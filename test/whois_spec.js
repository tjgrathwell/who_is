describe('whois', function() {
  beforeEach(function (done) {
    $('body').append('<div class="game-container"></div>');
    require(['/Users/tjgrathwell/workspace/who_is/app/who_is'], function (start) {
      $('document').ready(function () {
        start('.game-container');
        done();
      });
    });
  });

  it('shows the app title', function () {
    expect($('.game-container').text()).toMatch('Who is?');
  });
});