const database = require("./config")

function TodoItemStore() {
  this.setUser = user => {
    database.ref(`/user/${user.name}`).set(user);
  };
  this.getUsers = async () => {
    let users;
    await database
      .ref(`/user`)
      .on("value", snapshot => (users = snapshot.val()));
    return users;
  };
  this.getUser = async name => {
    const snapshot = await database.ref(`/user/${name}`).once("value");
    return snapshot.val();
  };

  this.setTeam = team => {
    database.ref(`/team/${team._id}`).set(team);
  };

  this.getTeam = async id => {
    const snapshot = await database.ref(`/team/${id}`).once("value");
    return snapshot.val();
  };

  this.removeTeam = async id => {
    try {
      await database.ref(`/team/${id}`).remove();
    } catch (e) {
      throw new Error(e);
    }
  };

  this.getTeams = async () => {
    const snapshot = await database.ref(`/team`).once("value");
    return snapshot.val();
  };
  this.addTeam = team => {
    database.ref(`/team/${team._id}`).set(team);
  };
}

module.exports = TodoItemStore;
