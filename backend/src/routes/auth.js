const express = require('express');
const router = express.Router();
const db = require('../../models');
const { success, error } = require('../utils/response');

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return error(res, 'VALIDATION_ERROR', 'Email and password are required', {}, 400);
    }
    if (password.length < 6) {
      return error(res, 'VALIDATION_ERROR', 'Password must be at least 6 characters', {}, 400);
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user || user.password !== password) {
      return error(res, 'UNAUTHORIZED', 'Invalid email or password', {}, 401);
    }

    return success(res, {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      userRole: user.userRole,
    }, 200);
  } catch (err) { next(err); }
});

router.post('/logout', (req, res) => {
  return success(res, { message: 'Logged out successfully' }, 200);
});

router.get('/me', async (req, res, next) => {
  try {
    const userId = parseInt(req.headers['x-user-id']);
    if (!userId) return error(res, 'UNAUTHORIZED', 'Missing x-user-id header', {}, 401);
    const user = await db.User.findByPk(userId);
    if (!user) return error(res, 'NOT_FOUND', 'User not found', {}, 404);
    return success(res, user, 200);
  } catch (err) { next(err); }
});

module.exports = router;
