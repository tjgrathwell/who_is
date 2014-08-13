var score, wrong, guesses, currentPersonIndex, difficulty;
var allPeople = [];
var currentPeople = [];

var templates = {
  person: Handlebars.compile($("#person-template").html()),
  previous: Handlebars.compile($("#previous-template").html())
};

window.supportsLocalStorage = (function () {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}());

function currentPerson() {
  return currentPeople[currentPersonIndex];
}

function addPerson(personIndex) {
  currentPersonIndex = personIndex;
  var personToRender = addChoices(currentPerson(), personIndex);
  personToRender.easy = difficulty == 'easy';
  personToRender.medium = difficulty == 'medium';
  renderPerson($('#question'), personToRender);
  $('.typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  }, {
    name: 'people',
    displayKey: 'value',
    source: substringMatcher(allPeople.map(function (person) { return person.name; }))
  });
}

function randInt (max) {
  return Math.floor(Math.random() * max);
}

function addChoices (person) {
  function randomChoice(exceptionNames) {
    var personIx = randInt(allPeople.length);
    var randomPerson = allPeople[personIx];
    while (_.include(exceptionNames, randomPerson.name)) {
      personIx = randInt(allPeople.length);
      randomPerson = allPeople[personIx];
    }
    return randomPerson;
  }

  var numChoices = Math.min(allPeople.length, 6);
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
  var personIx = randInt(currentPeople.length);
  addPerson(personIx);
  $('.answer input').focus();
}

function fullMatch(guess) {
  return guess.toLowerCase() === currentPerson().name.toLowerCase();
}

function partialCredit(guess) {
  return guess.toLowerCase().split(' ')[0] === currentPerson().name.toLowerCase().split(' ')[0];
}

function renderFailure(person) {
  $('.failures').removeClass('hidden');
  var img = $('<img></img>');
  img.attr('src', person.photo);
  img.attr('title', person.name);
  $('.failures .photos').append(img);
}

function renderScore() {
  $('#total').text(currentPeople.length);
  $('#score').text(score);
  $('#incorrect').text(wrong);
  if (score === guesses) {
    $('#percentage').text(100);
  } else {
    var pct = (score / guesses) * 100;
    $('#percentage').text(pct.toString().substr(0, 2));
  }
}

function processGuess(guess) {
  var thisPerson = currentPerson();

  guesses += 1;
  thisPerson.guessedCorrectly = false;
  if (fullMatch(guess)) {
    thisPerson.guessedCorrectly = true;
    currentPeople.splice(currentPersonIndex, 1);
    score += 1;
  } else if (partialCredit(guess)) {
    score += .5;
  } else {
    wrong += 1;
    renderFailure(thisPerson);
  }

  renderScore();

  if (currentPeople.length > 0) {
    addRandomPerson();
    var guessedPerson = allPeople.filter(function (person) { return person.name == guess; })[0];
    renderPrevious($('#answer'), thisPerson, guessedPerson);
  } else {
    $('.replay').removeClass('hidden');
  }
}

function setGameVisibility(playing) {
  $('.entry').toggleClass('hidden', playing);
  $('.game').toggleClass('hidden', !playing);
  $('.restart').toggleClass('hidden', !playing);
  $('#answer').toggleClass('hidden', !playing);
  $('.replay').addClass('hidden');
  $('.failures').addClass('hidden');
  $('.failures .photos').empty();
}

function startGuessing() {
  setGameVisibility(true);

  score = 0;
  wrong = 0;
  guesses = 0;

  currentPeople = allPeople.slice(0);

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
  difficulty = 'easy';
  if (window.supportsLocalStorage) {
    difficulty = localStorage['who_is.difficulty'] || difficulty;
    $('select.difficulty').val(difficulty);
  }

  $(document).on('click', '.entry button', function (event) {
    allPeople = parseTextarea();
    if (window.supportsLocalStorage) {
      localStorage['who_is.people'] = JSON.stringify(allPeople);
    }

    startGuessing();
  });

  $(document).on('change', 'select.difficulty', function () {
    difficulty = $('select.difficulty').val();
    if (window.supportsLocalStorage) {
      localStorage['who_is.difficulty'] = difficulty;
    }
    startGuessing();
  });

  $(document).on('click', '.replay button', function (event) {
    startGuessing();
  });

  $(document).on('keyup', '.answer .typeahead', function (event) {
    if (event.which === 13) {
      var guess = $(this).val();
      if (allPeople.filter(function (person) { return person.name === guess; }).length > 0) {

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

  if (window.supportsLocalStorage && localStorage['who_is.people']) {
    allPeople = JSON.parse(localStorage['who_is.people']);
    startGuessing();
  }
});