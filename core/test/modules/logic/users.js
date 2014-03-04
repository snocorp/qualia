/*jslint node: true*/
/*globals beforeEach, describe, it, xit*/
var rootDir = "../../../";

var assert = require("assert");
var nock = require("nock");
var chai = require('chai');
var passport = require('passport');
var passwordHash = require('password-hash');

chai.use(require('chai-connect-middleware'));

var datalog = require(rootDir + "logic/datalog");
var users = require(rootDir + "logic/users");
var scope;

beforeEach(function () {
    'use strict';
    
    scope = nock('http://localhost:5984');
});

describe('Users', function () {
    'use strict';
    
    it('should handle the create_user event', function () {
        var insertUser = scope
                .filteringRequestBody(function (body) {
                    var requestBody = JSON.parse(body);
                    requestBody.password = 'XXX';
                    return JSON.stringify(requestBody);
                })
                .post('/qualia', {
                    username: 'testuser',
                    password: 'XXX',
                    org: 'testorg',
                    entity_type: 'user'
                })
                .reply(200, JSON.stringify({"ok": true, "id": "123ABC", "rev": "946B7D1C"}), {'content-type': 'application/json'}),
            xaction = datalog.begin();
        
        xaction.create('user', {
            username: 'testuser',
            password: 'testpassword',
            org: 'testorg'
        });
        
        xaction.commit();
        
        setTimeout(function () {
            insertUser.done(); // will throw an assertion error if action was not performed.
        }, 10);
    });
    
    it('should have a design', function () {
        assert.ok(users.design);
    });
    
    describe('serializeUser', function () {
        it('should serialize using the user\'s id', function (done) {
            var user = {"_id": "1234567890"};
            
            users.serializeUser(user, function (err, id) {
                assert.equal(id, "1234567890", "Expect the user id to match the id of the user object");
                
                done();
            });
        });
    });
    
    describe('deserializeUser', function () {
        var expectedUser = {"_id": "0987654321", "username": "testuser", "entity_type": "user"},
            unexpectedEntity = {"_id": "1111111111", "entity_type": "entity"};
        
        it('should return the user with the given id', function (done) {
            var getUserById = scope.get('/qualia/0987654321')
                .reply(200, expectedUser);
            
            users.deserializeUser("0987654321", function (err, user) {
                assert.deepEqual(user, expectedUser, "Expected the user to match the expected user");
                
                done();
            });
        });
        
        it('should validate the type of entity', function (done) {
            var getUserById = scope.get('/qualia/1111111111')
                .reply(200, unexpectedEntity);
            
            users.deserializeUser("1111111111", function (err, user, result) {
                try {
                    assert.equal(null, err, "Expected no exception");
                    assert.equal(false, user, "Expected no user");
                    assert.equal(result.message, "Unable to verify identity", "Expected an error message");
                } catch (e) {
                    done(e);
                    
                    throw e;
                }
                
                done();
            });
        });
        
        it('should handle errors', function (done) {
            var getUserById = scope.get('/qualia/1111111111')
                .reply(404);
            
            users.deserializeUser("1111111111", function (err, user, result) {
                try {
                    assert.equal(null, err, "Expected no exception");
                    assert.equal(false, user, "Expected no user");
                    assert.equal(result.message, "Unable to verify identity", "Expected an error message");
                } catch (e) {
                    done(e);
                    
                    throw e;
                }
                
                done();
            });
        });
    });
    
    describe('Strategy', function () {
        passport.use('local', users.Strategy);
        
        it('should authenticate a valid user', function (done) {
            var userResponse = {
                    "total_rows": 1,
                    "offset": 0,
                    "rows": [
                        {
                            "id": "a35e64171475f70c5a567f68c1000d71",
                            "key": "admin",
                            "value": {
                                "_id": "a35e64171475f70c5a567f68c1000d71",
                                "_rev": "1-56a2a046c5a9c3662e088ac1b5d2aebe",
                                "username": "testuser",
                                "password": passwordHash.generate('testpassword'),
                                "entity_type": "user"
                            }
                        }
                    ]
                },
                getUserByUsername = scope.post('/qualia/_design/user/_view/by_username', {keys: ["testuser"]})
                    .reply(200, userResponse);
            
            chai.connect
                .use(passport.authenticate('local'))
                .req(function (req) {
                    req.query = { username: 'testuser', password: 'testpassword' };
                    req.logIn = function (user, options, done) {
                        assert.deepEqual(user, userResponse.rows[0].value, "Expected the returned user");
                        done();
                    };
                })
                .next(function (err) {
                    done(err);
                })
                .dispatch();
        });
        
        it('should fail to authenticate a non-existant user', function (done) {
            var userResponse = {
                    "total_rows": 1,
                    "offset": 0,
                    "rows": []
                },
                getUserByUsername = scope.post('/qualia/_design/user/_view/by_username', {keys: ["testuser"]})
                    .reply(200, userResponse);
            
            chai.connect
                .use(passport.authenticate('local'))
                .req(function (req) {
                    req.query = { username: 'testuser', password: 'testpassword' };
                })
                .end(function (res) {
                    try {
                        assert.equal(res.statusCode, 401, "Expected unauthorized status");
                        done();
                    } catch (e) {
                        done(e);
                    }
                })
                .next(function (err) {
                    done(err);
                })
                .dispatch();
        });
        
        it('should fail to authenticate a user with the wrong password', function (done) {
            var userResponse = {
                    "total_rows": 1,
                    "offset": 0,
                    "rows": [
                        {
                            "id": "a35e64171475f70c5a567f68c1000d71",
                            "key": "admin",
                            "value": {
                                "_id": "a35e64171475f70c5a567f68c1000d71",
                                "_rev": "1-56a2a046c5a9c3662e088ac1b5d2aebe",
                                "username": "testuser",
                                "password": passwordHash.generate('testpassword'),
                                "entity_type": "user"
                            }
                        }
                    ]
                },
                getUserByUsername = scope.post('/qualia/_design/user/_view/by_username', {keys: ["testuser"]})
                    .reply(200, userResponse);
            
            chai.connect
                .use(passport.authenticate('local'))
                .req(function (req) {
                    req.query = { username: 'testuser', password: 'test' };
                    req.logIn = function (user, options, done) {
                        assert.deepEqual(user, userResponse.rows[0].value, "Expected the returned user");
                        done();
                    };
                })
                .end(function (res) {
                    try {
                        assert.equal(res.statusCode, 401, "Expected unauthorized status");
                        done();
                    } catch (e) {
                        done(e);
                    }
                })
                .next(function (err) {
                    done(err);
                })
                .dispatch();
        });
    });
});