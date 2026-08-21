const prisma = require('../lib/prisma');

const {
  NotFoundError,
  BadRequestError
} = require('../utils/errors');

const catchAsync = require('../utils/catchAsync');


// GET /api/products
// Optional: ?category=Electronics
const getProducts = catchAsync(async (req, res) => {
  const { category } = req.query;

  const products = await prisma.product.findMany({
    where: category
      ? {
          categories: {
            some: {
              category: {
                name: category
              }
            }
          }
        }
      : undefined,

    include: {
      categories: {
        include: {
          category: true
        }
      }
    },

    orderBy: {
      id: 'desc'
    }
  });

  res.status(200).json(products);
});


// GET /api/products/:id
const getProductById = catchAsync(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    throw new BadRequestError('Invalid product ID');
  }

  const product = await prisma.product.findUnique({
    where: {
      id
    },

    include: {
      categories: {
        include: {
          category: true
        }
      },

      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  res.status(200).json(product);
});


// POST /api/products
// Admin only
const createProduct = catchAsync(async (req, res) => {
  const {
    name,
    description,
    price,
    stock,
    categoryIds
  } = req.body;

  // Validate required fields
  if (!name || price === undefined) {
    throw new BadRequestError(
      'Name and price are required'
    );
  }

  // Validate categoryIds
  if (
    categoryIds !== undefined &&
    !Array.isArray(categoryIds)
  ) {
    throw new BadRequestError(
      'categoryIds must be an array'
    );
  }

  // Create product + categories
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock: stock ?? 0,

      categories: categoryIds?.length
        ? {
            create: categoryIds.map((categoryId) => ({
              category: {
                connect: {
                  id: Number(categoryId)
                }
              }
            }))
          }
        : undefined
    },

    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  });

  res.status(201).json(product);
});


// PUT /api/products/:id
// Admin only
const updateProduct = catchAsync(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    throw new BadRequestError('Invalid product ID');
  }

  const {
    name,
    description,
    price,
    stock,
    categoryIds
  } = req.body;

  // Check product exists
  const existingProduct = await prisma.product.findUnique({
    where: {
      id
    }
  });

  if (!existingProduct) {
    throw new NotFoundError('Product not found');
  }

  // Validate categoryIds if provided
  if (
    categoryIds !== undefined &&
    !Array.isArray(categoryIds)
  ) {
    throw new BadRequestError(
      'categoryIds must be an array'
    );
  }

  const product = await prisma.product.update({
    where: {
      id
    },

    data: {
      ...(name !== undefined && {
        name
      }),

      ...(description !== undefined && {
        description
      }),

      ...(price !== undefined && {
        price
      }),

      ...(stock !== undefined && {
        stock
      }),

      // If categoryIds is provided,
      // replace existing categories
      ...(categoryIds !== undefined && {
        categories: {
          deleteMany: {},

          create: categoryIds.map((categoryId) => ({
            category: {
              connect: {
                id: Number(categoryId)
              }
            }
          }))
        }
      })
    },

    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  });

  res.status(200).json(product);
});


// DELETE /api/products/:id
// Admin only
const deleteProduct = catchAsync(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    throw new BadRequestError('Invalid product ID');
  }

  // Check product exists
  const existingProduct = await prisma.product.findUnique({
    where: {
      id
    }
  });

  if (!existingProduct) {
    throw new NotFoundError('Product not found');
  }

  await prisma.product.delete({
    where: {
      id
    }
  });

  res.status(200).json({
    message: 'Product deleted successfully'
  });
});


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};