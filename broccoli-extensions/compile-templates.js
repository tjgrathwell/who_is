// A remix of https://github.com/joliss/broccoli-template/blob/master/index.js

var jsStringEscape = require('js-string-escape')
var Filter = require('broccoli-filter')

module.exports = TemplateFilter
TemplateFilter.prototype = Object.create(Filter.prototype)
TemplateFilter.prototype.constructor = TemplateFilter
function TemplateFilter (inputNode, options) {
  if (!(this instanceof TemplateFilter)) return new TemplateFilter(inputNode, options)

  Filter.call(this, inputNode, options)

  this.extensions = options.extensions
  this.compileFunction = options.compileFunction || ''
}

TemplateFilter.prototype.targetExtension = 'js'

TemplateFilter.prototype.processString = function (string, path) {
  var templateName = path.match(/(\w+)\.hbs/)[1];
  var templateLoadLines = [];
  templateLoadLines.push('window.templates = window.templates || {};');
  templateLoadLines.push('templates[\'' + templateName + '\'] = ' + this.compileFunction +
  '("' + jsStringEscape(string) + '");');
  return templateLoadLines.join("\n");
}