/*jslint node: true*/

var winston = require('winston');
var readline = require('readline');
var when = require('when');
var config = require('./config');
var nano = require('nano')(config.couchdb_url);

var users = require('./users');
var orgs = require('./orgs');
var datalog = require('./datalog');

function requestPassword() {
    'use strict';
    var deferred = when.defer(),
        rl;

    //if the password is defined in the config
    if (config.admin_password) {
        deferred.resolve(config.admin_password);
    } else {
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question("Enter the password for admin: ", function (answer) {
            rl.close();

            deferred.resolve(answer);
        });
    }

    return deferred.promise;
}


function resetDatabase() {
    'use strict';
    var deferred = when.defer();
    
    nano.db.destroy(config.couchdb_database, function (err) {
        if (err && err.status_code >= 500) {
            deferred.reject(err);
        } else {
            nano.db.create(config.couchdb_database, function (err, body) {
                if (!err) {
                    deferred.resolve();
                } else {
                    winston.error('Unable to create database ' + config.couchdb_database + '. Setup failed.');
                    winston.error(err);
                    deferred.reject(err);
                }
            });
        }
    });

    return deferred.promise;
}


function initializeData() {
    'use strict';
    var db, data;
                
    winston.info('database ' + config.couchdb_database + ' created!');

    db = nano.use(config.couchdb_database);
    db.insert(users.design);
    db.insert(orgs.design);

    requestPassword()
        .then(function (password) {
            data = datalog.begin();
            data.create('user', {
                username: 'admin',
                password: password,
                roles: ['admin/users', 'admin/orgs'],
                org: 'admin'
            });
            data.create('org', {
                name: 'admin'
            });
            data.commit();
        });
}


//EXPORTS
module.exports = {
    "resetDatabase": resetDatabase,
    "initializeData": initializeData
};