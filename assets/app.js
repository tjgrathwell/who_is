define('modules/game', ['exports', 'module'], function (exports, module) {
  'use strict';

  module.exports = {
    playing: false,
    score: 0,
    wrong: 0,
    guesses: 0,
    failures: [],
    difficulty: 'easy',
    percentage: function percentage() {
      if (this.score === this.guesses) {
        return 100;
      } else {
        var pct = this.score / this.guesses * 100;
        return pct.toFixed();
      }
    },
    personRenderOptions: function personRenderOptions() {
      if (this.difficulty == 'easy') {
        return { showChoiceButtons: true };
      }
      if (this.difficulty == 'medium') {
        return { showTypeahead: true };
      }
      if (this.difficulty.match(/^hard/)) {
        return { showTextInput: true };
      }
      if (this.difficulty == 'reverse') {
        return { showChoiceImages: true };
      }
    },
    resetScore: function resetScore() {
      this.score = 0;
      this.wrong = 0;
      this.guesses = 0;
      this.failures = [];
    },
    persistedData: function persistedData() {
      return _.pick(this, 'score', 'wrong', 'guesses', 'failures', 'difficulty');
    }
  };
});
define("modules/keys", ["exports", "module"], function (exports, module) {
  "use strict";

  module.exports = {
    W: 87,
    A: 65,
    S: 83,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ESC: 27
  };
});
define("modules/monkeypatches", ["exports"], function (exports) {
  "use strict";

  String.prototype.toTitleCase = function () {
    return this[0].toUpperCase() + this.substr(1);
  };
});
define('modules/people', ['exports', 'module', './random'], function (exports, module, _random) {
  'use strict';

  module.exports = {
    currentPersonIndex: null,
    allPeople: [],
    currentPeople: [],
    personMatching: function personMatching(guess) {
      return this.allPeople.filter(function (person) {
        return person.name.toLowerCase() == guess.toLowerCase();
      })[0];
    },
    randomPerson: function randomPerson() {
      var personIx = (0, _random.randInt)(this.allPeople.length);
      return this.allPeople[personIx];
    },
    currentPerson: function currentPerson() {
      return this.currentPeople[this.currentPersonIndex];
    },
    chooseNewPerson: function chooseNewPerson() {
      this.currentPersonIndex = (0, _random.randInt)(this.currentPeople.length);;
      return this.currentPerson();
    },
    guessedPercentage: function guessedPercentage() {
      var guessed = this.allPeople.length - this.currentPeople.length;
      var pct = guessed / this.allPeople.length * 100;
      return pct.toFixed();
    },
    persistedData: function persistedData() {
      return {
        allPeople: _.map(this.allPeople, function (person) {
          return { name: person.name, photo: person.photo };
        }),
        currentPeopleNames: _.pluck(this.currentPeople, 'name')
      };
    }
  };
});
define("modules/random", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.randInt = randInt;

  function randInt(max) {
    return Math.floor(Math.random() * max);
  }
});
define('modules/storage', ['exports', 'module'], function (exports, module) {
  'use strict';

  function parseValue(value) {
    if (value && _.include(['[', '{'], value[0])) {
      return JSON.parse(value);
    } else {
      return value;
    }
  }

  function serialValue(value) {
    if (typeof value === 'string') {
      return value;
    } else {
      return JSON.stringify(value);
    }
  }

  module.exports = {
    retrieve: function retrieve(key, callback, defaultValue) {
      if (this.supported) {
        var value = localStorage['who_is.' + key];
        if (value) {
          callback(parseValue(value));
          return;
        }
      }
      if (defaultValue) {
        callback(defaultValue);
      }
    },
    store: function store(key, value) {
      if (this.supported) {
        localStorage['who_is.' + key] = serialValue(value);
      }
    },
    remove: function remove(key) {
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
    })()
  };
});
define("modules/strings", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.strip = strip;

  function strip(str) {
    return str.replace(/^\s*(.*?)\s*$/, "$1");
  }
});
define("modules/substring_matcher", ["exports", "module"], function (exports, module) {
  "use strict";

  module.exports = substringMatcher;
  function quote_for_regexp(str) {
    return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
  }

  // Ripped from the example at http://twitter.github.io/typeahead.js/examples/

  function substringMatcher(strs) {
    return function findMatches(q, cb) {
      var matches, substrRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(quote_for_regexp(q), 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function (i, str) {
        if (substrRegex.test(str)) {
          // the typeahead jQuery plugin expects suggestions to a
          // JavaScript object, refer to typeahead docs for more info
          matches.push({ value: str });
        }
      });

      cb(matches);
    };
  }

  ;
});
window.templates = window.templates || {};
templates['difficulty_select'] = Handlebars.compile("<label class=\"difficulty-select\">\n  Difficulty:\n  <select class=\"difficulty pull-right form-control\">\n    {{#each difficulties}}\n      <option value=\"{{this.value}}\">{{this.name}}</option>\n    {{/each}}\n  </select>\n</label>\n");
window.templates = window.templates || {};
templates['failures'] = Handlebars.compile("{{#each people}}\n  <img src=\"{{photo}}\" title=\"{{name}}\">\n{{/each}}");
window.templates = window.templates || {};
templates['person'] = Handlebars.compile("<div class=\"person\">\n  {{#if showChoiceImages}}\n    <h3>Who is {{name}}?</h3>\n  {{else}}\n    <h3>Who is this?</h3>\n    <img class=\"photo\" src=\"{{photo}}\" />\n  {{/if}}\n\n  <div class=\"answer\">\n    {{#if showChoiceButtons}}\n      {{#each choices}}\n        <button class=\"choice\">{{name}}</button>\n      {{/each}}\n    {{/if}}\n    {{#if showTypeahead}}\n      <input class=\"typeahead\" placeholder=\"Who is it?\" autofocus>\n    {{/if}}\n    {{#if showTextInput}}\n      <input class=\'form-control\' placeholder=\"Who is it?\" autofocus>\n    {{/if}}\n    {{#if showChoiceImages}}\n      <div class=\"choice-images\">\n        {{#each choices}}\n          <img src=\"{{photo}}\" data-name=\"{{name}}\">\n        {{/each}}\n      </div>\n    {{/if}}\n  </div>\n</div>\n");
window.templates = window.templates || {};
templates['preview_people'] = Handlebars.compile("{{#each people}}\n  <img src={{photo}} title=\"{{name}}\" class=\"preview\">\n{{/each}}\n");
window.templates = window.templates || {};
templates['previous'] = Handlebars.compile("<h1 style=\"text-align: center;\">\n  {{#if answerPerson.guessedCorrectly}}\n    YES\n  {{else}}\n    {{#if answerPerson.guessedPartially}}\n      ALMOST\n    {{else}}\n      NO\n    {{/if}}\n  {{/if}}\n</h1>\n<img class=\"photo {{#unless answerPerson.guessedCorrectly}}{{#if guessedPerson}}photo-small{{/if}}{{/unless}}\" src=\"{{answerPerson.photo}}\"/>\n<h3>That was {{answerPerson.name}}</h3>\n{{#unless answerPerson.guessedCorrectly}}\n  {{#if guessedPerson}}\n    <br>\n    <h3>This is {{guessedPerson.name}}:</h3>\n    <img class=\"photo photo-small\" src=\"{{guessedPerson.photo}}\"/>\n  {{/if}}\n{{/unless}}\n");
window.templates = window.templates || {};
templates['saved_people'] = Handlebars.compile("<h2>Saved Lists:</h2>\n<table class=\"table table-striped\">\n  <thead>\n  <tr>\n    <th>#</th>\n    <th>Name</th>\n    <th>Sample</th>\n    <th></th>\n  </tr>\n  </thead>\n  <tbody>\n{{#each savedGroups}}\n  <tr>\n    <td>{{count}}</td>\n    <td><a href=\"#\" class=\'start-with-saved\' data-name=\"{{name}}\">{{name}}</a></td>\n    <td>{{sample}}</td>\n    <td><button class=\"btn btn-primary rename-saved\" data-name=\"{{name}}\">Rename</button></td>\n    <td><button class=\"btn btn-primary preview-saved\" data-name=\"{{name}}\">Preview</button></td>\n    <td><button class=\"btn btn-danger clear-saved\" data-name=\"{{name}}\">Delete</button></td>\n  </tr>\n{{/each}}\n  </tbody>\n</table>\n<button class=\"btn btn-primary clear-saved\">Clear Saved Lists</button>");
window.templates = window.templates || {};
templates['score'] = Handlebars.compile("<h2>{{score}} correct, {{incorrect}} incorrect ({{percentage}}%)</h2>\n\n<h2>{{remaining}} of {{total}} remain</h2>\n\n<div class=\"progress\">\n  <div class=\"progress-bar\" role=\"progressbar\" style=\"width: {{guessedPercentage}}%; min-width: 3em;\">\n    {{guessedPercentage}}%\n  </div>\n</div>");
define('who_is', ['exports', './modules/storage', './modules/strings', './modules/random', './modules/substring_matcher', './modules/keys', './modules/game', './modules/people', './modules/monkeypatches'], function (exports, _modulesStorage, _modulesStrings, _modulesRandom, _modulesSubstring_matcher, _modulesKeys, _modulesGame, _modulesPeople, _modulesMonkeypatches) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _storage = _interopRequireDefault(_modulesStorage);

  var _substringMatcher = _interopRequireDefault(_modulesSubstring_matcher);

  var _KEYS = _interopRequireDefault(_modulesKeys);

  var _game = _interopRequireDefault(_modulesGame);

  var _people = _interopRequireDefault(_modulesPeople);

  function addPerson(person) {
    var personToRender = addChoices(person);
    renderPerson($('#question'), _.extend({}, personToRender, _game['default'].personRenderOptions()));
    var typeahead = $('.typeahead').typeahead({
      hint: true,
      highlight: true,
      autoselect: true,
      minLength: 1
    }, {
      name: 'people',
      displayKey: 'value',
      source: (0, _substringMatcher['default'])(_people['default'].allPeople.map(function (person) {
        return person.name;
      }))
    });

    function skipPersonOnEsc(e) {
      if (e.which == _KEYS['default'].ESC) {
        processGuess(null);
      }
    }

    if (typeahead.length > 0) {
      $('.tt-input').keydown(skipPersonOnEsc);
    } else {
      $('.answer input').keydown(skipPersonOnEsc);
    }
  }

  function addChoices(person) {
    function randomChoice(exceptionNames) {
      var randomPerson = _people['default'].randomPerson();
      while (_.include(exceptionNames, randomPerson.name)) {
        randomPerson = _people['default'].randomPerson();
      }
      return randomPerson;
    }

    var numChoices = Math.min(_people['default'].allPeople.length, 6);
    var choices = [];
    var exceptionNames = [person.name];
    while (choices.length < numChoices - 1) {
      var randomPerson = randomChoice(exceptionNames);
      choices.push(randomPerson);
      exceptionNames.push(randomPerson.name);
    }

    choices.splice((0, _modulesRandom.randInt)(numChoices), 0, person);
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
    if (_game['default'].difficulty == 'reverse') {
      previousContext = {
        answerPerson: guessedPerson,
        guessedPerson: answerPerson
      };
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
    addPerson(_people['default'].chooseNewPerson());
    $('.answer input').focus();
  }

  function fullMatch(guess) {
    return guess.toLowerCase() === _people['default'].currentPerson().name.toLowerCase();
  }

  function partialCredit(guess) {
    return guess.toLowerCase().split(' ')[0] === _people['default'].currentPerson().name.toLowerCase().split(' ')[0];
  }

  function renderFailures() {
    if (_game['default'].failures.length === 0) {
      return;
    }

    $('.failures').removeClass('hidden');
    $('.failures .photos').html(templates.failures({
      people: _game['default'].failures
    }));
  }

  function renderScore() {
    var $el = $('.scores');
    $el.empty();
    $el.append(templates.score({
      total: _people['default'].allPeople.length,
      remaining: _people['default'].currentPeople.length,
      guessedPercentage: _people['default'].guessedPercentage(),
      score: _game['default'].score,
      incorrect: _game['default'].wrong,
      percentage: _game['default'].percentage()
    }));
  }

  function renderSavedPeople() {
    _storage['default'].retrieve('saved_people', function (savedPeople) {
      var renderData = [];
      _.each(savedPeople, function (people, name) {
        var sample = people.slice(0, 3).map(function (person) {
          return person.name;
        }).join(', ');
        renderData.push({ name: name, count: people.length, sample: sample });
      });
      var $el = $('.saved-people');
      $el.empty();
      if (renderData.length > 0) {
        $el.append(templates.saved_people({ savedGroups: renderData }));
      }
    }, {});
  }

  function renderPreview($row, people) {
    $row.after('<tr><td colspan=5 class=saved-preview>' + templates.preview_people({ people: people }) + '</td></tr>');
    $row.find('.preview-saved').hide();
  }

  function processGuess(guess) {
    var thisPerson = _people['default'].currentPerson();
    _.extend(thisPerson, {
      guessedCorrectly: false,
      guessedPartially: false
    });

    _game['default'].guesses += 1;
    if (guess && (fullMatch(guess) || _game['default'].difficulty == 'hard' && partialCredit(guess))) {
      thisPerson.guessedCorrectly = true;
      _people['default'].currentPeople.splice(_people['default'].currentPersonIndex, 1);
      _game['default'].score += 1;
    } else if (guess && partialCredit(guess)) {
      thisPerson.guessedPartially = true;
      _game['default'].score += .5;
    } else {
      _game['default'].wrong += 1;
      _game['default'].failures.push({ name: thisPerson.name, photo: thisPerson.photo });
      renderFailures();
    }

    renderScore();

    if (_people['default'].currentPeople.length > 0) {
      addRandomPerson();
      if (guess) {
        var guessedPerson = _people['default'].personMatching(guess);
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

  function persistState() {
    _storage['default'].store('saved_state', {
      people: _people['default'].persistedData(),
      game: _game['default'].persistedData()
    });
  }

  function clearState() {
    _storage['default'].remove('saved_state');
  }

  function setGameVisibility(playing, resuming) {
    _game['default'].playing = playing;
    $('.entry').toggleClass('hidden', playing);
    if (!playing) {
      clearState();
      renderSavedPeople();
    }
    $('.game').toggleClass('hidden', !playing);
    $('#question').removeClass('hidden');
    $('#answer').empty().removeClass('success').removeClass('failure').toggleClass('hidden', !playing || resuming || _game['default'].guesses === 0);
    $('.replay').addClass('hidden');

    var showFailures = resuming && _game['default'].failures.length > 1;
    $('.failures').toggleClass('hidden', !showFailures);
    $('.restart').toggleClass('hidden', !showFailures);
    if (!showFailures) {
      $('.failures .photos').empty();
    }
  }

  function startGuessing() {
    _game['default'].resetScore();

    setGameVisibility(true);

    _people['default'].currentPeople = _people['default'].allPeople.slice(0);

    addRandomPerson();

    renderScore();
  }

  function showMainContainer() {
    $('.game-container').css('visibility', 'visible');
  }

  function parseTextarea() {
    return _.compact(_.map($('.entry textarea').val().split("\n"), function (line) {
      var match;
      if (match = (0, _modulesStrings.strip)(line).match(/^(http[^ ]+)\s+(.*)/)) {
        return {
          photo: match[1],
          name: match[2]
        };
      }
    }));
  }

  $(document).ready(function () {
    _storage['default'].retrieve('difficulty', function (value) {
      _game['default'].difficulty = value;
    }, 'easy');

    var difficultyContext = {
      difficulties: _.map(['easy', 'medium', 'hard', 'hardest', 'reverse'], function (level) {
        return { name: level.toTitleCase(), value: level };
      })
    };
    $('.difficulty-select-container').append(templates.difficulty_select(difficultyContext));
    $('select.difficulty').val(_game['default'].difficulty);

    function startGameWithPeople(thesePeople, savedName) {
      _people['default'].allPeople = _.uniq(thesePeople, function (p) {
        return p.name;
      });
      _storage['default'].store('people', _people['default'].allPeople);
      if (savedName) {
        _storage['default'].retrieve('saved_people', function (savedPeople) {
          savedPeople[savedName] = _people['default'].allPeople;
          _storage['default'].store('saved_people', savedPeople);
        }, {});
      }

      startGuessing();
    }

    $(document).on('click', '.begin-button', function (event) {
      startGameWithPeople(parseTextarea(), $('.save-as-name').val());
    });

    $(document).on('change', 'select.difficulty', function () {
      _game['default'].difficulty = $('select.difficulty').val();
      _storage['default'].store('difficulty', _game['default'].difficulty);

      if (_game['default'].playing) {
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
    key_choices[_KEYS['default'].W] = 0;
    key_choices[_KEYS['default'].A] = 2;
    key_choices[_KEYS['default'].S] = 4;
    key_choices[_KEYS['default'].UP] = 1;
    key_choices[_KEYS['default'].RIGHT] = 3;
    key_choices[_KEYS['default'].DOWN] = 5;

    $(document).on('keydown', function (event) {
      if (!(_game['default'].playing && _game['default'].difficulty == 'easy')) {
        return;
      }

      if (event.which == _KEYS['default'].DOWN || event.which == _KEYS['default'].UP) {
        event.preventDefault();
      }
    });

    $(document).on('keyup', function (event) {
      if (!(_game['default'].playing && _game['default'].difficulty == 'easy')) {
        return;
      }

      var choiceIx = key_choices[event.which];
      if (choiceIx !== undefined) {
        var choicePerson = _people['default'].currentPerson().choices[choiceIx];
        processGuess(choicePerson.name);
      }
    });

    $(document).on('keyup', '.answer input', function (event) {
      if (event.which === 13) {
        var guess = $(this).val();
        var validPerson = _people['default'].personMatching(guess);
        if (_game['default'].difficulty.match(/^hard/) || _game['default'].difficulty == 'medium' && validPerson) {
          processGuess(guess);
        }
      }
    });

    $(document).on('click', '[data-link=restart]', function (event) {
      setGameVisibility(false);
    });

    $(document).on('click', '[data-link=restart-mistakes]', function (event) {
      var now = new Date();
      var date = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-');

      var time = [now.getHours(), now.getMinutes()].join(':');
      startGameWithPeople(_game['default'].failures, 'Mistakes ' + [date, time].join(' '));
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
      _storage['default'].retrieve('saved_people', function (savedPeople) {
        startGameWithPeople(savedPeople[$(event.target).data('name')], $('.save-as-name').val());
      });
    });

    $(document).on('click', '.rename-saved', function (event) {
      var valueToStore = {};
      var oldName = $(event.target).data('name');
      var newName = prompt('Enter new name');
      if (oldName && newName) {
        _storage['default'].retrieve('saved_people', function (savedPeople) {
          var list = savedPeople[oldName];
          delete savedPeople[oldName];
          savedPeople[newName] = list;
          valueToStore = savedPeople;
        });

        _storage['default'].store('saved_people', valueToStore);
        renderSavedPeople();
      }
    });

    $(document).on('click', '.preview-saved', function (event) {
      var name = $(event.target).data('name');
      if (name) {
        _storage['default'].retrieve('saved_people', function (savedPeople) {
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
        _storage['default'].retrieve('saved_people', function (savedPeople) {
          delete savedPeople[name];
          valueToStore = savedPeople;
        });
      }
      _storage['default'].store('saved_people', valueToStore);
      renderSavedPeople();
    });

    _storage['default'].retrieve('saved_state', function (savedState) {
      if (savedState && _.keys(savedState).length > 0) {
        _people['default'].allPeople = savedState.people.allPeople;
        _people['default'].currentPeople = _.filter(_people['default'].allPeople, function (p) {
          return _.include(savedState.people.currentPeopleNames, p.name);
        });
        _.extend(_game['default'], savedState.game);

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
});