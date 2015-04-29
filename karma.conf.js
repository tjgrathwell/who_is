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

  if (process.env.TEST_PATH && process.env.TEST_LINE) {
    options.middleware = ['test-filter-relay'];
    options.preprocessors['test/helpers/test-filter.js'] = ['test-filter'];
    options.plugins.push({
      'preprocessor:test-filter': ['factory', TestFilterPreprocessorFactory],
      'middleware:test-filter-relay': ['factory', TestFilterRelayFactory]
    });
  }

  config.set(options);
};

function TestFilterPreprocessorFactory () {
  return function (content, file, done) {
    done(content.replace(/window\.focusedTestFileURL/g, '"/focused_test_name.txt"'));
  };
}

function TestFilterRelayFactory () {
  return function (request, response, next) {
    if (request.url === '/focused_test_name.txt') {
      var name = testNameAtFileLine(process.env.TEST_PATH, process.env.TEST_LINE);

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
