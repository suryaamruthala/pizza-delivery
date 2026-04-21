const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['base', 'sauce', 'cheese', 'veggies', 'meat'],
    required: true,
  },
  unit: { type: String, required: true }, // 'units', 'ml', 'g'
  quantity: { type: Number, required: true, min: 0 },
  threshold: { type: Number, required: true }, // alert when below this
  deductPerPizza: { type: Number, required: true }, // amount deducted per pizza ordered
  lowStockAlertSent: { type: Boolean, default: false }, // prevents duplicate alerts
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
