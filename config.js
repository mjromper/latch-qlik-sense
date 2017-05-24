var path = require('path');
var certPath = './certs';

var config = {

    certPath: certPath,

    certificates: {
        client: path.resolve(certPath, 'client.pem'),
        server: path.resolve(certPath, 'server.pem'),
        root: path.resolve(certPath, 'root.pem'),
        client_key: path.resolve(certPath, 'client_key.pem'),
        server_key: path.resolve(certPath, 'server_key.pem')
    },

    /**
     * Sense Server config
     */
    senseHost: 'ukwin-aor-w10',
    prefix: 'latch',
    isSecure: true,
    cookieName: 'X-Qlik-Session-Latch', // Cookie name assigned for virtual proxy

    latch: {
        appId: "XXXXXXXXXXX",
        secretKey: "XXXXXXXXXXXXXX"
    }
};

module.exports = config;