var express = require('express'),
    app = express(),
    fs = require('fs'),
    path = require('path'),
    http = require('http'),
    url = require('url'),
    bodyParser = require('body-parser'),
    Datastore = require('nedb'),
    ticket = require('./ticket'),
    latch = require('./latch.js'),
    config = require('./config');

var db = {};
db.latchacc = new Datastore( path.resolve(__dirname,'comments.db') );
db.latchacc.loadDatabase();

var defaulTargetUri = (config.isSecure? 'https://' : 'http://') + config.senseHost +"/"+config.prefix+"/hub";

app.use(bodyParser.json());
app.use(express.static( path.resolve(__dirname, './public')));

app.get('/authenticate', function ( req, res ) {
    //Store targetId and proxyRestUri in a global object
    if (url.parse(req.url, true).query.targetId != undefined) {
        global.qlikAuthSession = {
            "targetId": url.parse(req.url, true).query.targetId,
            "proxyRestUri": url.parse(req.url, true).query.proxyRestUri
        };
    } else {
        global.qlikAuthSession = null;
    }
    res.redirect("/#/login");
});

app.get('/login', function ( req, res ) {
    res.redirect("/#/login");
});


app.post('/auth', function ( req, res ) {

    var username = req.body.username;

    db['latchacc'].findOne( { "username": username } , function(err, result) {

        var targetId = global.qlikAuthSession? global.qlikAuthSession.targetId : null;

        if ( !result ) {
            getTicket(res, username, targetId, null, []);
        } else {
            latch.status(result.accountId, function( err, operations ) {

                if (err && err.message === "Account not paired" ) {
                    getTicket(res, username, targetId, null, []);
                    return;
                }

                if ( err ) {
                    var defaultTargetUri
                    res.json( {"error": err, "username": username,"latch": null, "targetUri": defaulTargetUri } );
                    return;
                }

                var isAllOn = true;
                for (var op in operations) {
                    isAllOn = isAllOn && (operations[op].status === 'on');
                }
                if ( isAllOn ) {
                    getTicket(res, username, targetId,isAllOn, operations);
                } else {
                    res.json( { "username": username, "latch": isAllOn, "targetUri": defaulTargetUri } );
                }
            });

        }
    } );

});

function getTicket( res, username, targetId, latch, operations ) {
    ticket( username, targetId, operations ).then( function( response ) {
        var resObj = JSON.parse(response),
            ticket = resObj.Ticket,
            targetUri = resObj.TargetUri? resObj.TargetUri : defaulTargetUri;

        res.json( {"ticket": ticket, "targetUri": targetUri, "username": username,"latch": latch } );
    }, function(err){
        res.status(403).send(err);
    });
}

app.post('/latchpair', function( req, res ) {
    latch.pair(req.body.username, req.body.code, function(err, result){
        if (err) {
            res.status(400).send({"success": false, "error": err});
        } else {

            db['latchacc'].update( { "username": req.body.username } , { "username": req.body.username, "accountId": result }, {"upsert": true}, function(err, affected, affectedDocuments) {
                if (err){
                    res.status(500).json( { success: false, error: err } );
                } else {
                    res.status(200).json( {success: true, affected:affected, affectedDocuments:affectedDocuments} );
                }
            } );

        }
    });
} );

app.get('/unpair/:user', function( req, res ) {

    db['latchacc'].findOne( { "username": req.params.user } , function(err, result) {
        if ( !result || err ) {
            res.status(404).json({success: false});
            return;
        }
        latch.unpair(result.accountId, function(err, data){
            if ( err ) {
                res.status(400).json({success: false, "error":err});
                return;
            }
            res.json({success: true, data: data});
        });
    });

} );

//Server application
var server = http.createServer( app );
server.listen( config.port );
