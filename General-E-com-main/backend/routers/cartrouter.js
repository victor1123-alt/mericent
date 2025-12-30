const express = require('express');
const cartRouter = express.Router();
const { requireAuth, getuser } = require('../middleware/authmiddleware');
const {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    checkout
} = require('../controlers/cartController');

// NOTE: Allow guest/anonymous access for most cart operations.
// Only `checkout` requires authentication.

// GET /cart - Fetch user's or guest's cart
cartRouter.get('/', getuser, getCart);

// POST /cart/add - Add item to cart (guest allowed)
cartRouter.post('/add', getuser, addToCart);

// PUT /cart/item/:itemId - Update cart item quantity (guest allowed)
cartRouter.put('/item/:itemId',getuser, updateCartItem);

// DELETE /cart/item/:itemId - Remove item from cart (guest allowed)
cartRouter.delete('/item/:itemId',getuser, removeFromCart);

// DELETE /cart - Clear entire cart (guest allowed)
cartRouter.delete('/', getuser, clearCart);

// POST /cart/checkout - Checkout and create order (requires auth)
cartRouter.post('/checkout', requireAuth, checkout);

module.exports = cartRouter;
