const shortid = require("shortid");

function Team(name) {
  this._id = shortid.generate();
  this.name = name;
  this.members = [];
}

module.exports = Team;
