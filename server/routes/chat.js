const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getChatHistory, sendMessage } = require('../controllers/chatController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Define rate limiting for AI chat: 11 requests per minute
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: 'Too many messages sent. Please wait 1 minute before sending another query.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.use(verifyToken);

router.get('/history/:patientId', getChatHistory);
router.post('/message', checkRole('patient'), chatLimiter, sendMessage);

module.exports = router;
