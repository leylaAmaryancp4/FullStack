const express = require('express');

const {
  getProductReviews,
  createReview,
  deleteReview
} = require('../controllers/review.controller');

const requireAuth = require('../middlewares/auth');

const router = express.Router();

// Public route
router.get('/products/:id/reviews', getProductReviews);

// Authenticated user route
router.post('/products/:id/reviews', requireAuth, createReview);

// Authenticated user route
// Controller checks whether user is owner or admin
router.delete('/reviews/:id', requireAuth, deleteReview);

module.exports = router;