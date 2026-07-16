const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../models/usersData');
const { success, error } = require('../utils/response');

let settings = {
  email: 'hadar@dough.com', // default settings for all users
  theme: 'light'
};

router.get('/', (req, res) => {
  const userId = parseInt(req.headers['x-user-id']);
  const users = getAllUsers();
  const user = users.find(u => u.userId === userId);

  return success(res, {
    userName: user ? user.userName : '',
    email: settings.email,
    theme: settings.theme
  });
});

router.put('/', (req, res) => {
  const { userName, email, theme } = req.body;
  const userId = parseInt(req.headers['x-user-id']);

  if (!userName || !email || !theme) {
    return error(res, 'VALIDATION_ERROR', 'All fields are required', {}, 400);
  }

  settings = { email, theme };

  const users = getAllUsers();
  const user = users.find(u => u.userId === userId);
  if (user) {
    user.userName = userName;
  }

  return success(res, { userName, email, theme });
});

module.exports = router;