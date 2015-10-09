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
  persistedData: function () {
    return {
      score: this.score,
      wrong: this.wrong,
      guesses: this.guesses,
      failures: this.failures,
      difficulty: this.difficulty
    };
  }
}