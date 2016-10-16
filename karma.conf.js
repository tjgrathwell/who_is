var fs = require('fs');
var npmDepsList = require('./npm-deps-list');

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
        getModuleId: function (moduleName) {
          // TODO: i'm sure there's some method whereby all this is not necessary
          if (moduleName.match(/who_is$/)) {
            return 'who_is';
          }
          var moduleFileMatch = moduleName.match(/modules\/(\w+)$/);
          if (moduleFileMatch) {
            return './modules/' + moduleFileMatch[1];
          }
          var specFileMatch = moduleName.match(/test\/(\w+)$/);
          if (specFileMatch) {
            return 'test/' + specFileMatch[1];
          }
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
