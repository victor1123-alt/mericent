const express = require('express');
const paymentRouter = express.Router();
const { initializePayment, verifyPayment, handleWebhook } = require('../controlers/paymentController');

// Get Paystack public key
paymentRouter.get('/paystack-config', (req, res) => {
  res.json({
    publicKey: process.env.PAYSTACK_PUBLIC_KEY
  });
});

// Initialize payment (create Paystack payment link)
paymentRouter.post('/create-payment', initializePayment);

// Verify payment (check payment status)
paymentRouter.post('/verify-payment', verifyPayment);

// Webhook endpoint for Paystack (no auth required for webhooks)
paymentRouter.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = paymentRouter;