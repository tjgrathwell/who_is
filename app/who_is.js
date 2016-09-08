import storage from './modules/storage';
import {strip} from './modules/strings';
import {randInt} from './modules/random';
import substringMatcher from './modules/substring_matcher';
import {isScrollKey, KeyCodes, personIndexForKey} from './modules/keys';
import game from './modules/game';
import people from './modules/people';
import './modules/monkeypatches';
import './modules/handlebars_helpers';

function addPerson(person) {
  var personToRender = addChoices(person);
  renderPerson($('#question'), _.extend({}, personToRender, game.personRenderOptions()));
  var typeahead = $('.typeahead').typeahead({
    hint: true,
    highlight: true,
    autoselect: true,
    minLength: 1
  }, {
    name: 'people',
    displayKey: 'value',
    source: substringMatcher(people.allPeople.map(function (person) { return person.name; }))
  });

  function skipPersonOnEsc (e) {
    if (e.which == KeyCodes.ESC) {
      processGuess(null);
    }
  }

  if (typeahead.length > 0) {
    $('.tt-input').keydown(skipPersonOnEsc);
  } else {
    $('.answer input').keydown(skipPersonOnEsc);
  }
}

function addChoices (person) {
  function randomChoice(exceptionNames) {
    var randomPerson = people.randomPerson();
    while (_.include(exceptionNames, randomPerson.name)) {
      randomPerson = people.randomPerson();
    }
    return randomPerson;
  }

  var numChoices = Math.min(people.allPeople.length, 6);
  var choices = [];
  var exceptionNames = [person.name];
  while (choices.length < numChoices - 1) {
    var randomPerson = randomChoice(exceptionNames);
    choices.push(randomPerson);
    exceptionNames.push(randomPerson.name);
  }

  choices.splice(randInt(numChoices), 0, person);
  person.choices = choices;
  return person;
}

function renderPerson($el, person) {
  $el.empty();
  $el.append(templates.person(person));
}

function renderPrevious($el, answerPerson, guessedPerson) {
  $el.empty();
  var previousContext;
  if (game.difficulty == 'reverse') {
    previousContext = {
      answerPerson: guessedPerson,
      guessedPerson: answerPerson
    }
  } else {
    previousContext = {
      answerPerson: answerPerson,
      guessedPerson: guessedPerson
    };
  }
  $el.append(templates.previous(previousContext));
  $el.removeClass('hidden');
  $el.toggleClass('success', answerPerson.guessedCorrectly);
  $el.toggleClass('failure', !answerPerson.guessedCorrectly);
}

function addRandomPerson() {
  addPerson(people.chooseNewPerson());
  $('.answer input').focus();
}

function fullMatch(guess) {
  return guess.toLowerCase() === people.currentPerson().name.toLowerCase();
}

function partialCredit(guess) {
  return guess.toLowerCase().split(' ')[0] === people.currentPerson().name.toLowerCase().split(' ')[0];
}

function renderFailures() {
  if (game.failures.length === 0) {
    return;
  }

  $('.failures').removeClass('hidden');
  $('.failures .photos').html(templates.failures({
    people: game.failures
  }));
}

function renderScore() {
  var $el = $('.scores');
  $el.empty();
  $el.append(templates.score({
    total: people.allPeople.length,
    remaining: people.currentPeople.length,
    guessedPercentage: people.guessedPercentage(),
    score: game.score,
    incorrect: game.wrong,
    percentage: game.percentage()
  }));
}

function renderSavedPeople() {
  storage.retrieve('saved_people', function (savedPeople) {
    var renderData = [];
    _.each(savedPeople, function (people, name) {
      var sample = people.slice(0, 3).map(function (person) {
        return person.name;
      }).join(', ');
      renderData.push({name: name, count: people.length, sample: sample});
    });
    var $el = $('.saved-people');
    $el.empty();
    if (renderData.length > 0) {
      $el.append(templates.saved_people({savedGroups: renderData}));
    }
  }, {});
}

