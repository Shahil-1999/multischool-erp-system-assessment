/**
 * Middleware to check if user has access to the requested school
 * - Superadmin can access all schools
 * - Admin/User can access only their own school
 */
function checkSchoolAccess(req, res, next) {
  const user = req.user;
  const school_id = req.params.school_id;

  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  // Superadmin can access any school
  if (user.role === 'superadmin') return next();

  // Admin/User can access only their school
  if (String(user.school_id) !== String(school_id)) {
    return res.status(403).json({ success: false, error: 'Forbidden: wrong school' });
  }

  next();
}

module.exports = { checkSchoolAccess };
