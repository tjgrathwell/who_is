export default {
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