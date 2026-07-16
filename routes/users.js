const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { requireRole, requireSelfOrRole } = require('../middleware/auth');

router.get('/me', requireRole('admin', 'manager', 'user'), usersController.me);
router.get('/',    requireRole('admin', 'manager', 'user'), usersController.list);
router.get('/:id', requireRole('admin', 'manager', 'user'), usersController.get);

// create — admin only
router.post('/', requireRole('admin'), usersController.create);

// update — admin + manager / regular user updating their own record
router.put('/:id', requireSelfOrRole('admin', 'manager'), usersController.update);

// delete — admin only
router.delete('/:id', requireRole('admin'), usersController.remove);

module.exports = router;
