const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getOrderById, validateCoupon } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.post('/validate-coupon', protect, validateCoupon);
router.get('/:id', protect, getOrderById);

module.exports = router;
