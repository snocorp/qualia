/*jslint node: true, nomen: true, indent: 4 */

var winston = require('winston');
var lodash = require('lodash');
var config = require('./config');
var nano = require('nano')(config.couchdb_url);
var datalog = require('./datalog');
var when = require('when');
var LocalStrategy = require('passport-local').Strategy;
var passwordHash = require('password-hash');

var db = nano.use(config.couchdb_database);

/**
 * The database design for users in couchdb.
 */
var design = {
    "_id": "_design/user",
    "language": "javascript",
    "views": {
        "all": {
            "map": "function(doc) { if (doc.entity_type == 'user')  emit(doc._id, doc) }"
        },
        "by_username": {
            "map": "function(doc) { if (doc.entity_type == 'user')  emit(doc.username, doc) }"
        }
    }
};

/**
 * Looks up a use by id.
 *
 * @param {string} id - The user id
 */
function userById(id) {
    'use strict';

    var deferred = when.defer();
    db.get(id, function (err, body) {
        if (err) {
            deferred.reject(new Error(err));
        } else if (body.entity_type !== 'user') {
            deferred.reject(new Error('Entity with id ' + id + ' is not a user'));
        } else {
            deferred.resolve(body);
        }
    });

    return deferred.promise;
}

/**
 * Returns the list of users available to the given user.
 */
function getUsers(user) {
    'use strict';
    
    var deferred = when.defer();
    if (user.roles && lodash.contains(user.roles, 'admin/users')) {
        db.view('user', 'all', null,
            function (err, body) {
                var i,
                    filter,
                    users = lodash.map(body.rows, function (u) { return lodash.omit(u.value, 'password'); });
                
                //if the user is not in the admin org
                if (user.org !== 'admin') {
                    users = lodash.filter(users, function (u) {
                        //return only if the organization matches
                        return u.org === user.org;
                    });
                }
                
                deferred.resolve(users);
            });
    } else {
        deferred.resolve(lodash.omit(user, 'password'));
    }
    
    return deferred.promise;
}

/**
 * Looks up a user in the database by their username.
 *
 * @param username The username
 */
function userByUsername(username) {
    'use strict';

    var deferred = when.defer();

    db.view('user', 'by_username', { keys: [username] },
        function (err, body) {
            if (body.rows.length === 1) {
                deferred.resolve(body.rows[0].value);
            } else if (body.rows.length > 1) {
                deferred.reject(new Error('Non-unique username: ' + username));
            } else {
                deferred.resolve(null);
            }
        });
  
    return deferred.promise;
}

/**
 * Turns a user object into a token representing that user, specifically the _id attribute.
 */
function serializeUser(user, done) {
    'use strict';

    done(null, user._id);
}

/**
 * Uses the id token to look up the user.
 *
 * @param id The user id
 * @param done function(err, user, result) to be called when an error occurs or the use is found.
 */
function deserializeUser(id, done) {
    'use strict';
    
    userById(id).then(function (user) {
        if (user) {
            done(null, user);
        } else {
            done(null, false, { message: 'Unable to verify identity' });
        }
    }).otherwise(function (err) {
        done(null, false, { message: 'Unable to verify identity' });
    });
}

/**
 * This is the strategy for authentication.
 */
var Strategy = new LocalStrategy(
    function (username, password, done) {
        'use strict';
        userByUsername(username).then(function (user) {
            var hashedPassword = passwordHash.generate(password);

            if (user && passwordHash.verify(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid username or password' });
            }
        }).otherwise(function (error) {
            return done(null, false, { message: error });
        });
    }
);

function createUser(user) {
    'use strict';
    winston.info('Creating user');

    lodash.assign(user, {
        "entity_type": "user",
        "password": passwordHash.generate(user.password)
    });

    db.insert(user, function (err, body) {
        if (!err) {
            winston.info(body);
        } else {
            winston.error(err);
        }
    });
}

//sign up for data events
datalog.on('create_user', createUser);

//EXPORTS
module.exports = {
    "design": design,
    "serializeUser": serializeUser,
    "deserializeUser": deserializeUser,
    "Strategy": Strategy,
    "getUsers": getUsers
};