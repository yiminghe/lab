var fs = require('fs');
var path = require('path');

function tabular(file){
	var net = fs.readFileSync(file, {
    encoding: 'utf-8'
	}); 
	var nets=net.trim().split(/\n/);
	nets.forEach(function(v,i){
		nets[i]=v.trim().split(/\s+/);
	});
	return nets;
}

var nets = tabular('net.txt');
var rna = tabular('rna.txt');

nets.forEach(function(v,i){
	if(i==0){return;}
	var symbol;
	rna.forEach(function(v2,i){
		if(v[0]==v2[5]){
			v.push(v2[6]);
			symbol=1;
			return false;
		}
	});
	if(!symbol){
		v.push('');
	}
});

var str=[];
nets.forEach(function(v,i){
	str.push('"'+v.join('","')+'"');
});
fs.writeFileSync('r.csv', str.join('\n'), {
    encoding: 'utf-8'
}); 