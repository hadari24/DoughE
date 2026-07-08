
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

// Like requireRole, but ALSO allows a regular user to act on their OWN record.
// The caller identifies themselves with an x-user-id header; if it matches the
// :id in the route, access is granted even if their role isn't in allowedRoles.
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

    // everyone else may act only on their OWN record
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
