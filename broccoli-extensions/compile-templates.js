// A remix of https://github.com/joliss/broccoli-template/blob/master/index.js

var jsStringEscape = require('js-string-escape')
var Filter = require('broccoli-filter')

module.exports = TemplateFilter
TemplateFilter.prototype = Object.create(Filter.prototype)
TemplateFilter.prototype.constructor = TemplateFilter
function TemplateFilter (inputTree, options) {
  if (!(this instanceof TemplateFilter)) return new TemplateFilter(inputTree, options)
  this.inputTree = inputTree
  this.extensions = options.extensions
  this.compileFunction = options.compileFunction || ''
}

TemplateFilter.prototype.targetExtension = 'js'

TemplateFilter.prototype.processString = function (string, path) {
  var templateName = path.match(/(\w+)\.hbs/)[1];
  return 'var ' + templateName + 'Template = ' + this.compileFunction +
  '("' + jsStringEscape(string) + '");\n'
}