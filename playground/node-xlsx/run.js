var xlsx = require('node-xlsx');
var fs = require('fs');
var path = require('path');
var csv = require('csv');
var matchFile = process.argv[2];
var dataFile = process.argv[3];
var resultFile =
  path.basename(dataFile, path.extname(dataFile)) +
  '-match' +
  path.extname(dataFile);

function read(file, callback) {
  if (path.extname(file) === '.csv') {
    var content = fs.readFileSync(file, { encoding: 'utf-8' });
    var data = [];
    csv()
      .from.string(content, {
        comment: '#',
      })
      .to.array(function (d) {
        data = d;
        callback({
          csv: 1,
          name: path.basename(file),
          data: data,
        });
      });
  } else {
    data = xlsx.parse(file).worksheets[0].data;
    var d = [];
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].length; j++) {
        d[i][j] = data[i][j];
      }
    }
    callback({
      xlsx: data,
      name: path.basename(file),
      data: d,
    });
  }
}

function save(file, data) {
  if (path.extname(file) === '.csv') {
    var str = '';
    for (var i = 0; i < data.length; i++) {
      var row = '';
      for (var j = 0; j < data[i].length; j++) {
        row += ',"' + data[i][j] + '"';
      }
      row = row.slice(1);
      str += row + '\n';
    }
    fs.writeFileSync(file, str, {
      encoding: 'utf8',
    });
  } else {
    var buffer = xlsx.build({
      worksheets: [{ name: path.basename(file), data: data }],
    });
    fs.writeFileSync(file, buffer);
  }
}

(function () {
  // parses a file
  var match = xlsx.parse(__dirname + '/' + matchFile); // parses a file
  var matches = [];
  var data, i, j;
  var matchSheets = match.worksheets;
  for (i = 0; i < matchSheets.length; i++) {
    data = matchSheets[i].data;
    for (j = 0; j < data.length; j++) {
      matches.push(String(data[j][0].value).trim());
    }
  }

  read(__dirname + '/' + dataFile, function (oo) {
    var ret = [];
    var realData = oo.data;
    ret.push(realData[0]);
    realData = realData.slice(1);
    function containMatch(str) {
      for (var i = 0; i < matches.length; i++) {
        if (matches[i] == str) {
          return 1;
        }
      }
      return 0;
    }

    for (i = 0; i < realData.length; i++) {
      var row = realData[i];
      if (containMatch(String(row[0]).trim())) {
        ret.push(row);
      }
    }

    save(__dirname + '/' + resultFile, ret);
  });
})();
