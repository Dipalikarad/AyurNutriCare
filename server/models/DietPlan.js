const mongoose = require('mongoose');

const DietPlanSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dietitianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goal: {
    type: String,
    required: true,
    enum: ['Weight Loss', 'Immunity Boost', 'Digestive Health', 'General Wellness']
  },
  duration: {
    type: Number, // in weeks
    required: true,
    default: 4
  },
  season: {
    type: String,
    required: true,
    enum: ['Vasanta', 'Grishma', 'Varsha', 'Sharad', 'Hemanta', 'Shishira'] // Ayurvedic Ritus
  },
  meals: [
    {
      key: { type: String, required: true }, // morningRoutine, breakfast, midMorningSnack, lunch, eveningSnack, dinner, bedtime
      name: { type: String, required: true }, // e.g. "Morning Routine", "Lunch"
      time: { type: String, required: true },
      foods: [{ type: String }], // food names
      description: { type: String },
      description_en: { type: String },
      description_hi: { type: String },
      description_mr: { type: String },
      nutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 }
      },
      ayurvedaNote: { type: String },
      ayurvedaNote_en: { type: String },
      ayurvedaNote_hi: { type: String },
      ayurvedaNote_mr: { type: String }
    }
  ],
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DietPlan', DietPlanSchema);
