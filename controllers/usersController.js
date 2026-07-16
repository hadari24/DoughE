const usersData = require('../models/usersData');
const { success, error } = require('../utils/response');

// GET /users — list all users
function list(req, res) {
  const allUsers = usersData.getAllUsers();
  return success(res, allUsers);
}

// GET /users/:id — fetch a single user
function get(req, res) {
  // URL params are always strings; convert to number for comparison
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return error(res, 'VALIDATION_ERROR', 'id must be a number',
      { param: 'id', received: req.params.id }, 400);
  }

  const user = usersData.getUserById(id);
  if (!user) {
    return error(res, 'NOT_FOUND', `User with id ${id} was not found`,
      { id }, 404);
  }

  return success(res, user);
}

// GET /users/me — fetch the current logged-in user
function me(req, res) {
  const userId = parseInt(req.headers['x-user-id']);
  if (!userId) {
    return error(res, 'UNAUTHORIZED', 'Missing x-user-id header', {}, 401);
  }

  const user = usersData.getUserById(userId);
  if (!user) {
    return error(res, 'NOT_FOUND', 'User not found', {}, 404);
  }

  return success(res, user);
}

// POST /users — create a new user
function create(req, res) {
  const { firstName, lastName, userRole } = req.body;

  // Check required fields and report ALL missing at once (better UX than one-by-one)
  const missing = [];
  if (!firstName) missing.push('firstName');
  if (!lastName) missing.push('lastName');
  if (!userRole) missing.push('userRole');

  if (missing.length > 0) {
    return error(res, 'VALIDATION_ERROR',
      `Missing required fields: ${missing.join(', ')}`,
      { missing }, 400);
  }

  const allowedRoles = ['admin', 'manager', 'user'];
  if (!allowedRoles.includes(userRole)) {
    return error(res, 'VALIDATION_ERROR',
      'userRole must be one of: admin, manager, user',
      { received: userRole, allowed: allowedRoles }, 400);
  }

  const newUser = usersData.addUser({ firstName, lastName, userRole });
  return success(res, { userId: newUser.userId, user: newUser }, 201);
}

// PUT /users/:id — update an existing user
function update(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return error(res, 'VALIDATION_ERROR', 'id must be a number',
      { param: 'id' }, 400);
  }

  const { firstName, lastName, userRole } = req.body;
  if (!firstName || !lastName || !userRole) {
    return error(res, 'VALIDATION_ERROR',
      'firstName, lastName, and userRole are all required',
      { required: ['firstName', 'lastName', 'userRole'] }, 400);
  }

  const updated = usersData.updateUser(id, { firstName, lastName, userRole });
  if (!updated) {
    return error(res, 'NOT_FOUND', `User with id ${id} was not found`,
      { id }, 404);
  }

  return success(res, { userId: updated.userId, user: updated });
}

// DELETE /users/:id — remove a user
function remove(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return error(res, 'VALIDATION_ERROR', 'id must be a number',
      { param: 'id' }, 400);
  }

  const removed = usersData.removeUser(id);
  if (!removed) {
    return error(res, 'NOT_FOUND', `User with id ${id} was not found`,
      { id }, 404);
  }

  return success(res, { userId: removed.userId, message: 'User deleted' });
}

module.exports = { list, get, me, create, update, remove};
