const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Create available time slots
// @route   POST /api/appointments/slots
// @access  Private (Dietitian only)
exports.createSlots = async (req, res) => {
  const { dateTimes, duration } = req.body; // Expects array of Date strings

  if (!dateTimes || !Array.isArray(dateTimes) || dateTimes.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide an array of dates and times' });
  }

  try {
    const slots = dateTimes.map((dateTime) => ({
      dietitianId: req.user.id,
      dateTime: new Date(dateTime),
      duration: duration || 30,
      status: 'Available'
    }));

    const createdSlots = await Appointment.insertMany(slots);

    res.status(201).json({
      success: true,
      message: `${createdSlots.length} available slots created successfully`,
      slots: createdSlots
    });
  } catch (error) {
    console.error('createSlots error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get available slots for booking
// @route   GET /api/appointments/available
// @access  Private
exports.getAvailableSlots = async (req, res) => {
  try {
    const availableSlots = await Appointment.find({ status: 'Available' })
      .populate('dietitianId', 'name email phone')
      .sort({ dateTime: 1 });

    res.status(200).json({
      success: true,
      count: availableSlots.length,
      slots: availableSlots
    });
  } catch (error) {
    console.error('getAvailableSlots error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Book an appointment slot
// @route   POST /api/appointments/book
// @access  Private (Patient only)
exports.bookSlot = async (req, res) => {
  const { slotId, notes } = req.body;

  if (!slotId) {
    return res.status(400).json({ success: false, message: 'Please specify slotId' });
  }

  try {
    let slot = await Appointment.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Appointment slot not found' });
    }

    if (slot.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'This slot is already booked or unavailable' });
    }

    slot.patientId = req.user.id;
    slot.status = 'Scheduled';
    slot.notes = notes || '';
    
    await slot.save();

    const populatedSlot = await Appointment.findById(slot._id)
      .populate('dietitianId', 'name email')
      .populate('patientId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: populatedSlot
    });
  } catch (error) {
    console.error('bookSlot error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user's appointments (patient sees theirs, dietitian sees theirs)
// @route   GET /api/appointments/mine
// @access  Private
exports.getMyAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'dietitian') {
      query = { dietitianId: req.user.id };
    } else {
      query = { patientId: req.user.id };
    }

    const appointments = await Appointment.find(query)
      .populate('dietitianId', 'name email phone')
      .populate('patientId', 'name email phone')
      .sort({ dateTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('getMyAppointments error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
exports.updateStatus = async (req, res) => {
  const { status, notes } = req.body; // Scheduled / Completed / Cancelled / Available (if deleted)

  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization checks
    if (
      req.user.role === 'dietitian' &&
      appointment.dietitianId.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this slot' });
    }

    if (
      req.user.role === 'patient' &&
      appointment.patientId &&
      appointment.patientId.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this appointment' });
    }

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;

    // If status is changed back to Available, unassign patient
    if (status === 'Available') {
      appointment.patientId = undefined;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('updateStatus error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
