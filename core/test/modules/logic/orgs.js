/*jslint node: true*/
/*globals describe, it, beforeEach, afterEach*/
var rootDir = "../../../";

var testutil = require('../../testutil');

var assert = require("assert");
var nock = require("nock");
var winston = require('winston');

var datalog = require(rootDir + "logic/datalog");
var orgs = require(rootDir + "logic/orgs");

describe('Orgs', function () {
    'use strict';

    beforeEach(function () {
        testutil.setupLogging(winston);
    });
    
    it('should handle the create_org event', function () {
        var insertOrg = nock('http://localhost:5984')
                .post('/qualia', {
                    name: 'admin',
                    entity_type: 'org'
                })
                .reply(200, JSON.stringify({"ok": true, "id": "123BAC", "rev": "946B7D1C"}), {'content-type': 'application/json'}),
            xaction = datalog.begin();
        
        xaction.create('org', {name: 'admin'});
        
        xaction.commit();
        
        setTimeout(function () {
            insertOrg.done(); // will throw an assertion error if action was not performed.
        }, 10);
    });
    
    it('should have a design', function () {
        assert.ok(orgs.design);
    });
    
    afterEach(function () {
        testutil.tearDownLogging(winston);
    });
});