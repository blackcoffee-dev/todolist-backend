const TodoItem = require('../todo/TodoItem')
const User = require('../todo/User')
const Team = require('../todo/Team')
const express = require('express')
const router = express.Router()
const TodoItemStore = require('../store/Step3Store')

const userController = {
  isValidTodoItem(name, contents) {
    return !!name && !!contents
  }
}
const todoItemStore = new TodoItemStore()

// 팀 추가하기
router.post('/teams', async (req, res) => {
  const { name } = req.body
  if (!name) {
    res.status(500).json({ message: '팀 이름이 필요합니다.' })
    return
  }
  try {
    const newTeam = new Team(name)
    await todoItemStore.addTeam(newTeam)
    res.status(200).json(newTeam)
  } catch (e) {
    res.status(500).json({ message: 'Team을 추가하는데 에러가 발생했습니다.' })
  }
})

// 팀 리스트 불러오기
router.get('/teams', async (req, res) => {
  try {
    const teams = await todoItemStore.getTeams()
    if (teams) {
      const teamList = []
      Object.keys(teams).map(key => {
        teamList.push({
          _id: teams[key]._id,
          name: teams[key].name,
          members: teams[key].members || []
        })
      })
      res.status(200).json(teamList)
    }
  } catch (e) {
    res.status(500).json({ message: 'Team을 찾는데 에러가 발생했습니다.' })
  }
})

// 팀 불러오기
router.get('/teams/:id', async (req, res) => {
  const { id } = req.params
  if (!id) {
    res.status(500).json({ message: 'id가 필요합니다.' })
    return
  }
  try {
    const team = await todoItemStore.getTeam(id)
    if (!team.members) {
      team.members = []
    }
    team.members.forEach(member => {
      if (!member.todoList) {
        member.todoList = []
      }
    })
    res.status(200).json(team)
  } catch (e) {
    res.status(500).json({ message: 'Team을 찾는데 에러가 발생했습니다.' })
  }
})

// 팀 삭제
router.delete('/teams/:id', async (req, res) => {
  const { id } = req.params
  if (!id) {
    res.status(500).json({ message: 'id가 필요합니다.' })
    return
  }
  try {
    const team = await todoItemStore.getTeam(id)
    if (!team) {
      res.status(500).json({ message: '해당 팀 존재하지 않습니다.' })
    }
    await todoItemStore.removeTeam(id)
    res.status(200).json({})
  } catch (e) {
    res.status(500).json({ message: 'Team을 찾는데 에러가 발생했습니다.' })
  }
})

// 팀에 멤버 추가하기
router.post('/teams/:id/members', async (req, res) => {
  const { name } = req.body
  const { id } = req.params
  if (!id) {
    res.status(500).json({ message: 'id가 필요합니다.' })
    return
  }
  if (!name) {
    res.status(500).json({ message: '유저 이름이 필요합니다.' })
    return
  }
  try {
    const team = await todoItemStore.getTeam(id)
    if (!team.members) {
      team.members = []
    }
    team.members.push(new User(name, null))
    await todoItemStore.setTeam(team)
    res.status(200).json(team)
  } catch (e) {
    res.status(500).json({ message: 'Team을 추가하는데 에러가 발생했습니다.' })
  }
})

// 팀원별 TodoList 불러오기
router.get('/teams/:teamId/members/:memberId', async (req, res) => {
  const { teamId, memberId } = req.params
  if (!teamId) {
    res.status(500).json({ message: '유효한 team Id가 필요합니다.' })
    return
  }
  if (!memberId) {
    res.status(500).json({ message: '유효한 member Id가 필요합니다.' })
    return
  }
  try {
    const team = await todoItemStore.getTeam(teamId)
    const member = team.members.find(member => member._id === memberId)
    res.status(200).json(member)
  } catch (e) {
    res.status(500).json({ message: 'Todo Item을 추가하는데 에러가 발생했습니다.' })
  }
})

