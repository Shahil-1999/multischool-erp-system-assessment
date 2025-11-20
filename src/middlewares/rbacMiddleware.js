/**
 * RBAC Middleware for multi-school ERP
 */

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

/**
 * Require edit permissions for students
 * Options:
 *   allowSuperadmin: true/false (default true)
 *   checkschool_id: true/false (default true)
 */
function requireEditStudents(options = {}) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { allowSuperadmin = true, checkschool_id = true } = options;

    // Superadmin bypass
    if (user.role === 'superadmin' && allowSuperadmin) return next();

    // School scoping
    if (checkschool_id && String(user.school_id) !== String(req.params.school_id)) {
      return res.status(403).json({ success: false, error: 'Forbidden: wrong school' });
    }

    // Admin can edit within their school
    if (user.role === 'admin') return next();

    // Regular user with can_edit_students
    if (user.role === 'user' && user.can_edit_students) return next();

    return res.status(403).json({ success: false, error: 'Forbidden: read-only access' });
  };
}

/**
 * Check if user can access/modify a target object (user/student)
 * target: { id, role, school_id }
 * options: { allowSameSchoolAdmin: true, allowSuperadmin: true }
 */
function canAccessRole(user, target, options = {}) {
  const { allowSameSchoolAdmin = true, allowSuperadmin = true } = options;

  if (!user || !target) return false;

  // Superadmin can access all
  if (user.role === 'superadmin' && allowSuperadmin) return true;

  // Admin can access same school users
  if (allowSameSchoolAdmin && user.role === 'admin' && String(user.school_id) === String(target.school_id)) {
    return true;
  }

  // Users can only access themselves
  if (user.role === 'user' && user.id === target.id) return true;

  return false;
}

/**
 * Dynamic access middleware
 * Pass a function that returns true/false
 */
function dynamicAccess(checkFn) {
  return async (req, res, next) => {
    try {
      const allowed = await checkFn(req);
      if (!allowed) return res.status(403).json({ success: false, error: 'Forbidden: access denied' });
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  requireRole,
  requireEditStudents,
  canAccessRole,
  dynamicAccess,
};
