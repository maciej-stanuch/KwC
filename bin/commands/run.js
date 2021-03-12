'use strict';

const https = require('https');
const fs = require('fs');
const chalk = require('chalk');
const config = require('../../config.json');

module.exports = async (options) => {
    const addresses = parseAddresses(getFileList(options.files))
    config.ports.forEach(async port => {
        const certificateDetails = await getProtocolAndCertificate(addresses, port)
        console.log(`PORT ${port}`);
        console.log(certificateDetails);

        // We have to check if its self-signed, its one of the metrics.
        const selfSigned = certificateDetails.filter(it => !it.error).filter(it => JSON.stringify(it.certificate.subject) == JSON.stringify(it.certificate.issuer));
        if (selfSigned.length > 0) {
            console.log(chalk.bgRed(chalk.whiteBright('SELF-SIGNED:')))
            console.log(selfSigned)
        }
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
            const fileContent = fs.readFileSync(file).toString().split("\n");
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