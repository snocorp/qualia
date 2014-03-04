/*jslint node: true*/
var lodash = require('lodash');

//default configuration, override by using ../config.json in root
var rootConfig = {
    "server_host": "localhost",
    "server_port": 8888,
    "couchdb_url": "http://localhost:5984",
    "couchdb_database": "qualia",
    "admin_password": null
};

try {
    var config = require('../config.json');

    lodash.assign(rootConfig, config);
} catch (ex) {
    //ignore
}

//EXPORTS
module.exports = rootConfig;