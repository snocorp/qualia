/*jslint node: true*/
var events = require('events');

/**
 * The DataLog object allows transactions to be collected and committed when ready.
 */
function DataLog() {
    'use strict';
    var self = this;

    /**
     * Begins a new transaction. Returns a handle to that transaction.
     */
    this.begin = function () {
        var logged = false,
            operations = [];
        return {
            /**
             * Logs a create for the given object with the given type.
             *
             * @param {string} type - The type of the object
             * @param {object} obj - The object to be created
             */
            create: function (type, obj) {
                if (!logged) {
                    operations.push({
                        op: 'create',
                        type: type,
                        obj: obj
                    });
                }
            },
            /**
             * Logs an update for the given object with the given type.
             *
             * @param {string} type - The type of the object
             * @param {object} obj - The object to be updated
             */
            update: function (type, obj) {
                if (!logged) {
                    operations.push({
                        op: 'update',
                        type: type,
                        obj: obj
                    });
                }
            },
            /**
             * Logs a removal for the given object with the given type.
             * The object may be an id or the object itself.
             *
             * @param {string} type - The type of the object
             * @param {(object|string} obj - The id or object to be removed
             */
            remove: function (type, obj) {
                if (!logged) {
                    operations.push({
                        op: 'delete',
                        type: type,
                        obj: obj
                    });
                }
            },
            /**
             * Emits events for each of the logged events.
             */
            commit: function () {
                var i, event;
                if (!logged) {
                    logged = true;
                    
                    for (i = 0; i < operations.length; i += 1) {
                        event = operations[i].op + '_' + operations[i].type;
                        self.emit(event, operations[i].obj);
                    }
                }
            },
            /**
             * Determines if the log has been committed yet or not.
             */
            logged: function () {
                return logged;
            }
        };
    };
}

// Extend the EventEmitter type
DataLog.prototype = Object.create(events.EventEmitter.prototype);

module.exports = new DataLog();