var fs = require('fs');
var request = require('request-promise');
var config = require('./config');

module.exports = function( user, targetId, operations ) {

    var attributes = [];

    for (var op in operations) {
        if ( operations[op].status === 'on' ) {
            attributes.push( {"Operation": op} );
        }
    }

    var ticketRequest = {
        "UserDirectory": config.prefix,
        "UserId": user,
        "Attributes": attributes,
        'TargetId': targetId
    };

    return request.post({
        url: `https://${config.senseHost}:4243/qps/${config.prefix}/ticket?xrfkey=abcdefghijklmnop`,
        headers: {
            'x-qlik-xrfkey': 'abcdefghijklmnop',
            'content-type': 'application/json'
        },
        rejectUnauthorized: false,
        cert: fs.readFileSync(config.certificates.client),
        key: fs.readFileSync(config.certificates.client_key),
        body: JSON.stringify(ticketRequest)
    });
};