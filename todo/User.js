const shortid = require("shortid");

function User(name, todoItem) {
  this._id = shortid.generate();
  this.name = name;
  this.todoList = todoItem ? [todoItem] : [];
}

module.exports = User;