function renderPreview($row, people) {
  $row.after('<tr><td colspan=5 class=saved-preview>' + templates.preview_people({people: people}) + '</td></tr>');
  $row.find('.preview-saved').addClass('hidden');
  $row.find('.hide-preview').removeClass('hidden');
}

function hidePreview($row) {
  $row.next().remove();
  $row.find('.preview-saved').removeClass('hidden');
  $row.find('.hide-preview').addClass('hidden');
}

function processGuess(guess) {
  var thisPerson = people.currentPerson();
  _.extend(thisPerson, {
    guessedCorrectly: false,
    guessedPartially: false
  });

  game.guesses += 1;
  if (guess && (fullMatch(guess) || (game.difficulty == 'hard' && partialCredit(guess)))) {
    thisPerson.guessedCorrectly = true;
    people.currentPeople.splice(people.currentPersonIndex, 1);
    game.score += 1;
  } else if (guess && partialCredit(guess)) {
    thisPerson.guessedPartially = true;
    game.score += .5;
  } else {
    game.wrong += 1;
    game.failures.push({name: thisPerson.name, photo: thisPerson.photo});
    renderFailures();
  }

  renderScore();

  if (people.currentPeople.length > 0) {
    addRandomPerson();
    if (guess) {
      var guessedPerson = people.personMatching(guess);
      renderPrevious($('#answer'), thisPerson, guessedPerson);
    } else {
      renderPrevious($('#answer'), thisPerson, null);
    }

    persistState();
  } else {
    clearState();
    $('#question').addClass('hidden');
    $('.replay').removeClass('hidden');
  }
}

function persistState () {
  storage.store('saved_state', {
    people: people.persistedData(),
    game: game.persistedData()
  });
}

function clearState () {
  storage.remove('saved_state');
}

function setGameVisibility(playing, resuming) {
  game.playing = playing;
  $('.entry').toggleClass('hidden', playing);
  if (!playing) {
    clearState();
    renderSavedPeople();
  }
  $('.game').toggleClass('hidden', !playing);
  $('#question').removeClass('hidden');
  $('#answer')
    .empty()
    .removeClass('success')
    .removeClass('failure')
    .toggleClass('hidden', !playing || resuming || (game.guesses === 0));
  $('.replay').addClass('hidden');

  var showFailures = resuming && game.failures.length > 1;
  $('.failures').toggleClass('hidden', !showFailures);
  $('.restart').toggleClass('hidden', !showFailures);
  if (!showFailures) {
    $('.failures .photos').empty();
  }
}

function startGuessing() {
  game.resetScore();

  setGameVisibility(true);

  people.currentPeople = people.allPeople.slice(0);

  addRandomPerson();

  renderScore();
}

function showMainContainer () {
  $('.game-container').css('visibility', 'visible');
}

function parseTextarea () {
  return _.compact(_.map($('.entry textarea').val().split("\n"), function (line) {
    var match;
    if (match = strip(line).match(/^(http[^ ]+)\s+(.*)/)) {
      return {
        photo: match[1],
        name: match[2]
      };
    }
  }));
}

