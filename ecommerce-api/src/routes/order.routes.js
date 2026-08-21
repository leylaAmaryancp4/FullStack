const express = require('express');

const orderController = require('../controllers/order.controller');
const requireAuth = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');

const router = express.Router();

// Checkout
router.post(
  '/checkout',
  requireAuth,
  orderController.checkout
);

// Get orders
router.get(
  '/',
  requireAuth,
  orderController.getOrders
);


// Get single order
router.get(
  '/:id',
  requireAuth,
  orderController.getOrderById
);


// Update order status - ADMIN ONLY
  router.patch(
  '/:id/status',
  requireAuth,
  adminOnly,
  orderController.updateOrderStatus
);

module.exports = router;