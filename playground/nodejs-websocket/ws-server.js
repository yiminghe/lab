var ws = require('websocket-server');

var server = ws.createServer();

server.addListener('connection', function (connection) {
  connection.addListener('message', function (msg) {
    console.log('receive : ' + msg);
    connection.send('from server : ' + msg);
  });
});

server.listen(8081);
