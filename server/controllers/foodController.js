const Food = require('../models/Food');

// Common Viruddha Ahara rules list
const INCOMPATIBILITY_RULES = [
  {
    pair: ['Fish', 'Curd'],
    reason: 'Fish and curd are considered incompatible due to opposite digestive properties and may cause digestive disturbances.',
    severity: 'high'
  },
  {
    pair: ['Fish', 'Yogurt'],
    reason: 'Fish combined with yogurt is considered a Viruddha Ahara combination and may impair digestion.',
    severity: 'high'
  },
  {
    pair: ['Watermelon', 'Milk'],
    reason: 'Watermelon digests quickly while milk digests slowly, which may cause digestive discomfort.',
    severity: 'high'
  },
  {
    pair: ['Orange', 'Milk'],
    reason: 'Citrus fruits like orange may curdle milk and lead to indigestion.',
    severity: 'high'
  },
  {
    pair: ['Pineapple', 'Milk'],
    reason: 'Pineapple and milk are considered incompatible and may cause digestive upset.',
    severity: 'high'
  },
  {
    pair: ['Strawberry', 'Milk'],
    reason: 'Sour fruits with milk are traditionally considered difficult to digest.',
    severity: 'medium'
  },
  {
    pair: ['Lemon', 'Yogurt'],
    reason: 'Combining multiple sour foods can aggravate acidity and digestive discomfort.',
    severity: 'medium'
  },
  {
    pair: ['Banana', 'Yogurt'],
    reason: 'Banana and yogurt together may increase Kapha and cause heaviness in digestion.',
    severity: 'medium'
  },
  {
    pair: ['Banana', 'Curd'],
    reason: 'This combination is traditionally considered heavy and mucus-forming.',
    severity: 'medium'
  },
  {
    pair: ['Mango', 'Milk'],
    reason: 'Excessive consumption of mango with milk may be heavy for digestion in some individuals.',
    severity: 'low'
  },
  {
    pair: ['Cheese', 'Milk'],
    reason: 'Combining multiple heavy dairy products may slow digestion.',
    severity: 'low'
  },
  {
    pair: ['Cheese', 'Yogurt'],
    reason: 'Heavy dairy combinations may increase digestive burden and Kapha.',
    severity: 'medium'
  },
  {
    pair: ['Chicken', 'Milk'],
    reason: 'Animal protein and milk are traditionally considered incompatible in Ayurveda.',
    severity: 'high'
  },
  {
    pair: ['Chicken', 'Yogurt'],
    reason: 'Heavy protein combined with fermented dairy may be difficult to digest.',
    severity: 'medium'
  },
  {
    pair: ['Chicken', 'Curd'],
    reason: 'This combination may produce heaviness and sluggish digestion.',
    severity: 'medium'
  },
  {
    pair: ['Tea', 'Milk'],
    reason: 'Tea may reduce the absorption of beneficial compounds present in milk.',
    severity: 'low'
  },
  {
    pair: ['Tea', 'Meals'],
    reason: 'Tea immediately after meals may reduce iron absorption.',
    severity: 'medium'
  },
  {
    pair: ['Coffee', 'Meals'],
    reason: 'Coffee immediately after meals may interfere with iron absorption.',
    severity: 'medium'
  },
  {
    pair: ['Radish', 'Milk'],
    reason: 'Radish and milk are considered incompatible due to opposite digestive effects.',
    severity: 'high'
  },
  {
    pair: ['Brinjal', 'Milk'],
    reason: 'Eggplant (Brinjal) and milk are traditionally considered incompatible.',
    severity: 'medium'
  },
  {
    pair: ['Mushroom', 'Yogurt'],
    reason: 'Mushrooms combined with fermented dairy may be heavy for digestion.',
    severity: 'medium'
  },
  {
    pair: ['Melon', 'Yogurt'],
    reason: 'Melons are best consumed alone as they digest at a different rate.',
    severity: 'high'
  },
  {
    pair: ['Melon', 'Curd'],
    reason: 'Combining melons with curd may lead to digestive discomfort.',
    severity: 'high'
  },
  {
    pair: ['Tomato', 'Milk'],
    reason: 'Acidic tomatoes may curdle milk and cause indigestion.',
    severity: 'medium'
  },
  {
    pair: ['Spinach', 'Milk'],
    reason: 'The combination may affect mineral absorption and digestion.',
    severity: 'low'
  },
  {
    pair: ['Garlic', 'Milk'],
    reason: 'Garlic and milk have contrasting digestive properties.',
    severity: 'low'
  },
  {
    pair: ['Onion', 'Milk'],
    reason: 'Onion and milk are traditionally considered incompatible.',
    severity: 'medium'
  },
  {
    pair: ['Jaggery', 'Milk'],
    reason: 'Heavy sweet combinations may slow digestion in sensitive individuals.',
    severity: 'low'
  }
];