// 팀원별 TodoItem 추가하기
router.post('/teams/:teamId/members/:memberId/items', async (req, res) => {
  const { teamId, memberId } = req.params
  const { contents } = req.body
  if (!teamId) {
    res.status(500).json({ message: '유효한 team Id가 필요합니다.' })
    return
  }
  if (!memberId) {
    res.status(500).json({ message: '유효한 member Id가 필요합니다.' })
    return
  }
  if (!contents) {
    res.status(500).json({ message: '내용을 작성해주세요.' })
    return
  }
  try {
    const newTodoItem = new TodoItem(contents, null)
    const team = await todoItemStore.getTeam(teamId)
    const member = team.members.find(member => member._id === memberId)
    if (!member.todoList) {
      member.todoList = []
    }
    member.todoList.push(newTodoItem)
    await todoItemStore.setTeam(team)
    res.status(200).json(newTodoItem)
  } catch (e) {
    res.status(500).json({ message: 'Todo Item을 추가하는데 에러가 발생했습니다.' })
  }
})

//팀원의 TodoItem 삭제하기
router.delete('/teams/:teamId/members/:memberId/items/:itemId', async (req, res) => {
  const { teamId, memberId, itemId } = req.params
  if (!teamId) {
    res.status(500).json({ message: '유효한 team Id가 필요합니다.' })
    return
  }
  if (!memberId) {
    res.status(500).json({ message: '유효한 member Id가 필요합니다.' })
    return
  }
  if (!itemId) {
    res.status(500).json({ message: '유요한 item Id가 필요합니다.' })
    return
  }
  try {
    const team = await todoItemStore.getTeam(teamId)
    const memberIndex = team.members.findIndex(member => member._id === memberId)
    if (!team.members[memberIndex].todoList) {
      team.members[memberIndex].todoList = []
    }
    const filteredTodoList = team.members[memberIndex].todoList.filter(item => item._id !== itemId)
    team.members[memberIndex].todoList = filteredTodoList
    await todoItemStore.setTeam(team)
    res.status(200).json({})
  } catch (e) {
    res.status(500).json({ message: 'Todo Item을 추가하는데 에러가 발생했습니다.' })
  }
})

//팀원 todoItem toggle하기
router.put('/teams/:teamId/members/:memberId/items/:itemId/toggle', async (req, res) => {
  const { teamId, memberId, itemId } = req.params
  if (!teamId) {
    res.status(500).json({ message: '유효한 team Id가 필요합니다.' })
    return
  }
  if (!memberId) {
    res.status(500).json({ message: '유효한 member Id가 필요합니다.' })
    return
  }
  if (!itemId) {
    res.status(500).json({ message: '유요한 item Id가 필요합니다.' })
    return
  }
  try {
    const team = await todoItemStore.getTeam(teamId)
    const memberIndex = team.members.findIndex(member => member._id === memberId)
    const itemIndex = team.members[memberIndex].todoList.findIndex(item => item._id === itemId)
    team.members[memberIndex].todoList[itemIndex].isCompleted = !team.members[memberIndex].todoList[itemIndex].isCompleted
    await todoItemStore.setTeam(team)
    res.status(200).json({ ...team.members[memberIndex].todoList[itemIndex] })
  } catch (e) {
    res.status(500).json({ message: 'Todo Item을 toggle하는데 에러가 발생했습니다.' })
  }
})

//팀원 todoItem 수정하기
router.put('/teams/:teamId/members/:memberId/items/:itemId', async (req, res) => {
  const { teamId, memberId, itemId } = req.params
  const { contents } = req.body
  if (!teamId) {
    res.status(500).json({ message: '유효한 team Id가 필요합니다.' })
    return
  }
  if (!memberId) {
    res.status(500).json({ message: '유효한 member Id가 필요합니다.' })
    return
  }
  if (!itemId) {
    res.status(500).json({ message: '유요한 item Id가 필요합니다.' })
    return
  }
  try {
    const team = await todoItemStore.getTeam(teamId)
    const memberIndex = team.members.findIndex(member => member._id === memberId)
    const itemIndex = team.members[memberIndex].todoList.findIndex(item => item._id === itemId)
    const todoItem = team.members[memberIndex].todoList[itemIndex]
    todoItem.contents = contents
    await todoItemStore.setTeam(team)
    res.status(200).json({ ...todoItem })
  } catch (e) {
    res.status(500).json({ message: 'Todo Item을 수정하는데 에러가 발생했습니다.' })
  }
})

