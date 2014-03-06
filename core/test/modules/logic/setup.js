/*jslint node: true */
/*globals describe, it, xit, beforeEach, afterEach*/
var rootDir = "../../../";

var assert = require("assert");
var nock = require("nock");
var winston = require('winston');
var readline = require('readline');

var testutil = require('../../testutil');

var config = require(rootDir + "logic/config");
var datalog = require(rootDir + "logic/datalog");
var setup = require(rootDir + "logic/setup");

var scope;
var scopeDelete;
var saved = {};

describe('Setup', function () {
    'use strict';

    beforeEach(function () {
        saved.admin_password = config.admin_password;
        config.admin_password = 'password';

        saved.datalog_begin = datalog.begin;
        saved.readline_createInterface = readline.createInterface;

        testutil.setupLogging(winston);

        scope = nock('http://localhost:5984');
        scopeDelete = scope['delete'];
    });
    
    describe('reset database', function () {
        it('should destroy the old database', function (done) {
            var destroyDb = scopeDelete('/qualia')
                .reply(200, JSON.stringify({"ok": true}))
                .put('/qualia')
                .reply(201, JSON.stringify({"ok": true}));
            
            setup.resetDatabase().then(function () {
                destroyDb.done();
                done();
            });
        });
        
        it('should not fail if the database does not exist', function (done) {
            var destroyDb = scopeDelete('/qualia')
                    .reply(404, JSON.stringify({"error": "not_found", "reason": "missing"}))
                    .put('/qualia')
                    .reply(201, JSON.stringify({"ok": true}));
            
            setup.resetDatabase().then(function () {
                destroyDb.done();
                done();
            });
        });
        
        it('should output an error if the database cannot be destroyed', function (done) {
            var destroyDb = scopeDelete('/qualia')
                    .reply(500, JSON.stringify({"error": "internal"}));
            
            setup.resetDatabase().otherwise(function (err) {
                //expecting the error
                done();
            });
        });
        
        it('should create a new database', function (done) {
            var createDb = scopeDelete('/qualia')
                    .reply(200, JSON.stringify({"ok": true}))
                    .put('/qualia')
                    .reply(201, JSON.stringify({"ok": true}));
            
            setup.resetDatabase().then(function () {
                createDb.done();
                done();
            });
        });
        
        it('should output an error if the database cannot be created', function (done) {
            var destroyDb = scopeDelete('/qualia')
                .reply(200, JSON.stringify({"ok": true}))
                .put('/qualia')
                .reply(500, JSON.stringify({"error": "error", "reason": "unknown"}));
            
            setup.resetDatabase().otherwise(function () {
                destroyDb.done();
                done();
            });
        });
    });
    
    describe('initial data', function () {
        it('should create an admin user and org', function (done) {
            datalog.begin = function () {
                var createUser = null,
                    createOrg = null;
                
                return {
                    create: function (type, obj) {
                        if (type === 'user') {
                            if (createUser !== null) {
                                done("Already created admin user");
                            } else {
                                createUser = obj;
                            }
                        } else if (type === 'org') {
                            if (createOrg !== null) {
                                done("Already created admin org");
                            } else {
                                createOrg = obj;
                            }
                        }
                    },
                    commit: function () {
                        assert.equal(createUser.username, 'admin');
                        assert.equal(createOrg.name, 'admin');
                        
                        done();
                    }
                };
            };
            
            setup.initializeData();
        });
        
        it('should not request a password when one is provided', function (done) {
            datalog.begin = function () {
                return {
                    create: function (type, obj) {
                        if (type === 'user') {
                            assert.equal(obj.password, 'password');
                            
                            done();
                        }
                    },
                    commit: function () {
                    }
                };
            };
            
            setup.initializeData();
        });
    
        it('should request a password when none is provided', function (done) {
            config.admin_password = null;
            
            readline.createInterface = function () {
                return {
                    question: function (message, callback) {
                        callback('qwerty');
                    },
                    close: function () {
                    }
                };
            };
            
            setup.initializeData().then(done, done);
        });
    });
    
    afterEach(function () {
        testutil.tearDownLogging(winston);
        
        config.admin_password = saved.admin_password;
        datalog.begin = saved.datalog_begin;
        readline.createInterface = saved.readline_createInterface;
    });
});