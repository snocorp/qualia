/*global console, define*/

define('qualia.admin.orgs.AppController', [
], function () {
    "use strict";

    var appController = ["$scope", "$resource",
        function ($scope, $resource) {
            /**
             * The array of users.
             */
            $scope.users = [];
            
            /**
             * Initializes the controller, called at the end of the containing function.
             */
            var init = function () {
                var Org = $resource('/api/org/:id', {},
                        {
                            all: {
                                method: 'GET',
                                url: '/api/orgs/',
                                isArray: true,
                                transformResponse: function (data) {
                                    var response = JSON.parse(data);
                                    return response.content;
                                }
                            }
                        });
                $scope.orgs = Org.all();
            };
            
            init();
        }];

    return appController;
});