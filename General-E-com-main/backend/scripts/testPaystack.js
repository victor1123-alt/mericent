// Test Paystack Payment Integration
const Paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY || 'sk_test_4f78aa184158eb5a59c8f52bc265ba02213af9e9');

async function testPaystackIntegration() {
  try {
    console.log('Testing Paystack integration...');

    // Test payment initialization
    const paymentData = {
      amount: 50000, // ₦500 in kobo
      email: 'test@example.com',
      reference: `test_${Date.now()}`,
      callback_url: 'mericent-git-main-markcode.vercel.app/checkout/success'
    };

    const response = await Paystack.transaction.initialize(paymentData);

    if (response.status) {
      console.log('✅ Payment initialization successful');
      console.log('Payment URL:', response.data.authorization_url);
      console.log('Reference:', response.data.reference);

      // Test verification with the reference
      console.log('Testing payment verification...');
      try {
        const verifyResponse = await Paystack.transaction.verify({ reference: response.data.reference });
        console.log('✅ Payment verification test completed');
        console.log('Verification status:', verifyResponse.status);
      } catch (verifyError) {
        console.log('❌ Payment verification test failed:', verifyError.message);
      }

    } else {
      console.log('❌ Payment initialization failed:', response.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if called directly
if (require.main === module) {
  require('dotenv').config();
  testPaystackIntegration();
}

module.exports = { testPaystackIntegration };