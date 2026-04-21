require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Pizza = require('./models/Pizza');

const pizzas = [
  {
    name: 'Margherita Royale',
    description: 'Classic tomato base with premium mozzarella, fresh basil, and extra virgin olive oil drizzle.',
    category: 'Veg',
    basePrice: 299,
    sizes: { S: 299, M: 399, L: 499 },
    toppings: [
      { name: 'Extra Cheese', price: 50 },
      { name: 'Black Olives', price: 30 },
      { name: 'Jalapeños', price: 25 },
    ],
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
    rating: 4.8,
    reviews: 324,
    isFeatured: true,
    tags: ['bestseller', 'classic'],
  },
  {
    name: 'BBQ Chicken Blaze',
    description: 'Smoky BBQ sauce, tender grilled chicken, caramelized onions, and smoked cheddar.',
    category: 'Non-Veg',
    basePrice: 449,
    sizes: { S: 449, M: 549, L: 699 },
    toppings: [
      { name: 'Extra Chicken', price: 80 },
      { name: 'Bacon', price: 70 },
      { name: 'Red Peppers', price: 30 },
    ],
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
    rating: 4.9,
    reviews: 512,
    isFeatured: true,
    tags: ['bestseller', 'spicy'],
  },
  {
    name: 'Truffle Mushroom',
    description: 'White truffle cream sauce, wild mushrooms, gruyère, and fresh thyme — a gourmet delight.',
    category: 'Specials',
    basePrice: 599,
    sizes: { S: 599, M: 749, L: 899 },
    toppings: [
      { name: 'Extra Truffle Oil', price: 100 },
      { name: 'Caramelized Onions', price: 40 },
    ],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
    rating: 4.7,
    reviews: 198,
    isFeatured: true,
    tags: ['premium', 'gourmet'],
  },
  {
    name: 'Spicy Pepperoni Storm',
    description: 'Double pepperoni, spicy arrabbiata sauce, mozzarella, and chili flakes.',
    category: 'Non-Veg',
    basePrice: 499,
    sizes: { S: 499, M: 599, L: 749 },
    toppings: [
      { name: 'Extra Pepperoni', price: 70 },
      { name: 'Jalapeños', price: 25 },
      { name: 'Chili Flakes', price: 15 },
    ],
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600',
    rating: 4.6,
    reviews: 287,
    isFeatured: false,
    tags: ['spicy', 'meaty'],
  },
  {
    name: 'Garden Harvest',
    description: 'Tomato sauce, bell peppers, zucchini, cherry tomatoes, artichoke, and feta cheese.',
    category: 'Veg',
    basePrice: 349,
    sizes: { S: 349, M: 449, L: 549 },
    toppings: [
      { name: 'Extra Veggies', price: 40 },
      { name: 'Feta Cheese', price: 60 },
    ],
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600',
    rating: 4.5,
    reviews: 156,
    isFeatured: false,
    tags: ['healthy', 'vegan-friendly'],
  },
  {
    name: 'Seekh Kebab Special',
    description: 'Spiced minced lamb seekh kebabs on a harissa tomato base with pickled onions and mint chutney.',
    category: 'Specials',
    basePrice: 649,
    sizes: { S: 649, M: 799, L: 949 },
    toppings: [
      { name: 'Extra Kebab', price: 90 },
      { name: 'Pickled Onions', price: 25 },
    ],
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600',
    rating: 4.8,
    reviews: 203,
    isFeatured: true,
    tags: ['special', 'premium'],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Pizza.deleteMany({});
  await User.deleteMany({});

  await Pizza.insertMany(pizzas);
  console.log('✅ Pizzas seeded');

  await User.create({ name: 'Admin User', email: 'amruthalasurya2@gmail.com', password: 'Suryanan.110', role: 'admin', isVerified: true });
  await User.create({ name: 'John Doe', email: 'john@example.com', password: 'user123', role: 'user', isVerified: true });
  console.log('✅ Users seeded');
  console.log('\n🍕 SliceStream DB seeded successfully!');
  console.log('Admin: amruthalasurya2@gmail.com / Suryanan.110');
  console.log('User:  john@example.com / user123');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
