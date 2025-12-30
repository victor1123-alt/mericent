
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserDb = require('../models/user');
const CartDb = require('../models/cart');
const mongoose = require('mongoose');

function Err_Handler(err) {
    const response = { message: 'An error occurred', details: null };
    if (!err) return response;

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        response.message = 'Validation failed';
        response.details = Object.keys(err.errors).reduce((acc, key) => {
            acc[key] = err.errors[key].message || err.errors[key].kind || err.errors[key].name;
            return acc;
        }, {});
        return response;
    }

    // Duplicate key error (unique index)
    if (err.code === 11000) {
        response.message = 'Duplicate field value';
        response.details = err.keyValue || err.message;
        return response;
    }

    // Array-style errors (e.g., express-validator style)
    if (err.errors && Array.isArray(err.errors)) {
        response.message = 'Multiple errors';
        response.details = err.errors.map(e => e.msg || e.message || e);
        return response;
    }

    // Fallback: use message if provided
    response.message = err.message || response.message;
    return response;
}

const SignupController = async (req, res) => {
    const { firstName, lastName, email, password } = req.body || {};

    // Basic presence check prior to DB operations
    const missing = [];
    if (!firstName) missing.push('firstName');
    if (!lastName) missing.push('lastName');
    if (!email) missing.push('email');
    if (!password) missing.push('password');
    if (missing.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields',
            missing
        });
    }

    try {
        const saltRounds = 10;
        const hashed = await bcrypt.hash(password, saltRounds);

        const created = await UserDb.create({
            firstName,
            lastName,
            email,
            password: hashed
        });

        const userObj = created.toObject ? created.toObject() : created;
        // Ensure password is not returned
        if (userObj.password) delete userObj.password;

        // Create JWT and set cookie
        const payload = { id: created._id, role: created.role, email: created.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: '7d' });

        // Set httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Merge guest cart (if present) into newly created user cart
        try {
            const guestId = req.cookies && req.cookies.cartId;
            if (guestId) {
                const guestCart = await CartDb.findOne({ guestId });
                if (guestCart && guestCart.items && guestCart.items.length > 0) {
                    let userCart = await CartDb.findOne({ userId: created._id });
                    if (!userCart) {
                        guestCart.userId = created._id;
                        guestCart.guestId = undefined;
                        await guestCart.save();
                    } else {
                        // merge items
                        for (const gItem of guestCart.items) {
                            const existing = userCart.items.find(i => i.productId.toString() === gItem.productId.toString());
                            if (existing) {
                                existing.quantity = Math.min(existing.quantity + gItem.quantity, 1000);
                            } else {
                                userCart.items.push(gItem.toObject ? gItem.toObject() : gItem);
                            }
                        }
                        await userCart.save();
                        await CartDb.deleteOne({ _id: guestCart._id });
                    }
                    res.clearCookie('cartId');
                }
            }
        } catch (mergeErr) {
            // Log merge error but don't block signup
            console.error('Error merging guest cart on signup:', mergeErr);
        }

        return res.status(201).json({ success: true, user: userObj, token });
    } catch (err) {
        const handled = Err_Handler(err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: handled.message });
        }

        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: handled.message });
        }

        return res.status(500).json({ success: false, message: handled.message });
    }
};

const LoginController = async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        // password field is stored with `select: false` in the schema, so explicitly select it
        const user = await UserDb.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // If user signed up with Google (no password), treat as invalid credentials
        if (!user.password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const userObj = user.toObject ? user.toObject() : user;
        if (userObj.password) delete userObj.password;

        // Create JWT and set cookie
        const payload = { id: user._id, role: user.role, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Merge guest cart into user's cart after successful login
        try {
            const guestId = req.cookies && req.cookies.cartId;
            if (guestId) {
                const guestCart = await CartDb.findOne({ guestId });
                if (guestCart && guestCart.items && guestCart.items.length > 0) {
                    let userCart = await CartDb.findOne({ userId: user._id });
                    if (!userCart) {
                        guestCart.userId = user._id;
                        guestCart.guestId = undefined;
                        await guestCart.save();
                    } else {
                        // merge items
                        for (const gItem of guestCart.items) {
                            const existing = userCart.items.find(i => i.productId.toString() === gItem.productId.toString());
                            if (existing) {
                                existing.quantity = Math.min(existing.quantity + gItem.quantity, 1000);
                            } else {
                                userCart.items.push(gItem.toObject ? gItem.toObject() : gItem);
                            }
                        }
                        await userCart.save();
                        await CartDb.deleteOne({ _id: guestCart._id });
                    }
                    res.clearCookie('cartId');
                }
            }
        } catch (mergeErr) {
            console.error('Error merging guest cart on login:', mergeErr);
        }

        return res.json({ success: true, user: userObj, token });
    } catch (err) {
        const handled = Err_Handler(err);
        return res.status(500).json({ success: false, message: handled.message });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        // The user ID is available from the JWT token via requireAuth middleware
        const userId = req.user.id;

        // Fetch user from database, excluding password
        const user = await UserDb.findById(userId);

        console.log(user)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userObj = user.toObject ? user.toObject() : user;
        // Ensure password is not returned (though it shouldn't be due to select: false)
        if (userObj.password) delete userObj.password;

        console.log(userObj);
        

        return res.status(200).json({
            success: true,
            user: userObj
        });
    } catch (err) {
        const handled = Err_Handler(err);
        return res.status(500).json({ success: false, error: handled });
    }
};

module.exports = {
    SignupController,
    LoginController,
    getCurrentUser
};