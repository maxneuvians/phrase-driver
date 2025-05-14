const { saveResult } = require('../models/results');

// POST /api/results
// Expects: { category, english, french, original_sentence, corrected_sentence }
async function saveResultController(req, res) {
    const { category, english, french, original_sentence, corrected_sentence } = req.body;
    if (!category || !english || !french || !original_sentence || !corrected_sentence) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const result = await saveResult({ category, english, french, original_sentence, corrected_sentence });
        res.status(201).json({ success: true, id: result.id });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save result' });
    }
}

module.exports = { saveResultController };
