'use strict';

module.exports = function(grunt) {

    // show elapsed time at the end
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: 'html',
        dist: 'trunk/dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        jst: {
            options: {
                amd: false,
                prettify: true,
                processName: function(filepath) {
                    return filepath.split('/').pop().replace('.ejs', '');
                }
            },
            compile: {
                files: {
                    '.tmp/js/templates.js': ['<%= yeoman.app %>/templates/*.ejs'],
                    'script/templates.js': ['<%= yeoman.app %>/templates/*.ejs']
                }
            }
        },
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: '\n',
                banner: '/*! linkeddt.com <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                // the files to concatenate
                src: ['.tmp/js/charts.js', '<%= yeoman.app %>/charts/base/*.js', '<%= yeoman.app %>/charts/*.js'],
                // the location of the resulting JS file
                dest: 'script/charts.js'
            }
        }
    });

    grunt.registerTask('createDefaultTemplate', function() {
        grunt.file.write('.tmp/js/templates.js', 'this.JST = this.JST || {};');
    });

    grunt.registerTask('createDefaultTemplate1', function() {
        grunt.file.write('.tmp/js/charts.js', 'var app = app || {};app.Charts = app.Charts || {};Highcharts.setOptions({lang: {noData: "暂无数据"} });');
    });

    grunt.registerTask('temp', function(target) {
        grunt.task.run([
            'createDefaultTemplate',
            'jst',
        ]);
    });

    grunt.registerTask('charts', function(target) {
        grunt.task.run([
            'createDefaultTemplate1',
            'concat',
        ]);
    });
};