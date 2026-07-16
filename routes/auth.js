const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../models/usersData');
const { success, error } = require('../utils/response');

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email ||!password) {
        return error(res, 'VALIDATION_ERROR', 'Email and password are required', {}, 400);
    }

    if (password.length < 6) {
        return error(res, 'VALIDATION_ERROR', 'Password must be at least 6 characters', {}, 400);
    }

    const users = getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return error(res, 'UNAUTHORIZED', 'Invalid email or password', {}, 401);
    }

    return success(res, {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        userRole: user.userRole
    }, 200);
});

router.post('/logout', (req, res) => {
  return success(res, { message: 'Logged out successfully' }, 200);
});

router.get('/me', (req, res) => {
  const userId = parseInt(req.headers['x-user-id']);

  if (!userId) {
    return error(res, 'UNAUTHORIZED', 'Missing x-user-id header', {}, 401);
  }

  const users = getAllUsers();
  const user = users.find(u => u.userId === userId);

  if (!user) {
    return error(res, 'NOT_FOUND', 'User not found', {}, 404);
  }

  return success(res, user, 200);
});

module.exports = router;