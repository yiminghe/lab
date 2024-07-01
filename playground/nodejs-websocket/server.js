var net = require('net');
var server = net.createServer(function (c) {
  c.setEncoding('utf-8');
  console.log('client connected');
  c.on('data', function (data) {
    console.log('receive : ' + data);
    c.write('from server ' + server.connections + ': ' + data);
  });
});
server.listen(8124);
