const { UnauthorizedError } = require('../utils/errors');

const requireAuth = (req, res, next) => {
  if (!req.session?.userId) {
    return next(
      new UnauthorizedError(
        'Please log in to access this resource'
      )
    );
  }

  next();
};

module.exports = requireAuth;