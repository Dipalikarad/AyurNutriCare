const express = require('express');
const router = express.Router();
const { getDietPlanReport } = require('../controllers/reportsController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/diet-plan/:patientId', verifyToken, getDietPlanReport);

module.exports = router;
