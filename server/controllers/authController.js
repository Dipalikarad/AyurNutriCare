const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const jwt = require('jsonwebtoken');

// Helper to sign JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ayurnutricare_secret_key_12345', {
    expiresIn: '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, role, phone, preferredLanguage } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone,
      preferredLanguage: preferredLanguage || 'en'
    });

    // If user is a patient, initialize their PatientProfile
    if (user.role === 'patient') {
      await PatientProfile.create({
        userId: user._id,
        medicalHistory: [],
        hydrationLog: [],
        complianceLog: []
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    // If patient, fetch their dominantDosha to attach to login details
    let dominantDosha = 'Undetermined';
    if (user.role === 'patient') {
      const profile = await PatientProfile.findOne({ userId: user._id });
      if (profile) {
        dominantDosha = profile.dominantDosha;
      }
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
        dominantDosha
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let dominantDosha = 'Undetermined';
    
    if (user.role === 'patient') {
      const profile = await PatientProfile.findOne({ userId: user._id });
      if (profile) {
        dominantDosha = profile.dominantDosha;
      }
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
        dominantDosha
      }
    });
  } catch (error) {
    console.error('GetMe error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user preferred language
// @route   PUT /api/auth/language
// @access  Private
exports.updateLanguage = async (req, res) => {
  const { preferredLanguage } = req.body;

  if (!preferredLanguage || !['en', 'hi', 'mr'].includes(preferredLanguage)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid language (en, hi, mr)' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferredLanguage },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      preferredLanguage: user.preferredLanguage
    });
  } catch (error) {
    console.error('UpdateLanguage error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

