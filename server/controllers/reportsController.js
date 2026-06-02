const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DietPlan = require('../models/DietPlan');

const FOOD_TRANSLATIONS = {
  "Moong Dal": { name_hi: "मूंग दाल", name_mr: "मूग डाळ" },
  "Chana Dal": { name_hi: "चना दाल", name_mr: "चना डाळ" },
  "Rice": { name_hi: "चावल", name_mr: "भात" },
  "Wheat": { name_hi: "गेहूं", name_mr: "गहू" },
  "Ghee": { name_hi: "घी", name_mr: "तूप" },
  "Milk": { name_hi: "दूध", name_mr: "दूध" },
  "Curd": { name_hi: "दही", name_mr: "दही" },
  "Ginger": { name_hi: "अदरक", name_mr: "आले" },
  "Turmeric": { name_hi: "हल्दी", name_mr: "हळद" },
  "Cumin": { name_hi: "जीरा", name_mr: "जिरे" },
  "Coriander": { name_hi: "धनिया", name_mr: "धणे" },
  "Amla": { name_hi: "आंवला", name_mr: "आवळा" },
  "Ashwagandha": { name_hi: "अश्वगंधा", name_mr: "अश्वगंधा" },
  "Triphala": { name_hi: "त्रिफला", name_mr: "त्रिफळा" },
  "Spinach": { name_hi: "पालक", name_mr: "पालक" },
  "Methi": { name_hi: "मेथी", name_mr: "मेथी" },
  "Pomegranate": { name_hi: "अनार", name_mr: "डाळिंब" },
  "Coconut": { name_hi: "नारियल", name_mr: "नारळ" },
  "Sesame": { name_hi: "तिल", name_mr: "तीळ" },
  "Honey": { name_hi: "शह़द", name_mr: "मध" },
  "Garlic": { name_hi: "लहसुन", name_mr: "लसूण" },
  "Onion": { name_hi: "प्याज़", name_mr: "कांदा" },
  "Lemon": { name_hi: "नींबू", name_mr: "लिंबू" },
  "Tomato": { name_hi: "टमाटर", name_mr: "टोमॅटो" },
  "Potato": { name_hi: "आलू", name_mr: "बटाटा" },
  "Mustard Seeds": { name_hi: "सरसों के बीज", name_mr: "मोहरी" },
  "Black Pepper": { name_hi: "काली मिर्च", name_mr: "काळी मिरी" },
  "Cardamom": { name_hi: "इलायची", name_mr: "वेलदोडा" },
  "Fennel Seeds": { name_hi: "सौंफ", name_mr: "बडीशेप" },
  "Mint": { name_hi: "पुदीना", name_mr: "पुदिना" },
  "Almonds": { name_hi: "बादाम", name_mr: "बदाम" },
  "Cashews": { name_hi: "काजू", name_mr: "काजू" },
  "Raisins": { name_hi: "किशमिश", name_mr: "मनुका" },
  "Dates": { name_hi: "खजूर", name_mr: "खजूर" },
  "Figs": { name_hi: "अंजीर", name_mr: "अंजीर" },
  "Apple": { name_hi: "सेब", name_mr: "सफरचंद" },
  "Banana": { name_hi: "केला", name_mr: "केळे" },
  "Mango": { name_hi: "आम", name_mr: "आंबा" },
  "Papaya": { name_hi: "पपीता", name_mr: "पपई" },
  "Bitter Gourd (Karela)": { name_hi: "करेला", name_mr: "कारले" },
  "Bottle Gourd (Lauki)": { name_hi: "लौकी", name_mr: "दुधी भोपळा" },
  "Eggplant (Baingan)": { name_hi: "बैंगन", name_mr: "वांगे" },
  "Okra (Bhindi)": { name_hi: "भिंडी", name_mr: "भेंडी" },
  "Chickpeas (Kabuli Chana)": { name_hi: "चना", name_mr: "हरभरा" },
  "Buttermilk (Takra)": { name_hi: "छाछ", name_mr: "ताक" },
  "Paneer": { name_hi: "पनीर", name_mr: "पनीर" },
  "Fish (Rohu)": { name_hi: "मछली", name_mr: "मासे" },
  "Chicken": { name_hi: "चिकन", name_mr: "चिकन" },
  "Basil (Tulsi)": { name_hi: "तुलसी", name_mr: "तुळस" },
  "Jaggery (Gur)": { name_hi: "गुड़", name_mr: "गूळ" }
};

