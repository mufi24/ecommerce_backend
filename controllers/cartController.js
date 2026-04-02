const { Cart, Product } = require('../models');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.userId })
      .populate('items.product', 'name price image description category');

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({ user: req.userId, items: [] });
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        cart: {
          ...cart.toObject(),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.userId });
    
    if (!cart) {
      cart = new Cart({
        user: req.userId,
        items: [{ product: productId, quantity }]
      });
    } else {
      // Check if item already in cart
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Update quantity if item exists
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();

    // Populate product details
    await cart.populate('items.product', 'name price image description category');

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: {
        cart: {
          ...cart.toObject(),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:id
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Populate product details
    await cart.populate('items.product', 'name price image description category');

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: {
        cart: {
          ...cart.toObject(),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:id
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
  try {
    const productId = req.params.id;

    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    // Populate product details
    await cart.populate('items.product', 'name price image description category');

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cart: {
          ...cart.toObject(),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.userId });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: {
        cart: {
          items: [],
          total: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
