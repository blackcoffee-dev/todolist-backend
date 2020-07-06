const TodoItem = require('../todo/TodoItem')
const User = require('../todo/User')
const Team = require('../todo/Team')
const express = require('express')
const router = express.Router()
const TodoItemStore = require('../store/index')

const userController = {
  isValidTodoItem(name, contents) {
    return !!name && !!contents
  }
}
const todoItemStore = new TodoItemStore()

router.post('/u/:name/item', async (req, res) => {
  const name = req.params.name
  const { contents, priority } = req.body
  if (!name) {
    res.status(500).json({ message: '유저 이름이 필요합니다.' })
    return
  }
  if (!contents) {
    res.status(500).json({ message: 'Todo Item의 내용이 필요합니다.' })
    return
  }
  if (!userController.isValidTodoItem(name, contents)) {
    res.status(500).json({ message: 'Todo Item을 추가하는데 에러가 발생했습니다.' })
    return
  }

  try {
    const newTodoItem = new TodoItem(contents, priority)
    let user = await todoItemStore.getUser(name)
    if (!user) {
      user = new User(name, newTodoItem)
    }
    user.todoList.push(newTodoItem)
    await todoItemStore.setUser(user)
    res.status(200).json(newTodoItem)
  } catch (e) {
    res.status(500).json({ message: 'Todo Item을 추가하는데 에러가 발생했습니다.' })
  }
})

router.get('/u/:name/item', async (req, res) => {
  const name = req.params.name
  const user = await todoItemStore.getUser(name)
  if (!!user) {
    return res.status(200).json(user)
  } else {
    res.status(500).json({
      message: '해당 이름의 유저가 없습니다.'
    })
  }
})

router.delete('/u/:name/items', async (req, res) => {
  const name = req.params.name
  if (!name) {
    res.status(500).json({ message: '유저 이름을 찾을 수 없습니다.' })
    return
  }
  const user = await todoItemStore.getUser(name)
  if (!user) {
    res.status(500).json({ message: '해당 유저가 존재하지 않습니다.' })
  }

  try {
    user.todoList = []
    await todoItemStore.setUser(user)
    res.status(200).json(user)
  } catch (e) {
    res.status(500).json({ message: '유저의 todolist를 삭제하는데 에러가 발생했습니다.' })
  }
})

router.get('/u', async (req, res) => {
  const users = await todoItemStore.getUsers()
  if (users) {
    const userList = []
    Object.keys(users).map(key => {
      userList.push({
        _id: users[key]._id,
        name: users[key].name
      })
    })
    res.status(200).json(userList)
  } else {
    res.status(500).json({ message: 'user list를 불러오는데 실패했습니다.' })
  }
})

router.put('/u/:name/item/:id', async (req, res) => {
  const { id, name } = req.params
  const { contents } = req.body

  if (!id || !contents || !name) {
    res.status(500).json({ message: 'Todo Item을 수정하는데 에러가 발생했습니다.' })
    return
  }

  const user = await todoItemStore.getUser(name)
  if (!user) {
    res.status(500).json({ message: '해당 유저가 존재하지 않습니다.' })
  }
  try {
    const targetItemIndex = user.todoList.findIndex(item => item._id === id)
    user.todoList[targetItemIndex].contents = contents
    await todoItemStore.setUser(user)
    res.status(200).json(user.todoList[targetItemIndex])
  } catch (e) {
    res.status(500).json({
      message: 'Todo Item의 priority를 수정하는데 에러가 발생했습니다.'
    })
  }
})

router.put('/u/:name/item/:id/priority', async (req, res) => {
  const { id, name } = req.params
  const priority = req.body.priority

  if (!id || !priority || !name) {
    res.status(500).json({ message: '수정하는데 빠진 항목이 있습니다.' })
    return
  }

  const user = await todoItemStore.getUser(name)
  if (!user) {
    res.status(500).json({ message: '해당 유저가 존재하지 않습니다.' })
  }
  try {
    const targetItemIndex = user.todoList.findIndex(item => item._id === id)
    user.todoList[targetItemIndex].priority = priority
    await todoItemStore.setUser(user)
    res.status(200).json(user.todoList[targetItemIndex])
  } catch (e) {
    res.status(500).json({
      message: 'Todo Item의 priority를 수정하는데 에러가 발생했습니다.'
    })
  }
})

router.put('/u/:name/item/:id/toggle', async (req, res) => {
  const itemId = req.params.id
  const name = req.params.name
  if (!itemId || !name) {
    res.status(500).json({ message: 'Todo Item을 수정하는데 에러가 발생했습니다.' })
    return
  }
  const user = await todoItemStore.getUser(name)
  if (!user) {
    res.status(500).json({ message: '해당 유저가 존재하지 않습니다.' })
  }
  try {
    const targetItemIndex = user.todoList.findIndex(item => item._id === itemId)
    user.todoList[targetItemIndex].isCompleted = !user.todoList[targetItemIndex].isCompleted
    await todoItemStore.setUser(user)
    res.status(200).json(user.todoList[targetItemIndex])
  } catch (e) {
    res.status(500).json({ message: 'Todo Item을 수정하는데 에러가 발생했습니다.' })
  }
})

router.delete('/u/:name/item/:id', async (req, res) => {
  const itemId = req.params.id
  const name = req.params.name
  if (!itemId || !name) {
    res.status(500).json({ message: 'Todo Item을 삭제하는데 에러가 발생했습니다.' })
    return
  }
  const user = await todoItemStore.getUser(name)
  if (!user) {
    res.status(500).json({ message: '해당 유저가 존재하지 않습니다.' })
  }
  try {
    const targetItemIndex = user.todoList.findIndex(item => item._id === itemId)
    user.todoList.splice(targetItemIndex, 1)
    await todoItemStore.setUser(user)
    res.status(200).json(user)
  } catch (e) {
    res.status(500).json({ message: 'Todo Item을 삭제하는데 에러가 발생했습니다.' })
  }
})

module.exports = router
