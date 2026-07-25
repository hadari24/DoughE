const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { requireRole, requireSelfOrRole } = require('../middleware/auth');

router.get('/', requireRole('admin', 'manager', 'user'), usersController.list);
router.get('/:id', requireRole('admin', 'manager', 'user'), usersController.get);
router.post('/', requireRole('admin'), usersController.create);
router.put('/:id', requireSelfOrRole('admin', 'manager'), usersController.update);
router.delete('/:id', requireRole('admin'), usersController.remove);

module.exports = router;
