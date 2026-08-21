const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');

const {
  ConflictError,
  UnauthorizedError
} = require('../utils/errors');


const registerUser = async (email, password) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    throw new ConflictError(
      'User with this email already exists'
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.$transaction(async (tx) => {

    // Create user
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split('@')[0],
        role: 'customer'
      }
    });

    // Create one cart for the user
    await tx.cart.create({
      data: {
        userId: user.id
      }
    });

    return user;
  });

  return {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role
  };
};


const validateCredentials = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user) {
    throw new UnauthorizedError(
      'Invalid email or password'
    );
  }

  const isValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isValid) {
    throw new UnauthorizedError(
      'Invalid email or password'
    );
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
};


const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  });

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  return user;
};


const updateUserRole = async (userId, role) => {
  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      role
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });
};


module.exports = {
  registerUser,
  validateCredentials,
  getUserById,
  updateUserRole
};