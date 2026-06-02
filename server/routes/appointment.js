const express = require('express');
const router = express.Router();
const {
  createSlots,
  getAvailableSlots,
  bookSlot,
  getMyAppointments,
  updateStatus
} = require('../controllers/appointmentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/slots', checkRole('dietitian'), createSlots);
router.post('/book', checkRole('patient'), bookSlot);
router.get('/available', getAvailableSlots);
router.get('/mine', getMyAppointments);
router.put('/:id/status', updateStatus);

module.exports = router;
