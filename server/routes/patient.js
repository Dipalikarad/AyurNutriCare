const express = require('express');
const router = express.Router();
const {
  getPrakriti,
  savePrakriti,
  getPatients,
  getPatientProfile,
  updatePatientProfile,
  updateMedicalHistory,
  updateHydration,
  getProgressData
} = require('../controllers/patientController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Patient only routes
router.post('/prakriti', checkRole('patient'), savePrakriti);
router.put('/profile', checkRole('patient'), updatePatientProfile);
router.post('/hydration', checkRole('patient'), updateHydration);

// Shared/Dietitian routes
router.get('/', checkRole('dietitian'), getPatients);
router.get('/progress/:patientId', getProgressData);
router.get('/prakriti/:patientId', getPrakriti);
router.get('/:patientId', getPatientProfile);
router.put('/:patientId/medical-history', checkRole('dietitian'), updateMedicalHistory);

module.exports = router;
