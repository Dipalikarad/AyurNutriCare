const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const DietPlan = require('../models/DietPlan');

// Helper to calculate dominant Dosha from quiz answers
// Answers should be a map of: { categoryName: "Vata" | "Pitta" | "Kapha" }
const calculateDominantDosha = (answers) => {
  let vata = 0;
  let pitta = 0;
  let kapha = 0;

  // Convert map or object to entries
  const entries = answers instanceof Map ? Array.from(answers.values()) : Object.values(answers);

  if (entries.length === 0) {
    return { dominant: 'Undetermined', distribution: { vata: 0, pitta: 0, kapha: 0 } };
  }

  entries.forEach((dosha) => {
    if (dosha === 'Vata') vata++;
    else if (dosha === 'Pitta') pitta++;
    else if (dosha === 'Kapha') kapha++;
  });

  const total = entries.length;
  const distribution = {
    vata: Math.round((vata / total) * 100),
    pitta: Math.round((pitta / total) * 100),
    kapha: Math.round((kapha / total) * 100)
  };

  // Find dominant
  let dominant = '';
  const scores = [
    { name: 'Vata', value: vata },
    { name: 'Pitta', value: pitta },
    { name: 'Kapha', value: kapha }
  ];

  // Sort descending
  scores.sort((a, b) => b.value - a.value);

  // If there's a tie or top two are within 1 point of each other, it's a dual-dosha
  if (scores[0].value - scores[1].value <= 1 && total >= 8) {
    dominant = `${scores[0].name}-${scores[1].name}`;
  } else {
    dominant = scores[0].name;
  }

  return { dominant, distribution };
};

