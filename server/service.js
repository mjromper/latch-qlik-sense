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

// Updateing configuration from parameters
var arg = process.argv.slice(2);
arg.forEach( function(a) {
    var key = a.split("=");
    switch( key[0] ) {
      case "user_directory":
        config.prefix = key[1];
        break;
      case "is_secure":
        config.isSecure = (key[1] === "y" || key[1] === "Y")? true : false;
        break;
      case "qlik_sense_hostname":
        config.senseHost = key[1];
        break;
      case "client_id":
        config.latch.appId = key[1];
        break;
      case "client_secret":
        config.latch.secretKey = key[1];
        break;
      case "auth_port":
        config.port = key[1];
        break;
  }
} );


var db = {};
db.latchacc = new Datastore( path.resolve(__dirname, 'latch-links.db') );
db.latchacc.loadDatabase();

//Init latch configuration
latch.init(config.latch);
ticket.init(config);

var defaulTargetUri = (config.isSecure? 'https://' : 'http://') + config.senseHost +"/"+config.prefix+"/hub";

app.use(bodyParser.json());
app.use(express.static( path.resolve(__dirname, '..','public')));

/*
Redirect from Qlik Sense Virtual Proxy
*/
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


/*
Authentication endpoint
*/
app.post('/auth', function ( req, res ) {

    var username = req.body.username,
        password = req.body.password;

    // IMPORTANT
    // Use real authentication mechanisms, not this mock method
    mockCheckUserLogin( username, password, function(err, response) {
        if ( !err && response.isAuth ) {
            getUserAndCheckLATCH(username, res);
        } else {
            //Return JSON with error, user is not authenticated
            res.status(401).json( err );
        }
    });
});

/*
Authentication endpoint
*/
app.post('/retry', function ( req, res ) {
    getUserAndCheckLATCH(req.body.username, res);
});


function getTicket( res, username, targetId, latch, operations ) {
    ticket.getNewTicket( username, targetId, operations ).then( function( response ) {
        var resObj = JSON.parse(response),
            ticketToken = resObj.Ticket,
            targetUri = resObj.TargetUri? resObj.TargetUri : defaulTargetUri;

        res.json( {"ticket": ticketToken, "targetUri": targetUri, "username": username,"latch": latch } );
    }, function(err){
        res.status(403).send(err);
    });
}

function mockCheckUserLogin(username, password, cb) {
    //This will authenticate users against usersDB.js
    var users = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'usersDB.json'), 'utf8'));
    var found;
    for ( var i=0; i< users.length; i++){
        if ( users[i].username === username && users[i].password === password ) {
            found = users[i];
            break;
        }
    }
    if ( found ) {
        delete found.password;
        cb( null, { "isAuth": true, "user": found } );
    } else {
        cb( { "error": "User not found. Wrong password or username." }, null );
    }

}

function getUserAndCheckLATCH( username, res ) {
    //Find if user already have a Latch pairing in database
    db['latchacc'].findOne( { "username": username } , function(err, result) {

        var targetId = global.qlikAuthSession? global.qlikAuthSession.targetId : null;

        if ( !result ) {
            //User not paired with Latch. Get a Qlik Ticket.
            getTicket(res, username, targetId, null, []);
        } else {
            //User with paried Latch. Checking Latch lock and operations
            latch.status(result.accountId, function( err, operations ) {

                if (err && err.message === "Account not paired" ) {
                    getTicket(res, username, targetId, null, []);
                    return;
                }

                if ( err ) {
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
}


/*
Endpoint to pair with Latch
*/
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


/*
Endpoint to uppair with Latch
*/
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