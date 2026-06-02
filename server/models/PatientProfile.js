const mongoose = require('mongoose');

const PatientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dietitianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  age: {
    type: Number
  },
  gender: {
    type: String
  },
  height: {
    type: Number // in cm
  },
  weight: {
    type: Number // in kg
  },
  prakritiAnswers: {
    type: Map,
    of: String // category -> dosha selection ('Vata', 'Pitta', 'Kapha')
  },
  dominantDosha: {
    type: String,
    default: 'Undetermined'
  },
  doshaDistribution: {
    vata: { type: Number, default: 0 },
    pitta: { type: Number, default: 0 },
    kapha: { type: Number, default: 0 }
  },
  medicalHistory: [
    {
      type: String
    }
  ],
  hydrationLog: [
    {
      date: { type: String, required: true }, // 'YYYY-MM-DD'
      count: { type: Number, default: 0 }
    }
  ],
  complianceLog: [
    {
      date: { type: String, required: true }, // 'YYYY-MM-DD'
      mealKey: { type: String, required: true }, // e.g., 'morningRoutine', 'breakfast', 'lunch'
      eaten: { type: Boolean, default: false }
    }
  ],
  weightHistory: [
    {
      date: { type: String, required: true }, // 'YYYY-MM-DD'
      weight: { type: Number, required: true }
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PatientProfile', PatientProfileSchema);
