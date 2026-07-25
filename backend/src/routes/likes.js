const express = require('express');
const router = express.Router();
const { myLikes } = require('../controllers/likesController');

// GET /api/likes -> recipes the current user (x-user-id header) has liked
router.get('/', myLikes);

module.exports = router;
