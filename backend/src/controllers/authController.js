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
        message: 'Please provide your email/mobile number and password.',
      });
    }

    const input = email.trim();
    const cleanPhoneDigits = input.replace(/\D/g, '');
    let query;

    // Check if input is a 10-digit Indian mobile number
    if (cleanPhoneDigits.length === 10 && /^[6-9]\d{9}$/.test(cleanPhoneDigits)) {
      query = { phone: `+91${cleanPhoneDigits}` };
    } else if (cleanPhoneDigits.length === 12 && cleanPhoneDigits.startsWith('91')) {
      query = { phone: `+${cleanPhoneDigits}` };
    } else {
      query = { email: input.toLowerCase() };
    }

    // Query user and explicitly select password field (since select: false in schema)
    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email/mobile number and password.',
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

/**
 * @desc    Update authenticated citizen profile details and avatar
 * @route   PUT /api/auth/profile or PUT /api/auth/me
 * @access  Protected (Bearer token)
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Citizen profile not found.',
      });
    }

    const {
      fullName,
      email,
      phone,
      avatar,
      location,
      gender,
      dob,
      occupation,
      preferredLanguage,
    } = req.body;

    // Full name validation
    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Full name must be at least 2 characters long.',
        });
      }
      user.fullName = fullName.trim();
    }

    // Email validation & duplicate check
    if (email !== undefined) {
      const normalizedEmail = email ? email.trim().toLowerCase() : '';
      if (normalizedEmail) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(normalizedEmail)) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address.',
          });
        }
        // Check uniqueness if email is changing
        if (normalizedEmail !== user.email) {
          const emailExists = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: user._id },
          });
          if (emailExists) {
            return res.status(400).json({
              success: false,
              message: 'This email address is already in use by another account.',
            });
          }
          user.email = normalizedEmail;
        }
      } else if (user.authProvider === 'phone') {
        // Phone users can leave email empty
        user.email = undefined;
      }
    }

    // Phone validation & duplicate check
    if (phone !== undefined) {
      const formattedPhone = phone ? otpService.formatIndianPhone(phone) : '';
      if (formattedPhone) {
        if (formattedPhone !== user.phone) {
          const phoneExists = await User.findOne({
            phone: formattedPhone,
            _id: { $ne: user._id },
          });
          if (phoneExists) {
            return res.status(400).json({
              success: false,
              message: 'This mobile number is already registered to another citizen account.',
            });
          }
          user.phone = formattedPhone;
        }
      }
    }

    // Profile Avatar (Base64 or URL or empty string to remove)
    if (avatar !== undefined) {
      user.avatar = typeof avatar === 'string' ? avatar : '';
    }

    // Location fields
    if (location && typeof location === 'object') {
      user.location = {
        state: location.state !== undefined ? String(location.state).trim() : user.location?.state || '',
        city: location.city !== undefined ? String(location.city).trim() : user.location?.city || '',
        district: location.district !== undefined ? String(location.district).trim() : user.location?.district || '',
        pincode: location.pincode !== undefined ? String(location.pincode).trim() : user.location?.pincode || '',
        address: location.address !== undefined ? String(location.address).trim() : user.location?.address || '',
      };
    }

    // Gender
    if (gender !== undefined) {
      user.gender = gender;
    }

    // Date of Birth
    if (dob !== undefined) {
      user.dob = String(dob).trim();
    }

    // Occupation
    if (occupation !== undefined) {
      user.occupation = String(occupation).trim();
    }

    // Preferred Language
    if (preferredLanguage !== undefined) {
      user.preferredLanguage = preferredLanguage;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Citizen profile updated successfully.',
      user,
    });
  } catch (error) {
    console.error('[UpdateProfile] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating profile.',
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
  updateProfile,
};
