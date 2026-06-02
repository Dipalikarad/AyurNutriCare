import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Plus, X, AlertTriangle, ShieldCheck, Flame, Droplet, Wind, Sparkles } from 'lucide-react';

const foods = [
  // Dairy
  { id: 1, name: "Milk (Dugdha)", name_mr: "दूध", name_hi: "दूध", category: "Dairy", virya: "cold" },
  { id: 2, name: "Curd / Yogurt (Dadhi)", name_mr: "दही", name_hi: "दही", category: "Dairy", virya: "hot" },
  { id: 3, name: "Buttermilk (Takra)", name_mr: "ताक", name_hi: "छाछ", category: "Dairy", virya: "cold" },
  { id: 4, name: "Ghee (Ghrita)", name_mr: "तूप", name_hi: "घी", category: "Dairy", virya: "cold" },
  { id: 5, name: "Paneer", name_mr: "पनीर", name_hi: "पनीर", category: "Dairy", virya: "cold" },
  { id: 6, name: "Cream (Malai)", name_mr: "मलाई", name_hi: "मलाई", category: "Dairy", virya: "cold" },
  // Fruits
  { id: 7, name: "Banana (Kadali)", name_mr: "केळ", name_hi: "केला", category: "Fruit", virya: "cold" },
  { id: 8, name: "Mango (Aam)", name_mr: "आंबा", name_hi: "आम", category: "Fruit", virya: "hot" },
  { id: 9, name: "Pomegranate (Anar)", name_mr: "डाळिंब", name_hi: "अनार", category: "Fruit", virya: "cold" },
  { id: 10, name: "Lemon (Nimbu)", name_mr: "लिंबू", name_hi: "नींबू", category: "Fruit", virya: "hot" },
  { id: 11, name: "Amla (Indian Gooseberry)", name_mr: "आवळा", name_hi: "आंवला", category: "Fruit", virya: "cold" },
  { id: 12, name: "Papaya (Papita)", name_mr: "पपई", name_hi: "पपीता", category: "Fruit", virya: "hot" },
  // Vegetables
  { id: 13, name: "Bottle Gourd (Lauki)", name_mr: "दुधी भोपळा", name_hi: "लौकी", category: "Vegetable", virya: "cold" },
  { id: 14, name: "Radish (Mooli)", name_mr: "मुळा", name_hi: "मूली", category: "Vegetable", virya: "hot" },
  { id: 15, name: "Spinach (Palak)", name_mr: "पालक", name_hi: "पालक", category: "Vegetable", virya: "cold" },
  { id: 16, name: "Brinjal (Baingan)", name_mr: "वांगे", name_hi: "बैंगन", category: "Vegetable", virya: "hot" },
  { id: 17, name: "Potato (Aloo)", name_mr: "बटाटा", name_hi: "आलू", category: "Vegetable", virya: "cold" },
  { id: 18, name: "Tomato (Tamatar)", name_mr: "टोमॅटो", name_hi: "टमाटर", category: "Vegetable", virya: "hot" },
  { id: 19, name: "Onion (Pyaz)", name_mr: "कांदा", name_hi: "प्याज", category: "Vegetable", virya: "hot" },
  { id: 20, name: "Garlic (Lahsun)", name_mr: "लसूण", name_hi: "लहसुन", category: "Vegetable", virya: "hot" },
  { id: 21, name: "Bitter Gourd (Karela)", name_mr: "कारले", name_hi: "करेला", category: "Vegetable", virya: "cold" },
  { id: 22, name: "Drumstick (Shevga)", name_mr: "शेवगा", name_hi: "सहजन", category: "Vegetable", virya: "hot" },
  // Grains
  { id: 23, name: "White Rice (Shali)", name_mr: "पांढरा भात", name_hi: "चावल", category: "Grain", virya: "cold" },
  { id: 24, name: "Wheat (Godhuma)", name_mr: "गहू", name_hi: "गेहूं", category: "Grain", virya: "cold" },
  { id: 25, name: "Bajra (Pearl Millet)", name_mr: "बाजरी", name_hi: "बाजरा", category: "Grain", virya: "hot" },
  { id: 26, name: "Jowar (Sorghum)", name_mr: "ज्वारी", name_hi: "ज्वार", category: "Grain", virya: "cold" },
  { id: 27, name: "Ragi (Nachni)", name_mr: "नाचणी", name_hi: "रागी", category: "Grain", virya: "cold" },
  // Legumes
  { id: 28, name: "Moong Dal", name_mr: "मूग डाळ", name_hi: "मूंग दाल", category: "Legume", virya: "cold" },
  { id: 29, name: "Chana Dal", name_mr: "चना डाळ", name_hi: "चना दाल", category: "Legume", virya: "hot" },
  { id: 30, name: "Urad Dal", name_mr: "उडीद डाळ", name_hi: "उड़द दाल", category: "Legume", virya: "hot" },
  { id: 31, name: "Masoor Dal (Red Lentil)", name_mr: "मसूर डाळ", name_hi: "मसूर दाल", category: "Legume", virya: "hot" },
  { id: 32, name: "Toor Dal (Arhar)", name_mr: "तूर डाळ", name_hi: "अरहर (तूर) दाल", category: "Legume", virya: "cold" },
  // Proteins
  { id: 33, name: "Fish (Matsya)", name_mr: "मासे", name_hi: "मछली", category: "Protein", virya: "hot" },
  { id: 34, name: "Chicken (Kukkuta)", name_mr: "चिकन", name_hi: "चिकन", category: "Protein", virya: "hot" },
  { id: 35, name: "Eggs (Anda)", name_mr: "अंडे", name_hi: "अंडा", category: "Protein", virya: "hot" },
  // Condiments & Spices
  { id: 36, name: "Honey (Madhu)", name_mr: "मध", name_hi: "शह़द", category: "Condiment", virya: "hot" },
  { id: 37, name: "Jaggery (Gur)", name_mr: "गूळ", name_hi: "गुड़", category: "Condiment", virya: "hot" },
  { id: 38, name: "Salt (Saindhav)", name_mr: "सैंधव मीठ", name_hi: "नमक", category: "Condiment", virya: "hot" },
  { id: 39, name: "Turmeric (Haldi)", name_mr: "हळद", name_hi: "हल्दी", category: "Spice", virya: "hot" },
  { id: 40, name: "Ginger (Adrak)", name_mr: "आले", name_hi: "अदरक", category: "Spice", virya: "hot" },
  { id: 41, name: "Cumin (Jeera)", name_mr: "जिरे", name_hi: "जीरा", category: "Spice", virya: "hot" },
  { id: 42, name: "Coriander (Dhania)", name_mr: "धणे", name_hi: "धनिया", category: "Spice", virya: "cold" },
  { id: 43, name: "Black Pepper (Kali Mirch)", name_mr: "काळी मिरी", name_hi: "काली मिर्च", category: "Spice", virya: "hot" },
  { id: 44, name: "Cardamom (Elaichi)", name_mr: "वेलदोडा", name_hi: "इलायची", category: "Spice", virya: "cold" },
  { id: 45, name: "Fenugreek (Methi)", name_mr: "मेथी", name_hi: "मेथी", category: "Spice", virya: "hot" },
  { id: 46, name: "Asafoetida (Hing)", name_mr: "हिंग", name_hi: "हींग", category: "Spice", virya: "hot" },
  // Herbs
  { id: 47, name: "Basil (Tulsi)", name_mr: "तुळस", name_hi: "तुलसी", category: "Herb", virya: "hot" },
  { id: 48, name: "Mint (Pudina)", name_mr: "पुदिना", name_hi: "पुदीना", category: "Herb", virya: "cold" },
  { id: 49, name: "Curry Leaves (Kadi Patta)", name_mr: "कढीपत्ता", name_hi: "करी पत्ता", category: "Herb", virya: "hot" },
  { id: 50, name: "Triphala", name_mr: "त्रिफळा", name_hi: "त्रिफला", category: "Herb", virya: "cold" },
];

