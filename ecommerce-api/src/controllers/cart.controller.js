const cartService = require('../services/cart.service');
const catchAsync = require('../utils/catchAsync');


const getCart = catchAsync(async (req, res) => {
     const cart = await cartService.getCart(req.session.userId);
res.status(200).json({
    cart
  });
});


const addCartItem = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;

  const cartItem = await cartService.addCartItem(
    req.session.userId,
    Number(productId),
    Number(quantity)
  );

  res.status(201).json({
    message: 'Product added to cart successfully',
    cartItem
  });
});


const updateCartItem = catchAsync(async (req, res) => {
  const productId = Number(req.params.productId);
  const { quantity } = req.body;

  const cartItem = await cartService.updateCartItem(
    req.session.userId,
    productId,
    Number(quantity)
  );

  res.status(200).json({
    message: 'Cart item updated successfully',
    cartItem
  });
});


const deleteCartItem = catchAsync(async (req, res) => {
  const productId = Number(req.params.productId);

  await cartService.deleteCartItem(
    req.session.userId,
    productId
  );

  res.status(200).json({
    message: 'Cart item deleted successfully'
  });
});


module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem
};