/*jslint node: true*/

var winston = require('winston');
var lodash = require('lodash');
var config = require('./config');
var nano = require('nano')(config.couchdb_url);
var datalog = require('./datalog');
var when = require('when');
var LocalStrategy = require('passport-local').Strategy;
var passwordHash = require('password-hash');

var db = nano.use(config.couchdb_database);

var design = {
    "_id": "_design/org",
    "language": "javascript",
    "views": {
        "all": {
            "map": "function(doc) { if (doc.entity_type == 'org')  emit(doc._id, doc) }"
        },
        "by_name": {
            "map": "function(doc) { if (doc.entity_type == 'org')  emit(doc.name, doc) }"
        }
    }
};


/**
 * Retrieves an organization by its id.
 *
 * @param {string} id - The id of the organization
 * @returns {promise} Resolves to the organization
 */
function orgById(id) {
    'use strict';
    var deferred = when.defer();
    db.get(id, function (err, body) {
        if (!err) {
            deferred.resolve(body);
        } else {
            deferred.reject(new Error(err));
        }
    });

    return deferred.promise;
}


/**
 * Retrieves an organization by its name. Names are assumed to be unique.
 *
 * @param {string} name - The organization name
 */
function orgByName(name) {
    'use strict';
    var deferred = when.defer();
  
    db.view('org', 'by_name', { keys: [name] }, function (err, body) {
        if (body.rows.length === 1) {
            deferred.resolve(body.rows[0].value);
        } else if (body.rows.length > 1) {
            deferred.reject(new Error('Non-unique organization name: ' + name));
        } else {
            deferred.resolve(null);
        }
    });
  
    return deferred.promise;
}


/**
 * Returns the list of organizations available to the given user.
 */
function getOrgs(user) {
    'use strict';
    
    var deferred = when.defer();
    if (user.roles && lodash.contains(user.roles, 'admin/orgs')) {
        db.view('org', 'all', null,
            function (err, body) {
                var i,
                    filter,
                    orgs;
                
                orgs = lodash.map(body.rows, function (o) { return o.value; });
                
                //if the user is not in the admin org
                if (user.org !== 'admin') {
                    orgs = lodash.filter(orgs, function (org) {
                        //return only if the organization matches
                        return org.id === user.org;
                    });
                }
                
                deferred.resolve(orgs);
            });
    } else {
        deferred.resolve([]);
    }
    
    return deferred.promise;
}


function createOrg(org) {
    'use strict';
    winston.info('Creating org');

    lodash.assign(org, {
        "entity_type": "org"
    });

    db.insert(org, function (err, body) {
        if (!err) {
            winston.info(body);
        } else {
            winston.error(err);
        }
    });
}

//sign up for data events
datalog.on('create_org', createOrg);

//EXPORTS
module.exports = {
    "design": design,
    "getOrgs": getOrgs
};