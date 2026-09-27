const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');

// Public routes
router.get('/featured', productController.getFeaturedProducts);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin-only modification routes
router.post('/', authenticate, authorizeAdmin, validate(createProductSchema), productController.createProduct);
router.put('/:id', authenticate, authorizeAdmin, validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, productController.deleteProduct);

module.exports = router;
