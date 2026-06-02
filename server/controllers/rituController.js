// Ritu Charya Seasonal Advisor Controller

// Month mappings (0-indexed):
// Jan (0), Feb (1): Shishira (Winter)
// Mar (2), Apr (3): Vasanta (Spring)
// May (4), Jun (5): Grishma (Summer)
// Jul (6), Aug (7): Varsha (Monsoon)
// Sep (8), Oct (9): Sharad (Autumn)
// Nov (10), Dec (11): Hemanta (Late Autumn)

const RITUS = {
  Shishira: {
    key: "Shishira",
    name_en: "Shishira (Winter)",
    name_mr: "शिशिर ऋतू (हिवाळा)",
    name_hi: "शिशिर ऋतु (शीतकाल)",
    favor_en: ["Wheat", "Urad Dal", "Rice", "Ghee", "Milk", "Ginger", "Sesame", "Jaggery", "Root vegetables"],
    favor_mr: ["गहू", "उडीद डाळ", "भात", "तूप", "दूध", "आले", "तीळ", "गूळ", "कंदमुळे"],
    favor_hi: ["गेहूं", "उड़द दाल", "चावल", "घी", "दूध", "अदरक", "तिल", "गुड़", "कंदमूल"],
    avoid_en: ["Astringent/bitter foods", "Cold water/drinks", "Dry/light foods"],
    avoid_mr: ["कडू/तुरट अन्न", "थंड पाणी/पेये", "कोरडे/हलके अन्न"],
    avoid_hi: ["कषाय/कड़वा भोजन", "ठंडा पानी/पेय", "रूखा/हल्का भोजन"],
    dinacharya_en: [
      "Keep head and body covered to conserve heat",
      "Perform daily body massage with warm sesame oil (Abhyanga)",
      "Consume hot, freshly cooked meals",
      "Sunbathing and moderate exercise"
    ],
    dinacharya_mr: [
      "उष्णता टिकवण्यासाठी डोके आणि शरीर झाकून ठेवा",
      "कोमट तिळाच्या तेलाने रोज शरीराला मालिश करा (अभ्यंग)",
      "गरम, ताजे शिजवलेले अन्न खा",
      "उन्हात बसणे आणि मध्यम व्यायाम"
    ],
    dinacharya_hi: [
      "शरीर और सिर को ढक कर रखें ताकि गर्मी बनी रहे",
      "गुनगुने तिल के तेल से रोजाना शरीर की मालिश करें (अभ्यंग)",
      "गर्म, ताजा बना हुआ भोजन करें",
      "धूप सेंकना और मध्यम व्यायाम"
    ],
    dominant_dosha: "Vata / Kapha (accumulates)",
    dominant_dosha_en: "Vata / Kapha (accumulates)",
    dominant_dosha_hi: "वात / कफ (संचित होता है)",
    dominant_dosha_mr: "वात / कफ (संचित होतो)"
  },
  Vasanta: {
    key: "Vasanta",
    name_en: "Vasanta (Spring)",
    name_mr: "वसंत ऋतू (वसंत)",
    name_hi: "वसंत ऋतु (बसंत)",
    favor_en: ["Barley", "Wheat", "Honey", "Moong Dal", "Bitter Gourd", "Ginger", "Turmeric"],
    favor_mr: ["जव (सत्तू)", "गहू", "मध", "मूग डाळ", "कारले", "आले", "हळद"],
    favor_hi: ["जौ (सत्तू)", "गेहूं", "शहद", "मूंग दाल", "करेला", "अदरक", "हल्दी"],
    avoid_en: ["Curd", "Cold foods/drinks", "Heavy sweets", "Oily/fried foods"],
    avoid_mr: ["दही", "थंड अन्न/पेये", "जड गोड पदार्थ", "तेलकट/तळलेले अन्न"],
    avoid_hi: ["दही", "ठंडा भोजन/पेय", "भारी मीठे पदार्थ", "तेलीय/तला हुआ भोजन"],
    dinacharya_en: [
      "Dry herbal powder massage (Udvartana) to reduce Kapha",
      "Light physical exercise (Vyayama) to clear sluggishness",
      "Nasal therapy (Nasya) with herbal oils",
      "Avoid daytime sleeping"
    ],
    dinacharya_mr: [
      "कफ कमी करण्यासाठी कोरड्या वनस्पतींच्या चूर्णाने मालिश (उद्वर्तन)",
      "सुस्ती घालवण्यासाठी हलका शारीरिक व्यायाम (व्यायाम)",
      "हर्बल तेलाने नस्य थेरपी",
      "दिवसा झोपणे टाळा"
    ],
    dinacharya_hi: [
      "कफ कम करने के लिए सूखे हर्बल पाउडर से मालिश (उद्वर्तन)",
      "सुस्ती दूर करने के लिए हल्का व्यायाम (व्यायाम)",
      "हर्बल तेलों से नस्य थेरपी",
      "दिन में सोने से बचें"
    ],
    dominant_dosha: "Kapha",
    dominant_dosha_en: "Kapha",
    dominant_dosha_hi: "कफ",
    dominant_dosha_mr: "कफ"
  },
  Grishma: {
    key: "Grishma",
    name_en: "Grishma (Summer)",
    name_mr: "ग्रीष्म ऋतू (उन्हाळा)",
    name_hi: "ग्रीष्म ऋतु (गर्मी)",
    favor_en: ["Milk", "Ghee", "Rice", "Coconut", "Pomegranate", "Cucumber", "Mint"],
    favor_mr: ["दूध", "तूप", "भात", "नारळ", "डाळिंब", "काकडी", "पुदिना"],
    favor_hi: ["दूध", "घी", "चावल", "नारियल", "अनार", "खीरा", "पुदीना"],
    avoid_en: ["Pungent spices", "Garlic", "Onion", "Alcohol", "Sour fruits", "Tea/Coffee"],
    avoid_mr: ["तिखट मसाले", "लसूण", "कांदा", "मद्यपान", "आंबट फळे", "चहा/कॉफी"],
    avoid_hi: ["तीखे मसाले", "लहसुन", "प्याज", "मदिरा", "खट्टे फल", "चाय/कॉफी"],
    dinacharya_en: [
      "Apply sandalwood paste to soothe and cool the skin",
      "Stay in cool, well-shaded and ventilated spaces",
      "Avoid heavy physical exertion or sun exposure",
      "Short daytime nap is allowed in a cool room"
    ],
    dinacharya_mr: [
      "त्वचेला थंड ठेवण्यासाठी चंदनाचा लेप लावा",
      "थंड, सावलीच्या आणि हवेशीर जागेत राहा",
      "जड शारीरिक श्रम किंवा उन्हात जाणे टाळा",
      "थंड खोलीत दिवसा थोडी झोप घेण्यास परवानगी आहे"
    ],
    dinacharya_hi: [
      "त्वचा को ठंडक और शांति देने के लिए चंदन का लेप लगाएं",
      "ठंडे, हवादार और छायादार स्थानों में रहें",
      "भारी शारीरिक श्रम या धूप में जाने से बचें",
      "ठंडे कमरे में दिन में छोटी सी नींद लेने की अनुमति है"
    ],
    dominant_dosha: "Pitta",
    dominant_dosha_en: "Pitta",
    dominant_dosha_hi: "पित्त",
    dominant_dosha_mr: "पित्त"
  },
  Varsha: {
    key: "Varsha",
    name_en: "Varsha (Monsoon)",
    name_mr: "वर्षा ऋतू (पावसाळा)",
    name_hi: "वर्षा ऋतु (मानसून)",
    favor_en: ["Wheat", "Rice", "Ghee", "Moong Dal", "Ginger", "Black Pepper", "Warm soups"],
    favor_mr: ["गहू", "भात", "तूप", "मूग डाळ", "आले", "काळी मिरी", "गरम सूप"],
    favor_hi: ["गेहूं", "चावल", "घी", "मूंग दाल", "अदरक", "काली मिर्च", "गर्म सूप"],
    avoid_en: ["Curd/Yogurt", "Leafy green vegetables", "Cold water", "Stale food"],
    avoid_mr: ["दही", "पालेभाज्या (दूषित असण्याची शक्यता)", "थंड पाणी", "शिळे अन्न"],
    avoid_hi: ["दही", "हरी पत्तेदार सब्जियां", "ठंडा पानी", "बासी भोजन"],
    dinacharya_en: [
      "Drink boiled and cooled water only",
      "Keep body dry, clean and warm",
      "Warm sesame oil massage (Abhyanga)",
      "Avoid sleeping during the day"
    ],
    dinacharya_mr: [
      "उकळून थंड केलेले पाणी प्या",
      "शरीर कोरडे, स्वच्छ आणि उबदार ठेवा",
      "कोमट तिळाच्या तेलाने मालिश (अभ्यंग)",
      "दिवसा झोपणे टाळा"
    ],
    dinacharya_hi: [
      "केवल उबला और ठंडा किया हुआ पानी पिएं",
      "शरीर को सूखा, स्वच्छ और गर्म रखें",
      "गुनगुने तिल के तेल से मालिश (अभ्यंग)",
      "दिन में सोने से बचें"
    ],
    dominant_dosha: "Vata",
    dominant_dosha_en: "Vata",
    dominant_dosha_hi: "वात",
    dominant_dosha_mr: "वात"
  },
  Sharad: {
    key: "Sharad",
    name_en: "Sharad (Autumn)",
    name_mr: "शरद ऋतू (ऑक्टोबर हिट)",
    name_hi: "शरद ऋतु (शरद)",
    favor_en: ["Ghee", "Milk", "Rice", "Wheat", "Moong Dal", "Amla", "Pomegranate"],
    favor_mr: ["तूप", "दूध", "भात", "गहू", "मूग डाळ", "आवळा", "डाळिंब"],
    favor_hi: ["घी", "दूध", "चावल", "गेहूं", "मूंग दाल", "आंवला", "अनार"],
    avoid_en: ["Curd", "Spicy food", "Garlic", "Onion", "Ginger", "Mustard oil", "Heavy foods"],
    avoid_mr: ["दही", "तिखट अन्न", "लसूण", "कांदा", "आले", "मोहरीचे तेल", "जड अन्न"],
    avoid_hi: ["दही", "तीखा भोजन", "लहसुन", "प्याज", "अदरक", "सरसों का तेल", "भारी भोजन"],
    dinacharya_en: [
      "Expose body to moonlight in evening (Sheetala)",
      "Gentle purging therapy (Virechana) under guidance",
      "Drink water purified by sun and moon rays (Hansodaka)"
    ],
    dinacharya_mr: [
      "संध्याकाळी चंद्राच्या प्रकाशात बसा (शीतल)",
      "तज्ञांच्या मार्गदर्शनाखाली सौम्य विरेचन थेरपी",
      "सूर्य आणि चंद्राच्या किरणांनी शुद्ध केलेले पाणी प्या (हंसोदक)"
    ],
    dinacharya_hi: [
      "शाम को चांदनी में बैठें (शीतलता)",
      "मार्गदर्शन में सौम्य विरेचन थेरपी",
      "धूप और चांदनी से शुद्ध किया हुआ जल पिएं (हंसोदक)"
    ],
    dominant_dosha: "Pitta",
    dominant_dosha_en: "Pitta",
    dominant_dosha_hi: "पित्त",
    dominant_dosha_mr: "पित्त"
  },
  Hemanta: {
    key: "Hemanta",
    name_en: "Hemanta (Late Autumn)",
    name_mr: "हेमंत ऋतू (पूर्व-हिवाळा)",
    name_hi: "हेमंत ऋतु (पूर्व-शीतकाल)",
    favor_en: ["Urad Dal", "Wheat", "Milk", "Ghee", "Sesame oil", "Bajra", "Jaggery", "Dates"],
    favor_mr: ["उडीद डाळ", "गहू", "दूध", "तूप", "तिळाचे तेल", "बाजरी", "गूळ", "खजूर"],
    favor_hi: ["उड़द दाल", "गेहूं", "दूध", "घी", "तिल का तेल", "बाजरा", "गुड़", "खजूर"],
    avoid_en: ["Cold/dry foods", "Light, vata-aggravating foods", "Cold drinks"],
    avoid_mr: ["थंड/कोरडे अन्न", "हलके, वात वाढवणारे अन्न", "थंड पेये"],
    avoid_hi: ["ठंडा/रूखा भोजन", "वात बढ़ाने वाला हल्का भोजन", "ठंडे पेय"],
    dinacharya_en: [
      "Regular full-body oil massage (Abhyanga)",
      "Heavy exercise is beneficial due to strong digestive fire",
      "Wear warm woolen clothing",
      "Sun bathing"
    ],
    dinacharya_mr: [
      "नियमित संपूर्ण शरीर तेल मालिश (अभ्यंग)",
      "मजबूत पचनशक्तीमुळे जड व्यायाम फायदेशीर आहे",
      "उबदार लोकरीचे कपडे घाला",
      "उन्हात बसा"
    ],
    dinacharya_hi: [
      "नियमित पूरे शरीर की तेल मालिश (अभ्यंग)",
      "मजबूत पाचन अग्नि के कारण भारी व्यायाम फायदेमंद है",
      "गर्म ऊनी कपड़े पहनें",
      "धूप सेंकना"
    ],
    dominant_dosha: "Vata (decreases) / Agni (strongest)",
    dominant_dosha_en: "Vata (decreases) / Agni (strongest)",
    dominant_dosha_hi: "वात (कम होता है) / अग्नि (तीव्रतम)",
    dominant_dosha_mr: "वात (कमी होते) / अग्नी (सर्वात तीव्र)"
  }
};

exports.getCurrentRitu = async (req, res) => {
  try {
    const month = new Date().getMonth(); // 0 to 11
    let key = "Vasanta";

    if (month === 0 || month === 1) {
      key = "Shishira";
    } else if (month === 2 || month === 3) {
      key = "Vasanta";
    } else if (month === 4 || month === 5) {
      key = "Grishma";
    } else if (month === 6 || month === 7) {
      key = "Varsha";
    } else if (month === 8 || month === 9) {
      key = "Sharad";
    } else if (month === 10 || month === 11) {
      key = "Hemanta";
    }

    const rituObj = RITUS[key];

    let lang = req.query.lang || req.headers['accept-language'] || (req.user && req.user.preferredLanguage) || 'en';
    lang = lang.toLowerCase();
    if (lang.startsWith('hi')) lang = 'hi';
    else if (lang.startsWith('mr')) lang = 'mr';
    else lang = 'en';

    const ritu = {
      ...rituObj,
      dominant_dosha: rituObj[`dominant_dosha_${lang}`] || rituObj.dominant_dosha_en || rituObj.dominant_dosha
    };

    res.status(200).json({
      success: true,
      ritu
    });
  } catch (error) {
    console.error("getCurrentRitu error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
