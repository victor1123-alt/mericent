const express = require('express');
const orderRouter = express.Router();
const {
    getOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} = require('../controlers/orderController');
const { requireAuth, isAdmin } = require('../middleware/authmiddleware');

// Public route: create an order (guest or authenticated)
orderRouter.post('/', requireAuth,require('../controlers/orderController').createOrder);

// Public convenience route for creating guest orders directly (keeps backward compatibility)
orderRouter.post('/guest', require('../controlers/orderController').createOrder);

// Protected routes
// GET /api/orders - list orders for the authenticated user
orderRouter.get('/', requireAuth, getOrders);

// GET /api/orders/all - admin: list all orders
orderRouter.get('/all', requireAuth, isAdmin, getAllOrders);

// GET /api/orders/:id - get a single order (user must own it or be admin)
orderRouter.get('/:id', requireAuth, getOrderById);

// PUT /api/orders/:id/status - admin updates order status
orderRouter.put('/:id/status', requireAuth, isAdmin, updateOrderStatus);

// POST /api/orders/:id/cancel - user cancels their order (if allowed)
orderRouter.post('/:id/cancel', requireAuth, cancelOrder);

// Attach guest orders to authenticated user (uses cookie or body.guestId)
orderRouter.post('/attach-guest', requireAuth, require('../controlers/orderController').attachGuestOrdersToUser);

module.exports = orderRouter;
