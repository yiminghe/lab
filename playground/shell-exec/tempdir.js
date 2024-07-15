var os = require('os');
var fs = require('fs');
function statFollowLinks() {
  return fs.statSync.apply(fs, arguments);
}
function randomFileName() {
  function randomHash(count) {
    if (count === 1) {
      return parseInt(16 * Math.random(), 10).toString(16);
    }
    var hash = '';
    for (var i = 0; i < count; i++) {
      hash += randomHash(1);
    }
    return hash;
  }

  return 'shelljs_' + randomHash(20);
}
function unlinkSync(file) {
  try {
    fs.unlinkSync(file);
  } catch (e) {
    // Try to override file permission
    /* istanbul ignore next */
    if (e.code === 'EPERM') {
      fs.chmodSync(file, '0666');
      fs.unlinkSync(file);
    } else {
      throw e;
    }
  }
}
// Returns false if 'dir' is not a writeable directory, 'dir' otherwise
function writeableDir(dir) {
  if (!dir || !fs.existsSync(dir)) return false;

  if (!statFollowLinks(dir).isDirectory()) return false;

  var testFile = dir + '/' + randomFileName();
  try {
    fs.writeFileSync(testFile, ' ');
    unlinkSync(testFile);
    return dir;
  } catch (e) {
    /* istanbul ignore next */
    return false;
  }
}

// Variable to cache the tempdir value for successive lookups.
var cachedTempDir;

//@
//@ ### tempdir()
//@
//@ Examples:
//@
//@ ```javascript
//@ var tmp = tempdir(); // "/tmp" for most *nix platforms
//@ ```
//@
//@ Searches and returns string containing a writeable, platform-dependent temporary directory.
//@ Follows Python's [tempfile algorithm](http://docs.python.org/library/tempfile.html#tempfile.tempdir).
function _tempDir() {
  if (cachedTempDir) return cachedTempDir;

  cachedTempDir =
    writeableDir(os.tmpdir()) ||
    writeableDir(process.env.TMPDIR) ||
    writeableDir(process.env.TEMP) ||
    writeableDir(process.env.TMP) ||
    writeableDir(process.env.Wimp$ScrapDir) || // RiscOS
    writeableDir('C:\\TEMP') || // Windows
    writeableDir('C:\\TMP') || // Windows
    writeableDir('\\TEMP') || // Windows
    writeableDir('\\TMP') || // Windows
    writeableDir('/tmp') ||
    writeableDir('/var/tmp') ||
    writeableDir('/usr/tmp') ||
    writeableDir('.'); // last resort

  return cachedTempDir;
}

// Indicates if the tempdir value is currently cached. This is exposed for tests
// only. The return value should only be tested for truthiness.
function isCached() {
  return cachedTempDir;
}

// Clears the cached tempDir value, if one is cached. This is exposed for tests
// only.
function clearCache() {
  cachedTempDir = undefined;
}

module.exports.tempDir = _tempDir;
module.exports.isCached = isCached;
module.exports.clearCache = clearCache;
