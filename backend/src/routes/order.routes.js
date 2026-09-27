const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createOrderSchema } = require('../validators/order.validator');

// All order routes require authentication
router.use(authenticate);

router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
