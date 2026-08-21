const categoryService = require('../services/category.service');

const catchAsync = require('../utils/catchAsync');

const {
  BadRequestError
} = require('../utils/errors');


const getCategories = catchAsync(async (req, res) => {

  const categories = await categoryService.getCategories();

  res.status(200).json(categories);
});


const getCategoryById = catchAsync(async (req, res) => {

  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    throw new BadRequestError('Invalid category ID');
  }

  const category = await categoryService.getCategoryById(id);

  res.status(200).json(category);
});


const createCategory = catchAsync(async (req, res) => {

  const { name, description } = req.body;

  if (!name) {
    throw new BadRequestError(
      'Category name is required'
    );
  }

  const category = await categoryService.createCategory(
    name,
    description
  );

  res.status(201).json(category);
});


const updateCategory = catchAsync(async (req, res) => {

  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    throw new BadRequestError('Invalid category ID');
  }

  const { name, description } = req.body;

  if (
    name === undefined &&
    description === undefined
  ) {
    throw new BadRequestError(
      'Provide name or description to update'
    );
  }

  const category = await categoryService.updateCategory(
    id,
    name,
    description
  );

  res.status(200).json(category);
});


const deleteCategory = catchAsync(async (req, res) => {

  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    throw new BadRequestError('Invalid category ID');
  }

  await categoryService.deleteCategory(id);

  res.status(200).json({
    message: 'Category deleted successfully'
  });
});


module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};