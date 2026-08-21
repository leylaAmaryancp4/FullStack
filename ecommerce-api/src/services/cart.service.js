const prisma = require('../lib/prisma');

const {
  BadRequestError,
  NotFoundError
} = require('../utils/errors');


const getCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  return cart;
};


const addCartItem = async (userId, productId, quantity) => {

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new BadRequestError('Invalid product ID');
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new BadRequestError(
      'Quantity must be greater than 0'
    );
  }

  return prisma.$transaction(async (tx) => {

    // Find the user's cart
    const cart = await tx.cart.findUnique({
      where: {
        userId
      }
    });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    // Find the product
    const product = await tx.product.findUnique({
      where: {
        id: productId
      }
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Find existing cart item
    const existingItem = await tx.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    });

    // If product already exists, increase quantity
    if (existingItem) {

      const newQuantity =
        existingItem.quantity + quantity;

      if (newQuantity > product.stock) {
        throw new BadRequestError(
          'Not enough product stock'
        );
      }

      return tx.cartItem.update({
        where: {
          id: existingItem.id
        },
        data: {
          quantity: newQuantity
        },
        include: {
          product: true
        }
      });
    }

    // New product
    if (quantity > product.stock) {
      throw new BadRequestError(
        'Not enough product stock'
      );
    }

    return tx.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity
      },
      include: {
        product: true
      }
    });
  });
};


const updateCartItem = async (
  userId,
  productId,
  quantity
) => {

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new BadRequestError('Invalid product ID');
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new BadRequestError(
      'Quantity must be greater than 0'
    );
  }

  return prisma.$transaction(async (tx) => {

    // Find the user's cart
    const cart = await tx.cart.findUnique({
      where: {
        userId
      }
    });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    // Find item in this user's cart
    const cartItem = await tx.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      },
      include: {
        product: true
      }
    });

    if (!cartItem) {
      throw new NotFoundError(
        'Cart item not found'
      );
    }

    // Check current product stock
    if (quantity > cartItem.product.stock) {
      throw new BadRequestError(
        'Not enough product stock'
      );
    }

    // Update quantity
    return tx.cartItem.update({
      where: {
        id: cartItem.id
      },
      data: {
        quantity
      },
      include: {
        product: true
      }
    });
  });
};


const deleteCartItem = async (
  userId,
  productId
) => {

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new BadRequestError('Invalid product ID');
  }

  // Find user's cart
  const cart = await prisma.cart.findUnique({
    where: {
      userId
    }
  });

  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  // Find item only inside this user's cart
  const cartItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId
      }
    }
  });

  if (!cartItem) {
    throw new NotFoundError(
      'Cart item not found'
    );
  }

  await prisma.cartItem.delete({
    where: {
      id: cartItem.id
    }
  });
};


module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem
};