var mergeTrees = require('broccoli-merge-trees');
var compileSass = require('broccoli-sass');
var filterTemplates = require('./broccoli-extensions/compile-templates');
var concatFiles = require('broccoli-concat');
var babel = require('broccoli-babel-transpiler');
var funnel = require('broccoli-funnel');
var handlebars = require('handlebars');
var npmDepsList = require('./npm-deps-list');

var appCss = compileSass(['app'], 'styles/main.scss', 'assets/who_is.css');

var templates = filterTemplates('app', {
  extensions: ['hbs'],
  templateLocation: 'window.templates',
  compiler: handlebars.precompile,
  hydrateFunction: 'Handlebars.template'
});

var appJs = babel('app', {
  browserPolyfill: true,
  moduleIds: true,
  presets: ['es2015'],
  plugins: [
    'transform-es2015-modules-amd'
  ]
});

var appImages = new funnel('app', {
  srcDir: 'images',
  destDir: 'assets/images'
});

var vendorJs = concatFiles('node_modules', {
  headerFiles: npmDepsList,
  outputFile: '/assets/vendor.js'
});

appJs = concatFiles(mergeTrees([templates, appJs], {overwrite: true}), {
  inputFiles: ['**/*.js'],
  outputFile: '/assets/app.js'
});

module.exports = mergeTrees([vendorJs, appJs, appCss, appImages, 'public']);