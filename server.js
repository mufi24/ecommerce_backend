const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// HEALTH CHECK ENDPOINT (No DB required)
// ============================================
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.status(200).json({
    success: true,
    message: 'Server is running',
    database: dbStatus[dbState],
    timestamp: new Date().toISOString()
  });
});

// ============================================
// API ROUTES
// ============================================
// Only mount routes after DB connection to prevent buffering timeout
let routesMounted = false;

const mountRoutes = () => {
  if (routesMounted) return;
  
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to M-Shop E-commerce API',
      version: '1.0.0',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      endpoints: {
        auth: '/api/auth',
        products: '/api/products',
        cart: '/api/cart',
        orders: '/api/orders',
        health: '/api/health'
      }
    });
  });
  
  // Error handling middleware (must be last)
  app.use(notFound);
  app.use(errorHandler);
  
  routesMounted = true;
  console.log('✅ API Routes mounted successfully');
};

// ============================================
// DATABASE CONNECTION
// ============================================
const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  
  // Mongoose connection options
  const options = {
    serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    bufferCommands: false, // Disable mongoose buffering
  };
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`📍 URI: ${MONGODB_URI.replace(/:([^@]+)@/, ':****@')}`);
    
    await mongoose.connect(MONGODB_URI, options);
    
    console.log('✅ MongoDB Connected Successfully');
    
    // Mount routes only after successful DB connection
    mountRoutes();
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Check if your IP is whitelisted in MongoDB Atlas');
    console.error('   → https://cloud.mongodb.com → Network Access → Add IP Address');
    console.error('2. Verify your username and password are correct');
    console.error('3. Ensure your MongoDB Atlas cluster is running');
    console.error('4. Check your internet connection\n');
    
    throw error;
  }
};

// ============================================
// MONGOOSE EVENT HANDLERS
// ============================================
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('📊 Mongoose disconnected from MongoDB');
});

// ============================================
// SERVER STARTUP
// ============================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start server only after DB connection
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`📝 Health Check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    
    // For development: Start server without DB for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('\n⚠️  Starting server WITHOUT database connection...');
      console.log('💡 API routes will return errors until DB is connected\n');
      
      mountRoutes();
      
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} (NO DATABASE)`);
        console.log(`🔗 API URL: http://localhost:${PORT}`);
        console.log(`📝 Health Check: http://localhost:${PORT}/api/health\n`);
      });
    } else {
      process.exit(1);
    }
  }
};

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGINT', async () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('📊 MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('📊 MongoDB connection closed');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Don't exit, let the app continue running
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Start the server
startServer();
