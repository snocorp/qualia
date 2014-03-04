/*jslint node: true */
/*globals describe, it, xit, beforeEach*/
var rootDir = "../../../";

var assert = require("assert");
var nock = require("nock");

//setup logging
var winston = require('winston');
winston.add(winston.transports.File, { filename: 'test_output.log' });
winston.remove(winston.transports.Console);

var setup = require(rootDir + "logic/setup");
var scope;
var scopeDelete;

beforeEach(function () {
    'use strict';
    
    scope = nock('http://localhost:5984');
    scopeDelete = scope['delete'];
});

describe('Setup', function () {
    'use strict';
    describe('resetDatabase', function () {
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
    
    describe('Initial Data', function () {
        xit('should create an admin user', function () {
            
        });
        
        xit('should not request a password when one is provided', function () {
        });
    
        xit('should request a password when none is provided', function () {
        });
    
        xit('should create an admin organization', function () {
        });
    });
});