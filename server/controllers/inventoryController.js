const Inventory = require('../models/Inventory');
const sendEmail = require('../utils/sendEmail');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'amruthalasurya2@gmail.com';

// ── GET all inventory items ───────────────────────────────────────────────────
const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ category: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT update a single item's quantity (manual set by admin) ─────────────────
const updateInventoryItem = async (req, res) => {
  try {
    const { quantity, threshold } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (quantity !== undefined) item.quantity = Math.max(0, quantity);
    if (threshold !== undefined) item.threshold = Math.max(1, threshold);

    // Reset alert flag if restocked above threshold
    if (item.quantity >= item.threshold) item.lowStockAlertSent = false;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── POST restock (add quantity to existing) ───────────────────────────────────
const restockItem = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount must be > 0' });

    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.quantity += amount;
    // If now above threshold, reset the alert flag so the next drop triggers a new email
    if (item.quantity >= item.threshold) item.lowStockAlertSent = false;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── INTERNAL: deduct ingredients after an order is placed ─────────────────────
const deductInventoryForOrder = async (orderItems) => {
  try {
    const Pizza = require('../models/Pizza');
    const allItems = await Inventory.find();

    // Map by category for easy lookup
    const byCategory = {};
    for (const item of allItems) byCategory[item.category] = item;

    for (const orderItem of orderItems) {
      const qty = orderItem.quantity;

      // Deduct base ingredients from every pizza regardless of type
      if (byCategory.base)   byCategory.base.quantity   = Math.max(0, byCategory.base.quantity   - byCategory.base.deductPerPizza   * qty);
      if (byCategory.sauce)  byCategory.sauce.quantity  = Math.max(0, byCategory.sauce.quantity  - byCategory.sauce.deductPerPizza  * qty);
      if (byCategory.cheese) byCategory.cheese.quantity = Math.max(0, byCategory.cheese.quantity - byCategory.cheese.deductPerPizza * qty);

      // Determine pizza category to decide meat vs veggies
      let pizzaCategory = 'Veg'; // safe default
      if (!orderItem.isCustom && orderItem.pizza) {
        try {
          const pizza = await Pizza.findById(orderItem.pizza).select('category');
          if (pizza) pizzaCategory = pizza.category;
        } catch (_) { /* ignore lookup failure */ }
      }

      if (pizzaCategory === 'Non-Veg') {
        if (byCategory.meat) byCategory.meat.quantity = Math.max(0, byCategory.meat.quantity - byCategory.meat.deductPerPizza * qty);
      } else {
        if (byCategory.veggies) byCategory.veggies.quantity = Math.max(0, byCategory.veggies.quantity - byCategory.veggies.deductPerPizza * qty);
      }
    }

    // Persist all changes
    await Promise.all(allItems.map(item => item.save()));

    // Check thresholds and fire low-stock alerts
    await checkLowStockAlerts(allItems);
  } catch (err) {
    console.error('⚠️  Inventory deduction error:', err.message);
    // Do NOT re-throw — inventory errors must not block order creation
  }
};

// ── INTERNAL: send low-stock email if threshold crossed ───────────────────────
const checkLowStockAlerts = async (inventoryItems) => {
  for (const item of inventoryItems) {
    if (item.quantity < item.threshold && !item.lowStockAlertSent) {
      try {
        await sendEmail({
          email: ADMIN_EMAIL,
          subject: `SliceStream - Low Stock Alert: ${item.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #fff8f0; border-radius: 12px; border: 2px solid #CA002C;">
              <h2 style="color: #CA002C; margin-top: 0;">🚨 Low Stock Alert</h2>
              <p>An ingredient has dropped below its safety threshold:</p>
              <table style="width:100%; border-collapse: collapse; margin: 1rem 0;">
                <tr style="background:#fff0f2;"><td style="padding:0.5rem 1rem; font-weight:600;">Item</td><td style="padding:0.5rem 1rem;">${item.name}</td></tr>
                <tr><td style="padding:0.5rem 1rem; font-weight:600;">Category</td><td style="padding:0.5rem 1rem; text-transform:capitalize;">${item.category}</td></tr>
                <tr style="background:#fff0f2;"><td style="padding:0.5rem 1rem; font-weight:600;">Current Stock</td><td style="padding:0.5rem 1rem; color:#CA002C; font-weight:700;">${item.quantity} ${item.unit}</td></tr>
                <tr><td style="padding:0.5rem 1rem; font-weight:600;">Threshold</td><td style="padding:0.5rem 1rem;">${item.threshold} ${item.unit}</td></tr>
              </table>
              <p style="color:#666;">Please restock immediately to avoid disruptions to your kitchen.</p>
              <p style="font-size:0.8rem; color:#999; margin-top:2rem;">— SliceStream Inventory System</p>
            </div>
          `,
        });
        console.log(`🚨 Low stock alert sent for: ${item.name} (${item.quantity} ${item.unit} remaining)`);
        item.lowStockAlertSent = true;
        await item.save();
      } catch (err) {
        console.error('Failed to send low stock alert:', err.message);
      }
    } else if (item.quantity >= item.threshold && item.lowStockAlertSent) {
      // Restocked above threshold — reset flag so next drop triggers a fresh alert
      item.lowStockAlertSent = false;
      await item.save();
    }
  }
};

module.exports = { getInventory, updateInventoryItem, restockItem, deductInventoryForOrder };
