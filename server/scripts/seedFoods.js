require('dotenv').config();
const mongoose = require('mongoose');
const Food = require('../models/Food');

const foods = [
  {
    name: "Moong Dal",
    category: "Legumes",
    nutrition: { calories: 347, protein: 24, carbs: 63, fat: 1.2, fiber: 16, vitamins: { B1: 0.6, B6: 0.4, C: 4 }, minerals: { iron: 6.7, calcium: 132, potassium: 1246 } },
    ayurveda: { rasa: ["Madhura", "Kashaya"], guna: ["Laghu", "Ruksha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "slightly increases" }, suitable_season: ["Vasanta", "Sharad", "Hemanta"] },
    incompatible_with: ["Milk", "Yogurt", "Cheese"],
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300"
  },
  {
    name: "Chana Dal",
    category: "Legumes",
    nutrition: { calories: 358, protein: 22, carbs: 60, fat: 5.6, fiber: 10, vitamins: { B1: 0.5, B6: 0.3, C: 1 }, minerals: { iron: 4.8, calcium: 56, potassium: 850 } },
    ayurveda: { rasa: ["Madhura", "Kashaya"], guna: ["Laghu", "Ruksha"], virya: "Sheeta", vipaka: "Katu", dosha_effect: { vata: "increases", pitta: "balances", kapha: "balances" }, suitable_season: ["Grishma", "Sharad"] },
    incompatible_with: ["Milk", "Yogurt"],
    image_url: "https://images.unsplash.com/photo-1585996388910-c44d57c24483?w=300"
  },
  {
    name: "Rice",
    category: "Grains",
    nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, vitamins: { B1: 0.07, B6: 0.09, C: 0 }, minerals: { iron: 0.2, calcium: 10, potassium: 35 } },
    ayurveda: { rasa: ["Madhura"], guna: ["Laghu", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Sharad", "Grishma", "Varsha"] },
    incompatible_with: ["Yogurt"],
    image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300"
  },
  {
    name: "Wheat",
    category: "Grains",
    nutrition: { calories: 339, protein: 13.7, carbs: 71, fat: 2.5, fiber: 12.2, vitamins: { B1: 0.38, B6: 0.3, C: 0 }, minerals: { iron: 3.9, calcium: 29, potassium: 363 } },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "increases" }, suitable_season: ["Hemanta", "Shishira", "Vasanta"] },
    incompatible_with: ["Yogurt", "Sour Fruits"],
    image_url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300"
  },
  {
    name: "Ghee",
    category: "Dairy",
    nutrition: { calories: 884, protein: 0, carbs: 0, fat: 99.8, fiber: 0, vitamins: { B1: 0, B6: 0, C: 0 }, minerals: { iron: 0, calcium: 0, potassium: 5 } },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Sharad", "Grishma", "Hemanta", "Shishira"] },
    incompatible_with: ["Honey"], // specifically in equal quantities
    image_url: "https://images.unsplash.com/photo-1622484211148-7164ff89622d?w=300"
  },
  {
    name: "Milk",
    category: "Dairy",
    nutrition: { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, vitamins: { B1: 0.04, B6: 0.04, C: 0 }, minerals: { iron: 0.03, calcium: 125, potassium: 150 } },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "increases" }, suitable_season: ["Grishma", "Sharad", "Shishira"] },
    incompatible_with: ["Fish", "Banana", "Salt", "Lemon", "Amla", "Radish", "Melon", "Yogurt", "Egg", "Mushrooms"],
    image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300"
  },
  {
    name: "Curd",
    category: "Dairy",
    nutrition: { calories: 98, protein: 3.5, carbs: 4.7, fat: 4.3, fiber: 0, vitamins: { B1: 0.03, B6: 0.03, C: 0.5 }, minerals: { iron: 0.1, calcium: 110, potassium: 141 } },
    ayurveda: { rasa: ["Amla"], guna: ["Guru", "Snigdha"], virya: "Ushna", vipaka: "Amla", dosha_effect: { vata: "balances", pitta: "increases", kapha: "increases" }, suitable_season: ["Hemanta", "Shishira", "Varsha"] },
    incompatible_with: ["Milk", "Sour Fruits", "Cheese", "Potato", "Tomato", "Spinach", "Egg"],
    image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300"
  },
  {
    name: "Ginger",
    category: "Spices",
    nutrition: { calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2, vitamins: { B1: 0.02, B6: 0.16, C: 5 }, minerals: { iron: 0.6, calcium: 16, potassium: 415 } },
    ayurveda: { rasa: ["Katu"], guna: ["Laghu", "Teekshna"], virya: "Ushna", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Hemanta", "Shishira", "Vasanta", "Varsha"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=300"
  },
  {
    name: "Turmeric",
    category: "Spices",
    nutrition: { calories: 312, protein: 9.7, carbs: 67, fat: 3.2, fiber: 22.7, vitamins: { B1: 0.05, B6: 0.18, C: 0.7 }, minerals: { iron: 55, calcium: 168, potassium: 2080 } },
    ayurveda: { rasa: ["Katu", "Tikta"], guna: ["Ruksha", "Laghu"], virya: "Ushna", vipaka: "Katu", dosha_effect: { vata: "balances", pitta: "slightly increases", kapha: "balances" }, suitable_season: ["Vasanta", "Varsha", "Hemanta"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300"
  },
  {
    name: "Cumin",
    category: "Spices",
    nutrition: { calories: 375, protein: 17.8, carbs: 44, fat: 22, fiber: 10.5, vitamins: { B1: 0.6, B6: 0.4, C: 7.7 }, minerals: { iron: 66, calcium: 931, potassium: 1788 } },
    ayurveda: { rasa: ["Katu"], guna: ["Laghu", "Ruksha"], virya: "Ushna", vipaka: "Katu", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Sharad", "Vasanta", "Varsha"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1615485290616-56be6c5c643b?w=300"
  },
  {
    name: "Coriander",
    category: "Spices",
    nutrition: { calories: 23, protein: 2.1, carbs: 3.7, fat: 0.5, fiber: 2.8, vitamins: { B1: 0.06, B6: 0.15, C: 27 }, minerals: { iron: 1.8, calcium: 67, potassium: 521 } },
    ayurveda: { rasa: ["Madhura", "Tikta"], guna: ["Laghu", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Grishma", "Sharad", "Vasanta"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=300"
  },
  {
    name: "Amla",
    category: "Fruits",
    nutrition: { calories: 44, protein: 0.9, carbs: 10.2, fat: 0.5, fiber: 4.3, vitamins: { B1: 0.03, B6: 0.04, C: 478 }, minerals: { iron: 1.2, calcium: 25, potassium: 198 } },
    ayurveda: { rasa: ["Amla", "Madhura", "Kashaya", "Tikta", "Katu"], guna: ["Laghu", "Ruksha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Sharad", "Hemanta", "Shishira"] },
    incompatible_with: ["Milk"],
    image_url: "https://images.unsplash.com/photo-1632733711679-5292d77a83bd?w=300"
  },
  {
    name: "Ashwagandha",
    category: "Herbs",
    nutrition: { calories: 277, protein: 3.7, carbs: 46.9, fat: 0.3, fiber: 36, vitamins: { B1: 0, B6: 0, C: 0 }, minerals: { iron: 3.3, calcium: 23, potassium: 120 } },
    ayurveda: { rasa: ["Tikta", "Kashaya", "Madhura"], guna: ["Laghu", "Snigdha"], virya: "Ushna", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "increases", kapha: "balances" }, suitable_season: ["Hemanta", "Shishira", "Vasanta"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=300"
  },
  {
    name: "Triphala",
    category: "Herbs",
    nutrition: { calories: 300, protein: 2, carbs: 70, fat: 0.5, fiber: 35, vitamins: { B1: 0, B6: 0, C: 50 }, minerals: { iron: 5, calcium: 150, potassium: 300 } },
    ayurveda: { rasa: ["Kashaya", "Madhura", "Amla", "Tikta", "Katu"], guna: ["Laghu", "Ruksha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Sharad", "Vasanta", "Hemanta", "Shishira"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=300"
  },
  {
    name: "Spinach",
    category: "Vegetables",
    nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, vitamins: { B1: 0.08, B6: 0.2, C: 28 }, minerals: { iron: 2.7, calcium: 99, potassium: 558 } },
    ayurveda: { rasa: ["Madhura", "Kashaya"], guna: ["Laghu", "Ruksha"], virya: "Sheeta", vipaka: "Katu", dosha_effect: { vata: "increases", pitta: "balances", kapha: "balances" }, suitable_season: ["Grishma", "Sharad"] },
    incompatible_with: ["Yogurt"],
    image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300"
  },
  {
    name: "Methi",
    category: "Vegetables",
    nutrition: { calories: 49, protein: 4.4, carbs: 6, fat: 0.9, fiber: 1.5, vitamins: { B1: 0.09, B6: 0.1, C: 52 }, minerals: { iron: 3.7, calcium: 395, potassium: 350 } },
    ayurveda: { rasa: ["Tikta"], guna: ["Laghu", "Ruksha"], virya: "Ushna", vipaka: "Katu", dosha_effect: { vata: "balances", pitta: "slightly increases", kapha: "balances" }, suitable_season: ["Hemanta", "Shishira", "Vasanta"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1589802829985-817e51161b9b?w=300"
  },
  {
    name: "Pomegranate",
    category: "Fruits",
    nutrition: { calories: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4, vitamins: { B1: 0.07, B6: 0.08, C: 10.2 }, minerals: { iron: 0.3, calcium: 10, potassium: 236 } },
    ayurveda: { rasa: ["Madhura", "Amla", "Kashaya"], guna: ["Laghu", "Snigdha"], virya: "Ushna", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Sharad", "Hemanta", "Shishira", "Grishma"] },
    incompatible_with: ["Milk", "Yogurt"],
    image_url: "https://images.unsplash.com/photo-1533616688419-b7a585564566?w=300"
  },
  {
    name: "Coconut",
    category: "Fruits",
    nutrition: { calories: 354, protein: 3.3, carbs: 15, fat: 33, fiber: 9, vitamins: { B1: 0.06, B6: 0.05, C: 3.3 }, minerals: { iron: 2.4, calcium: 14, potassium: 356 } },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "increases" }, suitable_season: ["Grishma", "Sharad", "Vasanta"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1543888365-f48d94e2cc18?w=300"
  },
  {
    name: "Sesame",
    category: "Seeds",
    nutrition: { calories: 573, protein: 18, carbs: 23, fat: 50, fiber: 12, vitamins: { B1: 0.79, B6: 0.79, C: 0 }, minerals: { iron: 14.6, calcium: 975, potassium: 468 } },
    ayurveda: { rasa: ["Madhura", "Tikta", "Kashaya"], guna: ["Guru", "Snigdha"], virya: "Ushna", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "increases", kapha: "increases" }, suitable_season: ["Hemanta", "Shishira", "Varsha"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300"
  },
  {
    name: "Honey",
    category: "Sweeteners",
    nutrition: { calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0, vitamins: { B1: 0, B6: 0.02, C: 0.5 }, minerals: { iron: 0.4, calcium: 6, potassium: 52 } },
    ayurveda: { rasa: ["Madhura", "Kashaya"], guna: ["Laghu", "Ruksha"], virya: "Ushna", vipaka: "Katu", dosha_effect: { vata: "balances", pitta: "increases", kapha: "balances" }, suitable_season: ["Vasanta", "Varsha", "Hemanta"] },
    incompatible_with: ["Ghee", "Tea", "Coffee", "Hot Water"], // equal quantities for ghee
    image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300"
  },
  {
    name: "Garlic",
    category: "Spices",
    nutrition: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, vitamins: { B1: 0.2, B6: 1.2, C: 31 } },
    ayurveda: { rasa: ["Katu", "Madhura", "Tikta", "Lavana", "Kashaya"], guna: ["Guru", "Teekshna", "Snigdha"], virya: "Ushna", vipaka: "Katu", dosha_effect: { vata: "balances", pitta: "increases", kapha: "balances" }, suitable_season: ["Hemanta", "Shishira", "Varsha"] },
    incompatible_with: ["Tea", "Milk"],
    image_url: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=300"
  },
  {
    name: "Onion",
    category: "Vegetables",
    nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
    ayurveda: { rasa: ["Madhura", "Katu"], guna: ["Guru", "Snigdha"], virya: "Ushna", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "increases", kapha: "increases" }, suitable_season: ["Hemanta", "Shishira"] },
    incompatible_with: ["Milk"],
    image_url: "https://images.unsplash.com/photo-1508747703725-719777637510?w=300"
  },
  {
    name: "Lemon",
    category: "Fruits",
    nutrition: { calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8, vitamins: { C: 53 } },
    ayurveda: { rasa: ["Amla"], guna: ["Laghu", "Teekshna"], virya: "Ushna", vipaka: "Amla", dosha_effect: { vata: "balances", pitta: "increases", kapha: "balances" }, suitable_season: ["Grishma", "Varsha"] },
    incompatible_with: ["Milk", "Yogurt"],
    image_url: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=300"
  },
  {
    name: "Tomato",
    category: "Vegetables",
    nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
    ayurveda: { rasa: ["Amla"], guna: ["Laghu", "Snigdha"], virya: "Ushna", vipaka: "Amla", dosha_effect: { vata: "balances", pitta: "increases", kapha: "increases" }, suitable_season: ["Vasanta", "Grishma"] },
    incompatible_with: ["Milk", "Yogurt"],
    image_url: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=300"
  },
  {
    name: "Potato",
    category: "Vegetables",
    nutrition: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
    ayurveda: { rasa: ["Madhura", "Kashaya"], guna: ["Guru", "Ruksha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "increases", pitta: "balances", kapha: "balances" }, suitable_season: ["Sharad", "Grishma"] },
    incompatible_with: ["Yogurt"],
    image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300"
  },
  {
    name: "Mustard Seeds",
    category: "Spices",
    nutrition: { calories: 508, protein: 26, carbs: 28, fat: 36, fiber: 12 },
    ayurveda: { rasa: ["Katu", "Tikta"], guna: ["Laghu", "Teekshna"], virya: "Ushna", vipaka: "Katu", dosha_effect: { vata: "balances", pitta: "increases", kapha: "balances" }, suitable_season: ["Hemanta", "Shishira", "Varsha"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1589135242502-39eebe1f22ba?w=300"
  },
  {
    name: "Black Pepper",
    category: "Spices",
    nutrition: { calories: 251, protein: 10, carbs: 64, fat: 3.3, fiber: 25 },
    ayurveda: { rasa: ["Katu"], guna: ["Laghu", "Teekshna", "Ruksha"], virya: "Ushna", vipaka: "Katu", dosha_effect: { vata: "balances", pitta: "slightly increases", kapha: "balances" }, suitable_season: ["Vasanta", "Varsha", "Hemanta", "Shishira"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=300"
  },
  {
    name: "Cardamom",
    category: "Spices",
    nutrition: { calories: 311, protein: 11, carbs: 68, fat: 6.7, fiber: 28 },
    ayurveda: { rasa: ["Katu", "Madhura"], guna: ["Laghu", "Ruksha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Sharad", "Grishma", "Vasanta"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1540121118671-10c57d76ee17?w=300"
  },
  {
    name: "Fennel Seeds",
    category: "Spices",
    nutrition: { calories: 345, protein: 16, carbs: 52, fat: 15, fiber: 40 },
    ayurveda: { rasa: ["Madhura", "Katu", "Tikta"], guna: ["Laghu", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Grishma", "Sharad", "Vasanta"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300"
  },
  {
    name: "Mint",
    category: "Vegetables",
    nutrition: { calories: 70, protein: 3.8, carbs: 15, fat: 0.9, fiber: 8 },
    ayurveda: { rasa: ["Tikta", "Katu"], guna: ["Laghu", "Ruksha"], virya: "Sheeta", vipaka: "Katu", dosha_effect: { vata: "slightly increases", pitta: "balances", kapha: "balances" }, suitable_season: ["Grishma", "Sharad"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1533630988602-c9431e3d7480?w=300"
  },
  {
    name: "Almonds",
    category: "Seeds",
    nutrition: { calories: 579, protein: 21, carbs: 22, fat: 49, fiber: 12 },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Ushna", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "increases", kapha: "increases" }, suitable_season: ["Hemanta", "Shishira", "Varsha"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1508061253366-f7da158b6d96?w=300"
  },
  {
    name: "Cashews",
    category: "Seeds",
    nutrition: { calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3 },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Ushna", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "increases", kapha: "increases" }, suitable_season: ["Hemanta", "Shishira"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"
  },
  {
    name: "Raisins",
    category: "Fruits",
    nutrition: { calories: 299, protein: 3, carbs: 79, fat: 0.5, fiber: 3.7 },
    ayurveda: { rasa: ["Madhura"], guna: ["Laghu", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Sharad", "Grishma", "Vasanta"] },
    incompatible_with: ["Radish", "Milk"],
    image_url: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=300"
  },
  {
    name: "Dates",
    category: "Fruits",
    nutrition: { calories: 277, protein: 1.8, carbs: 75, fat: 0.2, fiber: 6.7 },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "increases" }, suitable_season: ["Sharad", "Grishma", "Hemanta", "Shishira"] },
    incompatible_with: ["Milk"],
    image_url: "https://images.unsplash.com/photo-1569870499705-504209102861?w=300"
  },
  {
    name: "Figs",
    category: "Fruits",
    nutrition: { calories: 74, protein: 0.8, carbs: 19, fat: 0.3, fiber: 2.9 },
    ayurveda: { rasa: ["Madhura", "Kashaya"], guna: ["Guru", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "increases" }, suitable_season: ["Sharad", "Grishma", "Vasanta"] },
    incompatible_with: ["Milk"],
    image_url: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=300"
  },
  {
    name: "Apple",
    category: "Fruits",
    nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
    ayurveda: { rasa: ["Madhura", "Kashaya"], guna: ["Laghu", "Ruksha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "increases", pitta: "balances", kapha: "balances" }, suitable_season: ["Grishma", "Sharad"] },
    incompatible_with: ["Milk", "Yogurt"],
    image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300"
  },
  {
    name: "Banana",
    category: "Fruits",
    nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "slightly increases", kapha: "increases" }, suitable_season: ["Varsha", "Sharad", "Hemanta"] },
    incompatible_with: ["Milk", "Yogurt", "Melon"],
    image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300"
  },
  {
    name: "Mango",
    category: "Fruits",
    nutrition: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "increases" }, suitable_season: ["Grishma", "Vasanta"] },
    incompatible_with: ["Yogurt"],
    image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=300"
  },
  {
    name: "Papaya",
    category: "Fruits",
    nutrition: { calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7 },
    ayurveda: { rasa: ["Madhura", "Katu"], guna: ["Laghu", "Teekshna"], virya: "Ushna", vipaka: "Katu", dosha_effect: { vata: "balances", pitta: "increases", kapha: "balances" }, suitable_season: ["Vasanta", "Varsha", "Hemanta"] },
    incompatible_with: ["Milk", "Yogurt"],
    image_url: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=300"
  },
  {
    name: "Bitter Gourd (Karela)",
    category: "Vegetables",
    nutrition: { calories: 17, protein: 1, carbs: 3.7, fat: 0.17, fiber: 2.8 },
    ayurveda: { rasa: ["Tikta"], guna: ["Laghu", "Ruksha"], virya: "Ushna", vipaka: "Katu", dosha_effect: { vata: "increases", pitta: "balances", kapha: "balances" }, suitable_season: ["Vasanta", "Varsha"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1582515073490-39981397c445?w=300"
  },
  {
    name: "Bottle Gourd (Lauki)",
    category: "Vegetables",
    nutrition: { calories: 15, protein: 0.6, carbs: 3.4, fat: 0.05, fiber: 0.5 },
    ayurveda: { rasa: ["Madhura"], guna: ["Laghu", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Grishma", "Sharad", "Vasanta"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=300"
  },
  {
    name: "Eggplant (Baingan)",
    category: "Vegetables",
    nutrition: { calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3 },
    ayurveda: { rasa: ["Madhura", "Tikta"], guna: ["Laghu", "Teekshna"], virya: "Ushna", vipaka: "Katu", dosha_effect: { vata: "balances", pitta: "increases", kapha: "balances" }, suitable_season: ["Vasanta", "Varsha"] },
    incompatible_with: ["Yogurt"],
    image_url: "https://images.unsplash.com/photo-1590377274944-ff8507858639?w=300"
  },
  {
    name: "Okra (Bhindi)",
    category: "Vegetables",
    nutrition: { calories: 33, protein: 1.9, carbs: 7.5, fat: 0.19, fiber: 3.2 },
    ayurveda: { rasa: ["Madhura", "Kashaya"], guna: ["Guru", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Grishma", "Sharad", "Vasanta"] },
    incompatible_with: [],
    image_url: "https://images.unsplash.com/photo-1620921550993-bdc08b5e9f8a?w=300"
  },
  {
    name: "Chickpeas (Kabuli Chana)",
    category: "Legumes",
    nutrition: { calories: 364, protein: 19, carbs: 61, fat: 6, fiber: 17 },
    ayurveda: { rasa: ["Madhura", "Kashaya"], guna: ["Guru", "Ruksha"], virya: "Sheeta", vipaka: "Katu", dosha_effect: { vata: "increases", pitta: "balances", kapha: "balances" }, suitable_season: ["Sharad", "Grishma"] },
    incompatible_with: ["Milk", "Yogurt"],
    image_url: "https://images.unsplash.com/photo-1547058886-d249f0ec1413?w=300"
  },
  {
    name: "Buttermilk (Takra)",
    category: "Dairy",
    nutrition: { calories: 40, protein: 3.3, carbs: 4.8, fat: 0.9, fiber: 0 },
    ayurveda: { rasa: ["Amla", "Kashaya", "Madhura"], guna: ["Laghu", "Ruksha"], virya: "Ushna", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "balances" }, suitable_season: ["Vasanta", "Grishma", "Varsha", "Sharad"] },
    incompatible_with: ["Banana", "Lemon"],
    image_url: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300"
  },
  {
    name: "Paneer",
    category: "Dairy",
    nutrition: { calories: 265, protein: 18, carbs: 1.2, fat: 20.8, fiber: 0 },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Sheeta", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "balances", kapha: "increases" }, suitable_season: ["Sharad", "Hemanta", "Shishira"] },
    incompatible_with: ["Sour Fruits", "Yogurt"],
    image_url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300"
  },
  {
    name: "Fish (Rohu)",
    category: "Proteins",
    nutrition: { calories: 97, protein: 19.7, carbs: 0, fat: 2, fiber: 0 },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Ushna", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "increases", kapha: "increases" }, suitable_season: ["Hemanta", "Shishira"] },
    incompatible_with: ["Milk", "Jaggery", "Egg", "Yogurt"],
    image_url: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=300"
  },
  {
    name: "Chicken",
    category: "Proteins",
    nutrition: { calories: 239, protein: 27, carbs: 0, fat: 14, fiber: 0 },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Ushna", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "increases", kapha: "increases" }, suitable_season: ["Hemanta", "Shishira", "Varsha"] },
    incompatible_with: ["Milk", "Yogurt"],
    image_url: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300"
  },
  {
    name: "Basil (Tulsi)",
    category: "Herbs",
    nutrition: { calories: 23, protein: 3, carbs: 2.7, fat: 0.6, fiber: 1.6 },
    ayurveda: { rasa: ["Katu", "Tikta"], guna: ["Laghu", "Ruksha", "Teekshna"], virya: "Ushna", vipaka: "Katu", dosha_effect: { vata: "balances", pitta: "slightly increases", kapha: "balances" }, suitable_season: ["Varsha", "Vasanta", "Hemanta", "Shishira"] },
    incompatible_with: ["Milk"],
    image_url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300"
  },
  {
    name: "Jaggery (Gur)",
    category: "Sweeteners",
    nutrition: { calories: 383, protein: 0.4, carbs: 98, fat: 0.1, fiber: 0 },
    ayurveda: { rasa: ["Madhura"], guna: ["Guru", "Snigdha"], virya: "Ushna", vipaka: "Madhura", dosha_effect: { vata: "balances", pitta: "increases", kapha: "increases" }, suitable_season: ["Hemanta", "Shishira", "Varsha"] },
    incompatible_with: ["Fish", "Milk"],
    image_url: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=300"
  }
];

const FOOD_TRANSLATIONS = {
  "Moong Dal": { name_hi: "मूंग दाल", name_mr: "मूग डाळ", category_hi: "फली", category_mr: "कडधान्य" },
  "Chana Dal": { name_hi: "चना दाल", name_mr: "चना डाळ", category_hi: "फली", category_mr: "कडधान्य" },
  "Rice": { name_hi: "चावल", name_mr: "भात", category_hi: "अनाज", category_mr: "धान्य" },
  "Wheat": { name_hi: "गेहूं", name_mr: "गहू", category_hi: "अनाज", category_mr: "धान्य" },
  "Ghee": { name_hi: "घी", name_mr: "तूप", category_hi: "डेयरी", category_mr: "डेअरी" },
  "Milk": { name_hi: "दूध", name_mr: "दूध", category_hi: "डेयरी", category_mr: "डेअरी" },
  "Curd": { name_hi: "दही", name_mr: "दही", category_hi: "डेयरी", category_mr: "डेअरी" },
  "Ginger": { name_hi: "अदरक", name_mr: "आले", category_hi: "मसाला", category_mr: "मसाले" },
  "Turmeric": { name_hi: "हल्दी", name_mr: "हळद", category_hi: "मसाला", category_mr: "मसाले" },
  "Cumin": { name_hi: "जीरा", name_mr: "जिरे", category_hi: "मसाला", category_mr: "मसाले" },
  "Coriander": { name_hi: "धनिया", name_mr: "धणे", category_hi: "मसाला", category_mr: "मसाले" },
  "Amla": { name_hi: "आंवला", name_mr: "आवळा", category_hi: "फल", category_mr: "फळे" },
  "Ashwagandha": { name_hi: "अश्वगंधा", name_mr: "अश्वगंधा", category_hi: "जड़ी-बूटी", category_mr: "औषधी वनस्पती" },
  "Triphala": { name_hi: "त्रिफला", name_mr: "त्रिफळा", category_hi: "जड़ी-बूटी", category_mr: "औषधी वनस्पती" },
  "Spinach": { name_hi: "पालक", name_mr: "पालक", category_hi: "सब्जी", category_mr: "भाज्या" },
  "Methi": { name_hi: "मेथी", name_mr: "मेथी", category_hi: "सब्जी", category_mr: "भाज्या" },
  "Pomegranate": { name_hi: "अनार", name_mr: "डाळिंब", category_hi: "फल", category_mr: "फळे" },
  "Coconut": { name_hi: "नारियल", name_mr: "नारळ", category_hi: "फल", category_mr: "फळे" },
  "Sesame": { name_hi: "तिल", name_mr: "तीळ", category_hi: "बीज", category_mr: "बियाणे" },
  "Honey": { name_hi: "शहद", name_mr: "मध", category_hi: "चटनी/अचार", category_mr: "चटणी/लोणचे" },
  "Garlic": { name_hi: "लहसुन", name_mr: "लसूण", category_hi: "मसाला", category_mr: "मसाले" },
  "Onion": { name_hi: "प्याज़", name_mr: "कांदा", category_hi: "सब्जी", category_mr: "भाज्या" },
  "Lemon": { name_hi: "नींबू", name_mr: "लिंबू", category_hi: "फल", category_mr: "फळे" },
  "Tomato": { name_hi: "टमाटर", name_mr: "टोमॅटो", category_hi: "सब्जी", category_mr: "भाज्या" },
  "Potato": { name_hi: "आलू", name_mr: "बटाटा", category_hi: "सब्जी", category_mr: "भाज्या" },
  "Mustard Seeds": { name_hi: "सरसों के बीज", name_mr: "मोहरी", category_hi: "मसाला", category_mr: "मसाले" },
  "Black Pepper": { name_hi: "काली मिर्च", name_mr: "काळी मिरी", category_hi: "मसाला", category_mr: "मसाले" },
  "Cardamom": { name_hi: "इलायची", name_mr: "वेलदोडा", category_hi: "मसाला", category_mr: "मसाले" },
  "Fennel Seeds": { name_hi: "सौंफ", name_mr: "बडीशेप", category_hi: "मसाला", category_mr: "मसाले" },
  "Mint": { name_hi: "पुदीना", name_mr: "पुदिना", category_hi: "सब्जी", category_mr: "भाज्या" },
  "Almonds": { name_hi: "बादाम", name_mr: "बदाम", category_hi: "बीज", category_mr: "बियाणे" },
  "Cashews": { name_hi: "काजू", name_mr: "काजू", category_hi: "बीज", category_mr: "बियाणे" },
  "Raisins": { name_hi: "किशमिश", name_mr: "मनुका", category_hi: "फल", category_mr: "फळे" },
  "Dates": { name_hi: "खजूर", name_mr: "खजूर", category_hi: "फल", category_mr: "फळे" },
  "Figs": { name_hi: "अंजीर", name_mr: "अंजीर", category_hi: "फल", category_mr: "फळे" },
  "Apple": { name_hi: "सेब", name_mr: "सफरचंद", category_hi: "फल", category_mr: "फळे" },
  "Banana": { name_hi: "केला", name_mr: "केळे", category_hi: "फल", category_mr: "फळे" },
  "Mango": { name_hi: "आम", name_mr: "आंबा", category_hi: "फल", category_mr: "फळे" },
  "Papaya": { name_hi: "पपीता", name_mr: "पपई", category_hi: "फल", category_mr: "फळे" },
  "Bitter Gourd (Karela)": { name_hi: "करेला", name_mr: "कारले", category_hi: "सब्जी", category_mr: "भाज्या" },
  "Bottle Gourd (Lauki)": { name_hi: "लौकी", name_mr: "दुधी भोपळा", category_hi: "सब्जी", category_mr: "भाज्या" },
  "Eggplant (Baingan)": { name_hi: "बैंगन", name_mr: "वांगे", category_hi: "सब्जी", category_mr: "भाज्या" },
  "Okra (Bhindi)": { name_hi: "भिंडी", name_mr: "भेंडी", category_hi: "सब्जी", category_mr: "भाज्या" },
  "Chickpeas (Kabuli Chana)": { name_hi: "चना", name_mr: "हरभरा", category_hi: "फली", category_mr: "कडधान्य" },
  "Buttermilk (Takra)": { name_hi: "छाछ", name_mr: "ताक", category_hi: "डेयरी", category_mr: "डेअरी" },
  "Paneer": { name_hi: "पनीर", name_mr: "पनीर", category_hi: "डेयरी", category_mr: "डेअरी" },
  "Fish (Rohu)": { name_hi: "मछली", name_mr: "मासे", category_hi: "प्रोटीन", category_mr: "प्रथिने" },
  "Chicken": { name_hi: "चिकन", name_mr: "चिकन", category_hi: "प्रोटीन", category_mr: "प्रथिने" },
  "Basil (Tulsi)": { name_hi: "तुलसी", name_mr: "तुळस", category_hi: "जड़ी-बूटी", category_mr: "औषधी वनस्पती" },
  "Jaggery (Gur)": { name_hi: "गुड़", name_mr: "गूळ", category_hi: "चटनी/अचार", category_mr: "चटणी/लोणचे" }
};

const seedDB = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayurnutricare';
    await mongoose.connect(connString);
    console.log('Connected to DB for seeding...');
    
    // Clear existing
    await Food.deleteMany({});
    console.log('Cleared existing food database.');
    
    const translatedFoods = foods.map(food => {
      const trans = FOOD_TRANSLATIONS[food.name] || {};
      return {
        ...food,
        name_en: food.name,
        name_hi: trans.name_hi || food.name,
        name_mr: trans.name_mr || food.name,
        category_en: food.category,
        category_hi: trans.category_hi || food.category,
        category_mr: trans.category_mr || food.category
      };
    });
    
    // Insert new
    await Food.insertMany(translatedFoods);
    console.log(`Successfully seeded ${foods.length} food items!`);
    
    // Disconnect
    mongoose.connection.close();
    console.log('Seeding complete. Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
