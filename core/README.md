# Qualia - Core

This is the core of the Qualia test charter application.

## Getting Started

* Run `npm install` to setup all the dependencies
* Run `grunt` to build everything
* Run `node setup` to create the base data
    * Note that this **deletes all data**
* Start the server by running `npm start`

## Configuration

Configuration is done by creating a config.json file in the root of the core folder. Below is an example file with all properties filled in. All properties are optional. Details and defaults are listed below:

    {
        "server_host": "localhost",
        "server_port": 8888,
        "couchdb_url": "http://localhost:5984",
        "couchdb_database": "qualia",
        "admin_password": "<password>"
    }

* server_host
    * The hostname to which the server will be bound
    * Default: localhost
* server_port
    * The port to which the server will be bound
    * Default: 8888
* couchdb_url
    * The URL of the couchdb instance
    * Default: http://localhost:5984
* couchdb_database
    * The database where qualia will store its data. This can be useful when you want to test qualia without losing your existing data.
    * Default: qualia
* admin_password
    * The password of the admin user. If this is not set the password will be requested at a prompt.

---------------------------
Copyright 2014 
> David Sewell