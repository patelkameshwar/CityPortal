const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      console.error(`Access denied: User role '${req.user.role}' not in allowed roles: ${allowedRoles.join(', ')}`);
      return res.status(403).json({
        message: "Access denied: insufficient permission",
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
