import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Utility — generate a signed JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Utility — send token response
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// ── POST /api/auth/register ────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });
    sendToken(user, 201, res);
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── POST /api/auth/google ─────────────────────────────────────────────────────
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'No Google credential provided.' });
    }

    // Verify the ID token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account has no email.' });
    }

    // Find existing user or create new one (no password needed for Google users)
    let user = await User.findOne({ email });

    if (!user) {
      // Generate a random secure password for Google users (they will never use it)
      const randomPw = googleId + process.env.JWT_SECRET;
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPw,
        googleId,
        avatar: picture,
      });
    } else if (!user.googleId) {
      // Existing email/password account — link the Google ID
      user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save({ validateBeforeSave: false });
    }

    sendToken(user, 200, res);
  } catch (err) {
    console.error('[Auth] Google auth error:', err.message);
    res.status(401).json({ success: false, message: 'Google authentication failed.' });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
