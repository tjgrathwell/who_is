var allPeople = [];
var currentPeople = [];

var templates = {
  person: Handlebars.compile($("#person-template").html()),
  previous: Handlebars.compile($("#previous-template").html())
};

var score = 0;
var wrong = 0;
var guesses = 0;
var currentPersonIndex;

function currentPerson() {
  return currentPeople[currentPersonIndex];
}

function addPerson(personIndex) {
  currentPersonIndex = personIndex;
  renderPerson($('#question'), addChoices(currentPerson(), personIndex));
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

function renderPrevious($el, person) {
  $el.empty();
  $el.append(templates.previous(person));
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

  thisPerson.yes_or_no = false;
  guesses += 1;
  if (fullMatch(guess)) {
    thisPerson.yes_or_no = true;
    currentPeople.splice(currentPersonIndex, 1);
    score += 1;
  } else if (partialCredit(guess)) {
    score += .5;
  } else {
    wrong += 1;
  }

  renderScore();
  addRandomPerson();
  renderPrevious($('#answer'), thisPerson);
}

function startGuessing() {
  currentPeople = allPeople.slice(0);

  addRandomPerson();

  renderScore();

  $(document).on('click', 'button.choice', function (event) {
    var guess = $(this).text();
    processGuess(guess);
  });

  $(document).on('keydown', '.answer input', function (event) {
    if (event.which === 13) {
      var guess = $('.answer input').val();
      processGuess(guess);
    }
  });
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

$(document).ready(function () {
  $(document).on('click', '.entry button', function (event) {
    allPeople = parseTextarea();

    $('.entry').addClass('hidden');
    $('.game').removeClass('hidden');

    startGuessing();
  });
});