const { Product } = require('../models');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      },
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product (for seeding/admin)
 * @route   POST /api/products
 * @access  Public (should be Admin only in production)
 */
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Public (should be Admin only in production)
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Public (should be Admin only in production)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Seed products with dummy data
 * @route   POST /api/products/seed
 * @access  Public
 */
const seedProducts = async (req, res, next) => {
  try {
    const dummyProducts = [
      {
        name: "Premium Wireless Headphones",
        price: 299.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        description: "Experience studio-quality sound with noise-canceling technology and 40-hour battery life."
      },
      {
        name: "Minimalist Leather Watch",
        price: 150.00,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        description: "A timeless design featuring genuine Italian leather and scratch-resistant sapphire glass."
      },
      {
        name: "Smart Fitness Tracker",
        price: 89.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800",
        description: "Track your steps, heart rate, and sleep patterns with ease. Water-resistant up to 50m."
      },
      {
        name: "Ergonomic Office Chair",
        price: 450.00,
        category: "Home",
        image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800",
        description: "Support your back with adjustable lumbar support and breathable mesh material."
      },
      {
        name: "Organic Cotton Hoodie",
        price: 65.00,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
        description: "Sustainable, soft, and perfect for every season. Available in multiple colors."
      },
      {
        name: "Acoustic Noise Cancelling Headphones",
        price: 349.00,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
        description: "Industry-leading noise cancellation with premium sound quality and 30-hour battery life."
      },
      {
        name: "Luxury Minimalist Watch",
        price: 199.00,
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800",
        description: "Elegant sapphire crystal face with a genuine top-grain leather strap."
      },
      {
        name: "Smart Home Security Hub",
        price: 129.99,
        category: "Home",
        image: "https://thegadgetflow.com/wp-content/uploads/2021/01/HeimVision-Assure-B1-smart-home-security-hub-07.jpg",
        description: "Control your entire home environment with a single touch or voice command."
      },
      {
        name: "Performance Running Shoes",
        price: 120.00,
        category: "Sports",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        description: "Ultra-lightweight design with carbon-fiber plates for maximum energy return."
      },
      {
        name: "Velvet Accent Armchair",
        price: 499.00,
        category: "Home",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
        description: "Mid-century modern design with plush emerald velvet upholstery."
      },
      {
        name: "4K Professional Mirrorless Camera",
        price: 1899.00,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
        description: "Full-frame sensor with stunning low-light performance and 4K 60fps video."
      },
      {
        name: "Matte Black Espresso Machine",
        price: 250.00,
        category: "Home",
        image: "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=800",
        description: "Barista-quality coffee at home with integrated milk frother."
      },
      {
        name: "Designer Wool Overcoat",
        price: 295.00,
        category: "Fashion",
        image: "https://tse1.mm.bing.net/th/id/OIP.PmaVtkkIcBk9FRid6MleGAHaLH?w=2000&h=3000&rs=1&pid=ImgDetMain&o=7&rm=3",
        description: "Premium cashmere blend wool coat for unparalleled warmth and style."
      },
      {
        name: "Mountain Trail Bike",
        price: 850.00,
        category: "Sports",
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800",
        description: "Heavy-duty suspension and all-terrain tires for the ultimate adventure."
      },
      {
        name: "Hardcover Art Collection",
        price: 75.00,
        category: "Books",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
        description: "A visually stunning journey through 20th-century modern art."
      }
    ];

    // Clear existing products and insert new ones
    await Product.deleteMany({});
    const products = await Product.insertMany(dummyProducts);

    res.status(201).json({
      success: true,
      message: `${products.length} products seeded successfully`,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts
};
