/*jslint node: true, nomen: true */

(function (module) {
    'use strict';
    
    var config = require('../logic/config'),
        users = require('../logic/users'),
        routes = require('./routes'),
        
        flash = require('connect-flash'),
        express = require('express'),
        passport = require('passport'),
        winston = require('winston'),
        
        port,
        host,
        app = express();
    
    function configurePassport() {
        passport.serializeUser(users.serializeUser);
        passport.deserializeUser(users.deserializeUser);
        passport.use(users.Strategy);
    }
    
    function configureRoutes() {
        //authentication
        app.post('/login',
            passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
            function (req, res) {
                res.redirect('/');
            });

        app.get('/login', function (req, res) {
            res.render('login', { message: req.flash('error') });
        });

        app.get('/logout', function (req, res) {
            req.logout();
            res.redirect('/');
        });

        // Routes for UI
        app.get('/', routes.renderIndex);
        app.get('/admin/users', routes.renderAdminUsers);
        app.get('/admin/orgs', routes.renderAdminOrgs);

        //Routes for API
        app.get('/api/users', routes.getUsers);
        app.get('/api/orgs', routes.getOrgs);
    }
    
    function configure() {
        configurePassport();
        
        // Configuration
        app.configure(function () {

            app.set('views', __dirname + '/views');
            app.set('view engine', 'jade');
            app.use(express.bodyParser());
            app.use(express.cookieParser());
            app.use(express.session({secret: 'Z6nJs9qwpDx73H4j'}));
            app.use(express.methodOverride());
            app.use(flash());
            app.use(passport.initialize());
            app.use(passport.session());
            app.use(app.router);
            app.use(express['static'](__dirname + '/public'));
            //500 handler
            app.use(function (err, req, res, next) {
                console.error(err.stack);
                res.send(500, 'Internal error');
            });
            //404 handler
            app.use(function (req, res, next) {
                res.status(404);
                routes.renderError(req, res, '404');
            });
        });
        
        configureRoutes();
    }
    
    function start() {
        // Start the app by listening on <port>
        port = config.server_port;
        host = config.server_host;
        app.listen(port, host);

        winston.info("Server started at http://" + host + ":" + port);
    }
    
    module.exports = {
        configure: configure,
        start: start
    };
}(module));