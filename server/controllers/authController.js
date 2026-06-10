const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'ayurnutricare_secret_key_12345',
    { expiresIn: '7d' }
  );
};

/**
 * REGISTER USER
 */
exports.register = async (req, res) => {
  const { name, email, password, role, phone, preferredLanguage } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and phone'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone,
      preferredLanguage: preferredLanguage || 'en'
    });

    // Create patient profile only if patient
    if (user.role === 'patient') {
      await PatientProfile.create({
        userId: user._id,
        medicalHistory: [],
        hydrationLog: [],
        complianceLog: []
      });
    }

    const token = generateToken(user._id);

    const userResponse = await User.findById(user._id).select('-password');

    return res.status(201).json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('REGISTER ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

/**
 * LOGIN USER
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    let dominantDosha = 'Undetermined';

    if (user.role === 'patient') {
      const profile = await PatientProfile.findOne({ userId: user._id });
      if (profile) {
        dominantDosha = profile.dominantDosha;
      }
    }

    return res.status(200).json({
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
    console.error('LOGIN ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

/**
 * GET CURRENT USER
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let dominantDosha = 'Undetermined';

    if (user.role === 'patient') {
      const profile = await PatientProfile.findOne({ userId: user._id });
      if (profile) {
        dominantDosha = profile.dominantDosha;
      }
    }

    return res.status(200).json({
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
    console.error('GETME ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * UPDATE LANGUAGE
 */
exports.updateLanguage = async (req, res) => {
  const { preferredLanguage } = req.body;

  try {
    if (!['en', 'hi', 'mr'].includes(preferredLanguage)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language selection'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferredLanguage },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      preferredLanguage: user.preferredLanguage
    });

  } catch (error) {
    console.error('LANGUAGE UPDATE ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
