// A remix of https://github.com/joliss/broccoli-template/blob/master/index.js

var jsStringEscape = require('js-string-escape')
var Filter = require('broccoli-filter')
var fs = require('fs')
var path = require('path')

module.exports = TemplateFilter
TemplateFilter.prototype = Object.create(Filter.prototype)
TemplateFilter.prototype.constructor = TemplateFilter
function TemplateFilter (inputNode, options) {
  if (!(this instanceof TemplateFilter)) return new TemplateFilter(inputNode, options)

  Filter.call(this, inputNode, options)

  this.extensions = options.extensions
  this.compiler = options.compiler
  this.hydrateFunction = options.hydrateFunction
  this.templateLocation = options.templateLocation
}

TemplateFilter.prototype.targetExtension = 'js'

TemplateFilter.prototype.processString = function (string, path) {
  var templateName = path.match(/(\w+)\.hbs/)[1];
  return `${this.templateLocation}['${templateName}'] = ${this.hydrateFunction}(${this.compiler(string)})`
}

TemplateFilter.prototype.build = function () {
  fs.writeFileSync(
    path.join(this.outputPath, 'template_preamble.js'),
    `${this.templateLocation} = {}`
  )
  return Filter.prototype.build.call(this)
}