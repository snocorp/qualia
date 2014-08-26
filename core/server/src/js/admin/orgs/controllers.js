/*jslint browser: true, indent: 4 */
/*global define */

define('qualia.admin.orgs.controllers', [
    'qualia.admin.orgs.AppController'
], function (app) {
    "use strict";

    var initialize = function (angModule) {
        angModule.controller('AppController', app);
    };


    return {
        initialize: initialize
    };
});