const incompatibilities = [
  {
    foods: ["Milk", "Fish"],
    severity: "high",
    reason_en: "Opposite Virya (Milk=cold, Fish=hot). Creates skin disorders (Kushtha), toxic Ama.",
    reason_mr: "विपरीत वीर्य — दूध थंड, मासे उष्ण. त्वचारोग आणि आम निर्माण होते.",
    reason_hi: "विपरीत वीर्य (दूध = ठंडा, मछली = गर्म)। त्वचा रोग (कुष्ठ) और विषाक्त आम का निर्माण करता है।",
    classical_ref: "Charaka Samhita, Sutrasthana 26",
    aggravates: ["Pitta"]
  },
  {
    foods: ["Milk", "Curd"],
    severity: "high",
    reason_en: "Both dairy but opposite properties. Curd is Abhishyandi (blocks channels), together they cause heaviness and Kapha disorders.",
    reason_mr: "दूध आणि दही एकत्र जड असतात. कफ विकार होतात.",
    reason_hi: "दोनों डेयरी उत्पाद हैं लेकिन इनके गुण विपरीत हैं। दही अभिष्यंदी (चैनलों को अवरुद्ध करने वाला) है, साथ में ये भारीपन और कफ विकार पैदा करते हैं।",
    classical_ref: "Ashtanga Hridayam, Sutrasthana 7",
    aggravates: ["Kapha", "Pitta"]
  },
  {
    foods: ["Milk", "Salt"],
    severity: "high",
    reason_en: "Salt is Virya-viruddha with Milk. Causes skin diseases and disturbs Rasa Dhatu.",
    reason_mr: "मीठ आणि दूध एकत्र रस धातूला हानी करतात.",
    reason_hi: "नमक दूध के साथ वीर्य-विरुद्ध है। त्वचा रोगों का कारण बनता है और रस धातु को प्रभावित करता है।",
    classical_ref: "Charaka Samhita",
    aggravates: ["Pitta"]
  },
  {
    foods: ["Milk", "Lemon"],
    severity: "high",
    reason_en: "Sour fruits curdle Milk, creating indigestible compounds that block Srotas (channels).",
    reason_mr: "आंबट फळे दुधाला फाडतात. स्रोतस अवरोध होतो.",
    reason_hi: "खट्टे फल दूध को फाड़ देते हैं, जिससे अपच पैदा करने वाले तत्व बनते हैं जो स्रोतस (चैनलों) को अवरुद्ध करते हैं।",
    classical_ref: "Charaka Samhita, Sutrasthana 26",
    aggravates: ["Pitta", "Kapha"]
  },
  {
    foods: ["Milk", "Banana"],
    severity: "medium",
    reason_en: "Opposite qualities — creates heaviness, stimulates excess Kapha and mucus, impairs Agni.",
    reason_mr: "विरुद्ध गुण — जडपणा येतो, कफ वाढतो.",
    reason_hi: "विपरीत गुण — भारीपन पैदा करता है, अतिरिक्त कफ और बलगम बढ़ाता है, और जठराग्नि को कमजोर करता है।",
    classical_ref: "Classical Ayurvedic texts",
    aggravates: ["Kapha"]
  },
  {
    foods: ["Milk", "Radish"],
    severity: "high",
    reason_en: "Radish is hot and pungent; Milk is cold and sweet. Together cause Viruddha Virya reaction.",
    reason_mr: "मुळा उष्ण-तिखट, दूध थंड-गोड — विरुद्ध वीर्य प्रतिक्रिया.",
    reason_hi: "मूली गर्म और तीखी होती है; दूध ठंडा और मीठा होता है। साथ में वीर्य-विरुद्ध प्रतिक्रिया करते हैं।",
    classical_ref: "Charaka Samhita",
    aggravates: ["Pitta", "Vata"]
  },
  {
    foods: ["Honey", "Ghee"],
    severity: "high",
    reason_en: "Equal quantities of Honey and Ghee are toxic (Samana Matra Viruddha). Use different proportions only.",
    reason_mr: "समान प्रमाणात मध आणि तूप विषासमान आहे.",
    reason_hi: "शह़द और घी की समान मात्रा विषाक्त होती है (समान मात्रा विरुद्ध)। केवल अलग-अलग अनुपात में ही उपयोग करें।",
    classical_ref: "Charaka Samhita, Sutrasthana 26 — most cited Viruddha",
    aggravates: ["Vata", "Pitta", "Kapha"]
  },
  {
    foods: ["Honey", "Hot drinks"],
    severity: "high",
    reason_en: "Heating Honey above 40°C creates Ama and toxic compounds (Hydroxymethylfurfural). Never add honey to hot tea/milk.",
    reason_mr: "मध गरम केल्यावर विषारी बनतो. कधीही गरम चहा/दुधात घालू नका.",
    reason_hi: "शहद को 40 डिग्री सेल्सियस से ऊपर गर्म करने से आम और विषाक्त तत्व बनते हैं। गर्म चाय या दूध में कभी भी शहद न मिलाएं।",
    classical_ref: "Charaka Samhita, Sutrasthana 26",
    aggravates: ["Pitta"]
  },
  {
    foods: ["Fish", "Jaggery"],
    severity: "medium",
    reason_en: "Fish and Jaggery are incompatible — together create Ama and can cause skin disorders.",
    reason_mr: "मासे आणि गूळ एकत्र आम निर्माण करतात.",
    reason_hi: "मछली और गुड़ असंगत हैं — साथ में आम पैदा करते हैं और त्वचा विकारों का कारण बन सकते हैं।",
    classical_ref: "Charaka Samhita",
    aggravates: ["Pitta"]
  },
  {
    foods: ["Curd", "Onion"],
    severity: "medium",
    reason_en: "Curd and onion together may aggravate Kapha and cause digestive discomfort.",
    reason_mr: "दही आणि कांदा एकत्र घेतल्यास कफ वाढू शकतो आणि पचनास त्रास होऊ शकतो.",
    reason_hi: "दही और प्याज का संयोजन कफ बढ़ा सकता है और पाचन संबंधी परेशानी पैदा कर सकता है।",
    classical_ref: "Traditional Ayurvedic references",
    aggravates: ["Kapha"]
  }
];

