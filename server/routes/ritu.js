const express = require('express');
const router = express.Router();
const { getCurrentRitu } = require('../controllers/rituController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/current', verifyToken, getCurrentRitu);

module.exports = router;
