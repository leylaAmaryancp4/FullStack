
const reviewService = require('../services/review.service');
const catchAsync = require('../utils/catchAsync');
const { BadRequestError } = require('../utils/errors');


const getProductReviews = catchAsync(async (req, res) => {

  const productId = Number(req.params.id);

  if (!Number.isInteger(productId)) {
    throw new BadRequestError('Invalid product ID');
  }

  const reviews = await reviewService.getProductReviews(productId);

  res.status(200).json({
    reviews
  });
});


const createReview = catchAsync(async (req, res) => {

  const productId = Number(req.params.id);

  const { rating, comment } = req.body;

  if (!Number.isInteger(productId)) {
    throw new BadRequestError('Invalid product ID');
  }

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new BadRequestError(
      'Rating must be an integer between 1 and 5'
    );
  }

  const review = await reviewService.createReview(
    req.session.userId,
    productId,
    rating,
    comment
  );

  res.status(201).json({
    message: 'Review created successfully',
    review
  });
});


const deleteReview = catchAsync(async (req, res) => {

  const reviewId = Number(req.params.id);

  if (!Number.isInteger(reviewId)) {
    throw new BadRequestError('Invalid review ID');
  }

  await reviewService.deleteReview(
    req.session.userId,
    reviewId
  );

  res.status(200).json({
    message: 'Review deleted successfully'
  });
});


module.exports = {
  getProductReviews,
  createReview,
  deleteReview
};