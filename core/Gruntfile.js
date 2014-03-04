/*jslint node: true*/
var uglifyFiles = {
    'server/public/js/admin/users.js': [
        'server/src/js/admin/users/app.js',
        'server/src/js/admin/users/controllers.js',
        'server/src/js/admin/users/AppController.js',
        'server/src/js/admin/users/bootstrap.js'
    ]
};

module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['server/src/images/favicon/icons/*'],
                        dest: 'server/public/',
                        flatten: true,
                        filter: 'isFile'
                    }
                ]
            }
        },
        compass: {
            dist: {
                options: {
                    sassDir: 'server/src/scss',
                    cssDir: 'server/public/css',
                    outputStyle: 'compressed',
                    environment: 'production'
                }
            },
            dev: {
                options: {
                    sassDir: 'server/src/scss',
                    cssDir: 'server/public/css',
                    outputStyle: 'expanded'
                }
            }
        },
        uglify: {
            dist: {
                options: {
                    compress: true
                },
                files: uglifyFiles
            },
            dev: {
                options: {
                    beautify: true,
                    compress: false,
                    mangle: false
                },
                files: uglifyFiles
            }
        },
        mochacli: {
            options: {
                reporter: 'spec',
                bail: false
            },
            unit: ['test/modules/**/*.js'],
            all: ['test/**/*.js']
        },
        watch: {
            css: {
                files: 'server/src/scss/*.scss',
                tasks: ['compass:dev']
            },
            js: {
                files: 'server/src/js/**/*.js',
                tasks: ['uglify:dev']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha-cli');

    grunt.registerTask('default', ['copy:main', 'compass:dev', 'uglify:dev']);
    grunt.registerTask('test', ['mochacli:all']);
    grunt.registerTask('unittest', ['mochacli:unit']);
};