const express = require('express');
const router = express.Router();
const { getCategories, getWords } = require('../models/vocab');

// GET /api/categories
router.get('/categories', (req, res) => {
    res.json(getCategories());
});

// GET /api/words/:category
router.get('/words/:category', (req, res) => {
    const words = getWords(req.params.category);
    if (!words.length) return res.status(404).json({ error: 'Category not found' });
    res.json(words);
});

module.exports = router;
