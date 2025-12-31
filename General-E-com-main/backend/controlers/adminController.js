const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserDb = require('../models/user');
const Shipping = require('../models/shipping');

// Admin login: accepts { username, password } where username is usually email
const AdminLogin = async (req, res) => {
  const { username, password, email } = req.body || {};
  const id = email || username;
  if (!id || !password) {
    return res.status(400).json({ success: false, message: 'username (or email) and password are required' });
  }

  try {
    // Find user by email (case-insensitive)
    const user = await UserDb.findOne({ email: (id || '').toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access only' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const userObj = user.toObject ? user.toObject() : user;
    if (userObj.password) delete userObj.password;

    const payload = { id: user._id, role: user.role, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: '7d' });

    // set cookie for browser-based auth as well
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ success: true, user: userObj, token });
  } catch (err) {
    console.error('AdminLogin error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const me = async (req, res) => {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const user = await UserDb.findById(uid);
    if (!user) return res.status(404).json({ success: false, message: 'Admin not found' });

    if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const userObj = user.toObject ? user.toObject() : user;
    if (userObj.password) delete userObj.password;

    return res.json({ success: true, user: userObj });
  } catch (err) {
    console.error('Admin me error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Shipping Management Controllers
const getShippingPrices = async (req, res) => {
  try {
    const shippingOptions = await Shipping.find({ isActive: true }).sort({ state: 1, createdAt: 1 });
    return res.json(shippingOptions);
  } catch (err) {
    console.error('Get shipping prices error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createShippingPrice = async (req, res) => {
  try {
    const { name, state, basePrice, pricePerItem, maxItemsForBase, discountPercentage, discountActive } = req.body;

    if (!name || !state || basePrice === undefined || pricePerItem === undefined) {
      return res.status(400).json({ success: false, message: 'Name, state, base price, and price per item are required' });
    }

    const existingShipping = await Shipping.findOne({ state, name, isActive: true });
    if (existingShipping) {
      return res.status(400).json({ success: false, message: 'Shipping option with this name already exists for this state' });
    }

    const shipping = new Shipping({
      name,
      state,
      basePrice: Number(basePrice),
      pricePerItem: Number(pricePerItem),
      maxItemsForBase: Number(maxItemsForBase) || 1,
      discountPercentage: Number(discountPercentage) || 0,
      discountActive: Boolean(discountActive)
    });

    await shipping.save();
    return res.status(201).json({ success: true, shipping });
  } catch (err) {
    console.error('Create shipping price error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateShippingPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const shipping = await Shipping.findById(id);
    if (!shipping) {
      return res.status(404).json({ success: false, message: 'Shipping option not found' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        shipping[key] = updates[key];
      }
    });

    await shipping.save();
    return res.json({ success: true, shipping });
  } catch (err) {
    console.error('Update shipping price error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteShippingPrice = async (req, res) => {
  try {
    const { id } = req.params;

    const shipping = await Shipping.findById(id);
    if (!shipping) {
      return res.status(404).json({ success: false, message: 'Shipping option not found' });
    }

    shipping.isActive = false;
    await shipping.save();

    return res.json({ success: true, message: 'Shipping option deactivated' });
  } catch (err) {
    console.error('Delete shipping price error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const calculateShippingFee = async (req, res) => {
  try {
    const { state, itemCount } = req.body;

    if (!state || itemCount === undefined) {
      return res.status(400).json({ success: false, message: 'State and item count are required' });
    }

    const shippingOptions = await Shipping.find({ state, isActive: true });
    if (shippingOptions.length === 0) {
      return res.status(404).json({ success: false, message: 'No shipping options available for this state' });
    }

    // For now, use the first shipping option (could be enhanced to select based on criteria)
    const shipping = shippingOptions[0];

    let fee = shipping.basePrice;
    if (itemCount > shipping.maxItemsForBase) {
      fee += (itemCount - shipping.maxItemsForBase) * shipping.pricePerItem;
    }

    let discountAmount = 0;
    let finalFee = fee;
    let discountApplied = false;

    if (shipping.discountActive && shipping.discountPercentage > 0) {
      discountAmount = (fee * shipping.discountPercentage) / 100;
      finalFee = fee - discountAmount;
      discountApplied = true;
    }

    return res.json({
      success: true,
      shipping: {
        state: shipping.state,
        basePrice: shipping.basePrice,
        pricePerItem: shipping.pricePerItem,
        maxItemsForBase: shipping.maxItemsForBase,
        itemCount,
        originalFee: fee,
        discountApplied,
        discountPercentage: shipping.discountPercentage,
        discountAmount,
        finalFee
      }
    });
  } catch (err) {
    console.error('Calculate shipping fee error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  AdminLogin,
  me,
  getShippingPrices,
  createShippingPrice,
  updateShippingPrice,
  deleteShippingPrice,
  calculateShippingFee,
};