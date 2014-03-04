/*global console, define*/

define('qualia.admin.users.AppController', [
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
                var User = $resource('/api/user/:id', {},
                        {
                            all: {
                                method: 'GET',
                                url: '/api/users/',
                                isArray: true,
                                transformResponse: function (data) {
                                    var response = JSON.parse(data);
                                    return response.content;
                                }
                            }
                        });
                $scope.users = User.all();
            };
            
            init();
        }];

    return appController;
});