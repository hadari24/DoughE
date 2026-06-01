
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { requireRole } = require('../middleware/auth');


router.get('/',    requireRole('admin', 'manager', 'user'), usersController.list);
router.get('/:id', requireRole('admin', 'manager', 'user'), usersController.get);

// Create — admin only
router.post('/', requireRole('admin'), usersController.create);

// Update — admin + manager
router.put('/:id', requireRole('admin', 'manager'), usersController.update);

// Delete — admin only
router.delete('/:id', requireRole('admin'), usersController.remove);

module.exports = router;
