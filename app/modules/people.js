import {randInt} from './random';

export default {
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
  },
  persistedData: function () {
    return {
      allPeople: _.map(this.allPeople, function (person) {
        return {name: person.name, photo: person.photo};
      }),
      currentPeopleNames: _.pluck(this.currentPeople, 'name')
    };
  }
}
