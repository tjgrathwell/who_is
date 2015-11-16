module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine'],
    babelPreprocessor: {
      options: {
        moduleIds: true,
        modules: 'amd',
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
    files: [
      'http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js',
      'http://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.11.1/typeahead.jquery.min.js',
      'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js',
      'http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.4/handlebars.min.js',
      'http://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.20/require.min.js',
      'node_modules/requirejs/require.js',
      'node_modules/karma-requirejs/lib/adapter.js',
      'app/templates/*.hbs',
      'app/**/*.js',
      'test/*_spec.js',
      'test/test-main.js'
    ]
  });
};
