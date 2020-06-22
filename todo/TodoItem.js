const shortid = require("shortid");

function TodoItem(contents) {
  this._id = shortid.generate();
  this.contents = contents;
  this.completed = false;
}

module.exports = TodoItem;
