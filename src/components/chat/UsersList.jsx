/** @jsx React.DOM */
'use strict';

var UsersList = React.createClass({
  render: function () {
    var users = this.props.users.map(function (user) {
      return <div className="chat-user">&raquo; {user}</div>;
    });
    return (
      <div className="users-list col-xs-3">
        <span class="badge">{users.length+1}</span> Users Online:
        {users}
        <div className="chat-user yourself">&raquo; {this.props.username}</div>
      </div>
    );
  }
});
