/* global EventEmitter, events, io, Peer */
'use strict';

function ChatServer() {
  EventEmitter.call(this);
  this._peers = {};
}

ChatServer.prototype = Object.create(EventEmitter.prototype);

ChatServer.prototype.onMessage = function (cb) {
  this.addListener(events.MSG, cb);
};

ChatServer.prototype.getUsername = function () {
  return this._username;
};

ChatServer.prototype.setUsername = function (username) {
  this._username = username;
};

ChatServer.prototype.onUserConnected = function (cb) {
  this.addListener(events.CONNECT, cb);
};

ChatServer.prototype.onUserDisconnected = function (cb) {
  this.addListener(events.DISCONNECT, cb);
};

ChatServer.prototype.send = function (user, message) {
  this._peers[user].send(message);
};

ChatServer.prototype.broadcast = function (msg) {
  for (var peer in this._peers) {
    this.send(peer, msg);
  }
};

ChatServer.prototype.connect = function (username) {
  var self = this;
  this.setUsername(username);
  this.socket = io();
  this.socket.on('connect', function () {
    self.socket.on(events.CONNECT, function (userId) {
      if (userId === self.getUsername()) {
        return;
      }
      self._connectTo(userId);
      self.emit(events.CONNECT, userId);
      console.log('User connected', userId);
    });
    self.socket.on(events.DISCONNECT, function (userId) {
      if (userId === self.getUsername()) {
        return;
      }
      self._disconnectFrom(userId);
      self.emit(events.DISCONNECT, userId);
      console.log('User disconnected', userId);
    });
  });
  console.log('Connecting with username', username);
  this.peer = new Peer(username, {
    host: location.hostname,
    port: 9000,
    path: '/chat'
  });
  this.peer.on('open', function (userId) {
    self.setUsername(userId);
  });
  this.peer.on('connection', function (conn) {
    self._registerPeer(conn.peer, conn);
    self.emit(events.CONNECT, conn.peer);
  });
};

ChatServer.prototype._connectTo = function (username) {
  var conn = this.peer.connect(username);
  conn.on('open', function () {
    this._registerPeer(username, conn);
  }.bind(this));
};

ChatServer.prototype._registerPeer = function (username, conn) {
  console.log('Registering', username);
  this._peers[username] = conn;
  conn.on('data', function (msg) {
    console.log('Message received', msg);
    this.emit(events.MSG, { content: msg, author: username });
  }.bind(this));
};

ChatServer.prototype._disconnectFrom = function (username) {
  delete this._peers[username];
};
