const express = require('express');
const router = express.Router();
const { getPizzas, getPizzaById, createPizza, updatePizza, deletePizza } = require('../controllers/pizzaController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getPizzas);
router.get('/:id', getPizzaById);
router.post('/', protect, admin, createPizza);
router.put('/:id', protect, admin, updatePizza);
router.delete('/:id', protect, admin, deletePizza);

module.exports = router;
