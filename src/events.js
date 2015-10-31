var events = {
  CONNECT   : 'user-connected',
  DISCONNECT: 'user-disconnected',
  MSG       : 'user-message'
};

if (typeof module !== 'undefined') {
  module.exports = events;
}