export default function start (selector) {
  var gameContainer = $(selector);
  gameContainer.html(templates.main());

  storage.retrieve('difficulty', function (value) {
    game.difficulty = value;
  }, 'easy');

  $('.difficulty-select-container').append(templates.difficulty_select({
    difficulties: _.map([
      'easy', 'medium', 'hard', 'hardest', 'reverse'
    ], function (level) {
      return {name: level.toTitleCase(), value: level};
    }),
    selectedDifficulty: game.difficulty
  }));

  function startGameWithPeople(thesePeople, savedName) {
    people.allPeople = _.uniq(thesePeople, function (p) { return p.name; });
    storage.store('people', people.allPeople);
    if (savedName) {
      storage.retrieve('saved_people', function (savedPeople) {
        savedPeople[savedName] = people.allPeople;
        storage.store('saved_people', savedPeople);
      }, {});
    }

    startGuessing();
  }

  gameContainer.on('click', '.begin-button', function (event) {
    startGameWithPeople(parseTextarea(), $('.save-as-name').val());
  });

  gameContainer.on('change', 'select.difficulty', function () {
    game.difficulty = this.value;
    storage.store('difficulty', game.difficulty);

    if (game.playing) {
      startGuessing();
    }
  });

  gameContainer.on('click', '.replay button', function (event) {
    startGuessing();
  });

  gameContainer.on('keydown', function (event) {
    if (!(game.playing && game.difficulty == 'easy')) {
      return;
    }

    if (isScrollKey(event.which)) {
      event.preventDefault();
    }
  });

  gameContainer.on('keyup', function (event) {
    if (!(game.playing && game.difficulty == 'easy')) {
      return;
    }

    var choiceIx = personIndexForKey(event.which);
    if (choiceIx !== undefined) {
      var choicePerson = people.currentPerson().choices[choiceIx];
      processGuess(choicePerson.name);
    }
  });

  gameContainer.on('keyup', '.answer input', function (event) {
    if (event.which === KeyCodes.RETURN) {
      var guess = $(this).val();
      var validPerson = people.personMatching(guess);
      if (game.difficulty.match(/^hard/) || (game.difficulty == 'medium' && validPerson)) {
        processGuess(guess);
      }
    }
  });

  gameContainer.on('click', '[data-link=restart]', function (event) {
    setGameVisibility(false);
  });

  gameContainer.on('click', '[data-link=restart-mistakes]', function (event) {
    var now = new Date();
    var date = [
      now.getFullYear(),
      (now.getMonth() + 1),
      now.getDate()
    ].join('-');

    var time = [
      now.getHours(),
      now.getMinutes()
    ].join(':');
    startGameWithPeople(game.failures, 'Mistakes ' + [date, time].join(' '));
  });

  gameContainer.on('click', 'button.choice', function (event) {
    var guess = $(this).text();
    processGuess(guess);
  });

  gameContainer.on('click', '.choice-images img', function (event) {
    var guess = $(this).data('name');
    processGuess(guess);
  });

  gameContainer.on('click', '.start-with-saved', function (event) {
    storage.retrieve('saved_people', function (savedPeople) {
      startGameWithPeople(savedPeople[$(event.target).data('name')], $('.save-as-name').val());
    });
  });

  gameContainer.on('click', '.rename-saved', function (event) {
    var valueToStore = {};
    var oldName = $(event.target).data('name');
    var newName = prompt('Enter new name');
    if (oldName && newName) {
      storage.retrieve('saved_people', function (savedPeople) {
        var list = savedPeople[oldName];
        delete savedPeople[oldName];
        savedPeople[newName] = list;
        valueToStore = savedPeople;
      });

      storage.store('saved_people', valueToStore);
      renderSavedPeople();
    }
  });

  gameContainer.on('click', '.preview-saved', function (event) {
    var name = $(event.target).data('name');
    if (name) {
      storage.retrieve('saved_people', function (savedPeople) {
        renderPreview($(event.target).closest('tr'), savedPeople[name]);
      });
    }
  });

  gameContainer.on('click', '.hide-preview', function (event) {
    hidePreview($(event.target).closest('tr'));
  });

  gameContainer.on('click', '.clear-saved', function (event) {
    var result = confirm('Are you sure?');
    if (!result) {
      return;
    }

    var valueToStore = {};
    var name = $(event.target).data('name');
    if (name) {
      storage.retrieve('saved_people', function (savedPeople) {
        delete savedPeople[name];
        valueToStore = savedPeople;
      });
    }
    storage.store('saved_people', valueToStore);
    renderSavedPeople();
  });

  storage.retrieve('saved_state', function (savedState) {
    if (savedState && _.keys(savedState).length > 0) {
      people.allPeople = savedState.people.allPeople;
      people.currentPeople = _.filter(people.allPeople, function (p) {
        return _.include(savedState.people.currentPeopleNames, p.name);
      });
      _.extend(game, savedState.game);

      setGameVisibility(true, true);

      addRandomPerson();

      renderFailures();
      renderScore();
    } else {
      renderSavedPeople();
    }

    showMainContainer();
  }, {});
}