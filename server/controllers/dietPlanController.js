const DietPlan = require('../models/DietPlan');
const PatientProfile = require('../models/PatientProfile');
const Food = require('../models/Food');
const { translateText } = require('../services/aiService');

const isEnglish = (text) => {
  if (!text || typeof text !== 'string') return true;
  const devanagariRegex = /[\u0900-\u097F]/;
  return !devanagariRegex.test(text);
};

// Asynchronous background translations
const triggerTranslations = async (planId) => {
  try {
    const plan = await DietPlan.findById(planId);
    if (!plan) return;

    let updated = false;
    for (let i = 0; i < plan.meals.length; i++) {
      const meal = plan.meals[i];
      
      if (meal.description_en) {
        if (!meal.description_hi || isEnglish(meal.description_hi)) {
          try {
            const hiDesc = await translateText(meal.description_en, 'hi');
            meal.description_hi = hiDesc;
            updated = true;
          } catch (err) {
            console.error(`Error translating description_hi for plan ${planId} meal ${meal.key || i}:`, err.message);
          }
        }
        if (!meal.description_mr || isEnglish(meal.description_mr)) {
          try {
            const mrDesc = await translateText(meal.description_en, 'mr');
            meal.description_mr = mrDesc;
            updated = true;
          } catch (err) {
            console.error(`Error translating description_mr for plan ${planId} meal ${meal.key || i}:`, err.message);
          }
        }
      }

      if (meal.ayurvedaNote_en) {
        if (!meal.ayurvedaNote_hi || isEnglish(meal.ayurvedaNote_hi)) {
          try {
            const hiNote = await translateText(meal.ayurvedaNote_en, 'hi');
            meal.ayurvedaNote_hi = hiNote;
            updated = true;
          } catch (err) {
            console.error(`Error translating ayurvedaNote_hi for plan ${planId} meal ${meal.key || i}:`, err.message);
          }
        }
        if (!meal.ayurvedaNote_mr || isEnglish(meal.ayurvedaNote_mr)) {
          try {
            const mrNote = await translateText(meal.ayurvedaNote_en, 'mr');
            meal.ayurvedaNote_mr = mrNote;
            updated = true;
          } catch (err) {
            console.error(`Error translating ayurvedaNote_mr for plan ${planId} meal ${meal.key || i}:`, err.message);
          }
        }
      }
    }

    if (updated) {
      await plan.save();
      console.log(`[AI Translation]: Updated diet plan ${planId} with Hindi/Marathi translations.`);
    }
  } catch (err) {
    console.error(`[AI Translation Background Job Error] for plan ${planId}:`, err.message);
  }
};

const resolveLanguage = (req) => {
  let lang = req.query.lang || req.headers['accept-language'] || (req.user && req.user.preferredLanguage) || 'en';
  lang = lang.toLowerCase();
  if (lang.startsWith('hi')) return 'hi';
  if (lang.startsWith('mr')) return 'mr';
  return 'en';
};

