portnumber = 4444

network = https://mericent.onrender.com

apis
 get request 
    https://mericent.onrender.com/api/product


post request
    https://mericent.onrender.com/api/productPost
    https://mericent.onrender.com/auth/login
    https://mericent.onrender.com/auth/signup

cart routes :
Routes: cartrouter.js mounts routes and protects them:

All routes are protected by requireAuth (cookie JWT).
Mapped endpoints (mounted under /api in app.js):
GET /api/cart → getCart
POST /api/cart/add → addToCart
PUT /api/cart/item/:itemId → updateCartItem
DELETE /api/cart/item/:itemId → removeFromCart
DELETE /api/cart → clearCart
POST /api/cart/checkout → checkout

How the Cart API works (overview)
---------------------------------
- **Authentication:** The cart routes are protected using JWT stored in an `httpOnly` cookie named `token`. The `requireAuth` middleware reads the cookie, verifies the JWT, and attaches `req.user`.
- **Single cart per user:** The `Cart` model stores one cart per user (`userId` is unique). Each cart holds `items` with `productId`, `quantity`, and `price`.
- **Totals calculation:** A `pre('save')` hook on the `Cart` schema computes `totalPrice` and `totalItems` whenever the cart is saved.
- **Add to cart:** `addToCart` validates input, checks product existence, availability and stock, then finds or creates the user's cart and either increments an existing item or pushes a new item (price snapshot at add time).
- **Update/remove/clear:** `updateCartItem`, `removeFromCart`, and `clearCart` let the user adjust or remove items; input validation and stock checks are performed where appropriate.
- **Checkout:** `checkout` validates shipping and payment details, verifies stock for each item, creates an `Order` document, decrements product inventory, and clears the cart.

Known gaps and recommendations
------------------------------
- **Adding while anonymous:** Currently cart endpoints require authentication. If you want guest carts, add a `guestId` cookie and allow `POST /api/cart/add` to create/find guest carts. Merge guest cart into user cart on login.
- **Combined-quantity check:** When incrementing an existing item's quantity, ensure the new total does not exceed product stock or maximum allowed quantity.
- **Atomic checkout:** Use MongoDB transactions (replica set) to make order creation and stock updates atomic and avoid race conditions.
- **Token fallback:** Consider accepting `Authorization: Bearer <token>` as a fallback in `requireAuth` so mobile/third-party clients can authenticate without cookies.
- **SameSite / CORS:** For cross-origin frontend, ensure `cors` is configured with `credentials: true` and cookies are sent with `credentials: 'include'`. In production, cookies should use `SameSite=None; Secure`.
- **Validation & tests:** Add stricter request validation (e.g., `Joi`/`express-validator`) and unit/integration tests for cart flows.

Testing examples
----------------
- Login (frontend must include credentials to receive cookie):
    - Fetch example: `fetch('https://mericent.onrender.com/auth/login', { method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email, password}) })`
- Add item (include credentials):
    - `POST https://mericent.onrender.com/api/cart/add` with JSON `{ "productId": "<id>", "quantity": 2 }` and `credentials: 'include'`.
- Get cart:
    - `GET https://mericent.onrender.com/api/cart` with `credentials: 'include'`.

If you want, I can implement guest cart support (server-side `guestId` cookie + merge-on-login) or add the combined-quantity check now. Which should I do next?