const Pizza = require('../models/Pizza');

const getPizzas = async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    let query = { isAvailable: true };
    if (category && category !== 'All') query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.name = { $regex: search, $options: 'i' };
    const pizzas = await Pizza.find(query).sort({ isFeatured: -1, createdAt: -1 });
    res.json(pizzas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPizzaById = async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) return res.status(404).json({ message: 'Pizza not found' });
    res.json(pizza);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPizza = async (req, res) => {
  try {
    const pizza = await Pizza.create(req.body);
    res.status(201).json(pizza);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updatePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pizza) return res.status(404).json({ message: 'Pizza not found' });
    res.json(pizza);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deletePizza = async (req, res) => {
  try {
    await Pizza.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pizza deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPizzas, getPizzaById, createPizza, updatePizza, deletePizza };
