const database = require('./config')

function Step3Store() {
  this.getUser = async (teamId, memberId) => {
    const snapshot = await database.ref(`/team/${teamId}/members/${memberId}`).once('value')
    return snapshot.val()
  }

  this.setTeam = team => {
    database.ref(`/team/${team._id}`).set(team)
  }

  this.getTeam = async id => {
    const snapshot = await database.ref(`/team/${id}`).once('value')
    return snapshot.val()
  }

  this.removeTeam = async id => {
    try {
      await database.ref(`/team/${id}`).remove()
    } catch (e) {
      throw new Error(e)
    }
  }

  this.getTeams = async () => {
    const snapshot = await database.ref(`/team`).once('value')
    return snapshot.val()
  }
  this.addTeam = team => {
    database.ref(`/team/${team._id}`).set(team)
  }
}

module.exports = Step3Store
