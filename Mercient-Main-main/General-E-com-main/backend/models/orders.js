const mongoose = require('mongoose');

const OrderItem = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  productName: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  img: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  }
});

const ShippingAddress = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String
}, { _id: false });

const Order = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true,
    immutable: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  guestId: {
    type: String,
    index: true,
    sparse: true
  },

  guestInfo: {
    name: String,
    email: String,
    phone: String
  },

  items: {
    type: [OrderItem],
    required: true,
    validate: [arr => arr.length > 0, 'Order must have at least one item']
  },

  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },

  shipping: {
    state: {
      type: String,
      required: true
    },
    fee: {
      type: Number,
      required: true,
      min: [0, 'Shipping fee cannot be negative']
    },
    originalFee: {
      type: Number,
      min: [0, 'Original shipping fee cannot be negative']
    },
    discountApplied: {
      type: Boolean,
      default: false
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100']
    },
    discountAmount: {
      type: Number,
      min: [0, 'Discount amount cannot be negative']
    }
  },

  shippingAddress: {
    type: ShippingAddress,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'cash_on_delivery', 'stripe', 'paystack',"whatsapp", 'other'],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },

  paymentReference: {
    type: String,
    index: true
  },

  transactionId: {
    type: String,
    index: true
  },

  paidAt: Date,

  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },

  notes: {
    type: String,
    maxlength: 1000
  }

}, { timestamps: true });

/* -------------------- PRE-VALIDATE HOOK -------------------- */

Order.pre('validate', function (next) {
  // Generate orderNumber once
  if (!this.orderNumber) {
    const short = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `ORD-${Date.now()}-${short}`;
  }

  // Auto-calc totalAmount ONLY if not provided
  if ((!this.totalAmount || this.totalAmount === 0) && this.items?.length) {
    this.totalAmount = this.items.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );
  }

  // Ensure guestId exists for guest checkout
  if (!this.userId && !this.guestId) {
    this.guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
  }

  next();
});

const OrderDb = mongoose.model('Order', Order);

module.exports = OrderDb;