//팀원 todoItem 우선순위 수정하기
router.put('/teams/:teamId/members/:memberId/items/:itemId/priority', async (req, res) => {
  const { teamId, memberId, itemId } = req.params
  const { priority } = req.body
  if (!teamId) {
    res.status(500).json({ message: '유효한 team Id가 필요합니다.' })
    return
  }
  if (!memberId) {
    res.status(500).json({ message: '유효한 member Id가 필요합니다.' })
    return
  }
  if (!itemId) {
    res.status(500).json({ message: '유요한 item Id가 필요합니다.' })
    return
  }
  try {
    const team = await todoItemStore.getTeam(teamId)
    const memberIndex = team.members.findIndex(member => member._id === memberId)
    const itemIndex = team.members[memberIndex].todoList.findIndex(item => item._id === itemId)
    const todoItem = team.members[memberIndex].todoList[itemIndex]
    todoItem.priority = priority
    await todoItemStore.setTeam(team)
    res.status(200).json({ ...todoItem })
  } catch (e) {
    res.status(500).json({ message: 'Todo Item의 우선순위를 셋팅하는데 에러가 발생했습니다.' })
  }
})

//팀원 todoItem 순서 정렬
router.put('/teams/:teamId/items/:itemId/sort', async (req, res) => {
  const { teamId, itemId } = req.params
  const { originMemberId, targetMemberId, newPosition } = req.body
  if (!teamId) {
    res.status(500).json({ message: '유효한 team Id가 필요합니다.' })
    return
  }
  if (!itemId) {
    res.status(500).json({ message: '유요한 item Id가 필요합니다.' })
    return
  }
  if (!originMemberId || !targetMemberId || !newPosition) {
    res.status(500).json({ message: '요청 항목에 빠진 값이 있습니다.' })
  }
  try {
    const team = await todoItemStore.getTeam(teamId)
    if (originMemberId === targetMemberId) {
      const member = team.members.find(member => member._id === originMemberId)
      const itemIndex = member.todoList.findIndex(item => item._id === itemId)
      const item = { ...member.todoList[itemIndex] }
      member.todoList.splice(itemIndex, 1)
      member.todoList.splice(newPosition, 0, item)
      await todoItemStore.setTeam(team)
      res.status(200).json({ member })
    } else {
      const originMember = team.members.find(member => member._id === originMemberId)
      const targetMember = team.members.find(member => member._id === targetMemberId)
      const originItemIndex = originMember.todoList.findIndex(item => item._id === itemId)
      const item = { ...originMember.todoList[originItemIndex] }
      originMember.todoList.splice(originItemIndex, 1)
      targetMember.todoList.splice(newPosition, 0, item)
      await todoItemStore.setTeam(team)
      res.status(200).json({ originMember, targetMember })
    }
  } catch (e) {
    res.status(500).json({ message: 'Todo Item을 정렬 하는데 에러가 발생했습니다.' })
  }
})

//팀원간 순서 정렬
router.put('/teams/:teamId/sort', async (req, res) => {
  const { teamId } = req.params
  const { memberId, newPosition } = req.body
  if (!teamId) {
    res.status(500).json({ message: '유효한 team Id가 필요합니다.' })
    return
  }
  if (!memberId || !newPosition) {
    res.status(500).json({ message: '요청 항목에 빠진 값이 있습니다.' })
  }
  try {
    const team = await todoItemStore.getTeam(teamId)
    const memberIndex = team.members.findIndex(member => member._id === memberId)
    const member = team.members[memberIndex]
    team.members.splice(memberIndex, 1)
    team.members.splice(newPosition, 0, member)
    await todoItemStore.setTeam(team)
    res.status(200).json({ ...team })
  } catch (e) {
    res.status(500).json({ message: '정렬하는데 문제가 생겼습니다.' })
  }
})

//팀원의 TodoItem 전부 삭제
router.delete('/teams/:teamId/members/:memberId/items', async (req, res) => {
  const { teamId, memberId } = req.params
  if (!teamId) {
    res.status(500).json({ message: '유효한 team Id가 필요합니다.' })
    return
  }
  if (!memberId) {
    res.status(500).json({ message: '유효한 member Id가 필요합니다.' })
    return
  }
  try {
    const team = await todoItemStore.getTeam(teamId)
    const member = team.members.find(member => member._id === memberId)
    member.todoList = []
    await todoItemStore.setTeam(team)
    res.status(200).json({})
  } catch (e) {
    res.status(500).json({ message: `${member.name}님의 Todo Item을 삭제하는데 에러가 발생했습니다.` })
  }
})

module.exports = router
