import start from '/src/who_is';
import storage from '/src/modules/storage';
import { includes, difference } from 'lodash';
import { describe, it, beforeEach, expect } from 'vitest'
import * as $ from "jquery";

describe('who_is', function() {
  beforeEach(async function (context) {
    storage.clearAll();

    const existingContainer = $('body').find('.game-container')
    if (existingContainer.length > 0) {
      context.gameContainer = existingContainer;
    } else {
      $('body').append('<div class="game-container"></div>');
      context.gameContainer = $('.game-container');
    }

    context.gameContainer.off();
    context.gameContainer.empty();

    await start($,'.game-container');
  });


  it('shows the app title', function (context) {
    expect(context.gameContainer.text()).toMatch('Who is?');
  });

  describe('when the user has entered some photo + name combinations', function () {
    var people;
    var peopleMap;
    var images;

    beforeEach(function (context) {
      context.people = [
        "http://placebear.com/200/200 A Bear",
        "https://placekitten.com/200/200 Kitty Cat"
      ];
      context.peopleMap = {};

      context.people.forEach((p) => {
        var parts = p.match(/([^\s]+) (.*)/);
        context.peopleMap[parts[1]] = parts[2];
      });
      context.images = Object.keys(context.peopleMap);

      context.gameContainer.find('textarea').val(context.people.join("\n")).trigger('input');
    });

    it('starts the game when the start button is pressed', function (context) {
      context.gameContainer.find('.begin-button').click();
      var currentImage = context.gameContainer.find('.person img').attr('src');
      expect(includes(context.images, currentImage)).toBeTruthy();
    });

    it('shows a randomly shuffled list of options', function (context) {
      context.gameContainer.find('.begin-button').click();

      var buttons = context.gameContainer.find('.answer .choice');
      var names = buttons.map(function (ix, button) { return $(button).text() }).toArray();
      expect(names.sort()).toEqual([ 'A Bear', 'Kitty Cat' ].sort())
    });

    describe('during the game', function () {
      describe('in the easy difficulty', function () {
        beforeEach(function (context) {
          context.gameContainer.find('.difficulty').val('easy').trigger('change');
          context.gameContainer.find('.begin-button').click();
          context.currentImage = context.gameContainer.find('.person img').attr('src');
        });

        describe('when the correct image is selected', function () {
          it("shows a successful message", function (context) {
            var correctName = context.peopleMap[context.currentImage];
            context.gameContainer.find(`button:contains("${correctName}")`).click();
            expect(context.gameContainer.find('.game .success').length).toEqual(1);
          });
        });

        describe('when the wrong image is selected', function () {
          beforeEach(function (context) {
            let incorrectName = context.peopleMap[difference(context.images, [context.currentImage])[0]];
            context.gameContainer.find(`button:contains("${incorrectName}")`).click();
          });

          it("shows a failure message", function (context) {
            expect(context.gameContainer.find('.game .failure').length).toEqual(1);
          });

          it('adds the incorrectly guessed person to the mistakes area', function (context) {
            var failureNames = context.gameContainer.find('.failures img').toArray().map((image) => {
              return $(image).attr('title');
            });
            var correctName = context.peopleMap[context.currentImage];
            expect(failureNames).toEqual([correctName]);
          });
        });
      });

      describe.skip('in the medium difficulty', function () {
        function keyEvent (eventName, keyCode) {
          var event = jQuery.Event(eventName);
          event.which = keyCode; // Return Key
          return event;
        }

        beforeEach(function (context) {
          context.gameContainer.find('.difficulty').val('medium').trigger('change');
          context.gameContainer.find('.begin-button').click();
          context.currentImage = context.gameContainer.find('.person img').attr('src');
        });

        describe('when the correct name is selected', function () {
          it("shows a successful message", function (context) {
            var correctName = context.peopleMap[context.currentImage];
            context.gameContainer.find('.typeahead').val(correctName).trigger(keyEvent('keyup', 13));
            expect(context.gameContainer.find('.game .success').length).toEqual(1);
          });
        });

        describe('when the wrong name is selected', function () {
          it("shows a failure message", function (context) {
            var incorrectName = context.peopleMap[difference(images, [context.currentImage])[0]];
            context.gameContainer.find('.typeahead').val(incorrectName).trigger(keyEvent('keyup', 13));
            expect(context.gameContainer.find('.game .failure').length).toEqual(1);
          });
        });
      });

      describe('in the reverse difficulty', function () {
        beforeEach(function (context) {
          context.gameContainer.find('.difficulty').val('reverse').trigger('change');
          context.gameContainer.find('.begin-button').click();
          context.currentName = context.gameContainer.find('.person .person-name').text();
        });

        describe('when the correct name is selected', function () {
          it("shows a successful message", function (context) {
            context.gameContainer.find(`.choice-images img[data-name="${context.currentName}"]`).click();
            expect(context.gameContainer.find('.game .success').length).toEqual(1);
          });
        });

        describe('when the wrong name is selected', function () {
          it("shows a failure message", function (context) {
            context.gameContainer.find('.choice-images [data-name]').filter(`[data-name!="${context.currentName}"]`).click();
            expect(context.gameContainer.find('.game .failure').length).toEqual(1);
          });
        });
      });
    });
  });
});