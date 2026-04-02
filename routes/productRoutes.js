const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts
} = require('../controllers/productController');

/**
 * Product Routes
 * Base path: /api/products
 */

// Get all products and create new product
router.route('/')
  .get(getAllProducts)
  .post(createProduct);

// Seed products with dummy data
router.post('/seed', seedProducts);

// Get, update, delete single product
router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
