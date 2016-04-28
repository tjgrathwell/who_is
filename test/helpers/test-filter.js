if (window.focusedTestFileURL) {
  $.ajax({
    url: window.focusedTestFileURL,
    async: false,
    success: function (focusedTestName) {
      jasmine.getEnv().specFilter = function(spec) {
        return spec.getFullName().match(new RegExp('^' + focusedTestName));
      };
    }
  });
}
