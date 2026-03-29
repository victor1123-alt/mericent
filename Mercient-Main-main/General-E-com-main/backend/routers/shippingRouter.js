const express = require('express');
const { getShippingPrices, calculateShippingFee } = require('../controlers/adminController');
const router = express.Router();

// Public routes for shipping
// GET /api/shipping-prices - get all active shipping options (public)
router.get('/shipping-prices', getShippingPrices);

// POST /api/calculate-shipping - calculate shipping fee based on items (public)
router.post('/calculate-shipping', calculateShippingFee);

module.exports = router;