// @desc    Create a personalized diet plan
// @route   POST /api/dietplan/create
// @access  Private (Dietitian only)
exports.createDietPlan = async (req, res) => {
  const { patientId, goal, duration, season, meals } = req.body;

  if (!patientId || !goal || !season || !meals || meals.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields and meals' });
  }

  try {
    // Check if patient exists
    const profile = await PatientProfile.findOne({ userId: patientId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    // Deactivate previous active plans for this patient
    await DietPlan.updateMany(
      { patientId, status: 'Active' },
      { status: 'Completed' }
    );

    // Create new diet plan
    const processedMeals = meals.map(meal => ({
      ...meal,
      description_en: meal.description_en || meal.description,
      ayurvedaNote_en: meal.ayurvedaNote_en || meal.ayurvedaNote
    }));

    const newPlan = await DietPlan.create({
      patientId,
      dietitianId: req.user.id,
      goal,
      duration,
      season,
      meals: processedMeals,
      status: 'Active'
    });

    // Link dietitian to patient profile if not already done
    profile.dietitianId = req.user.id;
    await profile.save();

    // Trigger translation asynchronously in background without blocking
    triggerTranslations(newPlan._id);

    res.status(201).json({
      success: true,
      message: 'Diet plan created successfully',
      dietPlan: newPlan
    });
  } catch (error) {
    console.error('createDietPlan error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get active diet plan for patient
// @route   GET /api/dietplan/patient/:patientId
// @access  Private
exports.getPatientDietPlan = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Verify authorization
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const activePlan = await DietPlan.findOne({ patientId, status: 'Active' })
      .populate('dietitianId', 'name email phone');

    if (!activePlan) {
      return res.status(200).json({ success: true, message: 'No active diet plan found', dietPlan: null });
    }

    const lang = resolveLanguage(req);
    const localizedPlan = activePlan.toObject();
    localizedPlan.meals = localizedPlan.meals.map(meal => {
      const description = meal[`description_${lang}`] || meal.description_en || meal.description;
      const ayurvedaNote = meal[`ayurvedaNote_${lang}`] || meal.ayurvedaNote_en || meal.ayurvedaNote;
      return {
        ...meal,
        description,
        ayurvedaNote
      };
    });

    res.status(200).json({
      success: true,
      dietPlan: localizedPlan
    });
  } catch (error) {
    console.error('getPatientDietPlan error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update a diet plan
// @route   PUT /api/dietplan/:planId
// @access  Private (Dietitian only)
exports.updateDietPlan = async (req, res) => {
  const { goal, duration, season, meals, status } = req.body;

  try {
    let plan = await DietPlan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Diet plan not found' });
    }

    // Verify this dietitian owns the plan
    if (plan.dietitianId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this plan' });
    }

    if (goal) plan.goal = goal;
    if (duration) plan.duration = duration;
    if (season) plan.season = season;
    if (meals) {
      plan.meals = meals.map(meal => ({
        ...meal,
        description_en: meal.description_en || meal.description,
        ayurvedaNote_en: meal.ayurvedaNote_en || meal.ayurvedaNote
      }));
    }
    if (status) plan.status = status;

    await plan.save();
    
    if (meals) {
      triggerTranslations(plan._id);
    }

    res.status(200).json({
      success: true,
      message: 'Diet plan updated successfully',
      dietPlan: plan
    });
  } catch (error) {
    console.error('updateDietPlan error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Log meal compliance (mark as eaten / not eaten)
// @route   POST /api/dietplan/compliance
// @access  Private (Patient only)
exports.logMealCompliance = async (req, res) => {
  const { date, mealKey, eaten } = req.body; // date format 'YYYY-MM-DD', mealKey: morningRoutine etc., eaten: true/false

  if (!date || !mealKey) {
    return res.status(400).json({ success: false, message: 'Please provide date and mealKey' });
  }

  try {
    const profile = await PatientProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    // Find if record exists
    const complianceIndex = profile.complianceLog.findIndex(
      log => log.date === date && log.mealKey === mealKey
    );

    if (complianceIndex > -1) {
      profile.complianceLog[complianceIndex].eaten = eaten;
    } else {
      profile.complianceLog.push({ date, mealKey, eaten });
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Compliance logged successfully',
      complianceLog: profile.complianceLog
    });
  } catch (error) {
    console.error('logMealCompliance error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const INCOMPATIBILITIES = [
  {
    foods: ["Milk", "Fish"],
    severity: "high",
    reason_en: "Opposite Virya (Milk=cold, Fish=hot). Creates skin disorders (Kushtha), toxic Ama.",
    reason_mr: "विपरीत वीर्य — दूध थंड, मासे उष्ण. त्वचारोग आणि आम निर्माण होते.",
    reason_hi: "विपरीत वीर्य (दूध = ठंडा, मछली = गर्म)। त्वचा रोग (कुष्ठ) और विषाक्त आम का निर्माण करता है।",
    classical_ref: "Charaka Samhita, Sutrasthana 26"
  },
  {
    foods: ["Milk", "Curd"],
    severity: "high",
    reason_en: "Both dairy but opposite properties. Curd is Abhishyandi (blocks channels), together they cause heaviness and Kapha disorders.",
    reason_mr: "दूध आणि दही एकत्र जड असतात. कफ विकार होतात.",
    reason_hi: "दोनों डेयरी उत्पाद हैं लेकिन इनके गुण विपरीत हैं। दही अभिष्यंदी (चैनलों को अवरुद्ध करने वाला) है, साथ में ये भारीपन और कफ विकार पैदा करते हैं।",
    classical_ref: "Ashtanga Hridayam, Sutrasthana 7"
  },
  {
    foods: ["Milk", "Salt"],
    severity: "high",
    reason_en: "Salt is Virya-viruddha with Milk. Causes skin diseases and disturbs Rasa Dhatu.",
    reason_mr: "मीठ आणि दूध एकत्र रस धातूला हानी करतात.",
    reason_hi: "नमक दूध के साथ वीर्य-विरुद्ध है। त्वचा रोगों का कारण बनता है और रस धातु को प्रभावित करता है।",
    classical_ref: "Charaka Samhita"
  },
  {
    foods: ["Milk", "Lemon"],
    severity: "high",
    reason_en: "Sour fruits curdle Milk, creating indigestible compounds that block Srotas (channels).",
    reason_mr: "आंबट फळे दुधाला फाडतात. स्रोतस अवरोध होतो.",
    reason_hi: "खट्टे फल दूध को फाड़ देते हैं, जिससे अपच पैदा करने वाले तत्व बनते हैं जो स्रोतस (चैनलों) को अवरुद्ध करते हैं।",
    classical_ref: "Charaka Samhita, Sutrasthana 26"
  },
  {
    foods: ["Milk", "Banana"],
    severity: "medium",
    reason_en: "Opposite qualities — creates heaviness, stimulates excess Kapha and mucus, impairs Agni.",
    reason_mr: "विरुद्ध गुण — जडपणा येतो, कफ वाढतो.",
    reason_hi: "विपरीत गुण — भारीपन पैदा करता है, अतिरिक्त कफ और बलगम बढ़ाता है, और जठराग्नि को कमजोर करता है।",
    classical_ref: "Classical Ayurvedic texts"
  },
  {
    foods: ["Milk", "Radish"],
    severity: "high",
    reason_en: "Radish is hot and pungent; Milk is cold and sweet. Together cause Viruddha Virya reaction.",
    reason_mr: "मुळा उष्ण-तिखट, दूध थंड-गोड — विरुद्ध वीर्य प्रतिक्रिया.",
    reason_hi: "मूली गर्म और तीखी होती है; दूध ठंडा और मीठा होता है। साथ में वीर्य-विरुद्ध प्रतिक्रिया करते हैं।",
    classical_ref: "Charaka Samhita"
  },
  {
    foods: ["Honey", "Ghee"],
    severity: "high",
    reason_en: "Equal quantities of Honey and Ghee are toxic (Samana Matra Viruddha). Use different proportions only.",
    reason_mr: "समान प्रमाणात मध आणि तूप विषासमान आहे.",
    reason_hi: "शह़द और घी की समान मात्रा विषाक्त होती है (समान मात्रा विरुद्ध)। केवल अलग-अलग अनुपात में ही उपयोग करें।",
    classical_ref: "Charaka Samhita, Sutrasthana 26 — most cited Viruddha"
  },
  {
    foods: ["Honey", "Hot drinks"],
    severity: "high",
    reason_en: "Heating Honey above 40°C creates Ama and toxic compounds (Hydroxymethylfurfural). Never add honey to hot tea/milk.",
    reason_mr: "मध गरम केल्यावर विषारी बनतो. कधीही गरम चहा/दुधात घालू नका.",
    reason_hi: "शहद को 40 डिग्री सेल्सियस से ऊपर गर्म करने से आम और विषाक्त तत्व बनते हैं। गर्म चाय या दूध में कभी भी शहद न मिलाएं।",
    classical_ref: "Charaka Samhita, Sutrasthana 26"
  },
  {
    foods: ["Fish", "Jaggery"],
    severity: "medium",
    reason_en: "Fish and Jaggery are incompatible — together create Ama and can cause skin disorders.",
    reason_mr: "मासे आणि गूळ एकत्र आम निर्माण करतात.",
    reason_hi: "मछली और गुड़ असंगत हैं — साथ में आम पैदा करते हैं और त्वचा विकारों का कारण बन सकते हैं।",
    classical_ref: "Charaka Samhita"
  },
  {
    foods: ["Curd", "Onion"],
    severity: "medium",
    reason_en: "Curd + Onion aggravates all three Doshas. Common in Raita — use sparingly.",
    reason_mr: "दही + कांदा तीनही दोष वाढवतात.",
    reason_hi: "दही और प्याज तीनों दोषों को बढ़ाते हैं। रायता में बहुत कम मात्रा में प्रयोग करें।",
    classical_ref: "Classical Ayurvedic practice"
  },
  {
    foods: ["Eggs", "Milk"],
    severity: "medium",
    reason_en: "Both are heavy, Abhishyandi (channel-blocking). Together overburden Agni and create Ama.",
    reason_mr: "दोन्ही जड आणि अभिष्यंदी — अग्निवर ताण येतो.",
    reason_hi: "दोनों भारी और अभिष्यंदी हैं। साथ में जठराग्नि पर दबाव डालते हैं और आम बनाते हैं।",
    classical_ref: "Ashtanga Hridayam"
  },
  {
    foods: ["Radish", "Milk"],
    severity: "high",
    reason_en: "Virya-viruddha combination. Radish is Ushna (hot), Milk is Sheeta (cold).",
    reason_mr: "मुळा उष्ण, दूध शीत — विरुद्ध वीर्य.",
    reason_hi: "वीर्य-विरुद्ध संयोजन। मूली उष्ण (गर्म) है, दूध शीत (ठंडा) है।",
    classical_ref: "Charaka Samhita"
  },
  {
    foods: ["Urad Dal", "Radish"],
    severity: "medium",
    reason_en: "Both are heavy and gas-forming. Together cause severe bloating and Vata aggravation.",
    reason_mr: "दोन्ही जड आणि वातवर्धक — गोळा येतो.",
    reason_hi: "दोनों भारी और गैस बनाने वाले हैं। साथ में पेट फूलना और वात विकार बढ़ाते हैं।",
    classical_ref: "Classical Ayurvedic texts"
  },
  {
    foods: ["Banana", "Buttermilk"],
    severity: "low",
    reason_en: "Compatible in moderate quantity. Both have cooling properties, suitable for Pitta.",
    reason_mr: "माफक प्रमाणात ठीक. दोन्ही शीतल — पित्तासाठी योग्य.",
    reason_hi: "सीमित मात्रा में ठीक है। दोनों के शीत गुण हैं, पित्त के लिए अनुकूल है।",
    classical_ref: "Compatible combination"
  }
];

exports.validateDietPlan = async (req, res) => {
  const { patientId, goal, season, meals } = req.body;

  if (!patientId || !season || !meals || !Array.isArray(meals)) {
    return res.status(400).json({ success: false, message: 'Please provide patientId, season, and meals array' });
  }

  try {
    const profile = await PatientProfile.findOne({ userId: patientId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const allFoodsInDb = await Food.find({});
    
    // 1. Timing Checks
    const parseTime = (str) => {
      if (!str) return null;
      const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;
      let hr = parseInt(match[1]);
      const min = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hr < 12) hr += 12;
      if (ampm === 'AM' && hr === 12) hr = 0;
      return hr + min / 60;
    };

    let timingDeductions = 0;
    const timingIssues = [];

    meals.forEach(meal => {
      const tVal = parseTime(meal.time);
      if (tVal !== null) {
        if (meal.key === 'breakfast') {
          if (tVal < 7.0 || tVal > 9.0) {
            timingDeductions += 8;
            timingIssues.push({
              meal: meal.name,
              time: meal.time,
              issue_en: "Breakfast should ideally be taken between 7:00 AM and 9:00 AM.",
              issue_mr: "न्याहारी (ब्रेकफास्ट) सकाळी ७:०० ते ९:०० च्या दरम्यान घ्यावी.",
              issue_hi: "सुबह का नाश्ता आदर्श रूप से सुबह 7:00 बजे से 9:00 बजे के बीच लिया जाना चाहिए।"
            });
          }
        } else if (meal.key === 'lunch') {
          if (tVal < 12.0 || tVal > 14.0) {
            timingDeductions += 8;
            timingIssues.push({
              meal: meal.name,
              time: meal.time,
              issue_en: "Lunch should ideally be taken between 12:00 PM and 2:00 PM (maximum digestive fire / Agni).",
              issue_mr: "दुपारचे जेवण १२:०० ते २:०० च्या दरम्यान घ्यावे (अग्नी या काळात तीव्र असतो).",
              issue_hi: "दोपहर का भोजन आदर्श रूप से दोपहर 12:00 बजे से 2:00 बजे के बीच लिया जाना चाहिए (अधिकतम पाचक अग्नि / अग्नि)।"
            });
          }
        } else if (meal.key === 'dinner') {
          if (tVal > 20.0) {
            timingDeductions += 8;
            timingIssues.push({
              meal: meal.name,
              time: meal.time,
              issue_en: "Dinner should be consumed before 8:00 PM to ensure healthy digestion.",
              issue_mr: "रात्रीचे जेवण ८:०० वाजेपूर्वी घ्यावे जेणेकरून अन्न नीट पचेल.",
              issue_hi: "स्वस्थ पाचन सुनिश्चित करने के लिए रात का भोजन रात 8:00 बजे से पहले किया जाना चाहिए।"
            });
          }
        }
      }
    });

    // Helper to resolve food from db
    const findFoodMatch = (nameStr, dbFoods) => {
      if (!nameStr) return null;
      const clean = nameStr.toLowerCase().split('(')[0].trim();
      return dbFoods.find(f => {
        const fClean = f.name.toLowerCase().split('(')[0].trim();
        return fClean.includes(clean) || clean.includes(fClean);
      });
    };

    // 2. Seasonal Suitability & 4. Dosha Matching
    let seasonalDeductions = 0;
    const seasonalIssues = [];
    
    let doshaDeductions = 0;
    const doshaIssues = [];
    const dominantDosha = profile.dominantDosha || 'Undetermined';
    const activeDoshas = dominantDosha.toLowerCase().split('-');

    // 3. Incompatibility (Viruddha Ahara) check
    let compatibilityDeductions = 0;
    const compatibilityIssues = [];

    meals.forEach(meal => {
      const mFoods = meal.foods || [];
      
      // Seasonal & Dosha check for each food in this meal
      mFoods.forEach(foodName => {
        const match = findFoodMatch(foodName, allFoodsInDb);
        if (match) {
          // Season check
          if (match.ayurveda && match.ayurveda.suitable_season && match.ayurveda.suitable_season.length > 0) {
            if (!match.ayurveda.suitable_season.includes(season)) {
              seasonalDeductions += 5;
              const seasonMapHi = { Vasanta: 'वसंत', Grishma: 'ग्रीष्म', Varsha: 'वर्षा', Sharad: 'शरद', Hemanta: 'हेमंत', Shishira: 'शिशिर' };
              const seasonHi = seasonMapHi[season] || season;
              seasonalIssues.push({
                meal: meal.name,
                food: foodName,
                issue_en: `${foodName} is not typically recommended during ${season} season.`,
                issue_mr: `${foodName} हे सामान्यतः ${season} ऋतूत खाण्याची शिफारस केली जात नाही.`,
                issue_hi: `${foodName} की ${seasonHi} ऋतु के दौरान सामान्यतः सिफारिश नहीं की जाती है।`
              });
            }
          }
          // Dosha check
          if (match.ayurveda && match.ayurveda.dosha_effect) {
            activeDoshas.forEach(d => {
              if (d && d !== 'undetermined') {
                const effect = match.ayurveda.dosha_effect[d];
                if (effect === 'increases' || effect === 'aggravates') {
                  doshaDeductions += 5;
                  const doshaMap = { vata: 'वात', pitta: 'पित्त', kapha: 'कफ' };
                  const doshaHi = doshaMap[d.toLowerCase()] || d;
                  doshaIssues.push({
                    meal: meal.name,
                    food: foodName,
                    issue_en: `${foodName} increases ${d.charAt(0).toUpperCase() + d.slice(1)} Dosha, which may aggravate your dominant constitution.`,
                    issue_mr: `${foodName} मुळे ${d.charAt(0).toUpperCase() + d.slice(1)} दोष वाढतो, ज्यामुळे तुमच्या प्रकृतीमध्ये असंतुलन येऊ शकते.`,
                    issue_hi: `${foodName} से ${doshaHi} दोष बढ़ता है, जो आपकी प्रधान प्रकृति को प्रकुपित कर सकता है।`
                  });
                }
              }
            });
          }
        }
      });

      // Incompatibility check within the meal
      if (mFoods.length >= 2) {
        for (let i = 0; i < mFoods.length; i++) {
          for (let j = i + 1; j < mFoods.length; j++) {
            const foodA = mFoods[i];
            const foodB = mFoods[j];
            const pair = [foodA, foodB];

            const rule = INCOMPATIBILITIES.find(r =>
              r.foods.every(f => pair.some(p => p.toLowerCase().includes(f.toLowerCase())))
            );

            if (rule && rule.severity !== 'low') {
              if (rule.severity === 'high') {
                compatibilityDeductions += 15;
              } else {
                compatibilityDeductions += 8;
              }
              compatibilityIssues.push({
                meal: meal.name,
                pair: [foodA, foodB],
                severity: rule.severity,
                reason_en: rule.reason_en,
                reason_mr: rule.reason_mr,
                reason_hi: rule.reason_hi,
                classical_ref: rule.classical_ref
              });
            }
          }
        }
      }
    });

    // Score calculation (each section max 25 points deduction)
    const score = Math.max(0, 100 - Math.min(25, timingDeductions) - Math.min(25, seasonalDeductions) - Math.min(25, compatibilityDeductions) - Math.min(25, doshaDeductions));
    
    let status = 'perfect';
    if (score < 60) status = 'poor';
    else if (score < 90) status = 'caution';

    res.status(200).json({
      success: true,
      score,
      status,
      timingIssues,
      seasonalIssues,
      compatibilityIssues,
      doshaIssues
    });

  } catch (error) {
    console.error('validateDietPlan error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during plan validation' });
  }
};
