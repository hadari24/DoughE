// middleware/auth.js
// Simulated authentication: we trust the x-user-role header.
// In a real system this would verify a JWT / session cookie.

const { error } = require('../utils/response');

// "Higher-order" middleware — a function that RETURNS a middleware.
// Usage in routes: requireRole('admin', 'manager')
// That call returns an (req, res, next) function Express will run.
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];

    // No header at all -> 401 Unauthorized (not logged in)
    if (!userRole) {
      return error(res, 'UNAUTHORIZED',
        'Missing x-user-role header. Please provide your role.',
        {}, 401);
    }

    // Header exists but role isn't allowed for this route -> 403 Forbidden
    if (!allowedRoles.includes(userRole)) {
      return error(res, 'FORBIDDEN',
        'You do not have permission to perform this action.',
        { yourRole: userRole, allowedRoles }, 403);
    }

    // Pass role onward so controllers can read it if needed
    req.userRole = userRole;
    next(); // hand control to the next middleware / route handler
  };
}

module.exports = { requireRole };
