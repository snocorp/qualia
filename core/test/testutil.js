/*jslint node: true */

(function (module) {
    'use strict';
    
    /**
     * Sets up logging to output to a file instead of appearing in
     * the test results.
     */
    function setupLogging(winston) {
        try {
            winston.add(winston.transports.File, { filename: 'test_output.log' });
        } catch (e1) {
            //ignore
        }
        try {
            winston.remove(winston.transports.Console);
        } catch (e2) {
            //ignore
        }
    }
    
    
    function tearDownLogging(winston) {
        try {
            winston.remove(winston.transports.File);
        } catch (e1) {
            //ignore
        }
        try {
            winston.add(winston.transports.Console);
        } catch (e2) {
            //ignore
        }
    }
    
    module.exports = {
        setupLogging: setupLogging,
        tearDownLogging: tearDownLogging
    };
    
}(module));