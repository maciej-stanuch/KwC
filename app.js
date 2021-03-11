var https = require('https');
var config = require("./config.js");

config.sites.forEach(site => {
    config.ports.forEach(port => {
        config.methods.forEach(method => {
            callAndPrint(site, port, method);
        })
    })
});

function callAndPrint(host, port, method) {
    var req = https.request({host, port, method}, function(res) {
        console.log(res.socket.getPeerCertificate());
    });

    req.end();
}