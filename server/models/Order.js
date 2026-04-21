const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  pizza: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza', required: false, default: null },
  isCustom: { type: Boolean, default: false },
  name: String,
  image: String,
  size: { type: String, enum: ['S', 'M', 'L'], required: true },
  toppings: [{ name: String, price: Number }],
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  deliveryAddress: { type: String, required: true },
  phone: { type: String, required: true },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  coupon: { type: String, default: '' },
  deliveryFee: { type: Number, default: 49 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'COD' },
  status: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed',
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
  }],
  estimatedDelivery: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
