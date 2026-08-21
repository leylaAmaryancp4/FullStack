const prisma = require('../lib/prisma');
const {
  UnauthorizedError,
  ForbiddenError
} = require('../utils/errors');

const adminOnly = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return next(
        new UnauthorizedError('Please log in')
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.session.userId
      },
      select: {
        id: true,
        role: true
      }
    });

    if (!user) {
      return next(
        new UnauthorizedError('User not found')
      );
    }

    if (user.role !== 'admin') {
      return next(
        new ForbiddenError(
          'Forbidden: Admin privileges required'
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminOnly;