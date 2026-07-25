const { error } = require('../utils/response');

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];

    if (!userRole) {
      return error(res, 'UNAUTHORIZED',
        'Missing x-user-role header. Please provide your role.',
        {}, 401);
    }

    if (!allowedRoles.includes(userRole)) {
      return error(res, 'FORBIDDEN',
        'You do not have permission to perform this action.',
        { yourRole: userRole, allowedRoles }, 403);
    }

    req.userRole = userRole;
    next();
  };
}

function requireSelfOrRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];

    if (!userRole) {
      return error(res, 'UNAUTHORIZED',
        'Missing x-user-role header. Please provide your role.',
        {}, 401);
    }

    if (allowedRoles.includes(userRole)) {
      req.userRole = userRole;
      return next();
    }

    const callerId = parseInt(req.headers['x-user-id']);
    const targetId = parseInt(req.params.id);
    if (!isNaN(callerId) && callerId === targetId) {
      req.userRole = userRole;
      return next();
    }

    return error(res, 'FORBIDDEN',
      'You do not have permission to perform this action.',
      { yourRole: userRole, allowedRoles }, 403);
  };
}

module.exports = { requireRole, requireSelfOrRole };