const resolveLanguage = (req) => {
  let lang = req.query.lang || req.headers['accept-language'] || (req.user && req.user.preferredLanguage) || 'en';
  lang = lang.toLowerCase();
  if (lang.startsWith('hi')) return 'hi';
  if (lang.startsWith('mr')) return 'mr';
  return 'en';
};

const translateGoal = (goal, lang) => {
  if (lang === 'en') return goal;
  const goalMap = {
    'Weight Loss': { hi: 'वजन घटाना', mr: 'वजन कमी करणे' },
    'Immunity Boost': { hi: 'रोग प्रतिरोधक क्षमता बढ़ाना', mr: 'प्रतिकारशक्ती वाढवणे' },
    'Digestive Health': { hi: 'पाचन स्वास्थ्य', mr: 'पचन आरोग्य' },
    'General Wellness': { hi: 'सामान्य कल्याण', mr: 'सामान्य कल्याण' }
  };
  return (goalMap[goal] && goalMap[goal][lang]) || goal;
};

const translateSeason = (season, lang) => {
  if (lang === 'en') return season;
  const seasonMap = {
    'Shishira': { hi: 'शिशिर ऋतु (शीतकाल)', mr: 'शिशिर ऋतू (हिवाळा)' },
    'Vasanta': { hi: 'वसंत ऋतु (बसंत)', mr: 'वसंत ऋतू (वसंत)' },
    'Grishma': { hi: 'ग्रीष्म ऋतु (गर्मी)', mr: 'ग्रीष्म ऋतू (उन्हाळा)' },
    'Varsha': { hi: 'वर्षा ऋतु (मानसून)', mr: 'वर्षा ऋतू (पावसाळा)' },
    'Sharad': { hi: 'शरद ऋतु (शरद)', mr: 'शरद ऋतू (ऑक्टोबर हिट)' },
    'Hemanta': { hi: 'हेमंत ऋतु (पूर्व-शीतकाल)', mr: 'हेमंत ऋतू (पूर्व-हिवाळा)' }
  };
  return (seasonMap[season] && seasonMap[season][lang]) || season;
};

const translateDoshaName = (dosha, lang) => {
  if (!dosha) return 'Undetermined';
  if (dosha === 'Undetermined') return lang === 'mr' ? 'अनिर्धारित' : lang === 'hi' ? 'अनिर्धारित' : 'Undetermined';
  if (lang === 'en') return dosha;
  return dosha
    .split('-')
    .map(d => {
      const clean = d.trim().toLowerCase();
      if (clean === 'vata') return 'वात';
      if (clean === 'pitta') return 'पित्त';
      if (clean === 'kapha') return 'कफ';
      return d;
    })
    .join('-');
};

