const mongoose = require('mongoose');
const CartDb = require('../models/cart');
const ProductDb = require('../models/product');
const OrderDb = require('../models/orders');

/**
 * Get user's cart
 */
const getCart = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const guestId = req.cookies && req.cookies.cartId;

        const query = userId ? { userId } : guestId ? { guestId } : null;

        if (!query) {
            // No query means no user or guest cart identifier — return an empty cart object
            return res.json({ success: true, cart: { items: [], totalPrice: 0, totalItems: 0 } });
        }

        const cart = await CartDb.findOne(query)
            .populate('items.productId', 'productName price description category');

        if (!cart) {
            // No cart found for the given identifier — return an empty cart rather than 404
            return res.json({ success: true, cart: { items: [], totalPrice: 0, totalItems: 0 } });
        }

        return res.json({
            success: true,
            cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching cart',
            error: error.message
        });
    }
};

/**
 * Add item to cart
 */
const addToCart = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const guestId = req.cookies && req.cookies.cartId;
        const { productId, quantity } = req.body;

        // Validate input
        if (!productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: productId, quantity'
            });
        }

        if (quantity < 1 || quantity > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be between 1 and 1000'
            });
        }

        // Check if product exists and get its price
        const product = await ProductDb.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if product is available
        if (!product.isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Product is not available'
            });
        }

        // Check stock for requested addition
        if (product.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.quantity} items available in stock`
            });
        }

        // Find or create cart by userId or guestId
        let cart = null;
        if (userId) {
            cart = await CartDb.findOne({ userId });
            if (!cart) cart = await CartDb.create({ userId, items: [] });
        } else {
            let cookieGuestId = guestId;
            if (!cookieGuestId) {
                cookieGuestId = new mongoose.Types.ObjectId().toString();
                res.cookie('cartId', cookieGuestId, {
                    httpOnly: true,
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
                });
            }
            cart = await CartDb.findOne({ guestId: cookieGuestId });
            if (!cart) cart = await CartDb.create({ guestId: cookieGuestId, items: [] });
        }

        // Check if product already in cart
        const existingItem = cart.items.find(
            item => item.productId.toString() === productId.toString()
        );

        if (existingItem) {
            // Combined quantity check
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.quantity) {
                return res.status(400).json({ success: false, message: `Only ${product.quantity} items available in stock` });
            }
            if (newQuantity > 1000) {
                return res.status(400).json({ success: false, message: 'Quantity cannot exceed 1000' });
            }
            existingItem.quantity = newQuantity;
        } else {
            console.log(product)
            // Add new item
            cart.items.push({
                productId,
                quantity,
                price: product.price,
                img:product.img,
                images : product.images
            });
        }

        await cart.save();

        return res.status(201).json({
            success: true,
            message: 'Item added to cart',
            cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error adding item to cart',
            error: error.message
        });
    }
};

/**
 * Update cart item quantity
 */
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const guestId = req.cookies && req.cookies.cartId;
        const { itemId } = req.params;
        const { quantity } = req.body;

        // Validate input
        if (!quantity || quantity < 1 || quantity > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be between 1 and 1000'
            });
        }

        // Find cart by userId or guestId
        const query = userId ? { userId } : guestId ? { guestId } : null;
        if (!query) return res.status(404).json({ success: false, message: 'Cart not found' });
        const cart = await CartDb.findOne(query);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Find item in cart
        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Check product stock
        const product = await ProductDb.findById(item.productId);
        if (product && product.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.quantity} items available in stock`
            });
        }

        // Update quantity
        item.quantity = quantity;
        await cart.save();

        return res.json({
            success: true,
            message: 'Cart item updated',
            cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating cart item',
            error: error.message
        });
    }
};

/**
 * Remove item from cart
 */
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const guestId = req.cookies && req.cookies.cartId;
        const { itemId } = req.params;

        // Find cart by userId or guestId
        const query = userId ? { userId } : guestId ? { guestId } : null;
        if (!query) return res.status(404).json({ success: false, message: 'Cart not found' });
        const cart = await CartDb.findOne(query);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Remove item
        const removedItem = cart.items.id(itemId);
        if (!removedItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        removedItem.deleteOne();
        await cart.save();

        return res.json({
            success: true,
            message: 'Item removed from cart',
            cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error removing item from cart',
            error: error.message
        });
    }
};

/**
 * Clear entire cart
 */
const clearCart = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const guestId = req.cookies && req.cookies.cartId;

        const query = userId ? { userId } : guestId ? { guestId } : null;
        if (!query) return res.status(404).json({ success: false, message: 'Cart not found' });

        const cart = await CartDb.findOneAndUpdate(
            query,
            { items: [], totalPrice: 0, totalItems: 0 },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        return res.json({
            success: true,
            message: 'Cart cleared',
            cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error clearing cart',
            error: error.message
        });
    }
};

/**
 * Checkout and create order
 */
const checkout = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { shippingAddress, paymentMethod } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Please login to checkout' });
        }

        // Validate input
        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: shippingAddress, paymentMethod'
            });
        }

        // Use a transaction so order creation and stock updates are atomic (requires replica set)
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const cart = await CartDb.findOne({ userId }).populate('items.productId').session(session);
            if (!cart || cart.items.length === 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ success: false, message: 'Cart is empty. Cannot proceed with checkout' });
            }

            // Verify stock availability
            for (const item of cart.items) {
                const product = await ProductDb.findById(item.productId._id).session(session);
                if (product.quantity < item.quantity) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({
                        success: false,
                        message: `${item.productId.productName}: Only ${product.quantity} items available`
                    });
                }
            }

            // Create order
            const order = await OrderDb.create([{ // use array form to pass session
                userId,
                items: cart.items.map(item => ({
                    productId: item.productId._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: cart.totalPrice,
                shippingAddress,
                paymentMethod,
                status: 'pending'
            }], { session });

            const createdOrder = order[0];

            // Update product quantities (reduce stock) within session
            for (const item of cart.items) {
                const updated = await ProductDb.findOneAndUpdate(
                    { _id: item.productId._id, quantity: { $gte: item.quantity } },
                    { $inc: { quantity: -item.quantity } },
                    { session }
                );
                if (!updated) {
                    // Stock insufficient for this item; abort
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ success: false, message: `Insufficient stock for ${item.productId.productName}` });
                }
            }

            // Clear cart
            cart.items = [];
            cart.totalPrice = 0;
            cart.totalItems = 0;
            await cart.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({ success: true, message: 'Order created successfully', order: createdOrder });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error processing checkout',
            error: error.message
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    checkout
};
