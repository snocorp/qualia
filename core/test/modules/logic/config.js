/*jslint node: true*/
/*globals describe, it*/
var rootDir = "../../../";

var assert = require("assert");
var proxyquire =  require('proxyquire').noCallThru();

var configJson = {
    "server_host": "qualia.ca",
    "new_parm": "new_value"
};

var config = require(rootDir + "logic/config");

var configExtended = proxyquire(rootDir + "logic/config", {
    '../config.json': configJson
});

describe('Config', function () {
    'use strict';
    
    it('should extend the default properties when config provided', function () {
        assert.equal('qualia.ca', configExtended.server_host);
        assert.equal('new_value', configExtended.new_parm);
    });
    
    it('should use the default properties when no config provided', function () {
        assert.equal('localhost', config.server_host);
        assert.equal(undefined, config.new_parm);
    });
});