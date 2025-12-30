// Simple test script to create a guest order and print response
// Usage: node scripts/testGuestOrder.js

const fetch = globalThis.fetch || require('node-fetch');

(async () => {
  const url = 'https://mericent.onrender.com/api/orders';
  const payload = {
    items: [
      { productId: '000000000000000000000000', quantity: 1 } // replace with valid productId in your DB
    ],
    shippingAddress: { city: 'Lagos', state: 'Lagos', country: 'Nigeria' },
    paymentMethod: 'cash_on_delivery',
    guestInfo: { name: 'Guest Tester', email: 'guest@example.test' }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    });
    const json = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
})();