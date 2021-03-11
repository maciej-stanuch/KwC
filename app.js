var https = require('https');
var options = {
    host: 'moja.pg.edu.pl',
    port: 443,
    method: 'GET'
};

var req = https.request(options, function(res) {
    console.log(res.connection.getPeerCertificate(detailed = true));
});

req.end();