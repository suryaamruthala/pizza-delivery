const express = require('express');
const router = express.Router();
const { getStats, getAllOrders, updateOrderStatus, getAllUsers, addUser, deleteUser } = require('../controllers/adminController');
const { getInventory, updateInventoryItem, restockItem } = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/auth');

router.get('/stats', protect, admin, getStats);
router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);
router.get('/users', protect, admin, getAllUsers);
router.post('/users', protect, admin, addUser);
router.delete('/users/:id', protect, admin, deleteUser);

// Inventory
router.get('/inventory', protect, admin, getInventory);
router.put('/inventory/:id', protect, admin, updateInventoryItem);
router.post('/inventory/:id/restock', protect, admin, restockItem);

module.exports = router;

