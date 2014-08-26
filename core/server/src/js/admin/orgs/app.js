/*jslint browser: true, indent: 4 */
/*global define */

define('qualia.admin.orgs.app', [
    'angular',

    // Application Files
    'qualia.admin.orgs.controllers'
], function (angular, controllers) {
    "use strict";

    var initialize = function () {
    
        var mainModule = angular.module('adminOrgs', ['ngResource']);
        controllers.initialize(mainModule);

        angular.bootstrap(window.document, ['adminOrgs']);
    };

    return {
        initialize: initialize
    };
});