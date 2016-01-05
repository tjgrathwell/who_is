function parseValue (value) {
  if (value && _.include(['[', '{'], value[0])) {
    return JSON.parse(value);
  } else {
    return value;
  }
}

function serialValue (value) {
  if (typeof value === 'string') {
    return value;
  } else {
    return JSON.stringify(value);
  }
}

export default {
  retrieve: function (key, callback, defaultValue) {
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
  store: function (key, value) {
    if (this.supported) {
      localStorage['who_is.' + key] = serialValue(value);
    }
  },
  remove: function (key) {
    if (this.supported) {
      localStorage.removeItem(['who_is.' + key]);
    }
  },
  clearAll: function () {
    if (this.supported) {
      var i = localStorage.length;
      while(i--) {
        var key = localStorage.key(i);
        if(/^who_is\./.test(key)) {
          localStorage.removeItem(key);
        }
      }
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