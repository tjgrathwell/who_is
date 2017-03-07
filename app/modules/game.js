const {pick} = _;

export default {
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
  },
  resetScore: function () {
    this.score = 0;
    this.wrong = 0;
    this.guesses = 0;
    this.failures = [];
  },
  persistedData: function () {
    return pick(this, 'score', 'wrong', 'guesses', 'failures', 'difficulty');
  }
}