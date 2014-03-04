/*jslint node: true, nomen: true */

var config = require('./logic/config');
var users = require('./logic/users');

var routes = require('./server/routes');

var flash = require('connect-flash');
var express = require('express');
var passport = require('passport');

passport.serializeUser(users.serializeUser);
passport.deserializeUser(users.deserializeUser);
passport.use(users.Strategy);

var app = express();

// Configuration
app.configure(function () {
    'use strict';
    
    app.set('views', __dirname + '/server/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: 'Z6nJs9qwpDx73H4j'}));
    app.use(express.methodOverride());
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express['static'](__dirname + '/server/public'));
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

//authentication
app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function (req, res) {
        'use strict';
        res.redirect('/');
    });

app.get('/login', function (req, res) {
    'use strict';
    res.render('login', { message: req.flash('error') });
});

app.get('/logout', function (req, res) {
    'use strict';
    req.logout();
    res.redirect('/');
});

// Routes for UI
app.get('/', routes.renderIndex);
app.get('/admin/users', routes.renderAdminUsers);
app.get('/admin/orgs', routes.renderAdminOrgs);

//Routes for API
app.get('/api/users', routes.getUsers);

// Start the app by listening on <port>
var port = config.server_port;
var host = config.server_host;
app.listen(port, host);
console.log("Server started at http://" + host + ":" + port);