const CompatibilityChecker = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';

  const [selectedFoods, setSelectedFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [suggestions, setSuggestions] = useState([]);

  const [evalResult, setEvalResult] = useState({
    status: 'perfect',
    score: 100,
    warnings: [],
    aggravatedDoshas: []
  });

  const categories = ['All', 'Dairy', 'Fruit', 'Vegetable', 'Grain', 'Legume', 'Protein', 'Spice', 'Herb', 'Condiment'];

  // Filter suggestion list
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = foods.filter(food => {
      const matchSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.name_mr && food.name_mr.includes(searchQuery)) ||
        (food.name_hi && food.name_hi.includes(searchQuery));
      const matchCategory = selectedCategory === 'All' || food.category === selectedCategory;
      const isNotSelected = !selectedFoods.some(selected => selected.id === food.id);
      return matchSearch && matchCategory && isNotSelected;
    }).slice(0, 5);

    setSuggestions(filtered);
  }, [searchQuery, selectedCategory, selectedFoods]);

  // Compatibility Checker Evaluator
  const runEvaluation = (selectedList) => {
    if (selectedList.length < 2) {
      setEvalResult({ status: 'perfect', score: 100, warnings: [], aggravatedDoshas: [] });
      return;
    }

    const warnings = [];
    let score = 100;
    const aggravatedSet = new Set();

    // Check incompatibilities
    for (let i = 0; i < selectedList.length; i++) {
      for (let j = i + 1; j < selectedList.length; j++) {
        const foodA = selectedList[i];
        const foodB = selectedList[j];
        const pair = [foodA.name, foodB.name];

        const rule = incompatibilities.find(r =>
          r.foods.every(f => pair.some(p => p.toLowerCase().includes(f.toLowerCase())))
        );

        if (rule && rule.severity !== 'low') {
          warnings.push({
            pair: [foodA, foodB],
            rule
          });

          if (rule.severity === 'high') {
            score -= 35;
          } else if (rule.severity === 'medium') {
            score -= 20;
          }

          if (rule.aggravates) {
            rule.aggravates.forEach(d => aggravatedSet.add(d));
          }
        }
      }
    }

    // Check thermal mismatch (Opposite Virya)
    let coldCount = 0;
    let hotCount = 0;
    selectedList.forEach(f => {
      if (f.virya === 'cold') coldCount++;
      if (f.virya === 'hot') hotCount++;
    });

    if (coldCount > 0 && hotCount > 0 && warnings.length === 0) {
      // Small deduction for opposite thermal potencies if no severe rules triggered
      score -= 10;
      aggravatedSet.add("Vata");
    }

    const finalScore = Math.max(0, score);
    let status = 'perfect';
    if (warnings.some(w => w.rule.severity === 'high')) {
      status = 'incompatible';
    } else if (warnings.length > 0 || finalScore < 90) {
      status = 'caution';
    }

    setEvalResult({
      status,
      score: finalScore,
      warnings,
      aggravatedDoshas: Array.from(aggravatedSet)
    });
  };

  const handleAddFood = (food) => {
    const updated = [...selectedFoods, food];
    setSelectedFoods(updated);
    setSearchQuery('');
    setSuggestions([]);
    runEvaluation(updated);
  };

  const handleRemoveFood = (foodId) => {
    const updated = selectedFoods.filter(f => f.id !== foodId);
    setSelectedFoods(updated);
    runEvaluation(updated);
  };

  const clearAll = () => {
    setSelectedFoods([]);
    setEvalResult({ status: 'perfect', score: 100, warnings: [], aggravatedDoshas: [] });
  };

  const getFoodLocalizedName = (food) => {
    if (!food) return '';
    if (lang === 'mr') return food.name_mr || food.name;
    if (lang === 'hi') return food.name_hi || food.name;
    return food.name;
  };

  const getCategoryLocalizedName = (cat) => {
    if (cat === 'All') return t('checker.allChip', 'All');
    return t(`checker.category.${cat.toLowerCase()}`, cat);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">

      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-150/70 dark:border-sage/15 pb-6"
      >
        <div>
          <h1 className="font-playfair text-3xl sm:text-4xl font-black text-earth dark:text-white transition-colors duration-300">
            {t('checker.title')}
          </h1>
          <p className="text-gray-500 dark:text-white/45 text-sm font-semibold mt-1.5 max-w-2xl leading-relaxed transition-colors duration-300">
            {t('checker.subtitle')}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearAll}
          className="px-4 py-2 text-xs font-bold text-earth dark:text-white/80 bg-gray-100 hover:bg-gray-200 dark:bg-herbal-dark dark:hover:bg-herbal-dark/80 rounded-xl transition-all cursor-pointer border border-gray-200 dark:border-sage/20 shadow-sm"
        >
          {t('checker.clearPlate', 'Clear Plate')}
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (2 Cols): Selection Plate */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white dark:bg-herbal rounded-[32px] p-6 border border-gray-100 dark:border-sage/15 shadow-sm space-y-6 transition-colors duration-300">
            <div>
              <h3 className="font-playfair text-xl font-bold text-earth dark:text-white">
                {t('checker.plateTitle')}
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-white/45 font-bold uppercase tracking-widest mt-1">
                {t('checker.plateSubtitle')}
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 pb-1 border-b border-gray-50 dark:border-sage/10 max-h-[84px] overflow-y-auto scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] px-3 py-1.5 rounded-full font-bold border transition-all cursor-pointer ${selectedCategory === cat
                    ? 'bg-sage text-white border-sage shadow-sm shadow-sage/10'
                    : 'bg-gray-50/50 dark:bg-herbal-dark/30 text-gray-400 dark:text-white/40 border-gray-250/70 dark:border-sage/10 hover:bg-gray-100 dark:hover:bg-herbal-dark/60'
                    }`}
                >
                  {getCategoryLocalizedName(cat)}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  placeholder={t('checker.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 py-3.5 block w-full border border-gray-250/70 dark:border-sage/25 rounded-2xl focus:ring-sage focus:border-sage text-sm outline-none bg-gray-50/40 dark:bg-herbal-dark/30 text-earth dark:text-white transition-all font-semibold"
                />
              </div>

              {/* Autocomplete suggestions */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 right-0 mt-2 bg-white/95 dark:bg-herbal/95 backdrop-blur-md border border-gray-150 dark:border-sage/25 rounded-2xl shadow-xl z-20 divide-y divide-gray-50 dark:divide-sage/15 overflow-hidden"
                  >
                    {suggestions.map((food) => (
                      <button
                        key={food.id}
                        onClick={() => handleAddFood(food)}
                        className="w-full text-left px-5 py-3.5 hover:bg-sage/10 dark:hover:bg-sage text-sm font-bold text-earth dark:text-white flex justify-between items-center transition-all cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-earth dark:text-white">{getFoodLocalizedName(food)}</span>
                          {lang !== 'en' && <span className="text-[10px] text-gray-400 dark:text-white/45 mt-0.5">{food.name}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-sage/10 text-sage dark:text-sage-light px-2.5 py-0.5 rounded-md uppercase font-extrabold tracking-wider">{t(`checker.category.${food.category.toLowerCase()}`, food.category)}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-md uppercase font-extrabold tracking-wider ${food.virya === 'cold' ? 'bg-blue-500/10 text-blue-500' : 'bg-saffron/10 text-saffron-dark dark:text-saffron'}`}>{t(`virya.${food.virya}`, food.virya)}</span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Removable chips of selected foods */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-earth/50 dark:text-white/40 uppercase tracking-widest">
                {t('checker.selectedTitle', 'Selected Ingredients')}
              </span>

              {selectedFoods.length === 0 ? (
                <div className="text-center py-16 bg-gray-50/50 dark:bg-herbal-dark/20 rounded-2xl border border-dashed border-gray-200 dark:border-sage/20 text-xs text-gray-455 dark:text-white/40 font-bold transition-all duration-300">
                  {t('checker.noFoodsSelected')}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  <AnimatePresence>
                    {selectedFoods.map((food) => (
                      <motion.span
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key={food.id}
                        className="bg-gradient-to-r from-sage to-sage-dark text-white text-xs font-bold pl-3.5 pr-2.5 py-2 rounded-full flex items-center gap-1.5 shadow-sm shadow-sage/10"
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-extrabold">{getFoodLocalizedName(food)}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFood(food.id)}
                          className="text-sage-light hover:text-white transition-colors cursor-pointer ml-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Quick Browse Grid */}
            <div className="space-y-3 pt-2">
              <span className="block text-[10px] font-bold text-earth/50 dark:text-white/40 uppercase tracking-widest">
                {t('checker.quickAdd', 'Quick Add Ingredients')}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                {foods
                  .filter(f => selectedCategory === 'All' || f.category === selectedCategory)
                  .filter(f => !selectedFoods.some(sel => sel.id === f.id))
                  .slice(0, 12)
                  .map(food => (
                    <button
                      key={food.id}
                      onClick={() => handleAddFood(food)}
                      className="text-left px-3 py-2 bg-gray-50/50 dark:bg-herbal-dark/30 hover:bg-sage/10 dark:hover:bg-sage/15 border border-gray-150 dark:border-sage/10 rounded-xl text-xs font-bold text-earth dark:text-white flex justify-between items-center transition-all cursor-pointer"
                    >
                      <span className="truncate">{getFoodLocalizedName(food).split(' ')[0]}</span>
                      <Plus className="w-3.5 h-3.5 text-sage" />
                    </button>
                  ))
                }
              </div>
            </div>

          </div>
        </motion.div>

        {/* Right Column: Dynamic Agni Meter & Result Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Main Card */}
          <div className="bg-white dark:bg-herbal rounded-[32px] p-6 border border-gray-100 dark:border-sage/15 shadow-sm space-y-6 transition-colors duration-300 flex flex-col justify-between min-h-[460px]">
            <div className="space-y-6">
              <h3 className="font-playfair text-xl font-bold text-earth dark:text-white border-b border-gray-50 dark:border-sage/10 pb-3 flex items-center gap-2">
                {t('checker.evalResultTitle')}
              </h3>

              {selectedFoods.length < 2 ? (
                <div className="text-center py-20 text-xs text-gray-400 dark:text-white/40 font-semibold space-y-3">
                  <Flame className="w-14 h-14 text-gray-250 dark:text-white/10 mx-auto animate-pulse" />
                  <p>{t('checker.selectMinIngredients')}</p>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Agni digestive fire meter */}
                  <div className="text-center space-y-2.5">
                    <span className="text-[10px] text-gray-405 dark:text-white/40 font-extrabold uppercase tracking-wider">
                      {t('checker.impact', 'Agni Digestive Impact')}
                    </span>

                    <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                      {/* Gauge circle background */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="52"
                          strokeWidth="8"
                          stroke="currentColor"
                          className="text-gray-100 dark:text-herbal-dark"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="52"
                          strokeWidth="8"
                          strokeDasharray={326.7}
                          initial={{ strokeDashoffset: 326.7 }}
                          animate={{ strokeDashoffset: 326.7 - (326.7 * evalResult.score) / 100 }}
                          stroke={
                            evalResult.score >= 90 ? '#10B981' : // emerald
                              evalResult.score >= 60 ? '#F59E0B' : // amber
                                '#EF4444' // rose
                          }
                          strokeLinecap="round"
                          fill="transparent"
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </svg>
                      {/* Score display with flame icon */}
                      <div className="absolute flex flex-col items-center justify-center">
                        <Flame className={`w-6 h-6 animate-pulse ${evalResult.score >= 90 ? 'text-emerald-500' :
                          evalResult.score >= 60 ? 'text-amber-500' :
                            'text-rose-500'
                          }`} />
                        <span className="text-2xl font-black text-earth dark:text-white mt-0.5">{evalResult.score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Dosha aggravation tags */}
                  {evalResult.aggravatedDoshas.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-[9px] font-bold text-earth/50 dark:text-white/40 uppercase tracking-widest">
                        {t('checker.aggravated', 'Aggravated Doshas')}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {evalResult.aggravatedDoshas.map(d => (
                          <span
                            key={d}
                            className={`text-[9px] px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-wider flex items-center gap-1 ${d === 'Vata' ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' :
                              d === 'Pitta' ? 'bg-saffron/10 text-saffron-dark dark:text-saffron' :
                                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              }`}
                          >
                            {d === 'Vata' ? <Wind className="w-3 h-3" /> : d === 'Pitta' ? <Flame className="w-3 h-3" /> : <Droplet className="w-3 h-3" />}
                            {d === 'Vata' ? t('profile.constitVata') : d === 'Pitta' ? t('profile.constitPitta') : t('profile.constitKapha')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings and Conflicts logs */}
                  <div className="space-y-3 pt-2">
                    <span className="block text-[9px] font-bold text-earth/50 dark:text-white/40 uppercase tracking-widest">
                      {t('checker.detailedAnalysis', 'Detailed Analysis')}
                    </span>

                    {evalResult.warnings.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-100 dark:border-emerald-950/20 text-center space-y-2">
                        <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                        <h4 className="font-playfair text-sm font-bold text-emerald-800 dark:text-emerald-400">{t('checker.compatibleTitle')}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-white/40 leading-relaxed font-semibold">
                          {t('checker.compatibleDesc')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                        {evalResult.warnings.map((warn, index) => (
                          <div
                            key={index}
                            className={`p-3.5 border rounded-2xl text-[11px] space-y-1.5 transition-all ${warn.rule.severity === 'high' ? 'bg-rose-500/5 border-rose-250 shadow-inner' :
                              'bg-amber-500/5 border-amber-250 shadow-inner'
                              }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-earth dark:text-white text-xs">
                                ❌ {`${getFoodLocalizedName(warn.pair[0])} + ${getFoodLocalizedName(warn.pair[1])}`}
                              </span>
                              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${warn.rule.severity === 'high' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                {t('checker.hazardTag', { severity: t(`checker.${warn.rule.severity}`, warn.rule.severity) })}
                              </span>
                            </div>

                            <p className="text-gray-500 dark:text-white/60 leading-relaxed font-semibold">
                              {lang === 'mr' ? warn.rule.reason_mr : lang === 'hi' ? warn.rule.reason_hi : warn.rule.reason_en}
                            </p>

                            <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-white/40 border-t border-gray-100 dark:border-sage/10 pt-1.5 mt-1 font-bold">
                              <span>Ref: {warn.rule.classical_ref}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Tip section */}
            <div className="text-[10px] text-gray-450 dark:text-white/40 mt-6 pt-4 border-t border-gray-100 dark:border-sage/15 italic leading-relaxed font-semibold flex items-start gap-1.5 transition-colors duration-300">
              <Sparkles className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
              <span>
                {t('checker.tipText')}
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default CompatibilityChecker;
