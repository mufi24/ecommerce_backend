const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { authenticate } = require('../middleware');

/**
 * Order Routes
 * Base path: /api/orders
 */

// All order routes require authentication
router.use(authenticate);

// Create order and get all user orders
router.route('/')
  .post(createOrder)
  .get(getUserOrders);

// Get, update, cancel specific order
router.route('/:id')
  .get(getOrderById)
  .put(updateOrderStatus)
  .delete(cancelOrder);

module.exports = router;
