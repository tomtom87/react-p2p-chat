//Configure our Services
var PeerServer = require('peer').PeerServer,
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    express = require('express'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(session),
    assert = require('assert'),
    events = require('./src/events.js'),
    app = express(),
    port = process.env.PORT || 3001;

//Connect to the database
mongoose.connect('mongodb://localhost:27017/chat');
var db = mongoose.connection;

mongoose.set('debug', true);

db.on('error', console.error.bind(console, '# Mongo DB: connection error:'));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
  secret: 'supersecretstring12345!',
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({ mongooseConnection: db })
}))

app.get('/', function (req, res) {
  res.sendFile(__dirname +'/src/index.html');
  if(req.session.username == undefined){
    console.log("# Username not set in session yet");
  } else {
    console.log("# Username from session: "+ req.session.username);

  }
});

//Save the username when the user posts the set username form
app.post('/username', function(req, res){
  console.log("# Username set to "+ req.body.username);
  req.session.username = req.body.username;
  req.session.save();
  console.log("# Session value set "+ req.session.username);
  res.end();
});

//Return the session value when the client checks
app.get('/username', function(req,res){
  console.log("# Client Username check "+ req.session.username);
  res.json({username: req.session.username})
});

//Tell express to use the 'src' directory
app.use(express.static(__dirname + '/src'));


db.once('open', function (callback) {

  console.log("# Mongo DB:  Connected to server");

  //Setup our User Schema
  var usersSchema = mongoose.Schema({username: String});
  var User = mongoose.model('User', usersSchema);

  //Configure the http server and PeerJS Server
  var expressServer = app.listen(port);
  var io = require('socket.io').listen(expressServer);
  var peer = new PeerServer({ port: 9000, path: '/chat' });

  //Print some console output
  console.log('#### -- Server Running -- ####');
  console.log('# Express:   Listening on port', port);


  peer.on('connection', function (id) {
    io.emit(events.CONNECT, id);
    console.log('# Connected: ', id);

    //Store Peer in database
    var user = new User({ username: id });
    user.save(function (err, user) {
      if (err) return console.error(err);
      console.log('# User '+ id + ' saved to database');
    });

  });

  peer.on('disconnect', function (id) {
    //End session
    io.emit(events.DISCONNECT, id);
    console.log('# Disconnected: ', id);

    //Remove Peer from database
    User.remove({username: id}, function(err){ if(err) return console.error(err)});
  });

});
