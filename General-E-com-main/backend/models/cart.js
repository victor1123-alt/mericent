const mongoose = require('mongoose');

const CartItem = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        max: [1000, 'Quantity cannot exceed 1000']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    img: {
        type: String,
        trim: true,
        default: ''
    },
    images: {
        type: [String],
        default: []
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const Cart = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        unique: true,
        sparse: true
    },
    guestId: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    items: [CartItem],
    totalPrice: {
        type: Number,
        default: 0,
        min: [0, 'Total price cannot be negative']
    },
    totalItems: {
        type: Number,
        default: 0,
        min: [0, 'Total items cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, { timestamps: true });

// Middleware to calculate totals before saving
Cart.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        this.totalPrice = this.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
        this.totalItems = this.items.reduce((sum, item) => {
            return sum + item.quantity;
        }, 0);
    } else {
        this.totalPrice = 0;
        this.totalItems = 0;
    }
    next();
});

const CartDb = mongoose.model('Cart', Cart);

module.exports = CartDb;
