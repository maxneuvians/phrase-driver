const express = require('express');
const router = express.Router();
const { saveResultController } = require('../controllers/results');

router.post('/results', saveResultController);

module.exports = router;
