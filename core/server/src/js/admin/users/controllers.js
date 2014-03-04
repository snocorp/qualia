'use strict';

define('qualia.admin.users.controllers', [
  'qualia.admin.users.AppController'
], function (app) {
  "use strict";

  var initialize = function(angModule) {
    angModule.controller('AppController', app);
  };


  return {
    initialize: initialize
  };
});