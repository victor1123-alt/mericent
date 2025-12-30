const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserDb = require('../models/user');

// Admin login: accepts { username, password } where username is usually email
const AdminLogin = async (req, res) => {
  const { username, password, email } = req.body || {};
  const id = email || username;
  if (!id || !password) {
    return res.status(400).json({ success: false, message: 'username (or email) and password are required' });
  }

  try {
    // Find user by email (case-insensitive)
    const user = await UserDb.findOne({ email: (id || '').toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access only' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const userObj = user.toObject ? user.toObject() : user;
    if (userObj.password) delete userObj.password;

    const payload = { id: user._id, role: user.role, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: '7d' });

    // set cookie for browser-based auth as well
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ success: true, user: userObj, token });
  } catch (err) {
    console.error('AdminLogin error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const me = async (req, res) => {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const user = await UserDb.findById(uid);
    if (!user) return res.status(404).json({ success: false, message: 'Admin not found' });

    if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const userObj = user.toObject ? user.toObject() : user;
    if (userObj.password) delete userObj.password;

    return res.json({ success: true, user: userObj });
  } catch (err) {
    console.error('Admin me error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  AdminLogin,
  me,
};