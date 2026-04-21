const Order = require('../models/Order');
const { deductInventoryForOrder } = require('./inventoryController');

const COUPONS = {
  SLICE10: 10,
  PIZZA20: 20,
  FIRST50: 50,
};

const placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, phone, paymentMethod, coupon } = req.body;
    let subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = 0;
    if (coupon && COUPONS[coupon.toUpperCase()]) {
      discount = Math.round((subtotal * COUPONS[coupon.toUpperCase()]) / 100);
    }
    const deliveryFee = subtotal > 500 ? 0 : 49;
    const total = subtotal - discount + deliveryFee;
    const estimatedDelivery = new Date(Date.now() + 40 * 60 * 1000); // 40 min

    const initialStatus = paymentMethod === 'Online' ? 'Confirmed' : 'Placed';

    const order = await Order.create({
      user: req.user._id,
      items,
      deliveryAddress,
      phone,
      subtotal,
      discount,
      coupon: coupon || '',
      deliveryFee,
      total,
      paymentMethod,
      estimatedDelivery,
      status: initialStatus,
      statusHistory: [{ status: initialStatus, timestamp: new Date() }],
    });

    // Deduct inventory in background — does NOT block the order response
    deductInventoryForOrder(items);

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.pizza', 'name image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.pizza', 'name image category');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const validateCoupon = async (req, res) => {
  const { coupon } = req.body;
  const discount = COUPONS[coupon?.toUpperCase()];
  if (discount) res.json({ valid: true, discount, code: coupon.toUpperCase() });
  else res.status(400).json({ valid: false, message: 'Invalid coupon' });
};

module.exports = { placeOrder, getMyOrders, getOrderById, validateCoupon };
