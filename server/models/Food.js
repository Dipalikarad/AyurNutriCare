const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  name_en: { type: String },
  name_hi: { type: String },
  name_mr: { type: String },
  category: {
    type: String,
    required: true
  },
  category_en: { type: String },
  category_hi: { type: String },
  category_mr: { type: String },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    vitamins: {
      B1: { type: Number, default: 0 },
      B6: { type: Number, default: 0 },
      C: { type: Number, default: 0 }
    },
    minerals: {
      iron: { type: Number, default: 0 },
      calcium: { type: Number, default: 0 },
      potassium: { type: Number, default: 0 }
    }
  },
  ayurveda: {
    rasa: [{ type: String }], // Sweet, Sour, Salty, Pungent, Bitter, Astringent
    guna: [{ type: String }], // e.g. Laghu (light), Guru (heavy), Snigdha (oily), Ruksha (dry)
    virya: { type: String, enum: ['Sheeta', 'Ushna'] }, // cold / hot potency
    vipaka: { type: String, enum: ['Madhura', 'Amla', 'Katu'] }, // post-digestive effect: sweet / sour / pungent
    dosha_effect: {
      vata: { type: String }, // e.g. "balances", "increases", "decreases"
      pitta: { type: String },
      kapha: { type: String }
    },
    suitable_season: [{ type: String }] // Vasanta, Grishma, etc.
  },
  incompatible_with: [{ type: String }], // Array of food names it shouldn't be eaten with
  image_url: { type: String }
});

module.exports = mongoose.model('Food', FoodSchema);
