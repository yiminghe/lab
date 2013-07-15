var fs = require('fs');
var path = require('path');
var parent = 'data/';
var paths = fs.readdirSync(parent);
var ret = [];
for (var i = 0; i < paths.length; i++) {
    var path1 = paths[i];
    if (path1 == '.' || path1 == '..') {
        continue;
    }
    if (path1.indexOf('A.') != -1 || path1.indexOf('A-') != -1) {
        var fullpath = parent + path1;
        var bPath = fullpath.replace(/A|(\.|-)/, 'B$1');
        var rPath = path1.replace(/A|(\.|-)/, '');
        var a = getCsv(fullpath);
        var b = getCsv(bPath);
        var count;
        ret[0]=['number'].concat(a[0]);
        for (count = 1; count < a.length; count++) {
            var gene = a[count][1];
            if (!isContainGene(b, gene)) {
                ret.push([rPath].concat(a[count]));
            }
        }
    }

    saveCsv(ret,parent+'total.csv');
}

function isContainGene(csv, gene) {
    for (var i = 1; i < csv.length; i++) {
        var line = csv[i];
        if (line[1] == gene) {
            return true;
        }
    }
    return false;
}

function saveCsv(csv, path) {
    var str = '';
    for (var i = 0; i < csv.length; i++) {
        var line = csv[i];
        var lineStr = '"' + line.join('","') + '"';
        str += lineStr + '\n';
    }
    str = str.trim();
    fs.writeFileSync(path, str, {
        encoding: 'utf-8'
    });
}

function parseCsvLine(line) {
    line = line.trim();
    var ret = [];
    var lastMatch = '';
    for (var i = 0; i < line.length; i++) {
        var c = line.charAt(i);
        if (c == '"') {
            var start = i + 1;
            do {
                c = line.charAt(++i);
            } while (c != '"');
            lastMatch = line.substring(start, i);
        } else if (c == ',') {
            ret.push(lastMatch);
            lastMatch = '';
        } else {
            lastMatch += c;
        }
    }
    ret.push(lastMatch);
    return ret;
}

function getCsv(file) {
    var ret = [];
    var content = fs.readFileSync(file, {
        encoding: 'utf-8'
    });
    content = content.split('\n');
    for (var i = 0; i < content.length; i++) {
        ret.push(parseCsvLine(content[i]));
    }
    return ret;
}
