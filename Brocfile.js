var mergeTrees = require('broccoli-merge-trees');
var compileSass = require('broccoli-sass');

var appCss = compileSass(['app'], 'who_is.scss', 'assets/who_is.css');

module.exports = mergeTrees(['app', appCss, 'public']);