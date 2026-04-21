require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pizzas', require('./routes/pizza'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));

app.get('/', (req, res) => res.json({ message: 'SliceStream API running 🍕' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  let mongoUri = process.env.MONGO_URI;

  // Try connecting to real MongoDB first
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB connected (real instance)');
  } catch (err) {
    console.log('❌ MongoDB Connection Error:', err.message);
    // Fall back to in-memory MongoDB
    console.log('⚠️  No MongoDB found — starting in-memory database...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB in-memory started');

    // Auto-seed demo data
    await seedData();
  }

  app.listen(PORT, () => {
    console.log(`\n🍕 SliceStream API running on http://localhost:${PORT}`);
    console.log('\n📋 Demo Credentials:');
    console.log('   Admin:  amruthalasurya2@gmail.com / Suryanan.110');
    console.log('   User:   john@example.com / user123\n');
  });
}

async function seedData() {
  const User = require('./models/User');
  const Pizza = require('./models/Pizza');
  const Inventory = require('./models/Inventory');
  const count = await Pizza.countDocuments();
  if (count > 0) {
    // If pizzas are already seeded, still seed inventory if it's empty
    const invCount = await Inventory.countDocuments();
    if (invCount === 0) await seedInventory(Inventory);
    return;
  }

  await User.create([
    { name: 'Admin User', email: 'amruthalasurya2@gmail.com', password: 'Suryanan.110', role: 'admin', isVerified: true },
    { name: 'John Doe', email: 'john@example.com', password: 'user123', role: 'user', isVerified: true },
  ]);

  await Pizza.insertMany([
    // ── VEG ──────────────────────────────────────────────────────────────────
    {
      name: 'Margherita Royale',
      description: 'Classic tomato base with premium mozzarella, fresh basil, and extra virgin olive oil drizzle.',
      category: 'Veg', basePrice: 299, sizes: { S: 299, M: 399, L: 499 },
      toppings: [{ name: 'Extra Cheese', price: 50 }, { name: 'Black Olives', price: 30 }, { name: 'Jalapeños', price: 25 }],
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
      rating: 4.8, reviews: 324, isFeatured: true, tags: ['bestseller', 'classic'],
    },
    {
      name: 'Garden Harvest',
      description: 'Tomato sauce, bell peppers, zucchini, cherry tomatoes, artichoke, and feta cheese.',
      category: 'Veg', basePrice: 349, sizes: { S: 349, M: 449, L: 549 },
      toppings: [{ name: 'Extra Veggies', price: 40 }, { name: 'Feta Cheese', price: 60 }, { name: 'Sun-dried Tomatoes', price: 35 }],
      image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600',
      rating: 4.5, reviews: 156, isFeatured: false, tags: ['healthy', 'fresh'],
    },
    {
      name: 'Paneer Tikka Fiesta',
      description: 'Tandoori-spiced paneer cubes, capsicum, red onion, and mint yoghurt on a smoky tomato base.',
      category: 'Veg', basePrice: 379, sizes: { S: 379, M: 479, L: 579 },
      toppings: [{ name: 'Extra Paneer', price: 60 }, { name: 'Green Chutney Drizzle', price: 20 }, { name: 'Onion Rings', price: 25 }],
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600',
      rating: 4.7, reviews: 241, isFeatured: true, tags: ['indian', 'spicy'],
    },
    {
      name: 'Pesto Primavera',
      description: 'House-made basil pesto, roasted asparagus, cherry tomatoes, pine nuts, and shaved parmesan.',
      category: 'Veg', basePrice: 399, sizes: { S: 399, M: 499, L: 629 },
      toppings: [{ name: 'Extra Parmesan', price: 45 }, { name: 'Roasted Garlic', price: 30 }, { name: 'Chili Flakes', price: 15 }],
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600',
      rating: 4.6, reviews: 178, isFeatured: false, tags: ['gourmet', 'italian'],
    },
    {
      name: 'Corn & Capsicum Crunch',
      description: 'Sweet corn, tri-colour capsicum, mozzarella, jalapeños, and a tangy BBQ drizzle.',
      category: 'Veg', basePrice: 319, sizes: { S: 319, M: 419, L: 519 },
      toppings: [{ name: 'Extra Corn', price: 25 }, { name: 'Extra Capsicum', price: 25 }, { name: 'BBQ Drizzle', price: 20 }],
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600',
      rating: 4.4, reviews: 132, isFeatured: false, tags: ['mild', 'colourful'],
    },
    {
      name: 'Mushroom Melt',
      description: 'Creamy garlic white sauce, baby portobello mushrooms, truffle oil, gouda, and fresh thyme.',
      category: 'Veg', basePrice: 429, sizes: { S: 429, M: 529, L: 649 },
      toppings: [{ name: 'Extra Mushrooms', price: 40 }, { name: 'Truffle Oil', price: 80 }, { name: 'Caramelised Onions', price: 30 }],
      image: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=600',
      rating: 4.7, reviews: 209, isFeatured: true, tags: ['creamy', 'umami'],
    },
    {
      name: 'Spinach & Ricotta Bliss',
      description: 'Velvety ricotta base, wilted baby spinach, garlic, sun-dried tomatoes, and toasted pine nuts.',
      category: 'Veg', basePrice: 369, sizes: { S: 369, M: 469, L: 569 },
      toppings: [{ name: 'Extra Ricotta', price: 55 }, { name: 'Pine Nuts', price: 35 }, { name: 'Chili Flakes', price: 15 }],
      image: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=600',
      rating: 4.5, reviews: 119, isFeatured: false, tags: ['healthy', 'creamy'],
    },

    // ── NON-VEG ──────────────────────────────────────────────────────────────
    {
      name: 'BBQ Chicken Blaze',
      description: 'Smoky BBQ sauce, tender grilled chicken, caramelized onions, and smoked cheddar.',
      category: 'Non-Veg', basePrice: 449, sizes: { S: 449, M: 549, L: 699 },
      toppings: [{ name: 'Extra Chicken', price: 80 }, { name: 'Bacon', price: 70 }, { name: 'Red Peppers', price: 30 }],
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
      rating: 4.9, reviews: 512, isFeatured: true, tags: ['bestseller', 'smoky'],
    },
    {
      name: 'Spicy Pepperoni Storm',
      description: 'Double pepperoni, spicy arrabbiata sauce, mozzarella, and chili flakes.',
      category: 'Non-Veg', basePrice: 499, sizes: { S: 499, M: 599, L: 749 },
      toppings: [{ name: 'Extra Pepperoni', price: 70 }, { name: 'Jalapeños', price: 25 }, { name: 'Chili Flakes', price: 15 }],
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600',
      rating: 4.6, reviews: 287, isFeatured: false, tags: ['spicy', 'meaty'],
    },
    {
      name: 'Chicken Tikka Masala',
      description: 'Juicy chicken tikka in a spiced masala sauce, red onion, capsicum, and fresh coriander.',
      category: 'Non-Veg', basePrice: 469, sizes: { S: 469, M: 569, L: 719 },
      toppings: [{ name: 'Extra Chicken', price: 80 }, { name: 'Green Chutney', price: 20 }, { name: 'Extra Cheese', price: 50 }],
      image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600',
      rating: 4.8, reviews: 344, isFeatured: true, tags: ['indian', 'spicy'],
    },
    {
      name: 'Prawn Arrabiata',
      description: 'Plump tiger prawns on a fiery arrabiata tomato sauce with garlic, capers, and fresh parsley.',
      category: 'Non-Veg', basePrice: 579, sizes: { S: 579, M: 699, L: 849 },
      toppings: [{ name: 'Extra Prawns', price: 100 }, { name: 'Chili Oil', price: 25 }, { name: 'Capers', price: 20 }],
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600',
      rating: 4.7, reviews: 163, isFeatured: false, tags: ['seafood', 'spicy'],
    },
    {
      name: 'Bacon Ranch Stampede',
      description: 'Crispy streaky bacon, smoky ranch sauce, mozzarella, jalapeños, and spring onion.',
      category: 'Non-Veg', basePrice: 489, sizes: { S: 489, M: 589, L: 729 },
      toppings: [{ name: 'Extra Bacon', price: 75 }, { name: 'Ranch Drizzle', price: 20 }, { name: 'Jalapeños', price: 25 }],
      image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600',
      rating: 4.6, reviews: 231, isFeatured: false, tags: ['smoky', 'hearty'],
    },
    {
      name: 'Keema Dhaba',
      description: 'Spiced minced mutton keema, green peas, red onion, and a drizzle of tamarind chutney on masala base.',
      category: 'Non-Veg', basePrice: 519, sizes: { S: 519, M: 629, L: 779 },
      toppings: [{ name: 'Extra Keema', price: 90 }, { name: 'Extra Cheese', price: 50 }, { name: 'Fried Onions', price: 25 }],
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
      rating: 4.7, reviews: 188, isFeatured: true, tags: ['indian', 'meaty'],
    },
    {
      name: 'Buffalo Chicken Ranch',
      description: 'Shredded buffalo chicken tossed in hot sauce, ranch base, blue cheese crumbles, and celery.',
      category: 'Non-Veg', basePrice: 459, sizes: { S: 459, M: 559, L: 699 },
      toppings: [{ name: 'Extra Chicken', price: 80 }, { name: 'Blue Cheese', price: 50 }, { name: 'Hot Sauce', price: 20 }],
      image: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=600',
      rating: 4.5, reviews: 197, isFeatured: false, tags: ['spicy', 'american'],
    },

    // ── SPECIALS ─────────────────────────────────────────────────────────────
    {
      name: 'Truffle Mushroom',
      description: 'White truffle cream sauce, wild mushrooms, gruyère, and fresh thyme — a gourmet delight.',
      category: 'Specials', basePrice: 599, sizes: { S: 599, M: 749, L: 899 },
      toppings: [{ name: 'Extra Truffle Oil', price: 100 }, { name: 'Caramelized Onions', price: 40 }],
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
      rating: 4.7, reviews: 198, isFeatured: true, tags: ['premium', 'gourmet'],
    },
    {
      name: 'Seekh Kebab Special',
      description: 'Spiced minced lamb seekh kebabs on a harissa tomato base with pickled onions and mint chutney.',
      category: 'Specials', basePrice: 649, sizes: { S: 649, M: 799, L: 949 },
      toppings: [{ name: 'Extra Kebab', price: 90 }, { name: 'Pickled Onions', price: 25 }],
      image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600',
      rating: 4.8, reviews: 203, isFeatured: true, tags: ['special', 'premium'],
    },
  ]);

  console.log('✅ Demo data seeded (18 pizzas)');

  await seedInventory(Inventory);
}

async function seedInventory(Inventory) {
  await Inventory.insertMany([
    { name: 'Pizza Base',        category: 'base',    unit: 'units', quantity: 200,   threshold: 20,   deductPerPizza: 1   },
    { name: 'Tomato Sauce',      category: 'sauce',   unit: 'ml',    quantity: 15000, threshold: 2000, deductPerPizza: 150 },
    { name: 'Mozzarella Cheese', category: 'cheese',  unit: 'g',     quantity: 8000,  threshold: 1000, deductPerPizza: 100 },
    { name: 'Mixed Vegetables',  category: 'veggies', unit: 'g',     quantity: 5000,  threshold: 600,  deductPerPizza: 80  },
    { name: 'Meat & Protein',    category: 'meat',    unit: 'g',     quantity: 6000,  threshold: 800,  deductPerPizza: 120 },
  ]);
  console.log('✅ Inventory seeded (5 items)');
}

startServer().catch(err => { console.error('Fatal:', err); process.exit(1); });

