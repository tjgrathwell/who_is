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

  // Test focusing
  options.middleware = ['test-filter-relay'];
  options.plugins.push({
    'middleware:test-filter-relay': ['factory', TestFilterRelayFactory]
  });

  config.set(options);
};

function TestFilterRelayFactory () {
  return function (request, response, next) {
    var match = request.url.match(new RegExp('^/focused_test_name/(.*)'));
    if (match) {
      var pathAndLine = decodeURIComponent(match[1]).split(':');
      var path = pathAndLine[0];
      var line = pathAndLine[1];
      var name = testNameAtFileLine(path, line);
      console.log("Focus:", match[1], '(' + name + ')');

      response.writeHead(200);
      response.end(name);
    } else {
      return next();
    }
  };
}

function testNameAtFileLine(filePath, lineNumber) {
  var lines = fs.readFileSync(filePath, 'UTF-8').trim().split("\n");
  var currentIndentLevel = 99999;
  var linePointer = parseInt(lineNumber, 10) - 1;
  var match;
  var lineRegexp = /^(\s*)f?(?:it|describe)\s*\(\s*(['"])(.*?)\2/;
  var nameComponents = [];

  while (linePointer >= 0) {
    var line = lines[linePointer];

    if (match = line.match(lineRegexp)) {
      var indentLevel = match[1];
      var nameComponent = match[3];
      if (indentLevel < currentIndentLevel) {
        nameComponents.push(nameComponent);
        currentIndentLevel = indentLevel;
      }
    }
    linePointer -= 1;
  }

  return nameComponents.reverse().join(' ');
}
