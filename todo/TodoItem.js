const shortid = require("shortid");

function TodoItem(contents, priority) {
  this._id = shortid.generate();
  this.contents = contents;
  this.priority = priority || 0;
  this.isCompleted = false;
}

module.exports = TodoItem;