const PDF_STRINGS = {
  en: {
    title: '🌿 AyurNutriCare',
    subtitle: 'Personalized Ayurvedic Wellness & Diet Plan Report',
    generatedOn: 'Generated on: ',
    section1: '1. Patient Profile & Prakriti Assessment',
    name: 'Name: ',
    email: 'Email: ',
    phone: 'Phone: ',
    age: 'Age: ',
    years: ' years',
    gender: 'Gender: ',
    height: 'Height: ',
    weight: 'Weight: ',
    constitution: 'Ayurvedic Constitution (Prakriti)',
    dominant: 'Dominant Dosha: ',
    vata: 'Vata: ',
    pitta: 'Pitta: ',
    kapha: 'Kapha: ',
    medHistoryTitle: 'Medical History / Warnings:',
    noneReported: 'None reported.',
    section2: '2. Prescribed Diet Plan',
    season: 'Season/Ritu: ',
    duration: 'Duration: ',
    weeks: ' Weeks',
    status: 'Status: ',
    ingredients: 'Ingredients: ',
    description: 'Description: ',
    ayurvedicInsight: 'Ayurvedic Insight: ',
    customInstructions: 'Custom meal instructions',
    noDescription: 'No description.',
    noPlan: 'No active prescribed diet plan found. Consult your dietitian to configure a customized Ayurvedic meal profile.',
    section3: '3. Crucial Viruddha Ahara (Food Incompatibility) Warnings',
    viruddhaHeader: 'Per classical Ayurvedic literature, certain food combinations clash in metabolic thermal properties (Virya) or post-digestive processes, creating digestive sluggishness (impaired Agni) and chronic toxin accumulation (Ama). Please strictly avoid the following pairings:',
    disclaimer: 'AyurNutriCare Wellness Report. Not a substitute for emergency clinical prescription. Please consult your dietitian for severe metabolic challenges.',
    calories: 'Calories: ',
    protein: 'Protein: ',
    carbs: 'Carbs: ',
    fats: 'Fats: '
  },
  hi: {
    title: '🌿 आयुर्न्यूट्रीकेयर (AyurNutriCare)',
    subtitle: 'व्यक्तिगत आयुर्वेदिक कल्याण और आहार योजना रिपोर्ट',
    generatedOn: 'उत्पन्न तिथि: ',
    section1: '1. रोगी प्रोफ़ाइल और प्रकृति मूल्यांकन',
    name: 'नाम: ',
    email: 'ईमेल: ',
    phone: 'फ़ोन: ',
    age: 'आयु: ',
    years: ' वर्ष',
    gender: 'लिंग: ',
    height: 'ऊंचाई: ',
    weight: 'वजन: ',
    constitution: 'आयुर्वेदिक प्रकृति (Prakriti)',
    dominant: 'प्रधान दोष: ',
    vata: 'वात: ',
    pitta: 'पित्त: ',
    kapha: 'कफ: ',
    medHistoryTitle: 'चिकित्सा इतिहास / चेतावनियाँ:',
    noneReported: 'कोई रिपोर्ट नहीं।',
    section2: '2. निर्धारित आहार योजना',
    season: 'ऋतु: ',
    duration: 'अवधि: ',
    weeks: ' सप्ताह',
    status: 'स्थिति: ',
    ingredients: 'सामग्री: ',
    description: 'विवरण: ',
    ayurvedicInsight: 'आयुर्वेदिक अंतर्दृष्टि: ',
    customInstructions: 'कस्टम भोजन निर्देश',
    noDescription: 'कोई विवरण नहीं।',
    noPlan: 'कोई सक्रिय निर्धारित आहार योजना नहीं मिली। एक अनुकूलित आयुर्वेदिक भोजन प्रोफ़ाइल कॉन्फ़िगर करने के लिए अपने आहार विशेषज्ञ से परामर्श करें।',
    section3: '3. महत्वपूर्ण विरुद्ध आहार (खाद्य असंगति) चेतावनियाँ',
    viruddhaHeader: 'शास्त्रीय आयुर्वेदिक साहित्य के अनुसार, कुछ खाद्य संयोजन चयापचय तापीय गुणों (वीर्य) या पाचन के बाद की प्रक्रियाओं में टकराते हैं, जिससे पाचन सुस्ती (कमजोर अग्नि) और पुराने विषाक्त संचय (आम) का निर्माण होता है। कृपया निम्नलिखित संयोजनों से पूरी तरह बचें:',
    disclaimer: 'आयुर्न्यूट्रीकेयर कल्याण रिपोर्ट। आपातकालीन नैदानिक ​​प्रिस्क्रिप्शन का विकल्प नहीं है। कृपया गंभीर चयापचय चुनौतियों के लिए अपने आहार विशेषज्ञ से परामर्श करें।',
    calories: 'कैलोरी: ',
    protein: 'प्रोटीन: ',
    carbs: 'कार्ब्स: ',
    fats: 'वसा: '
  },
  mr: {
    title: '🌿 आयुर्न्यूट्रीकेयर (AyurNutriCare)',
    subtitle: 'सानुकूलित आयुर्वेदिक आरोग्य आणि आहार योजना अहवाल',
    generatedOn: 'तयार केल्याची तारीख: ',
    section1: '१. रुग्ण प्रोफाइल आणि प्रकृती मूल्यांकन',
    name: 'नाव: ',
    email: 'ईमेल: ',
    phone: 'फोन: ',
    age: 'वय: ',
    years: ' वर्षे',
    gender: 'लिंग: ',
    height: 'उंची: ',
    weight: 'वजन: ',
    constitution: 'आयुर्वेदिक प्रकृती (Prakriti)',
    dominant: 'प्रमुख दोष: ',
    vata: 'वात: ',
    pitta: 'पित्त: ',
    kapha: 'कफ: ',
    medHistoryTitle: 'वैद्यकीय इतिहास / इशारे:',
    noneReported: 'काहीही नोंदवलेले नाही.',
    section2: '२. विहित आहार योजना',
    season: 'ऋतू: ',
    duration: 'कालावधी: ',
    weeks: ' आठवडे',
    status: 'स्थिती: ',
    ingredients: 'घटक: ',
    description: 'वर्णन: ',
    ayurvedicInsight: 'आयुर्वेदिक दृष्टिकोन: ',
    customInstructions: 'सानुकूल जेवण सूचना',
    noDescription: 'वर्णन नाही.',
    noPlan: 'कोणतीही सक्रिय विहित आहार योजना आढळली नाही. सानुकूलित आयुर्वेदिक जेवण प्रोफाइल कॉन्फिगर करण्यासाठी तुमच्या आहारतज्ज्ञांचा सल्ला घ्या.',
    section3: '३. महत्त्वाचे विरुद्ध आहार (अन्न विसंगती) इशारे',
    viruddhaHeader: 'शास्त्रीय आयुर्वेदिक साहित्यानुसार, काही अन्नाचे संयोजन पचन क्रियेच्या औष्णिक गुणधर्मात (वीर्य) किंवा पचनानंतरच्या प्रक्रियेत विसंगत ठरतात, ज्यामुळे पचन मंदावते (अग्नी मंद होणे) आणि शरीरात विषारी घटक (आम) साठतात. कृपया खालील जोड्या काटेकोरपणे टाळा:',
    disclaimer: 'आयुर्न्यूट्रीकेयर कल्याण अहवाल. आणीबाणीच्या वैद्यकीय उपचारांसाठी हा पर्याय नाही. गंभीर चयापचय आव्हानांसाठी कृपया तुमच्या आहारतज्ज्ञांचा सल्ला घ्या.',
    calories: 'कॅलरी: ',
    protein: 'प्रथिने: ',
    carbs: 'कार्ब्स: ',
    fats: 'चरबी: '
  }
};

