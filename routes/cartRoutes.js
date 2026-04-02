const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { authenticate } = require('../middleware');

/**
 * Cart Routes
 * Base path: /api/cart
 */

// All cart routes require authentication
router.use(authenticate);

// Get cart and add item
router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

// Update and remove specific item
router.route('/:id')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;
