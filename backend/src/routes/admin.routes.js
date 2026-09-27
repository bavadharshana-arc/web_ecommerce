const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateOrderStatusSchema } = require('../validators/order.validator');

// All admin routes strictly enforce authenticate + authorizeAdmin
router.use(authenticate, authorizeAdmin);

// Analytics
router.get('/dashboard', adminController.getDashboardStats);

// Orders
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', validate(updateOrderStatusSchema), adminController.updateOrderStatus);

// Inventory
router.get('/inventory', adminController.getInventory);
router.patch('/inventory/:id/stock', adminController.quickRestock);

// Users
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/status', adminController.updateUserStatus);

module.exports = router;
