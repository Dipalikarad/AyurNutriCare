const express = require('express');
const router = express.Router();
const {
  createDietPlan,
  getPatientDietPlan,
  updateDietPlan,
  logMealCompliance,
  validateDietPlan
} = require('../controllers/dietPlanController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Dietitian actions
router.post('/create', checkRole('dietitian'), createDietPlan);
router.post('/validate', checkRole('dietitian'), validateDietPlan);
router.put('/:planId', checkRole('dietitian'), updateDietPlan);

// Patient actions
router.post('/compliance', checkRole('patient'), logMealCompliance);

// Shared retrieval
router.get('/patient/:patientId', getPatientDietPlan);

module.exports = router;
