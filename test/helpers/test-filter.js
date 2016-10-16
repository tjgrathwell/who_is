(function () {
  if (window.__karma__) {
    var karmaArgs = window.__karma__.config.args;
    if (karmaArgs && karmaArgs.length === 1) {
      jasmine.getEnv().specFilter = function(spec) {
        return spec.getFullName().indexOf(karmaArgs[0]) === 0;
      };
    }
  }
})();
