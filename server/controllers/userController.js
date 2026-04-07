import User from '../models/User.js';

// ── GET /api/users/profile ────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── PUT /api/users/profile ────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// ── PUT /api/users/change-password ───────────────────────────────────────────────
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if user is a Google-only user
    if (user.googleId && !user.password) {
        return res.status(400).json({ success: false, message: 'Social login users must set a password via "Forgot Password" or linking.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
};

// ── POST /api/users/upload-avatar ───────────────────────────────────────────────
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Save relative path: uploads/filename.jpg
    user.avatar = req.file.path.replace(/\\/g, '/'); 
    await user.save();

    res.status(200).json({
      success: true,
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to upload avatar.' });
  }
};
