const mongoose = require('mongoose');

const toppingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const pizzaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Veg', 'Non-Veg', 'Specials'], required: true },
  basePrice: { type: Number, required: true },
  sizes: {
    S: { type: Number, required: true },
    M: { type: Number, required: true },
    L: { type: Number, required: true },
  },
  toppings: [toppingSchema],
  image: { type: String, default: '' },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  reviews: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Pizza', pizzaSchema);
