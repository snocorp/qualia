/*jslint node: true*/
/*globals describe, it*/
var rootDir = "../../../";

var assert = require("assert");
var nock = require("nock");
var datalog = require(rootDir + "logic/datalog");
var orgs = require(rootDir + "logic/orgs");

describe('Orgs', function () {
    'use strict';
    
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
});