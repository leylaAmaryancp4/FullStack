const orderService = require('../services/order.service');
const catchAsync = require('../utils/catchAsync');
const {
  BadRequestError
} = require('../utils/errors');

const checkout = catchAsync(async (req, res) => {

  const order = await orderService.checkout(
    req.session.userId
  );

  res.status(201).json({
    message: 'Order created successfully',
    order
  });
});

const getOrders = catchAsync(async (req, res) => {

  const orders = await orderService.getOrders(
    req.session.userId
  );

  res.status(200).json({
    orders
  });
});

const getOrderById = catchAsync(async (req, res) => {

  const orderId = Number(req.params.id);

  if (!Number.isInteger(orderId)) {
    throw new BadRequestError('Invalid order ID');
  }

  const order = await orderService.getOrderById(
    req.session.userId,
    orderId
  );

  res.status(200).json({
    order
  });
});

const updateOrderStatus = catchAsync(async (req, res) => {

  const orderId = Number(req.params.id);

  if (!Number.isInteger(orderId)) {
    throw new BadRequestError(
      'Invalid order ID'
    );
  }

  const { status } = req.body;

  if (!status) {
    throw new BadRequestError(
      'Status is required'
    );
  }

  const order = await orderService.updateOrderStatus(
    orderId,
    status
  );

  res.status(200).json({
    message: 'Order status updated successfully',
    order
  });
});

module.exports = {
  checkout,
  getOrders,
  getOrderById,
  updateOrderStatus
};