const crypto = require('crypto');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendVerificationEmail } = require('../utils/email');

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

exports.signup = async (req, res) => {
  try {
    const { userId, email, companyName, companyId, password, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User ID or email already exists.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      userId,
      email,
      password,
      role: role || 'user',
      companyName,
      companyId: role === 'company' ? userId : companyId,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: 'Account created! Please verify your email before logging in.',
      userId: user.userId
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup.' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error during email verification.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    const user = await User.findOne({ userId }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setCookies(res, accessToken, refreshToken);

    res.json({
      message: 'Login successful',
      accessToken,
      user: {
        _id: user._id,
        userId: user.userId,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        companyId: user.companyId,
        profilePicture: user.profilePicture,
        backgroundTheme: user.backgroundTheme
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token.' });

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setCookies(res, accessToken, newRefreshToken);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+refreshToken');
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Logout error.' });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};