// @desc    Get all foods with search and filters
// @route   GET /api/foods
// @access  Private
exports.getFoods = async (req, res) => {
  const { category, season, rasa, dosha, search } = req.query;

  try {
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (season) {
      query['ayurveda.suitable_season'] = season;
    }

    if (rasa) {
      query['ayurveda.rasa'] = rasa;
    }

    if (dosha) {
      // Filter where dosha effect is "balances"
      query[`ayurveda.dosha_effect.${dosha.toLowerCase()}`] = 'balances';
    }

    const foods = await Food.find(query);

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    console.error('getFoods error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single food detail
// @route   GET /api/foods/:id
// @access  Private
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    res.status(200).json({
      success: true,
      food
    });
  } catch (error) {
    console.error('getFoodById error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Search foods by name
// @route   GET /api/foods/search
// @access  Private
exports.searchFoods = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ success: false, message: 'Please provide a search term' });
  }

  try {
    const foods = await Food.find({
      name: { $regex: q, $options: 'i' }
    });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    console.error('searchFoods error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Check compatibility of multiple foods
// @route   POST /api/foods/check-compatibility
// @access  Private
exports.checkCompatibility = async (req, res) => {
  const { foods } = req.body; // Expects array of strings, e.g. ["Milk", "Fish", "Banana"]

  if (!foods || !Array.isArray(foods) || foods.length < 2) {
    return res.status(200).json({
      success: true,
      compatible: true,
      warnings: []
    });
  }

  try {
    const warnings = [];
    const lowerFoods = foods.map(f => f.trim().toLowerCase());

    // Evaluate combinations
    for (let i = 0; i < lowerFoods.length; i++) {
      for (let j = i + 1; j < lowerFoods.length; j++) {
        const foodA = lowerFoods[i];
        const foodB = lowerFoods[j];

        // Check if this pair triggers any rule
        INCOMPATIBILITY_RULES.forEach((rule) => {
          const rulePairA = rule.pair[0].toLowerCase();
          const rulePairB = rule.pair[1].toLowerCase();

          if (
            (foodA.includes(rulePairA) && foodB.includes(rulePairB)) ||
            (foodA.includes(rulePairB) && foodB.includes(rulePairA))
          ) {
            // Check special rules like Honey + Ghee equal quantities
            if (rule.checkEqualQuantities) {
              warnings.push({
                foods: [rule.pair[0], rule.pair[1]],
                reason: `${rule.reason} (Note: This is specifically dangerous when taken in equal weights/quantities).`,
                severity: 'high'
              });
            } else {
              warnings.push({
                foods: [rule.pair[0], rule.pair[1]],
                reason: rule.reason,
                severity: rule.severity
              });
            }
          }
        });
      }
    }

    // Filter out duplicate warnings if any
    const uniqueWarnings = Array.from(new Set(warnings.map(JSON.stringify))).map(JSON.parse);

    res.status(200).json({
      success: true,
      compatible: uniqueWarnings.length === 0,
      warnings: uniqueWarnings
    });
  } catch (error) {
    console.error('checkCompatibility error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
