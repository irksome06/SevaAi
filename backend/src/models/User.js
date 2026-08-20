const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters long'],
      maxlength: [80, 'Full name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      match: [
        /^\+91[6-9]\d{9}$/,
        'Please provide a valid 10-digit Indian phone number prefixed with +91',
      ],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Do not include password by default in queries
    },
    preferredLanguage: {
      type: String,
      default: 'en',
      enum: [
        'en', // English
        'hi', // Hindi
        'bn', // Bengali
        'mr', // Marathi
        'te', // Telugu
        'ta', // Tamil
        'gu', // Gujarati
        'ur', // Urdu
        'kn', // Kannada
        'ml', // Malayalam
        'or', // Odia
        'pa', // Punjabi
        'as', // Assamese
      ],
    },
    authProvider: {
      type: String,
      enum: ['local', 'phone'],
      default: 'local',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare plain text password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Transform output to remove sensitive fields
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
