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
        }
      }
    },
    handlebarsPreprocessor: {
      templates: "window.templates"
    },
    preprocessors: {
      'app/**/*.js': ['babel'],
      'app/templates/**/*.hbs': 'handlebars'
    },
    files: [
      'http://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.20/require.min.js',
      'http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min.js',
      'http://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.10.4/typeahead.jquery.min.js',
      'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js',
      'http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.3.0/handlebars.min.js',
      'app/templates/*.hbs',
      'app/**/*.js',
      'test/*_spec.js'
    ]
  });
};
