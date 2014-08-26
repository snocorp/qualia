/*jslint node: true, indent: 4 */

var roles = require('../logic/roles').roles;
var users = require('../logic/users');
var orgs = require('../logic/orgs');

var lodash = require('lodash');

/**
 * Renders an error page for the given code.
 *
 * @param req The request
 * @param res The response
 * @param code The error code
 */
var renderError =
    function (req, res, code) {
        'use strict';
        var user = req.user;

        res.render(code, {
            user: user,
            roles: roles
        });
    };

/**
 * Restricts a route to logged in users.
 *
 * @param req The request
 * @param res The response
 * @param render(req, res) A function that will render if the user is logged in.
 * @param error(req, res) A function that will render if the user is not logged in.
 */
var restrictUser =
    function (req, res, render, error) {
        'use strict';
        if (req.user) {
            render(req, res);
        } else {
            if (!error) {
                res.render('login', {
                    redirect: req.url
                });
            } else {
                error(req, res);
            }
        }
    };

/**
 * Restrict a route to a user with a particular role.
 *
 * @param req The request
 * @param res The response
 * @param role The required role
 * @param render(req, res) A function that will render if the user is logged in.
 */
var restrictRole =
    function (req, res, role, render) {
        'use strict';
        if (req.user && req.user.roles && lodash.contains(req.user.roles, role)) {
            render(req, res);
        } else {
            //unauthorized
            renderError(req, res, '403');
        }
    };

/**
 * Renders a view with some basic info.
 * 
 * @param req The request
 * @param res The response
 * @param role The role/view to be rendered
 */
var render =
    function (req, res, role) {
        'use strict';
        var user = req.user;

        res.render(role, {
            user: user,
            roles: roles,
            role: role
        });
    };

/**
 * Determine the default page to render and render it.
 *
 * @param req The request
 * @param res The response
 */
var renderIndex =
    function (req, res) {
        'use strict';

        //restrict to users
        restrictUser(req, res, function (req, res) {
            var user = req.user,
                place = 'index',
                i;

            //determine the default place
            if (user.roles) {
                for (i = 0; i < user.roles.length; i += 1) {
                    if (user.roles[i] === "admin/users") {
                        place = 'admin/users';
                        break;
                    }
                    if (user.roles[i] === "admin/orgs") {
                        place = 'admin/orgs';
                        break;
                    }
                }
            }
            render(req, res, place);
        });
    };


/**
 * Renders the user administration page.
 *
 * @param req The request
 * @param res The response
 */
var renderAdminUsers =
    function (req, res) {
        'use strict';

        //restrict to admins
        restrictRole(req, res, 'admin/users', function (req, res) {
            render(req, res, 'admin/users');
        });
    };

/**
 * Renders the organization administration page.
 *
 * @param req The request
 * @param res The response
 */
var renderAdminOrgs =
    function (req, res) {
        'use strict';

        //restrict to admins
        restrictRole(req, res, 'admin/orgs', function (req, res) {
            render(req, res, 'admin/orgs');
        });
    };

/**
 * Responds to a json request with an appropriate error.
 *
 * @param req The request
 * @param res The response
 * @param code The error code
 * @param body The json object to send
 */
var jsonError =
    function (req, res, code, body) {
        'use strict';

        res.status(code);
        res.set('Content-Type', 'application/json');
        res.send(body);
    };

/**
 * API route for returning the list of users.
 *
 * @param req The request
 * @param res The response
 */
var getUsers =
    function (req, res) {
        'use strict';

        restrictUser(req, res,
            function (req, res) {
                users.getUsers(req.user).then(function (users) {
                    res.set('Content-Type', 'application/json');
                    res.send({"content": users});
                });
            },
            function (req, res) {
                jsonError(req, res, 401, {
                    "errors": ["Not authorized to view this resource"]
                });
            });
    };

/**
 * API route for returning the list of organizations.
 *
 * @param req The request
 * @param res The response
 */
var getOrgs =
    function (req, res) {
        'use strict';

        restrictUser(req, res,
            function (req, res) {
                orgs.getOrgs(req.user).then(function (orgs) {
                    res.set('Content-Type', 'application/json');
                    res.send({"content": orgs});
                });
            },
            function (req, res) {
                jsonError(req, res, 401, {
                    "errors": ["Not authorized to view this resource"]
                });
            });
    };

//EXPORTS
module.exports = {
    renderIndex: renderIndex,
    renderAdminUsers: renderAdminUsers,
    renderAdminOrgs: renderAdminOrgs,
    renderError: renderError,
    getUsers: getUsers,
    getOrgs: getOrgs
};