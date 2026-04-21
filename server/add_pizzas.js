// Run with: node add_pizzas.js
// Adds pizzas via the REST API (server must be running on port 5000)
const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'localhost', port: 5000, path, method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const newPizzas = [
  // ── VEG ─────────────────────────────────────────────────────────────────
  {
    name: 'Paneer Tikka Fiesta',
    description: 'Tandoori-spiced paneer cubes, capsicum, red onion, and mint yoghurt on a smoky tomato base.',
    category: 'Veg', basePrice: 379, sizes: { S: 379, M: 479, L: 579 },
    toppings: [{ name: 'Extra Paneer', price: 60 }, { name: 'Green Chutney Drizzle', price: 20 }, { name: 'Onion Rings', price: 25 }],
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600',
    rating: 4.7, reviews: 241, isFeatured: true, isAvailable: true, tags: ['indian', 'spicy'],
  },
  {
    name: 'Pesto Primavera',
    description: 'House-made basil pesto, roasted asparagus, cherry tomatoes, pine nuts, and shaved parmesan.',
    category: 'Veg', basePrice: 399, sizes: { S: 399, M: 499, L: 629 },
    toppings: [{ name: 'Extra Parmesan', price: 45 }, { name: 'Roasted Garlic', price: 30 }, { name: 'Chili Flakes', price: 15 }],
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600',
    rating: 4.6, reviews: 178, isFeatured: false, isAvailable: true, tags: ['gourmet', 'italian'],
  },
  {
    name: 'Corn & Capsicum Crunch',
    description: 'Sweet corn, tri-colour capsicum, mozzarella, jalapeños, and a tangy BBQ drizzle.',
    category: 'Veg', basePrice: 319, sizes: { S: 319, M: 419, L: 519 },
    toppings: [{ name: 'Extra Corn', price: 25 }, { name: 'Extra Capsicum', price: 25 }, { name: 'BBQ Drizzle', price: 20 }],
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600',
    rating: 4.4, reviews: 132, isFeatured: false, isAvailable: true, tags: ['mild', 'colourful'],
  },
  {
    name: 'Mushroom Melt',
    description: 'Creamy garlic white sauce, baby portobello mushrooms, truffle oil, gouda, and fresh thyme.',
    category: 'Veg', basePrice: 429, sizes: { S: 429, M: 529, L: 649 },
    toppings: [{ name: 'Extra Mushrooms', price: 40 }, { name: 'Truffle Oil', price: 80 }, { name: 'Caramelised Onions', price: 30 }],
    image: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=600',
    rating: 4.7, reviews: 209, isFeatured: true, isAvailable: true, tags: ['creamy', 'umami'],
  },
  {
    name: 'Spinach & Ricotta Bliss',
    description: 'Velvety ricotta base, wilted baby spinach, garlic, sun-dried tomatoes, and toasted pine nuts.',
    category: 'Veg', basePrice: 369, sizes: { S: 369, M: 469, L: 569 },
    toppings: [{ name: 'Extra Ricotta', price: 55 }, { name: 'Pine Nuts', price: 35 }, { name: 'Chili Flakes', price: 15 }],
    image: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=600',
    rating: 4.5, reviews: 119, isFeatured: false, isAvailable: true, tags: ['healthy', 'creamy'],
  },
  {
    name: 'Veggie Supreme',
    description: 'Loaded with olives, mushrooms, onions, bell peppers, jalapenos and sweet corn on rich tomato sauce.',
    category: 'Veg', basePrice: 349, sizes: { S: 349, M: 449, L: 559 },
    toppings: [{ name: 'Extra Cheese', price: 50 }, { name: 'Extra Olives', price: 25 }, { name: 'Jalapeños', price: 25 }],
    image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=600',
    rating: 4.5, reviews: 143, isFeatured: false, isAvailable: true, tags: ['loaded', 'classic'],
  },

  // ── NON-VEG ─────────────────────────────────────────────────────────────
  {
    name: 'Chicken Tikka Masala',
    description: 'Juicy chicken tikka in a spiced masala sauce, red onion, capsicum, and fresh coriander.',
    category: 'Non-Veg', basePrice: 469, sizes: { S: 469, M: 569, L: 719 },
    toppings: [{ name: 'Extra Chicken', price: 80 }, { name: 'Green Chutney', price: 20 }, { name: 'Extra Cheese', price: 50 }],
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600',
    rating: 4.8, reviews: 344, isFeatured: true, isAvailable: true, tags: ['indian', 'spicy'],
  },
  {
    name: 'Prawn Arrabiata',
    description: 'Plump tiger prawns on a fiery arrabiata tomato sauce with garlic, capers, and fresh parsley.',
    category: 'Non-Veg', basePrice: 579, sizes: { S: 579, M: 699, L: 849 },
    toppings: [{ name: 'Extra Prawns', price: 100 }, { name: 'Chili Oil', price: 25 }, { name: 'Capers', price: 20 }],
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600',
    rating: 4.7, reviews: 163, isFeatured: false, isAvailable: true, tags: ['seafood', 'spicy'],
  },
  {
    name: 'Bacon Ranch Stampede',
    description: 'Crispy streaky bacon, smoky ranch sauce, mozzarella, jalapeños, and spring onion.',
    category: 'Non-Veg', basePrice: 489, sizes: { S: 489, M: 589, L: 729 },
    toppings: [{ name: 'Extra Bacon', price: 75 }, { name: 'Ranch Drizzle', price: 20 }, { name: 'Jalapeños', price: 25 }],
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600',
    rating: 4.6, reviews: 231, isFeatured: false, isAvailable: true, tags: ['smoky', 'hearty'],
  },
  {
    name: 'Keema Dhaba',
    description: 'Spiced minced mutton keema, green peas, red onion, and a drizzle of tamarind chutney on masala base.',
    category: 'Non-Veg', basePrice: 519, sizes: { S: 519, M: 629, L: 779 },
    toppings: [{ name: 'Extra Keema', price: 90 }, { name: 'Extra Cheese', price: 50 }, { name: 'Fried Onions', price: 25 }],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
    rating: 4.7, reviews: 188, isFeatured: true, isAvailable: true, tags: ['indian', 'meaty'],
  },
  {
    name: 'Buffalo Chicken Ranch',
    description: 'Shredded buffalo chicken in hot sauce on a ranch base, blue cheese crumbles, and celery.',
    category: 'Non-Veg', basePrice: 459, sizes: { S: 459, M: 559, L: 699 },
    toppings: [{ name: 'Extra Chicken', price: 80 }, { name: 'Blue Cheese', price: 50 }, { name: 'Hot Sauce', price: 20 }],
    image: 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=600',
    rating: 4.5, reviews: 197, isFeatured: false, isAvailable: true, tags: ['spicy', 'american'],
  },
  {
    name: 'Double Meat Inferno',
    description: 'Chicken sausage, pepperoni, sriracha tomato base, ghost pepper cheese, and pickled jalapeños.',
    category: 'Non-Veg', basePrice: 549, sizes: { S: 549, M: 649, L: 799 },
    toppings: [{ name: 'Extra Sausage', price: 80 }, { name: 'Extra Pepperoni', price: 70 }, { name: 'Ghost Pepper Drizzle', price: 30 }],
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600',
    rating: 4.6, reviews: 258, isFeatured: true, isAvailable: true, tags: ['extra-spicy', 'loaded'],
  },
];

async function main() {
  console.log('Logging in as admin...');
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'admin@slicestream.com',
    password: 'admin123',
  });

  if (!loginRes.token) {
    console.error('Login failed:', loginRes);
    process.exit(1);
  }
  const token = loginRes.token;
  console.log('Logged in. Adding pizzas...\n');

  let added = 0, failed = 0;
  for (const pizza of newPizzas) {
    const res = await request('POST', '/api/pizzas', pizza, token);
    if (res._id) {
      console.log(`✅  ${res.category.padEnd(7)}  ${res.name}`);
      added++;
    } else {
      console.log(`❌  Failed: ${pizza.name} —`, res.message || JSON.stringify(res));
      failed++;
    }
  }

  console.log(`\n🍕 Done! ${added} added, ${failed} failed.`);
}

main().catch(console.error);
