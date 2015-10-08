var mergeTrees = require('broccoli-merge-trees');
var compileSass = require('broccoli-sass');
var filterTemplates = require('./broccoli-extensions/compile-templates');
var concatFiles = require('broccoli-concat');
var babel = require('broccoli-babel-transpiler');

var appCss = compileSass(['app'], 'styles/main.scss', 'assets/who_is.css');

var templates = filterTemplates('app', {
  extensions: ['hbs'],
  compileFunction: 'Handlebars.compile'
});

var appJs = babel('app', {
  browserPolyfill: true,
  moduleIds: true,
  modules: 'amd'
});

appJs = concatFiles(mergeTrees([templates, appJs], {overwrite: true}), {
  inputFiles: ['**/*.js'],
  outputFile: '/assets/app.js'
});

module.exports = mergeTrees([appJs, appCss, 'public']);