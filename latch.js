var latch = require('latch-sdk');

function init(config) {
    latch.init(config);
}

function status( accountId, cb ) {
    var statusResponse = latch.status(accountId, function(err, res){
        if (err){
            cb(err, null);
            return;
        }
        console.log("status", res);
        if ( res.error ) {
            cb(res.error, null);
            return;
        }

        cb(null, res.data.operations)
    });
}

function pair( user, pairCode, cb ) {
    var pairResponse = latch.pair( pairCode, function(err, data) {

        if ( data.error ) {
            cb(data.error, null);
            return;
        }

        if (data["data"]["accountId"]) {
            var accountId = data["data"]["accountId"];
            cb(null, accountId);
        }
    });
}

function unpair( accountId, cb ) {
    var pairResponse = latch.unpair( accountId, cb);
}

exports.init = init;
exports.pair = pair;
exports.unpair = unpair;
exports.status = status;
