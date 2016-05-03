(function () {
  if (window.__karma__) {
    var karmaArgs = window.__karma__.config.args;
    if (karmaArgs && karmaArgs.length === 1) {
      $.ajax({
        url: '/focused_test_name/' + encodeURIComponent(karmaArgs[0]),
        async: false,
        success: function (focusedTestName) {
          jasmine.getEnv().specFilter = function(spec) {
            return spec.getFullName().indexOf(focusedTestName) === 0;
          };
        }
      });
    }
  }
})();

