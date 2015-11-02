/* global EventEmitter, events, io, Peer */
/** @jsx React.DOM */

$(function () {
  'use strict';

  // Check for session value
  $(document).ready(function(){
    $.ajax({
          url: '/username'
    }).done(function (data) {
      console.log("data loaded: " + data.username);
      if(data.username)
        initChat($('#container')[0], data.username);
    });
  });

  // Set the session
  $('#connect-btn').click(function(){
    var data = JSON.stringify({username: $('#username-input').val()});
    $.ajax({ url: '/username',
              method: "POST",
              data: data,
              contentType: 'application/json',
              dataType: 'json'
            });
  });

  // Initalize the chat
  $('#connect-btn').click(function () {
    initChat($('#container')[0],
      $('#username-input').val());
  });

  function initChat(container, username) {
    var proxy = new ChatServer();
    React.renderComponent(<ChatBox chatProxy={proxy}
      username={username}></ChatBox>, container);
  }

  window.onbeforeunload = function () {
  //  return 'Are you sure you want to leave the chat?';
  };

});
