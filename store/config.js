const firebase = require("firebase");
const firebaseConfig = {
  apiKey: "AIzaSyDpW8Xa3OmfGzhyAifDRL9klz0QN0Zmoks",
  authDomain: "js-todo-list-9ca3a.firebaseapp.com",
  databaseURL: "https://js-todo-list-9ca3a.firebaseio.com",
  projectId: "js-todo-list-9ca3a",
  storageBucket: "js-todo-list-9ca3a.appspot.com",
  messagingSenderId: "590124268771",
  appId: "1:590124268771:web:6e147ff5eab26f856a59d6",
  measurementId: "G-X0G9CEDEXG"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

module.exports = database