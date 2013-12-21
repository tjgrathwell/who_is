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
  var person = currentPeople[currentPersonIndex];
  return {
    name: person[1],
    photo: person[0]
  }
}

function addPerson(personIndex) {
  currentPersonIndex = personIndex;
  var templateData = currentPerson();
  renderPerson($('#question'), addChoices(currentPerson(), personIndex));
}

function addChoices (person, personIndex) {
  var numChoices = 6;
  var choices = [];
  var personChoiceIndex = Math.floor(Math.random() * numChoices);
  while (choices.length < 6) {
    if (choices.length === personChoiceIndex) {
      choices.push({name: currentPeople[personIndex][1]});
    } else {
      addToChoices(choices);
    }
  }
  person.choices = choices;
  return person;
}

function inArray(person, people) {
  for (var i = 0; i < people.length; i++) {
    if (person[1] === people[i][1]) {
      return true;
    }
  }
  return false;
}

function addToChoices(choices) {
  var personIx = Math.floor(Math.random() * allPeople.length);
  var randomPerson = allPeople[personIx];
  while (inArray(randomPerson, choices)) {
    personIx = Math.floor(Math.random() * allPeople.length);
    randomPerson = allPeople[personIx];
  }
  choices.push({name: randomPerson[1]});
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
  var personIx = Math.floor(Math.random() * currentPeople.length);
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

$(document).ready(function () {
  $(document).on('click', '.entry button', function (event) {
    allPeople = [];
    var match;
    var lines = $('.entry textarea').val().split("\n");
    for (var i = 0; i < lines.length; i++) {
      var line = strip(lines[i]);
      if (match = line.match(/^(http[^ ]+)\s+(.*)/)) {
        allPeople.push([match[1], match[2]]);
      }
    }

    $('.entry').addClass('hidden');
    $('.game').removeClass('hidden');

    startGuessing();
  });
});