const express = require('express');

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');

const adminOnly = require('../middlewares/adminOnly');

const router = express.Router();


// Public
router.get('/', getCategories);
router.get('/:id', getCategoryById);


// Admin only
router.post('/', adminOnly, createCategory);
router.put('/:id', adminOnly, updateCategory);
router.delete('/:id', adminOnly, deleteCategory);


module.exports = router;