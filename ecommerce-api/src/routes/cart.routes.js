const express = require('express');

const requireAuth = require('../middlewares/auth');

const {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem
} = require('../controllers/cart.controller');

const router = express.Router();
router.get('/', requireAuth, getCart);
router.post('/items', requireAuth, addCartItem);
router.put('/items/:productId', requireAuth, updateCartItem);
router.delete('/items/:productId', requireAuth, deleteCartItem);

module.exports = router;