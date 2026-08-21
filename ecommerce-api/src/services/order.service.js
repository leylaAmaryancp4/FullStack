
const prisma = require('../lib/prisma');

const {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError
} = require('../utils/errors');


const checkout = async (userId) => {

  return prisma.$transaction(async (tx) => {

    // 1. Find the user's cart with its items and products
    const cart = await tx.cart.findUnique({
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


    // 2. Make sure the cart is not empty
    if (cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }


    // 3. Verify stock and calculate total
    let total = 0;

    for (const item of cart.items) {

      if (item.quantity <= 0) {
        throw new BadRequestError(
          'Cart item quantity must be greater than 0'
        );
      }

      if (item.product.stock < item.quantity) {
        throw new ConflictError(
          `Not enough stock for product: ${item.product.name}`
        );
      }

      total += Number(item.product.price) * item.quantity;
    }


    // 4. Create the order
    const order = await tx.order.create({
      data: {
        userId,
        status: 'pending',
        total
      }
    });


    // 5. Create order items
    for (const item of cart.items) {

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.product.price
        }
      });
    }


    // 6. Decrement product stock
    for (const item of cart.items) {

      await tx.product.update({
        where: {
          id: item.productId
        },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }


    // 7. Empty the cart
    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id
      }
    });


    // 8. Return the complete order
    return tx.order.findUnique({
      where: {
        id: order.id
      },
      include: {
        items: {
          include: {
            product: true
        }
    }
     }
});
});
};

const getOrders = async (userId) => {

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      role: true
    }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const where = user.role === 'admin'
    ? {}
    : {
        userId
      };

  return prisma.order.findMany({
    where,

    include: {
      items: {
        include: {
          product: true
        }
      }
    },

    orderBy: {
      createdAt: 'desc'
    }
  });
};


const getOrderById = async (userId, orderId) => {

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      role: true
    }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Customer can only see their own order
  if (user.role !== 'admin' && order.userId !== userId) {
    throw new ForbiddenError(
      'You do not have access to this order'
    );
  }

  return order;
};

const updateOrderStatus = async (orderId, status) => {

  const allowedStatuses = [
    'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled'
  ];

  if (!allowedStatuses.includes(status)) {
    throw new BadRequestError(
      'Invalid order status'
    );
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId
    }
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  return prisma.order.update({
    where: {
      id: orderId
    },
    data: {
      status
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });
};


module.exports = {
  checkout,
  getOrders,
  getOrderById,
  updateOrderStatus
};