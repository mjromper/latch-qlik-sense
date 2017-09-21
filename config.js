var path = require('path');
var certPath = 'C:/ProgramData/Qlik/Sense/Repository/Exported Certificates/.Local Certificates';

var config = {

    certPath: certPath,

    certificates: {
        client: path.resolve(certPath, 'client.pem'),
        server: path.resolve(certPath, 'server.pem'),
        root: path.resolve(certPath, 'root.pem'),
        client_key: path.resolve(certPath, 'client_key.pem'),
        server_key: path.resolve(certPath, 'server_key.pem')
    },

    port: 4000,

    /**
     * Sense Server config
     */
    senseHost: 'qmi-qs-latch',
    prefix: 'latch',
    isSecure: false,
    cookieName: 'X-Qlik-Session-Latch', // Cookie name assigned for virtual proxy

    latch: {
        appId: "XXXXXXXXXXX",
        secretKey: "XXXXXXXXXXXXXX"
    }
};

module.exports = config;