Guest Checkout & Cart Sync Manual Verification

Overview
- This document contains manual verification steps to test the guest cart + guest checkout and the sync-on-login flow implemented.

Prerequisites
- Backend: running on https://mericent.vercel.app (npm run dev)
- Frontend: running on mericent-git-main-markcode.vercel.app (npm run dev or vite)
- A seeded user exists (seed script created admin at admin@mercient.test.com / Password123!)

Steps
1) Guest cart behavior
   - Open the frontend in an incognito window (no token in localStorage).
   - Browse products and click "Add to Cart" on a few items.
   - Open the cart modal (top-right cart icon) and verify items appear.
   - Refresh the page and ensure the cart items persist (localStorage key: guest_cart_v1).
   - In DevTools -> Application -> Cookies, verify a cookie named `cartId` is set after the first server-add call (server sets it when guest adds an item).

2) Guest checkout
   - Proceed to Checkout page: add delivery details (click "Add Delivery Details"), select shipping state, and click "Proceed to Payment".
   - The app will send a POST /api/orders (no auth). The server should create a guest order and return 201 with order object.
   - In the backend, verify a new Order document was created with guestId filled.
   - The guest cart in DB (if any) should be cleared by the server.

3) Sync on login
   - Before login, ensure guest cart has items and guest checkout created orders exist (or just cart items exist locally).
   - Login (use seeded admin or a test user). After login, the frontend should:
     - Sync local guest cart items to the server (POST /api/cart/add for each item).
     - Call POST /api/orders/attach-guest (authenticated) which attaches guest orders to the user (server ties orders with guestId to userId).
   - Verify via GET /api/orders (authenticated) that the orders are now associated with your userId.

4) While signed-in
   - Add items and check that cart operations use server endpoints (observe network requests: /api/cart/add, /api/cart/item/:id updates, etc.).

5) Admin login (new)
   - Visit mericent-git-main-markcode.vercel.app/admin/login and sign in using the seeded admin (see seed output) or any user with role `admin`.
   - The page posts to `POST /api/admin/login`. On success the response includes `{ token, user }` and the UI stores `admin_token` and `admin_user` in localStorage.
   - Verify the admin verification endpoint `/api/admin/me` returns 200 when called with `Authorization: Bearer <token>`.
   - Verify admin-only endpoints are protected. For example, try to call `GET /api/orders/all` without an admin token - it should return 403. With the admin token it should return the list of orders.

Notes
- If any request fails, check browser console and Network tab; the backend logs errors to the console.
- The server responds with consistent JSON shapes (success: true, cart/order objects).

If you'd like, I can add an automated test harness (supertest + jest) — it will require dev dependencies and a small test DB setup (or in-memory MongoDB). Let me know if you want that.

Quick script: there's a small test script at `backend/scripts/testGuestOrder.js` which can be used to exercise guest order creation. Replace the placeholder `productId` with a real product ID from your DB and run:

  node backend/scripts/testGuestOrder.js

This will POST to `POST /api/orders` and print the server response.