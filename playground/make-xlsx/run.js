var xlsx = require('node-xlsx');
var fs = require('fs');
var path = require('path');
var resPath = './res';

var walk = function (dir, done, filter) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function (file) {
      file = dir + '/' + file;
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walk(
            file,
            function (err, res) {
              results = results.concat(res);
              if (!--pending) done(null, results);
            },
            filter,
          );
        } else {
          if (!filter || filter(file)) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

function transformToWorkSheet(file) {
  var content = fs.readFileSync(file, { encoding: 'utf-8' });
  var data = [];
  content = content.trim().split(/\r?\n/);
  content.forEach(function (c) {
    var cols = c.trim().split(/\s+/);
    var row = [];
    cols.forEach(function (col) {
      row.push({
        value: col,
      });
    });
    data.push(row);
  });
  return {
    name: path.basename(file),
    data: data,
  };
}

function gen(type) {
  walk(
    resPath,
    function (error, results) {
      var sheets = [];
      results.forEach(function (f) {
        sheets.push(transformToWorkSheet(f));
      });
      var buffer = xlsx.build({
        worksheets: sheets,
      });
      fs.writeFile(type + '.xlsx', buffer);
    },
    function (file) {
      return (
        file.indexOf('.' + type + '.') != -1 &&
        file.substring(file.length - 4) == '.txt'
      );
    },
  );
}

gen('snp');
gen('indel');
