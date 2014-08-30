function randInt (max) {
  return Math.floor(Math.random() * max);
}

var game = {
  playing: false,
  score: 0,
  wrong: 0,
  guesses: 0,
  difficulty: 'easy',
  percentage: function () {
    if (this.score === this.guesses) {
      return 100;
    } else {
      var pct = (this.score / this.guesses) * 100;
      return pct.toString().substr(0, 2);
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
  }
};

var templates = {
  person: Handlebars.compile($("#person-template").html()),
  previous: Handlebars.compile($("#previous-template").html()),
  score: Handlebars.compile($("#score-template").html())
};

var storage = {
  retrieve: function (key, callback, defaultValue) {
    if (this.supported) {
      var value = localStorage['who_is.' + key];
      if (value) {
        callback(value);
      }
    } else if (defaultValue) {
      callback(defaultValue);
    }
  },
  store: function (key, value) {
    if (this.supported) {
      localStorage['who_is.' + key] = value;
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
  personToRender.difficulty = {};
  personToRender.difficulty[game.difficulty] = true;
  renderPerson($('#question'), personToRender);
  $('.typeahead').typeahead({
    hint: true,
    highlight: true,
    autoselect: true,
    minLength: 1
  }, {
    name: 'people',
    displayKey: 'value',
    source: substringMatcher(people.allPeople.map(function (person) { return person.name; }))
  });
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
  while (choices.length < numChoices - 1) {
    var exceptionNames = choices.concat(person.name);
    choices.push(randomChoice(exceptionNames).name);
  }

  choices.splice(randInt(numChoices), 0, person.name);
  person.choices = _.map(choices, function (choiceName) {
    return {name: choiceName};
  });
  return person;
}

function renderPerson($el, person) {
  $el.empty();
  $el.append(templates.person(person));
}

function renderPrevious($el, answerPerson, guessedPerson) {
  $el.empty();
  $el.append(templates.previous({
    answerPerson: answerPerson,
    guessedPerson: guessedPerson
  }));
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

function renderFailure(person) {
  $('.failures').removeClass('hidden');
  var img = $('<img></img>');
  img.attr('src', person.photo);
  img.attr('title', person.name);
  $('.failures .photos').append(img);
}

function renderScore() {
  var $el = $('.scores');
  $el.empty();
  $el.append(templates.score({
    total: people.currentPeople.length,
    score: game.score,
    incorrect: game.wrong,
    percentage: game.percentage()
  }));
}

function processGuess(guess) {
  var thisPerson = people.currentPerson();

  game.guesses += 1;
  thisPerson.guessedCorrectly = false;
  if (fullMatch(guess)) {
    thisPerson.guessedCorrectly = true;
    people.currentPeople.splice(people.currentPersonIndex, 1);
    game.score += 1;
  } else if (partialCredit(guess)) {
    game.score += .5;
  } else {
    game.wrong += 1;
    renderFailure(thisPerson);
  }

  renderScore();

  if (people.currentPeople.length > 0) {
    addRandomPerson();
    var guessedPerson = people.personMatching(guess);
    renderPrevious($('#answer'), thisPerson, guessedPerson);
  } else {
    $('.replay').removeClass('hidden');
  }
}

function setGameVisibility(playing) {
  game.playing = playing;
  $('.entry').toggleClass('hidden', playing);
  $('.game').toggleClass('hidden', !playing);
  $('.restart').toggleClass('hidden', !playing);
  $('#answer')
    .empty()
    .removeClass('success')
    .removeClass('failure')
    .toggleClass('hidden', !playing || (game.guesses === 0));
  $('.replay').addClass('hidden');
  $('.failures').addClass('hidden');
  $('.failures .photos').empty();
}

function startGuessing() {
  game.score = 0;
  game.wrong = 0;
  game.guesses = 0;

  setGameVisibility(true);

  people.currentPeople = people.allPeople.slice(0);

  addRandomPerson();

  renderScore();
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
    substrRegex = new RegExp(q, 'i');

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
  $('select.difficulty').val(game.difficulty);

  $(document).on('click', '.entry button', function (event) {
    people.allPeople = parseTextarea();
    storage.store('who_is.people', JSON.stringify(people.allPeople));

    startGuessing();
  });

  $(document).on('change', 'select.difficulty', function () {
    game.difficulty = $('select.difficulty').val();
    storage.store('difficulty', game.difficulty);

    startGuessing();
  });

  $(document).on('click', '.replay button', function (event) {
    startGuessing();
  });

  var keys = {
    W: 87,
    A: 65,
    S: 83,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  };

  //  0/W    1/^
  //  2/A    3/>
  //  4/S    5/v

  var key_choices = {};
  key_choices[keys.W] = 0;
  key_choices[keys.A] = 2;
  key_choices[keys.S] = 4;
  key_choices[keys.UP] = 1;
  key_choices[keys.RIGHT] = 3;
  key_choices[keys.DOWN] = 5;

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
      if (game.difficulty == 'hard' || (game.difficulty == 'medium' && validPerson)) {
        processGuess(guess);
      }
    }
  });

  $(document).on('click', '.restart button', function (event) {
    setGameVisibility(false);
  });

  $(document).on('click', 'button.choice', function (event) {
    var guess = $(this).text();
    processGuess(guess);
  });

  storage.retrieve('people', function (savedPeople) {
    people.allPeople = JSON.parse(savedPeople);
    startGuessing();
  });
});