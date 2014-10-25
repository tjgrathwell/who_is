var mergeTrees = require('broccoli-merge-trees');
var compileSass = require('broccoli-sass');
var filterTemplates = require('./broccoli-extensions/compile-templates');
var concatFiles = require('broccoli-concat');

var appCss = compileSass(['app'], 'styles/main.scss', 'assets/who_is.css');

var appJs = filterTemplates('app', {
  extensions: ['hbs'],
  compileFunction: 'Handlebars.compile'
});

appJs = concatFiles(appJs, {
  inputFiles: [
    '**/*.js'
  ],
  outputFile: '/assets/app.js'
});

module.exports = mergeTrees([appJs, appCss, 'public']);