// @desc    Get Prakriti quiz result
// @route   GET /api/patient/prakriti/:patientId
// @access  Private
exports.getPrakriti = async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.params.patientId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    res.status(200).json({
      success: true,
      dominantDosha: profile.dominantDosha,
      doshaDistribution: profile.doshaDistribution,
      prakritiAnswers: profile.prakritiAnswers
    });
  } catch (error) {
    console.error('getPrakriti error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Save Prakriti quiz answers and calculate Dosha
// @route   POST /api/patient/prakriti
// @access  Private (Patient only)
exports.savePrakriti = async (req, res) => {
  const { answers } = req.body; // Expects object: { BodyFrame: "Vata", SkinType: "Pitta", ... }

  if (!answers || Object.keys(answers).length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide quiz answers' });
  }

  try {
    let profile = await PatientProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new PatientProfile({ userId: req.user.id });
    }

    const { dominant, distribution } = calculateDominantDosha(answers);

    profile.prakritiAnswers = answers;
    profile.dominantDosha = dominant;
    profile.doshaDistribution = distribution;
    profile.updatedAt = Date.now();

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Prakriti assessment saved successfully',
      dominantDosha: dominant,
      doshaDistribution: distribution
    });
  } catch (error) {
    console.error('savePrakriti error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all patients
// @route   GET /api/patient
// @access  Private (Dietitian only)
exports.getPatients = async (req, res) => {
  try {
    // Find all users with role 'patient'
    const patients = await User.find({ role: 'patient' }).select('-password');
    
    // Map with profile details
    const patientsWithProfiles = await Promise.all(
      patients.map(async (pat) => {
        const profile = await PatientProfile.findOne({ userId: pat._id }).populate('dietitianId', 'name email');
        return {
          _id: pat._id,
          name: pat.name,
          email: pat.email,
          phone: pat.phone,
          createdAt: pat.createdAt,
          dominantDosha: profile ? profile.dominantDosha : 'Undetermined',
          doshaDistribution: profile ? profile.doshaDistribution : { vata: 0, pitta: 0, kapha: 0 },
          medicalHistory: profile ? profile.medicalHistory : [],
          age: profile ? profile.age : null,
          weight: profile ? profile.weight : null,
          height: profile ? profile.height : null,
          gender: profile ? profile.gender : null,
          dietitian: profile && profile.dietitianId ? profile.dietitianId : null
        };
      })
    );

    res.status(200).json({
      success: true,
      count: patientsWithProfiles.length,
      patients: patientsWithProfiles
    });
  } catch (error) {
    console.error('getPatients error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get patient profile (Combined user info + wellness profile)
// @route   GET /api/patient/:patientId
// @access  Private
exports.getPatientProfile = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    // Verify authorized user
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ success: false, message: 'Unauthorized profile access' });
    }

    const user = await User.findById(patientId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Patient user not found' });
    }

    let profile = await PatientProfile.findOne({ userId: patientId }).populate('dietitianId', 'name email');
    if (!profile) {
      // Lazy init if profile is missing
      profile = await PatientProfile.create({ userId: patientId });
    }

    res.status(200).json({
      success: true,
      patient: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        dominantDosha: profile.dominantDosha,
        doshaDistribution: profile.doshaDistribution,
        prakritiAnswers: profile.prakritiAnswers,
        medicalHistory: profile.medicalHistory,
        hydrationLog: profile.hydrationLog,
        complianceLog: profile.complianceLog,
        dietitian: profile.dietitianId
      }
    });
  } catch (error) {
    console.error('getPatientProfile error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update patient personal wellness details
// @route   PUT /api/patient/profile
// @access  Private (Patient only)
exports.updatePatientProfile = async (req, res) => {
  const { age, gender, height, weight } = req.body;

  try {
    let profile = await PatientProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new PatientProfile({ userId: req.user.id });
    }

    if (age !== undefined) profile.age = age;
    if (gender !== undefined) profile.gender = gender;
    if (height !== undefined) profile.height = height;
    if (weight !== undefined) {
      profile.weight = weight;
      
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${d.getFullYear()}-${month}-${day}`;

      if (!profile.weightHistory) {
        profile.weightHistory = [];
      }
      const existingIdx = profile.weightHistory.findIndex(wh => wh.date === dateStr);
      if (existingIdx > -1) {
        profile.weightHistory[existingIdx].weight = weight;
      } else {
        profile.weightHistory.push({ date: dateStr, weight });
      }
    }
    
    profile.updatedAt = Date.now();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile details updated successfully',
      profile
    });
  } catch (error) {
    console.error('updatePatientProfile error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update patient medical history
// @route   PUT /api/patient/:patientId/medical-history
// @access  Private (Dietitian only)
exports.updateMedicalHistory = async (req, res) => {
  const { medicalHistory } = req.body; // Expects array of strings

  if (!Array.isArray(medicalHistory)) {
    return res.status(400).json({ success: false, message: 'Medical history must be an array' });
  }

  try {
    let profile = await PatientProfile.findOne({ userId: req.params.patientId });
    if (!profile) {
      profile = new PatientProfile({ userId: req.params.patientId });
    }

    // Set dietitian who updated it
    profile.dietitianId = req.user.id;
    profile.medicalHistory = medicalHistory;
    profile.updatedAt = Date.now();

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Medical history updated successfully',
      medicalHistory: profile.medicalHistory
    });
  } catch (error) {
    console.error('updateMedicalHistory error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Log hydration tracker (glasses of water)
// @route   POST /api/patient/hydration
// @access  Private (Patient only)
exports.updateHydration = async (req, res) => {
  const { date, count } = req.body; // date format 'YYYY-MM-DD', count is the value (e.g. +1, or exact value)

  if (!date) {
    return res.status(400).json({ success: false, message: 'Please provide a valid date' });
  }

  try {
    const profile = await PatientProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    // Check if date already exists in hydrationLog
    const logIndex = profile.hydrationLog.findIndex(log => log.date === date);

    if (logIndex > -1) {
      profile.hydrationLog[logIndex].count = count;
    } else {
      profile.hydrationLog.push({ date, count });
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Hydration logged successfully',
      hydrationLog: profile.hydrationLog
    });
  } catch (error) {
    console.error('updateHydration error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get patient progress tracking data (weight trend, meal compliance, Dosha balance, streaks)
// @route   GET /api/patient/progress/:patientId
// @access  Private
exports.getProgressData = async (req, res) => {
  const patientId = req.params.patientId;

  if (req.user.role === 'patient' && req.user.id !== patientId) {
    return res.status(403).json({ success: false, message: 'Unauthorized access' });
  }

  try {
    const profile = await PatientProfile.findOne({ userId: patientId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    let weightHistory = profile.weightHistory || [];
    if (weightHistory.length === 0 && profile.weight) {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${d.getFullYear()}-${month}-${day}`;
      weightHistory = [{ date: dateStr, weight: profile.weight }];
    }

    const complianceData = [];
    const complianceLog = profile.complianceLog || [];

    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - w * 7);

      const formatD = (d) => {
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
      };

      const startStr = formatD(weekStart);
      const endStr = formatD(weekEnd);

      const logsInWeek = complianceLog.filter(log => log.date >= startStr && log.date <= endStr);
      const scheduled = logsInWeek.length;
      const eaten = logsInWeek.filter(log => log.eaten).length;
      
      const rate = scheduled > 0 ? Math.round((eaten / scheduled) * 100) : 0;
      complianceData.push({
        name: `Wk ${4 - w}`,
        rate
      });
    }

    let streak = 0;
    const formatD = (d) => {
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${month}-${day}`;
    };

    let checkDate = new Date();
    let todayStr = formatD(checkDate);
    let todayLogs = complianceLog.filter(log => log.date === todayStr);
    let todayHasEaten = todayLogs.some(log => log.eaten);

    if (!todayHasEaten) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = formatD(checkDate);
      const dayLogs = complianceLog.filter(log => log.date === dateStr);
      const hasEaten = dayLogs.some(log => log.eaten);
      if (hasEaten) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      if (streak > 365) break;
    }

    const complianceRate = complianceLog.length > 0
      ? Math.round((complianceLog.filter(log => log.eaten).length / complianceLog.length) * 100)
      : 0;

    const baseBal = 60;
    const currentBal = Math.min(95, baseBal + Math.round(complianceRate * 0.35));

    const activePlan = await DietPlan.findOne({ patientId, status: 'Active' });
    let milestone = "Start tracking to hit your milestones!";
    if (activePlan) {
      const daysPrescribed = activePlan.duration * 7;
      const uniqueDaysLogged = new Set(complianceLog.map(log => log.date)).size;
      const daysRemaining = Math.max(0, daysPrescribed - uniqueDaysLogged);
      if (daysRemaining > 0) {
        milestone = `${daysRemaining} more days to complete your ${activePlan.duration}-week plan!`;
      } else {
        milestone = `Congratulations! You have completed your ${activePlan.duration}-week plan!`;
      }
    }

    res.status(200).json({
      success: true,
      weightHistory,
      complianceData,
      streak,
      milestone,
      doshaBalance: {
        initial: baseBal,
        current: currentBal
      }
    });

  } catch (error) {
    console.error('getProgressData error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
