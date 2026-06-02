const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Food = require('../models/Food');
const DietPlan = require('../models/DietPlan');
const ChatHistory = require('../models/ChatHistory');
const { translateText } = require('../services/aiService');

const isEnglish = (text) => {
  if (!text || typeof text !== 'string') return true;
  const devanagariRegex = /[\u0900-\u097F]/;
  return !devanagariRegex.test(text);
};

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

const runMigration = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayurnutricare';
    console.log(`Connecting to MongoDB at: ${connString.split('@').pop()}...`);
    await mongoose.connect(connString);
    console.log('Connected successfully. Starting migration...');

    // 1. Migrate Food documents
    console.log('--------------------------------------------------');
    console.log('Step 1: Migrating Food documents...');
    const allFoods = await Food.find({});
    console.log(`Found ${allFoods.length} Food documents in database.`);

    let foodUpdatedCount = 0;
    for (const food of allFoods) {
      let isModified = false;

      // Populate English values from current fields if missing
      if (!food.name_en) {
        food.name_en = food.name;
        isModified = true;
      }
      if (!food.category_en) {
        food.category_en = food.category;
        isModified = true;
      }

      // Check translation mapping
      const trans = FOOD_TRANSLATIONS[food.name] || FOOD_TRANSLATIONS[food.name_en];
      if (trans) {
        if (!food.name_hi) {
          food.name_hi = trans.name_hi;
          isModified = true;
        }
        if (!food.name_mr) {
          food.name_mr = trans.name_mr;
          isModified = true;
        }
        if (!food.category_hi) {
          food.category_hi = trans.category_hi;
          isModified = true;
        }
        if (!food.category_mr) {
          food.category_mr = trans.category_mr;
          isModified = true;
        }
      } else {
        // Safe fallbacks to current values if no mapping exists
        if (!food.name_hi) {
          food.name_hi = food.name;
          isModified = true;
        }
        if (!food.name_mr) {
          food.name_mr = food.name;
          isModified = true;
        }
        if (!food.category_hi) {
          food.category_hi = food.category;
          isModified = true;
        }
        if (!food.category_mr) {
          food.category_mr = food.category;
          isModified = true;
        }
      }

      if (isModified) {
        await food.save();
        foodUpdatedCount++;
      }
    }
    console.log(`Step 1 complete. Updated ${foodUpdatedCount} Food documents.`);

    // 2. Migrate DietPlan documents
    console.log('--------------------------------------------------');
    console.log('Step 2: Migrating DietPlan documents...');
    const allPlans = await DietPlan.find({});
    console.log(`Found ${allPlans.length} DietPlan documents in database.`);

    let plansUpdatedCount = 0;
    for (const plan of allPlans) {
      let isPlanModified = false;

      for (let i = 0; i < plan.meals.length; i++) {
        const meal = plan.meals[i];
        
        // 2a. Populate English description & ayurvedaNote if missing
        if (meal.description && !meal.description_en) {
          meal.description_en = meal.description;
          isPlanModified = true;
        }
        if (meal.ayurvedaNote && !meal.ayurvedaNote_en) {
          meal.ayurvedaNote_en = meal.ayurvedaNote;
          isPlanModified = true;
        }

        // 2b. Translate meal descriptions into Hindi & Marathi asynchronously
        if (meal.description_en) {
          if (!meal.description_hi || isEnglish(meal.description_hi)) {
            try {
              console.log(`Translating description to hi for plan ${plan._id} meal ${meal.key || i}...`);
              meal.description_hi = await translateText(meal.description_en, 'hi');
              isPlanModified = true;
            } catch (err) {
              console.error(`Failed to translate description to hi for plan ${plan._id}: ${err.message}`);
            }
          }
          if (!meal.description_mr || isEnglish(meal.description_mr)) {
            try {
              console.log(`Translating description to mr for plan ${plan._id} meal ${meal.key || i}...`);
              meal.description_mr = await translateText(meal.description_en, 'mr');
              isPlanModified = true;
            } catch (err) {
              console.error(`Failed to translate description to mr for plan ${plan._id}: ${err.message}`);
            }
          }
        }

        // 2c. Translate ayurvedaNote into Hindi & Marathi asynchronously
        if (meal.ayurvedaNote_en) {
          if (!meal.ayurvedaNote_hi || isEnglish(meal.ayurvedaNote_hi)) {
            try {
              console.log(`Translating ayurvedaNote to hi for plan ${plan._id} meal ${meal.key || i}...`);
              meal.ayurvedaNote_hi = await translateText(meal.ayurvedaNote_en, 'hi');
              isPlanModified = true;
            } catch (err) {
              console.error(`Failed to translate ayurvedaNote to hi for plan ${plan._id}: ${err.message}`);
            }
          }
          if (!meal.ayurvedaNote_mr || isEnglish(meal.ayurvedaNote_mr)) {
            try {
              console.log(`Translating ayurvedaNote to mr for plan ${plan._id} meal ${meal.key || i}...`);
              meal.ayurvedaNote_mr = await translateText(meal.ayurvedaNote_en, 'mr');
              isPlanModified = true;
            } catch (err) {
              console.error(`Failed to translate ayurvedaNote to mr for plan ${plan._id}: ${err.message}`);
            }
          }
        }
      }

      if (isPlanModified) {
        await plan.save();
        plansUpdatedCount++;
      }
    }
    console.log(`Step 2 complete. Updated/Translated ${plansUpdatedCount} DietPlan documents.`);

    // 3. Clear ChatHistory collection so chatbot greetings are re-initialized correctly in target language
    console.log('--------------------------------------------------');
    console.log('Step 3: Resetting ChatHistory documents...');
    const deleteRes = await ChatHistory.deleteMany({});
    console.log(`Step 3 complete. Cleared ${deleteRes.deletedCount} ChatHistory documents.`);

    console.log('--------------------------------------------------');
    console.log('Migration successfully completed!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('Database connection closed.');
    } catch (e) {
      console.error('Error closing database connection:', e.message);
    }
    process.exit(0);
  }
};

runMigration();
