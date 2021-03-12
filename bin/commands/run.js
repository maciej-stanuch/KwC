'use strict';

const https = require('https');
const chalk = require('chalk');

module.exports = () => {
    var req = https.request({
        host: "google.com",
        port: "443", 
        method: "GET"
    }, function(res) {
        console.log(res.socket.getPeerCertificate());
    });

    req.end();
};