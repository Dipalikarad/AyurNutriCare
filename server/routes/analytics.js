const express = require('express');
const router = express.Router();
const { getOverview, getDeficiencies } = require('../controllers/analyticsController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.get('/overview', verifyToken, checkRole('dietitian'), getOverview);
router.get('/deficiencies/:patientId', verifyToken, getDeficiencies);

module.exports = router;
