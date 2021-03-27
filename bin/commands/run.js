'use strict';

const https = require('https');
const fs = require('fs');
const chalk = require('chalk');
const config = require('../../config.json');
const {exec} = require('child_process');

class CertificateData {
    constructor(selfSigned, shortKey, forcedTlsVersion, oldTlsVersion, expiredCertificate, nameMismatch, mixedContent, certificateRevoked) {
        this.selfSigned = selfSigned;
        this.shortKey = shortKey;
        this.forcedTlsVersion = forcedTlsVersion;
        this.oldTlsVersion = oldTlsVersion;
        this.expiredCertificate = expiredCertificate;
        this.nameMismatch = nameMismatch;
        this.mixedContent = mixedContent;
        this.certificateRevoked = certificateRevoked;
    }
}

module.exports = async (options) => {
    const addresses = parseAddresses(getFileList(options.files));
    config.ports.map(async port => {
        const certificateDetails = await getProtocolAndCertificate(addresses, port)
        //console.log(`PORT ${port}`);
        //console.log(certificateDetails);

        certificateDetails.map(it => {
            const selfSigned = JSON.stringify(it.certificate.subject) === JSON.stringify(it.certificate.issuer);
            const shortPublicKey = it.certificate.bits < 1024;
            const version = parseFloat(it.protocol.substring(4)) <= 1.1;
            const expired = new Date() < Date.parse(it.certificate.valid_from) || new Date() > Date.parse(it.certificate.valid_to);
            const nameMismatch = !it.url.replace(/\./g, "").includes(it.certificate.subject.CN.replace(/\*/g, "").replace(/\./g, ""));

            if (selfSigned) console.log(`selfSigned: ${it.url}`)
            if (shortPublicKey) console.log(`shortPublicKey: ${it.url}`)
            // Forced old TLS version (Less than 1.1)
            if (version) console.log(`version: ${it.url}`)
            if (expired) console.log(`expired: ${it.url}`)
            if (nameMismatch) console.log(`nameMismatch: ${it.url}`)

        })
    });
};

/**
 * Parses file string into file path array.
 *
 * @param {string} fileString - String representing file paths separated by comma, e.g. "india.csv, europe.csv, usa.txt".
 * @returns {string[]} Array of strings representing each file path.
 */
const getFileList = (fileString) => fileString.split(',').map(filename => filename.trim());

/**
 * Parses addresses in file to list of URL strings. Order isn't guaranteed.
 *
 * @param {string[]} fileList - List of path to files to parse.
 * @returns {string[]} List of URLs from files.
 */
const parseAddresses = (fileList) => {
    console.log(chalk.blueBright('Parsing adresses...'));
    let addresses = []
    fileList.forEach(file => {
        try {
            const fileContent = fs.readFileSync(file).toString().split(",").map(it => it.trim());
            console.log(`${chalk.green(file + '[' + fileContent.length + ']')}:${fileContent}`);
            addresses = addresses.concat(fileContent);
        } catch (error) {
            console.error(chalk.redBright(error));
        }
    });

    console.log(chalk.blueBright(`Finished. Parsed ${addresses.length} ${addresses.length == 1 ? 'address' : 'addresses'}.`));
    return addresses;
}

/**
 * Makes pararell requests to provided URLs and returns informations about the protocol and the certificate.
 * When the certificate is invalid returns an error field.
 *
 * @param {string[]} urls - URLs to make request to.
 * @param {number} port - Port on which request should be made.
 * @returns {Promise<{url: string, protocol: string, certificate: any, error: Error}[]>} Promise of a list of a protocol and a certificate details for each URL.
 */
const getProtocolAndCertificate = async (urls, port) => {
    return Promise.all(urls.map(url => new Promise((resolve, reject) => {
            https.request({
                host: url,
                port: port,
                method: 'GET',
                rejectUnauthorized: false,
            }, (res) => resolve({
                url: url,
                protocol: res.socket.getProtocol(),
                certificate: res.socket.getPeerCertificate(true),
                error: undefined,
            }))
                .on('error', (err) => reject({
                    url: url,
                    protocol: undefined,
                    certificate: undefined,
                    error: err,
                }))
                .end();
        })
    )).then(responses => {
        return responses;
    }).catch(error => {
        console.error(chalk.redBright(error));
        return error;
    })
}