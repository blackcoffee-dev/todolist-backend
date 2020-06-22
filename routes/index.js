const TodoItem = require("../todo/TodoItem");
const User = require("../todo/User");
const express = require("express");
const router = express.Router();
const users = [];

const userController = {
  isValidTodoItem(username, contents) {
    return !username || !contents;
  },
  addTodoItem(username, contents, newTodoItem) {
    let targetUserIndex = "";
    if (users.length > 0) {
      targetUserIndex = users.findIndex(user => user.name === username);
      console.log(targetUserIndex);
      if (targetUserIndex >= 0) {
        users[targetUserIndex].todoList.push(newTodoItem);
      } else {
        users.push(new User(username, newTodoItem));
      }
      return;
    }
    if (users.length === 0) {
      users.push(new User(username, newTodoItem));
    }
  }
};

router.post("/todo/:name/item", (req, res) => {
  const username = req.params.name;
  const contents = req.body.contents;
  if (userController.isValidTodoItem(username, contents)) {
    return;
  }
  const newTodoItem = new TodoItem(contents);
  userController.addTodoItem(username, contents, newTodoItem);
  console.log(users);
  res.status(200).json(newTodoItem);
});

router.get("/todo/:name/item", (req, res) => {
  const username = req.params.name;
  const user = users.find(user => user.name === username);
  res.status(200).json(user);
});

router.put("/todo/:name/item/:id", (req, res) => {
  const id = req.params.id;
  const contents = req.body.contents;
  const username = req.params.name;
  const targetUserIndex = users.findIndex(user => user.name === username);
  const targetItemIndex = users[targetUserIndex].todoList.findIndex(
    item => item._id === id
  );
  users[targetUserIndex].todoList[targetItemIndex].contents = contents;
  res.status(200).json(users[targetUserIndex].todoList[targetItemIndex]);
});

router.delete("/todo/:name/item/:id", (req, res) => {
  const id = req.params.id;
  const username = req.params.name;
  const targetUserIndex = users.findIndex(user => user.name === username);
  const targetItemIndex = users[targetUserIndex].todoList.findIndex(
    item => item._id === id
  );
  users[targetUserIndex].todoList.splice(targetItemIndex, 1);
  res.status(200).json({});
});

module.exports = router;
