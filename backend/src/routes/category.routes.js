const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/product.validator');

// Public endpoints
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin-only endpoints
router.post('/', authenticate, authorizeAdmin, validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', authenticate, authorizeAdmin, validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, categoryController.deleteCategory);

module.exports = router;
