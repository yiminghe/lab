(function () {
  function count(str, log) {
    var words = str.split(/[^a-zA-Z]+/);
    if (!words[0]) {
      words.shift();
    }
    if (!words[words.length - 1]) {
      words.pop();
    }
    var len = words.length;
    var hash = {};
    var maxCount = 0;
    var maxStr;
    for (var i = 0; i < len; i++) {
      var w = words[i];
      var count;
      if (hash[w]) {
        count = ++hash[w];
      } else {
        count = hash[w] = 1;
      }
      if (maxCount < count) {
        maxCount = count;
        maxStr = words[i];
      }
    }
    if (log) {
      for (var h in hash) {
        log(hash[h], h);
      }
    }
    return {
      count: maxCount,
      str: maxStr,
    };
  }

  window.splitHashCount = count;
})();
