export const PRAKRITI_QUESTIONS = [
  {
    id: 'bodyFrame',
    category: 'Body Frame',
    text: 'Describe your physical structure and bone frame:',
    options: [
      { text: 'Thin, bony, tall or very short, with prominent joints and difficulty gaining weight.', dosha: 'Vata' },
      { text: 'Medium build, athletic, well-proportioned, and easy to maintain weight.', dosha: 'Pitta' },
      { text: 'Broad, sturdy, large-boned, with a tendency to gain weight easily and lose it slowly.', dosha: 'Kapha' }
    ]
  },
  {
    id: 'skinType',
    category: 'Skin Type',
    text: 'How does your skin look and feel most of the time?',
    options: [
      { text: 'Dry, rough, cool to touch, and prone to cracking or ashiness.', dosha: 'Vata' },
      { text: 'Warm, sensitive, reddish/fair complexion, prone to acne, freckles, or sunburn.', dosha: 'Pitta' },
      { text: 'Thick, smooth, soft, slightly oily, cool, and clear complexion.', dosha: 'Kapha' }
    ]
  },
  {
    id: 'hairType',
    category: 'Hair Type',
    text: 'Describe your hair quality and texture:',
    options: [
      { text: 'Dry, curly or frizzy, brittle, coarse, and dark brown or black.', dosha: 'Vata' },
      { text: 'Fine, straight, silky, thin, reddish/blonde, or prone to early graying/thinning.', dosha: 'Pitta' },
      { text: 'Thick, wavy, abundant, oily, strong, and dark in color.', dosha: 'Kapha' }
    ]
  },
  {
    id: 'digestionPattern',
    category: 'Digestion Pattern',
    text: 'How does your stomach behave after meals?',
    options: [
      { text: 'Irregular and erratic; prone to gas, bloating, and constipation.', dosha: 'Vata' },
      { text: 'Strong and fast; digests everything easily, but prone to acidity, heartburn, or loose stools.', dosha: 'Pitta' },
      { text: 'Slow and heavy; feels full for a long time, digestion is sluggish, but regular bowels.', dosha: 'Kapha' }
    ]
  },
  {
    id: 'sleepPattern',
    category: 'Sleep Pattern',
    text: 'What are your sleeping habits?',
    options: [
      { text: 'Light, interrupted, easily disturbed by noise, and average 5-6 hours.', dosha: 'Vata' },
      { text: 'Moderate and sound; can sleep easily, average 7-8 hours, and feel rested.', dosha: 'Pitta' },
      { text: 'Deep, heavy, long; hard to wake up in the morning, average 8-10 hours, and prone to sleepiness.', dosha: 'Kapha' }
    ]
  },
  {
    id: 'mentalNature',
    category: 'Mental Nature',
    text: 'How does your mind process information?',
    options: [
      { text: 'Quick-thinking, creative, talks fast, but gets distracted easily and has a restless mind.', dosha: 'Vata' },
      { text: 'Sharp, focused, logical, highly organized, quick-witted, and competitive.', dosha: 'Pitta' },
      { text: 'Calm, steady, patient, slow to learn but has excellent long-term memory.', dosha: 'Kapha' }
    ]
  },
  {
    id: 'emotionalTendency',
    category: 'Emotional Tendency',
    text: 'How do you react to stressful situations?',
    options: [
      { text: 'Prone to anxiety, worry, fear, and feeling overwhelmed or nervous.', dosha: 'Vata' },
      { text: 'Prone to anger, irritation, impatience, and aggressive behavior.', dosha: 'Pitta' },
      { text: 'Calm, loving, composed, stable, but can become lazy, attached, or complacent.', dosha: 'Kapha' }
    ]
  },
  {
    id: 'energyLevel',
    category: 'Energy Level',
    text: 'Describe your physical energy and stamina:',
    options: [
      { text: 'Hyperactive or bursts of high energy, but tires out very quickly and needs frequent rest.', dosha: 'Vata' },
      { text: 'Moderate energy, driven, determined, and will push through fatigue to finish a goal.', dosha: 'Pitta' },
      { text: 'Steady, enduring stamina; slow to start but can work long hours without tiring.', dosha: 'Kapha' }
    ]
  },
  {
    id: 'appetitePattern',
    category: 'Appetite Pattern',
    text: 'How is your appetite throughout the day?',
    options: [
      { text: 'Variable; I forget to eat, or get hungry at irregular times. Digestion varies.', dosha: 'Vata' },
      { text: 'Intense and sharp; I cannot skip meals without feeling angry ("hangry") or weak.', dosha: 'Pitta' },
      { text: 'Moderate and steady; I can easily skip a meal without feeling weak or irritated.', dosha: 'Kapha' }
    ]
  },
  {
    id: 'weatherPreference',
    category: 'Weather Preference',
    text: 'Which weather is most uncomfortable for you?',
    options: [
      { text: 'Cold, windy, and dry weather makes me feel stiff and uncomfortable.', dosha: 'Vata' },
      { text: 'Hot, sunny, and humid weather makes me feel hot, sweat excessively, and get irritated.', dosha: 'Pitta' },
      { text: 'Cold, damp, cloudy, and rainy weather makes me feel heavy, congested, and lazy.', dosha: 'Kapha' }
    ]
  }
];

export const calculateDoshaResult = (answers) => {
  let vata = 0;
  let pitta = 0;
  let kapha = 0;

  const categories = Object.keys(answers);
  categories.forEach((key) => {
    const value = answers[key];
    if (value === 'Vata') vata++;
    else if (value === 'Pitta') pitta++;
    else if (value === 'Kapha') kapha++;
  });

  const total = categories.length;
  if (total === 0) {
    return {
      dominant: 'Undetermined',
      distribution: { vata: 0, pitta: 0, kapha: 0 }
    };
  }

  const distribution = {
    vata: Math.round((vata / total) * 100),
    pitta: Math.round((pitta / total) * 100),
    kapha: Math.round((kapha / total) * 100)
  };

  const scores = [
    { name: 'Vata', value: vata },
    { name: 'Pitta', value: pitta },
    { name: 'Kapha', value: kapha }
  ];

  scores.sort((a, b) => b.value - a.value);

  // If top two are within 1 point of each other, it's a dual constitution
  let dominant = '';
  if (scores[0].value - scores[1].value <= 1) {
    dominant = `${scores[0].name}-${scores[1].name}`;
  } else {
    dominant = scores[0].name;
  }

  return { dominant, distribution };
};
