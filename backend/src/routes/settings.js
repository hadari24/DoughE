const express = require('express');
const router = express.Router();
const db = require('../../models');
const { success, error } = require('../utils/response');

router.get('/', async (req, res, next) => {
  try {
    const userId = parseInt(req.headers['x-user-id']);
    const user = await db.User.findByPk(userId);
    return success(res, {
      userName: user ? user.userName : '',
      email: user ? user.email : '',
      theme: (user && user.theme) || 'light',
    });
  } catch (err) { next(err); }
});

router.put('/', async (req, res, next) => {
  try {
    const { userName, email, theme } = req.body;
    const userId = parseInt(req.headers['x-user-id']);

    if (!userName || !email || !theme) {
      return error(res, 'VALIDATION_ERROR', 'All fields are required', {}, 400);
    }

    const user = await db.User.findByPk(userId);
    if (user) {
      await user.update({ userName, email, theme });
    }

    return success(res, { userName, email, theme });
  } catch (err) { next(err); }
});

module.exports = router;
