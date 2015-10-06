String.prototype.toTitleCase = function () {
  return this[0].toUpperCase() + this.substr(1);
};

function quote_for_regexp(str) {
  return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}

function randInt (max) {
  return Math.floor(Math.random() * max);
}

var KEYS = {
  W: 87,
  A: 65,
  S: 83,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  ESC: 27
};

var game = {
  playing: false,
  score: 0,
  wrong: 0,
  guesses: 0,
  failures: [],
  difficulty: 'easy',
  percentage: function () {
    if (this.score === this.guesses) {
      return 100;
    } else {
      var pct = (this.score / this.guesses) * 100;
      return pct.toFixed();
    }
  },
  personRenderOptions: function () {
    if (this.difficulty == 'easy') {
      return {showChoiceButtons: true};
    }
    if (this.difficulty == 'medium') {
      return {showTypeahead: true};
    }
    if (this.difficulty.match(/^hard/)) {
      return {showTextInput: true};
    }
    if (this.difficulty == 'reverse') {
      return {showChoiceImages: true};
    }
  }
};

var people = {
  currentPersonIndex: null,
  allPeople: [],
  currentPeople: [],
  personMatching: function (guess) {
    return this.allPeople.filter(function (person) { return person.name.toLowerCase() == guess.toLowerCase(); })[0];
  },
  randomPerson: function () {
    var personIx = randInt(this.allPeople.length);
    return this.allPeople[personIx];
  },
  currentPerson: function () {
    return this.currentPeople[this.currentPersonIndex];
  },
  chooseNewPerson: function () {
    this.currentPersonIndex = randInt(this.currentPeople.length);;
    return this.currentPerson();
  },
  guessedPercentage: function () {
    var guessed = this.allPeople.length - this.currentPeople.length;
    var pct = (guessed / this.allPeople.length) * 100;
    return pct.toFixed();
  }
};

var storage = {
  _parseValue: function (value) {
    if (value && _.include(['[', '{'], value[0])) {
      return JSON.parse(value);
    } else {
      return value;
    }
  },
  _serialValue: function (value) {
    if (typeof value === 'string') {
      return value;
    } else {
      return JSON.stringify(value);
    }
  },
  retrieve: function (key, callback, defaultValue) {
    if (this.supported) {
      var value = localStorage['who_is.' + key];
      if (value) {
        callback(this._parseValue(value));
        return;
      }
    }
    if (defaultValue) {
      callback(defaultValue);
    }
  },
  store: function (key, value) {
    if (this.supported) {
      localStorage['who_is.' + key] = this._serialValue(value);
    }
  },
  remove: function (key) {
    if (this.supported) {
      localStorage.removeItem(['who_is.' + key]);
    }
  },
  supported: (function () {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }())
};

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
    if (e.which == KEYS.ESC) {
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
  $row.find('.preview-saved').hide();
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
    people: {
      allPeople: _.map(people.allPeople, function (person) {
        return {name: person.name, photo: person.photo};
      }),
      currentPeopleNames: _.pluck(people.currentPeople, 'name')
    },
    game: {
      score: game.score,
      wrong: game.wrong,
      guesses: game.guesses,
      failures: game.failures,
      difficulty: game.difficulty
    }
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
  game.score = 0;
  game.wrong = 0;
  game.guesses = 0;
  game.failures = [];

  setGameVisibility(true);

  people.currentPeople = people.allPeople.slice(0);

  addRandomPerson();

  renderScore();
}

function showMainContainer () {
  $('.game-container').css('visibility', 'visible');
}

function strip(str) {
  return str.replace(/^\s*(.*?)\s*$/, "$1");
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

// Ripped from the example at http://twitter.github.io/typeahead.js/examples/
var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substrRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(quote_for_regexp(q), 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
      }
    });

    cb(matches);
  };
};

$(document).ready(function () {
  storage.retrieve('difficulty', function (value) {
    game.difficulty = value;
  }, 'easy');

  var difficultyContext = {
    difficulties: _.map([
      'easy', 'medium', 'hard', 'hardest', 'reverse'
    ], function (level) {
      return {name: level.toTitleCase(), value: level};
    })
  };
  $('.difficulty-select-container').append(templates.difficulty_select(difficultyContext));
  $('select.difficulty').val(game.difficulty);

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

  $(document).on('click', '.begin-button', function (event) {
    startGameWithPeople(parseTextarea(), $('.save-as-name').val());
  });

  $(document).on('change', 'select.difficulty', function () {
    game.difficulty = $('select.difficulty').val();
    storage.store('difficulty', game.difficulty);

    if (game.playing) {
      startGuessing();
    }
  });

  $(document).on('click', '.replay button', function (event) {
    startGuessing();
  });

  //  0/W    1/^
  //  2/A    3/>
  //  4/S    5/v

  var key_choices = {};
  key_choices[KEYS.W] = 0;
  key_choices[KEYS.A] = 2;
  key_choices[KEYS.S] = 4;
  key_choices[KEYS.UP] = 1;
  key_choices[KEYS.RIGHT] = 3;
  key_choices[KEYS.DOWN] = 5;

  $(document).on('keyup', function (event) {
    if (!game.playing) {
      return;
    }
    if (game.difficulty != 'easy') {
      return;
    }

    var choiceIx = key_choices[event.which];
    if (choiceIx !== undefined) {
      var choicePerson = people.currentPerson().choices[choiceIx];
      processGuess(choicePerson.name);
    }
  });

  $(document).on('keyup', '.answer input', function (event) {
    if (event.which === 13) {
      var guess = $(this).val();
      var validPerson = people.personMatching(guess);
      if (game.difficulty.match(/^hard/) || (game.difficulty == 'medium' && validPerson)) {
        processGuess(guess);
      }
    }
  });

  $(document).on('click', '[data-link=restart]', function (event) {
    setGameVisibility(false);
  });

  $(document).on('click', '[data-link=restart-mistakes]', function (event) {
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

  $(document).on('click', 'button.choice', function (event) {
    var guess = $(this).text();
    processGuess(guess);
  });

  $(document).on('click', '.choice-images img', function (event) {
    var guess = $(this).data('name');
    processGuess(guess);
  });

  $(document).on('click', '.start-with-saved', function (event) {
    storage.retrieve('saved_people', function (savedPeople) {
      startGameWithPeople(savedPeople[$(event.target).data('name')], $('.save-as-name').val());
    });
  });

  $(document).on('click', '.rename-saved', function (event) {
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

  $(document).on('click', '.preview-saved', function (event) {
    var name = $(event.target).data('name');
    if (name) {
      storage.retrieve('saved_people', function (savedPeople) {
        renderPreview($(event.target).closest('tr'), savedPeople[name]);
      });
    }
  });

  $(document).on('click', '.clear-saved', function (event) {
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
});