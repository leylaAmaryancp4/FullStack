const prisma = require('../lib/prisma');

const {
  NotFoundError,
  ConflictError
} = require('../utils/errors');

const getCategories = async () => {
  return prisma.category.findMany({
    orderBy: {
      id: 'asc'
    }
  });
};


const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: {
      id
    },
    include: {
      products: {
        include: {
          product: true
        }
      }
    }
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  return category;
};


const createCategory = async (name, description) => {
  try {
    return await prisma.category.create({
      data: {
        name,
        description
      }
    });
  } catch (error) {
    if (
      error.code === 'P2002'
    ) {
      throw new ConflictError(
        'A category with this name already exists'
      );
    }

    throw error;
  }
};


const updateCategory = async (id, name, description) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      id
    }
  });

  if (!existingCategory) {
    throw new NotFoundError('Category not found');
  }

  try {
    return await prisma.category.update({
      where: {
        id
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description })
      }
    });
  } catch (error) {
    if (
      error.code === 'P2002'
    ) {
      throw new ConflictError(
        'A category with this name already exists'
      );
    }

    throw error;
  }
};


const deleteCategory = async (id) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      id
    }
  });

  if (!existingCategory) {
    throw new NotFoundError('Category not found');
  }

  await prisma.category.delete({
    where: {
      id
    }
  });
};


module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};