const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  dietitianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Null if slot is available (not booked yet)
  },
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes, e.g. 30, 45, 60
    default: 30
  },
  status: {
    type: String,
    enum: ['Available', 'Scheduled', 'Completed', 'Cancelled'],
    default: 'Available'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
