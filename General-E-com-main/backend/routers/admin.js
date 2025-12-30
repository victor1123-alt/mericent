const express = require('express');
const { AdminLogin, me } = require('../controlers/adminController');
const { requireAuth, isAdmin } = require('../middleware/authmiddleware');
const router = express.Router();

// POST /api/admin/login
router.post('/login', AdminLogin);
// POST /api/admin/logout - clears auth cookie
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token');
    return res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

// GET /api/admin/me - verify admin token
router.get('/me', requireAuth, isAdmin, me);

module.exports = router;
