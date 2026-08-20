const User = require('../models/User');
const otpService = require('../services/otpService');
const { generateToken } = require('../utils/tokenUtils');

/**
 * @desc    Register a new citizen with email + password
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword, preferredLanguage } = req.body;

    // Validate presence of required fields
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, mobile number, and password.',
      });
    }

    // Full name validation
    if (fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters long.',
      });
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    const formattedPhone = otpService.formatIndianPhone(phone);
    if (!formattedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number.',
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    // Confirm password check
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // Check if user already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const existingPhoneUser = await User.findOne({ phone: formattedPhone });
    if (existingPhoneUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists. Please sign in with phone OTP or use another number.',
      });
    }

    // Create user in database (password is hashed by Mongoose pre-save hook)
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: formattedPhone,
      password: password,
      preferredLanguage: preferredLanguage || 'en',
      authProvider: 'local',
      isVerified: true,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Citizen account registered successfully.',
      token,
      user,
    });
  } catch (error) {
    console.error('[Register] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
      error: error.message,
    });
  }
};

/**
 * @desc    Authenticate citizen with email + password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query user and explicitly select password field (since select: false in schema)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user,
    });
  } catch (error) {
    console.error('[Login] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
      error: error.message,
    });
  }
};

/**
 * @desc    Send 6-digit OTP to Indian phone number
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.',
      });
    }

    const result = await otpService.sendOtp(phone);

    return res.status(200).json({
      success: true,
      message: result.message,
      phone: result.phone,
      expiresInSeconds: result.expiresInSeconds,
      ...(result.devOtp ? { devOtp: result.devOtp } : {}),
    });
  } catch (error) {
    console.error('[SendOtp] Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to send OTP. Please check the phone number.',
    });
  }
};

/**
 * @desc    Verify 6-digit OTP and login/register citizen
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, fullName, preferredLanguage } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and 6-digit OTP code are required.',
      });
    }

    // Verify OTP code with service
    const verification = await otpService.verifyOtp(phone, otp);

    if (!verification.success) {
      const statusCode = verification.reason === 'EXPIRED' || verification.reason === 'EXPIRED_OR_NOT_FOUND' ? 410 : 400;
      return res.status(statusCode).json({
        success: false,
        reason: verification.reason,
        message: verification.message,
      });
    }

    const formattedPhone = verification.phone;

    // Find existing citizen by phone or create new record
    let user = await User.findOne({ phone: formattedPhone });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        fullName: fullName && fullName.trim().length >= 2 ? fullName.trim() : `Citizen (${formattedPhone.slice(-4)})`,
        phone: formattedPhone,
        preferredLanguage: preferredLanguage || 'en',
        authProvider: 'phone',
        isVerified: true,
      });
    } else {
      // If citizen provided language or updated full name during OTP flow
      if (preferredLanguage && preferredLanguage !== user.preferredLanguage) {
        user.preferredLanguage = preferredLanguage;
        await user.save();
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: isNewUser ? 'Welcome to SevaAI! Account created.' : 'Authentication successful.',
      isNewUser,
      token,
      user,
    });
  } catch (error) {
    console.error('[VerifyOtp] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during OTP verification. Please try again.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get currently authenticated citizen profile
 * @route   GET /api/auth/me
 * @access  Protected (Bearer token)
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('[GetMe] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving citizen profile.',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  getMe,
};
