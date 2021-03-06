import start from 'who_is';
import storage from 'modules/storage';

const {includes, difference} = _;

describe('who_is', function() {
  var gameContainer;

  beforeEach(function () {
    storage.clearAll();

    if (!gameContainer) {
      $('body').append('<div class="game-container"></div>');
      gameContainer = $('.game-container');
    }

    gameContainer.off();
    gameContainer.empty();

    start('.game-container');
  });

  it('shows the app title', function () {
    expect(gameContainer.text()).toMatch('Who is?');
  });

  describe('when the user has entered some photo + name combinations', function () {
    var people;
    var peopleMap;
    var images;

    beforeEach(function () {
      people = [
        "http://fillmurray.com/200/200 Bill Murray",
        "http://placebear.com/200/200 A Bear",
        "http://placecage.com/200/200 Nicolas Cage"
      ];
      peopleMap = {};

      people.forEach((p) => {
        var parts = p.match(/([^\s]+) (.*)/);
        peopleMap[parts[1]] = parts[2];
      });
      images = Object.keys(peopleMap);

      gameContainer.find('textarea').val(people.join("\n")).trigger('input');
    });

    it('starts the game when the start button is pressed', function () {
      gameContainer.find('.begin-button').click();
      var currentImage = gameContainer.find('.person img').attr('src');
      expect(includes(images, currentImage)).toBeTruthy();
    });

    it('shows a randomly shuffled list of options', function () {
      gameContainer.find('.begin-button').click();

      var buttons = gameContainer.find('.answer .choice');
      var names = buttons.map(function (ix, button) { return $(button).text() }).toArray();
      expect(names.sort()).toEqual([ 'Bill Murray', 'Nicolas Cage', 'A Bear' ].sort())
    });

    describe('during the game', function () {
      describe('in the easy difficulty', function () {
        var currentImage;
        beforeEach(function () {
          gameContainer.find('.difficulty').val('easy').trigger('change');
          gameContainer.find('.begin-button').click();
          currentImage = gameContainer.find('.person img').attr('src');
        });

        describe('when the correct image is selected', function () {
          it("shows a successful message", function () {
            var correctName = peopleMap[currentImage];
            gameContainer.find(`button:contains("${correctName}")`).click();
            expect(gameContainer.find('.game .success').length).toEqual(1);
          });
        });

        describe('when the wrong image is selected', function () {
          var incorrectName;
          beforeEach(function () {
            incorrectName = peopleMap[difference(images, [currentImage])[0]];
            gameContainer.find(`button:contains("${incorrectName}")`).click();
          });

          it("shows a failure message", function () {
            expect(gameContainer.find('.game .failure').length).toEqual(1);
          });

          it('adds the incorrectly guessed person to the mistakes area', function () {
            var failureNames = gameContainer.find('.failures img').toArray().map((image) => {
              return $(image).attr('title');
            });
            var correctName = peopleMap[currentImage];
            expect(failureNames).toEqual([correctName]);
          });
        });
      });

      describe('in the medium difficulty', function () {
        var currentImage;

        function keyEvent (eventName, keyCode) {
          var event = jQuery.Event(eventName);
          event.which = keyCode; // Return Key
          return event;
        }

        beforeEach(function () {
          gameContainer.find('.difficulty').val('medium').trigger('change');
          gameContainer.find('.begin-button').click();
          currentImage = gameContainer.find('.person img').attr('src');
        });

        describe('when the correct name is selected', function () {
          it("shows a successful message", function () {
            var correctName = peopleMap[currentImage];
            gameContainer.find('.typeahead').val(correctName).trigger(keyEvent('keyup', 13));
            expect(gameContainer.find('.game .success').length).toEqual(1);
          });
        });

        describe('when the wrong name is selected', function () {
          it("shows a failure message", function () {
            var incorrectName = peopleMap[difference(images, [currentImage])[0]];
            gameContainer.find('.typeahead').val(incorrectName).trigger(keyEvent('keyup', 13));
            expect(gameContainer.find('.game .failure').length).toEqual(1);
          });
        });
      });

      describe('in the reverse difficulty', function () {
        var currentName;
        beforeEach(function () {
          gameContainer.find('.difficulty').val('reverse').trigger('change');
          gameContainer.find('.begin-button').click();
          currentName = gameContainer.find('.person .person-name').text();
        });

        describe('when the correct name is selected', function () {
          it("shows a successful message", function () {
            gameContainer.find(`.choice-images img[data-name="${currentName}"]`).click();
            expect(gameContainer.find('.game .success').length).toEqual(1);
          });
        });

        describe('when the wrong name is selected', function () {
          it("shows a failure message", function () {
            gameContainer.find('.choice-images [data-name]').filter(`[data-name!="${currentName}"]`).click();
            expect(gameContainer.find('.game .failure').length).toEqual(1);
          });
        });
      });
    });
  });
});