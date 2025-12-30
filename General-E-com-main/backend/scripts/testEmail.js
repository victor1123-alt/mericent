// Test Email Service
require('dotenv').config();
const { sendEmail } = require('../utils/emailService');

async function testEmailService() {
  try {
    console.log('Testing email service...');

    // Create a mock order object
    const mockOrder = {
      orderNumber: 'TEST-123',
      totalAmount: 50000,
      paymentMethod: 'paystack',
      createdAt: new Date(),
      items: [
        {
          productName: 'Test Product',
          quantity: 1,
          price: 50000
        }
      ],
      shippingAddress: {
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria'
      },
      userId: null, // Test as guest
      guestInfo: {
        name: 'Test Customer',
        email: 'test@example.com' // Replace with your actual email for testing
      }
    };

    console.log('Sending test payment success email...');
    const result = await sendEmail('your-email@example.com', 'paymentSuccess', mockOrder);

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('❌ Email sending failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if called directly
if (require.main === module) {
  require('dotenv').config();
  testEmailService();
}

module.exports = { testEmailService };