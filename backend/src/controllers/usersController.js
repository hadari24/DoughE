const db = require('../../models');
const { success, error } = require('../utils/response');

async function list(req, res, next) {
  try {
    const users = await db.User.findAll();
    return success(res, users);
  } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return error(res, 'VALIDATION_ERROR', 'id must be a number', { param: 'id', received: req.params.id }, 400);
    const user = await db.User.findByPk(id);
    if (!user) return error(res, 'NOT_FOUND', `User with id ${id} was not found`, { id }, 404);
    return success(res, user);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { firstName, lastName, userRole, email, password, userName } = req.body;

    const missing = [];
    if (!firstName) missing.push('firstName');
    if (!lastName) missing.push('lastName');
    if (!userRole) missing.push('userRole');
    if (missing.length > 0) {
      return error(res, 'VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}`, { missing }, 400);
    }

    const allowedRoles = ['admin', 'manager', 'user'];
    if (!allowedRoles.includes(userRole)) {
      return error(res, 'VALIDATION_ERROR', 'userRole must be one of: admin, manager, user', { received: userRole, allowed: allowedRoles }, 400);
    }

    const newUser = await db.User.create({ firstName, lastName, userRole, email, password, userName });
    return success(res, { userId: newUser.userId, user: newUser }, 201);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return error(res, 'VALIDATION_ERROR', 'id must be a number', { param: 'id' }, 400);

    const { firstName, lastName, userRole } = req.body;
    if (!firstName || !lastName || !userRole) {
      return error(res, 'VALIDATION_ERROR', 'firstName, lastName, and userRole are all required', { required: ['firstName', 'lastName', 'userRole'] }, 400);
    }

    const user = await db.User.findByPk(id);
    if (!user) return error(res, 'NOT_FOUND', `User with id ${id} was not found`, { id }, 404);

    await user.update({ firstName, lastName, userRole });
    return success(res, { userId: user.userId, user });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return error(res, 'VALIDATION_ERROR', 'id must be a number', { param: 'id' }, 400);

    const user = await db.User.findByPk(id);
    if (!user) return error(res, 'NOT_FOUND', `User with id ${id} was not found`, { id }, 404);

    await user.destroy();
    return success(res, { userId: id, message: 'User deleted' });
  } catch (err) { next(err); }
}

module.exports = { list, get, create, update, remove };
