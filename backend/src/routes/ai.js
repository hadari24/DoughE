const express = require('express');
const router = express.Router();
const { assistant } = require('../controllers/aiController');

router.post('/assistant', assistant);

module.exports = router;
