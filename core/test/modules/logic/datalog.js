/*jslint node: true*/
/*globals describe, it*/
var rootDir = "../../../";

var assert = require("assert");
var datalog = require(rootDir + "logic/datalog");

describe('DataLog', function () {
    'use strict';
    
    it('should be able to begin a new transaction', function () {
        assert.ok(datalog.begin(), "Expect a value returned");
    });
  
    it('should be able to commit an empty transaction', function () {
        var xaction = datalog.begin();
        
        xaction.commit();
        
        assert.ok(xaction.logged(), "Expect the transaction to be logged");
    });
    
    it('should emit an event on creation of an object', function (done) {
        var xaction = datalog.begin();
        
        xaction.create('test', {key: 'value'});
        
        datalog.on('create_test', function (test) {
            assert.deepEqual(test, {key: 'value'}, "Expected {key: 'value'} but got " + JSON.stringify(test));
            
            done();
        });
        
        xaction.commit();
    });
    
    it('should emit an event on update of an object', function (done) {
        var xaction = datalog.begin();
        
        xaction.update('test', {id: 1, key: 'value'});
        
        datalog.on('update_test', function (test) {
            assert.deepEqual(test, {id: 1, key: 'value'}, "Expected {id: 1, key: 'value'} but got " + JSON.stringify(test));
            
            done();
        });
        
        xaction.commit();
    });
    
    it('should emit an event on removal of an object', function (done) {
        var xaction = datalog.begin();
        
        xaction.remove('test', {id: 1});
        
        datalog.on('delete_test', function (test) {
            assert.deepEqual(test, {id: 1}, "Expected {id: 1} but got " + JSON.stringify(test));
            
            done();
        });
        
        xaction.commit();
    });
});