// @desc    Generate and download Patient Diet Plan and Health Assessment PDF Report
// @route   GET /api/reports/diet-plan/:patientId
// @access  Private
exports.getDietPlanReport = async (req, res) => {
  const patientId = req.params.patientId;

  // Authorization check
  if (req.user.role === 'patient' && req.user.id !== patientId) {
    return res.status(403).json({ success: false, message: 'Unauthorized access' });
  }

  try {
    const user = await User.findById(patientId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const profile = await PatientProfile.findOne({ userId: patientId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Patient wellness profile not found' });
    }

    const activePlan = await DietPlan.findOne({ patientId, status: 'Active' });

    // Initialize PDF Document
    const doc = new PDFDocument({ margin: 50 });

    // Set Response Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ayurnutricare_report_${patientId}.pdf`);

    // Stream PDF directly to response
    doc.pipe(res);

    // Resolve active language
    const lang = resolveLanguage(req);
    const strings = PDF_STRINGS[lang] || PDF_STRINGS.en;

    // Load Devanagari font if language is hi or mr
    let resolvedFont = 'Helvetica';
    let resolvedFontBold = 'Helvetica-Bold';
    let resolvedFontOblique = 'Helvetica-Oblique';
    
    if (lang !== 'en') {
      const possibleFonts = [
        'C:/Windows/Fonts/mangal.ttf',
        'C:/Windows/Fonts/kokila.ttf',
        'C:/Windows/Fonts/aparaj.ttf',
        'C:/Windows/Fonts/utsaah.ttf'
      ];
      for (const fPath of possibleFonts) {
        if (fs.existsSync(fPath)) {
          resolvedFont = fPath;
          resolvedFontBold = fPath;
          resolvedFontOblique = fPath;
          break;
        }
      }
    }

    // Styling Colors
    const primaryColor = '#1B4D3E'; // Herbal Dark Green
    const secondaryColor = '#E65F2B'; // Saffron
    const textColor = '#333333';
    const lightBgColor = '#F4F7F6';

    // Set Font
    doc.font(resolvedFont);

    // 1. Header
    doc.rect(0, 0, 612, 120).fill(primaryColor);
    doc.fillColor('#FFFFFF')
       .fontSize(24)
       .text(strings.title, 50, 40)
       .fontSize(10)
       .text(strings.subtitle, 50, 70)
       .text(`${strings.generatedOn}${new Date().toLocaleDateString()}`, 50, 85);

    // Decorative line
    doc.rect(0, 120, 612, 5).fill(secondaryColor);

    // Shift cursor below header
    doc.y = 150;
    doc.fillColor(textColor);

    // 2. Patient Demographics & Prakriti Info Table/Layout
    doc.font(resolvedFontBold)
       .fontSize(14)
       .fillColor(primaryColor)
       .text(strings.section1, 50)
       .moveDown(0.5);

    const startY = doc.y;

    // Left Column: Demographics
    doc.font(resolvedFont)
       .fontSize(10)
       .fillColor(textColor)
       .text(`${strings.name}${user.name}`, 55, startY)
       .text(`${strings.email}${user.email}`, 55, startY + 18)
       .text(`${strings.phone}${user.phone || 'N/A'}`, 55, startY + 36)
       .text(`${strings.age}${profile.age || 'N/A'}${strings.years}`, 55, startY + 54)
       .text(`${strings.gender}${profile.gender || 'N/A'}`, 55, startY + 72)
       .text(`${strings.height}${profile.height || 'N/A'} cm  |  ${strings.weight}${profile.weight || 'N/A'} kg`, 55, startY + 90);

    // Right Column: Dosha Profile
    doc.font(resolvedFontBold)
       .fontSize(11)
       .fillColor(secondaryColor)
       .text(strings.constitution, 320, startY)
       .font(resolvedFont)
       .fontSize(10)
       .fillColor(textColor)
       .text(`${strings.dominant}${translateDoshaName(profile.dominantDosha, lang)}`, 320, startY + 18)
       .text(`${strings.vata}${profile.doshaDistribution?.vata || 0}%`, 320, startY + 36)
       .text(`${strings.pitta}${profile.doshaDistribution?.pitta || 0}%`, 320, startY + 54)
       .text(`${strings.kapha}${profile.doshaDistribution?.kapha || 0}%`, 320, startY + 72);

    // Medical History Box
    doc.y = startY + 115;
    doc.rect(50, doc.y, 512, 36).fill(lightBgColor);
    doc.fillColor(textColor)
       .font(resolvedFontBold)
       .fontSize(9)
       .text(strings.medHistoryTitle, 60, doc.y + 8)
       .font(resolvedFont)
       .text(profile.medicalHistory && profile.medicalHistory.length > 0 ? profile.medicalHistory.join(', ') : strings.noneReported, 60, doc.y + 20);

    doc.y += 50;

    // 3. Active Diet Plan Details
    if (activePlan) {
      const translatedGoal = translateGoal(activePlan.goal, lang);
      doc.font(resolvedFontBold)
         .fontSize(14)
         .fillColor(primaryColor)
         .text(`${strings.section2} (${translatedGoal})`, 50)
         .moveDown(0.5);

      const planY = doc.y;
      doc.font(resolvedFont)
         .fontSize(10)
         .fillColor(textColor)
         .text(`${strings.season}${translateSeason(activePlan.season, lang)}`, 55, planY)
         .text(`${strings.duration}${activePlan.duration}${strings.weeks}`, 55, planY + 18)
         .text(`${strings.status}${activePlan.status}`, 55, planY + 36);

      doc.y = planY + 55;

      // Render meals in a list
      activePlan.meals.forEach((meal) => {
        // Prevent page overflow
        if (doc.y > 650) {
          doc.addPage();
          doc.y = 50; // top margin
          doc.font(resolvedFont);
        }

        doc.rect(50, doc.y, 512, 20).fill(primaryColor);
        doc.fillColor('#FFFFFF')
           .font(resolvedFontBold)
           .fontSize(10)
           .text(`${meal.name} - ${meal.time}`, 60, doc.y + 5);

        doc.y += 25;
        doc.fillColor(textColor);
        
        // Translate foods
        const mealFoods = meal.foods || [];
        const translatedFoods = mealFoods.map(fName => {
          const trans = FOOD_TRANSLATIONS[fName];
          return trans ? trans[`name_${lang}`] || fName : fName;
        });

        doc.font(resolvedFontBold)
           .fontSize(9)
           .text(strings.ingredients, 55, doc.y)
           .font(resolvedFont)
           .text(translatedFoods.length > 0 ? translatedFoods.join(', ') : strings.customInstructions, 120, doc.y);

        doc.y += 15;
        const description = meal[`description_${lang}`] || meal.description_en || meal.description || strings.noDescription;
        doc.font(resolvedFontBold)
           .text(strings.description, 55, doc.y)
           .font(resolvedFont)
           .text(description, 120, doc.y);

        doc.y += 15;
        const ayurvedaNote = meal[`ayurvedaNote_${lang}`] || meal.ayurvedaNote_en || meal.ayurvedaNote;
        if (ayurvedaNote) {
          doc.font(resolvedFontBold)
             .fillColor(secondaryColor)
             .text(strings.ayurvedicInsight, 55, doc.y)
             .font(resolvedFontOblique)
             .text(ayurvedaNote, 150, doc.y)
             .fillColor(textColor);
          doc.y += 15;
        }

        // Macros values
        if (meal.nutrition) {
          doc.font(resolvedFontBold)
             .fontSize(8)
             .text(`${strings.calories}${meal.nutrition.calories || 0} kcal  |  ${strings.protein}${meal.nutrition.protein || 0}g  |  ${strings.carbs}${meal.nutrition.carbs || 0}g  |  ${strings.fats}${meal.nutrition.fat || 0}g`, 55, doc.y);
          doc.y += 15;
        }

        doc.y += 10; // extra space between meals
      });

    } else {
      doc.font(resolvedFontOblique)
         .fontSize(11)
         .text(strings.noPlan, 50)
         .moveDown(1);
    }

    // 4. Viruddha Ahara Guidelines Page or Footer
    if (doc.y > 550) {
      doc.addPage();
      doc.y = 50;
      doc.font(resolvedFont);
    }

    doc.y += 20;
    doc.rect(50, doc.y, 512, 2).fill(secondaryColor);
    doc.y += 15;

    doc.font(resolvedFontBold)
       .fontSize(14)
       .fillColor(primaryColor)
       .text(strings.section3, 50)
       .moveDown(0.5);

    doc.font(resolvedFont)
       .fontSize(9.5)
       .fillColor(textColor)
       .text(strings.viruddhaHeader, { lineGap: 3 });

    doc.moveDown(0.8);

    const localizedRules = [
      { 
        pair: lang === 'hi' ? 'दूध + मछली' : lang === 'mr' ? 'दूध + मासे' : 'Milk + Fish', 
        note: lang === 'hi' ? 'विपरीत तासीर (ठंडा दूध बनाम गर्म मछली) गंभीर रक्त और त्वचा विकार पैदा करती है।' : lang === 'mr' ? 'विरुद्ध वीर्य (थंड दूध आणि उष्ण मासे) रक्त व त्वचेचे गंभीर विकार निर्माण करतात.' : 'Opposite potency (cold milk vs hot fish) causes severe blood and skin disorders.' 
      },
      { 
        pair: lang === 'hi' ? 'दूध + खट्टे फल / नींबू' : lang === 'mr' ? 'दूध + आंबट फळे / लिंबू' : 'Milk + Sour Fruits / Lemon', 
        note: lang === 'hi' ? 'पेट में जाकर दूध फट जाता है, जिससे परिसंचरण चैनलों (स्रोतस) में रुकावट आती है।' : lang === 'mr' ? 'पोटात गेल्यावर दूध फाडते, ज्यामुळे वहन करणाऱ्या वाहिन्यांमध्ये (स्रोतस) अडथळा येतो.' : 'Curdles in the gut, clogging circulation channels (Srotas).' 
      },
      { 
        pair: lang === 'hi' ? 'दूध + केला' : lang === 'mr' ? 'दूध + केळी' : 'Milk + Banana', 
        note: lang === 'hi' ? 'अत्यधिक भारीपन और कफ पैदा करता है, जिससे सर्दी/जुकाम की समस्या होती है।' : lang === 'mr' ? 'अतिशय जडपणा आणि कफ निर्माण करतो, ज्यामुळे सर्दी/खोकल्याचा त्रास होऊ शकतो.' : 'Creates immense heaviness, Kapha congestion, and triggers sinus issues.' 
      },
      { 
        pair: lang === 'hi' ? 'शह़द + घी (समान मात्रा)' : lang === 'mr' ? 'मध + तूप (समप्रमाण)' : 'Honey + Ghee (Equal Quantities)', 
        note: lang === 'hi' ? 'समान मात्रा में मिलाए जाने पर रासायनिक रूप से विषैला हो जाता है।' : lang === 'mr' ? 'समान प्रमाणात एकत्र केल्यास रासायनिकदृष्ट्या विषारी बनते.' : 'Chemically toxic when taken in exactly equal proportions.' 
      },
      { 
        pair: lang === 'hi' ? 'शहद + गर्म पेय / गर्म पानी' : lang === 'mr' ? 'मध + गरम पेये / गरम पाणी' : 'Honey + Hot Drinks / Hot Water', 
        note: lang === 'hi' ? 'शहद को 40 डिग्री सेल्सियस से ऊपर गर्म करने से एंजाइम नष्ट हो जाते हैं और विषैला आम बनता है।' : lang === 'mr' ? 'मध ४० डिग्री सेल्सिअसपेक्षा जास्त गरम केल्याने त्याचे गुणधर्म नष्ट होतात आणि शरीरात चिकट विष (आम) निर्माण होते.' : 'Heating honey above 40°C destroys enzymes and creates a sticky, indigestible poison (Ama).' 
      },
      { 
        pair: lang === 'hi' ? 'दही + प्याज' : lang === 'mr' ? 'दही + कांदा' : 'Curd / Yogurt + Onion', 
        note: lang === 'hi' ? 'विपरीत तापीय गुणों के कारण दोषों को बढ़ाता है।' : lang === 'mr' ? 'विरुद्ध औष्णिक गुणधर्मांमुळे दोष वाढतात.' : 'Aggravates Doshas due to highly conflicting thermal attributes.' 
      },
      { 
        pair: lang === 'hi' ? 'अंडे + दूध' : lang === 'mr' ? 'अंडी + दूध' : 'Eggs + Milk', 
        note: lang === 'hi' ? 'पाचन अग्नि पर भारी बोझ डालता है, जिससे पेट फूलना और सुस्ती होती है।' : lang === 'mr' ? 'पचनशक्तीवर अतिशय ताण पडतो, ज्यामुळे पोट फुगणे व बद्धकोष्ठता होऊ शकते.' : 'Heavily loads the metabolic fire, leading to bloating and sluggish bowels.' 
      }
    ];

    localizedRules.forEach((rule, idx) => {
      doc.font(resolvedFontBold)
         .fillColor(secondaryColor)
         .text(`• ${rule.pair}: `, 55)
         .font(resolvedFont)
         .fillColor(textColor)
         .text(rule.note, 180, doc.y - 12);
      doc.y += 5;
    });

    // Final Footer
    doc.y = 740;
    doc.font(resolvedFont)
       .fontSize(8)
       .fillColor('#888888')
       .text(strings.disclaimer, 50, 740, { align: 'center' });

    // Finalize
    doc.end();

  } catch (error) {
    console.error('getDietPlanReport error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
  }
};
