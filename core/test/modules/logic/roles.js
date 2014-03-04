/*jslint node: true*/
/*globals describe, it*/
var rootDir = "../../../";

var assert = require('assert');
var roles = require(rootDir + "/logic/roles");

describe('Roles', function () {
    'use strict';
    
    it('should have roles', function () {
        assert.ok(roles.roles);
    });
});