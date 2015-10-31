//Configure our Services
var PeerServer = require('peer').PeerServer,
    express = require('express'),
    events = require('./src/events.js'),
    app = express(),
    port = process.env.PORT || 3001;

//Tell express to use the 'src' directory
app.use(express.static(__dirname + '/src'));

//Configure the http server and PeerJS Server
var expressServer = app.listen(port);
var io = require('socket.io').listen(expressServer);
var peer = new PeerServer({ port: 9000, path: '/chat' });

//Print some console output
console.log('#### -- Server Running -- ####');
console.log('Listening on port', port);

peer.on('connection', function (id) {
  io.emit(events.CONNECT, id);
  console.log('# Connected', id);
});

peer.on('disconnect', function (id) {
  io.emit(events.DISCONNECT, id);
  console.log('# Disconnected', id);
});
