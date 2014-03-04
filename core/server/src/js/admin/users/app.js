/*jslint browser: true, indent: 4 */
/*global define */

define('qualia.admin.users.app', [
    'angular',

    // Application Files
    'qualia.admin.users.controllers'
], function (angular, controllers) {
    "use strict";

    var initialize = function () {
    
        var mainModule = angular.module('adminUsers', ['ngResource']);
        controllers.initialize(mainModule);

        angular.bootstrap(window.document, ['adminUsers']);
    };

    return {
        initialize: initialize
    };
});