const express = require('express');
const router = express.Router();
const {
  getFoods,
  getFoodById,
  checkCompatibility
} = require('../controllers/foodController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', getFoods);
router.post('/check-compatibility', checkCompatibility);
router.get('/:id', getFoodById);

module.exports = router;
