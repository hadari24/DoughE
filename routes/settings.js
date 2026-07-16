const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../models/usersData');
const { success, error } = require('../utils/response');

router.get('/', (req, res) => {
  const userId = parseInt(req.headers['x-user-id']);
  const users = getAllUsers();
  const user = users.find(u => u.userId === userId);

  return success(res, {
    userName: user ? user.userName : '',
    email: user ? user.email : '',
    theme: (user && user.theme) || 'light'
  });
});

router.put('/', (req, res) => {
  const { userName, email, theme } = req.body;
  const userId = parseInt(req.headers['x-user-id']);

  if (!userName || !email || !theme) {
    return error(res, 'VALIDATION_ERROR', 'All fields are required', {}, 400);
  }

  const users = getAllUsers();
  const user = users.find(u => u.userId === userId);
  if (user) {
    user.userName = userName;
    user.email = email;
    user.theme = theme;
  }

  return success(res, { userName, email, theme });
});

module.exports = router;