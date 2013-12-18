var xlsx = require('node-xlsx');
var fs = require('fs');
// parses a file
var match = xlsx.parse(__dirname + '/match.xlsx'); // parses a file
var matches = [];
var data, i, j;
var matchSheets = match.worksheets;
for (i = 0; i < matchSheets.length; i++) {
    data = (matchSheets[i].data);
    for (j = 0; j < data.length; j++) {
        matches.push(String(data[j][0].value).trim());
    }
}
var ret = [];
data = xlsx.parse(__dirname + '/data.xlsx');
var realData = data.worksheets[0].data;
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
    if (containMatch(String(row[0].value).trim())) {
        ret.push(row);
    }
}

var buffer = xlsx.build({worksheets: [
    {"name": "result", "data": ret}
]});

fs.writeFileSync('result.xlsx', buffer);

