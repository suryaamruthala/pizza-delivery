const Order = require('../models/Order');
const Pizza = require('../models/Pizza');
const User = require('../models/User');

const getStats = async (req, res) => {
  try {
    const [totalOrders, totalUsers, pizzas, orders] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Pizza.find(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    ]);
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const revenueByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({
      totalOrders,
      totalUsers,
      totalPizzas: pizzas.length,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders: orders,
      revenueByDay,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date() });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, password, role, isVerified } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    
    const user = await User.create({
      name, email, 
      password: password || 'user123', 
      role: role || 'user',
      isVerified: isVerified !== undefined ? isVerified : true
    });
    
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getAllOrders, updateOrderStatus, getAllUsers, addUser, deleteUser };
