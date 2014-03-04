/*global require */

require.config({
    paths: {
        'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
        'jquery-ui': '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min',
        'twitter-bootstrap': '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.0.3/js/bootstrap.min',
        'angular': 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.6/angular',
        'angular-resource': 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.6/angular-resource'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        "angular-resource": {
            deps: ["angular"]
        },
        'twitter-bootstrap': ['jquery']
    }
});

require([
    // Standard Libs
    'require',
    'jquery',
    'angular',
    'angular-resource',
    'jquery-ui',
    'twitter-bootstrap'
], function (require, $, angular) {
    "use strict";

    require(['qualia.admin.users.app'], function (App) {
  	
        //done first to avoid any DOM manipulation after angular initializes
        //TODO

        App.initialize();

    });

});