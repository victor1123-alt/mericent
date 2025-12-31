const express = require('express');
const { AdminLogin, me, getShippingPrices, createShippingPrice, updateShippingPrice, deleteShippingPrice, calculateShippingFee } = require('../controlers/adminController');
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

// Shipping Management Routes
// GET /api/admin/shipping-prices - get all active shipping options
router.get('/shipping-prices', getShippingPrices);

// POST /api/admin/shipping-prices - create new shipping option
router.post('/shipping-prices', requireAuth, isAdmin, createShippingPrice);

// PUT /api/admin/shipping-prices/:id - update shipping option
router.put('/shipping-prices/:id', requireAuth, isAdmin, updateShippingPrice);

// DELETE /api/admin/shipping-prices/:id - deactivate shipping option
router.delete('/shipping-prices/:id', requireAuth, isAdmin, deleteShippingPrice);

// POST /api/admin/calculate-shipping - calculate shipping fee based on items
router.post('/calculate-shipping', calculateShippingFee);

module.exports = router;
