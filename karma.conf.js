var fs = require('fs');
var npmDepsList = require('./npm-deps-list');
var thisDir = __dirname;

module.exports = function(config) {
  var options = {
    basePath: '.',
    frameworks: ['jasmine'],
    reporters: ['jasmine-diff', 'progress'],
    jasmineDiffReporter: {
      pretty: true
    },
    babelPreprocessor: {
      options: {
        moduleIds: true,
        presets: ['es2015'],
        plugins: [
          'transform-es2015-modules-amd'
        ],
        getModuleId: function (fileName) {
          var relativeName = fileName.replace(thisDir + '/', '');
          return relativeName.replace(new RegExp('^app/'), '');
        }
      }
    },
    handlebarsPreprocessor: {
      templates: "window.templates"
    },
    preprocessors: {
      'app/**/*.js': ['babel'],
      'app/templates/**/*.hbs': 'handlebars',
      'test/**/*_spec.js': ['babel']
    },
    files: npmDepsList.map(function (dep) {
      return ['node_modules', dep].join('/');
    }).concat([
      'node_modules/karma-requirejs/lib/adapter.js',
      'app/templates/*.hbs',
      'app/**/*.js',
      'test/*_spec.js',
      'test/test-main.js',
      'test/helpers/*.js'
    ]),
    plugins: config.plugins
  };

  config.set(options);
};
