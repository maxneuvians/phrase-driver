const express = require('express');
const router = express.Router();
const { evaluateSentenceController } = require('../controllers/evaluate');

router.post('/evaluate', evaluateSentenceController);

module.exports = router;
