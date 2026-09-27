const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addToCartSchema, updateCartItemSchema } = require('../validators/cart.validator');

// All cart routes require user authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', validate(addToCartSchema), cartController.addToCart);
router.put('/items/:id', validate(updateCartItemSchema), cartController.updateCartItem);
router.delete('/items/:id', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;
