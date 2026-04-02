const mongoose = require('mongoose');

// Order Item Schema (embedded in Order)
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String
  }
});

// Order Schema Definition
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Ordered'
  },
  shippingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'India' }
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Index for faster queries by user
orderSchema.index({ user: 1, createdAt: -1 });

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Static method to get order statistics
orderSchema.statics.getUserOrderStats = async function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalSpent: { $sum: '$total' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
