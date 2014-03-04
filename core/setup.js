/*jslint node: true*/

var setup = require('./logic/setup');

setup.resetDatabase().then(setup.initializeData);