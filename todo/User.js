const shortid = require("shortid");

function User(username, todoItem) {
  this._id = shortid.generate();
  this.name = username;
  this.todoList = [todoItem];
}

module.exports = User;
