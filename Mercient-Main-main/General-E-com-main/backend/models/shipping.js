const mongoose = require('mongoose');

const ShippingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Shipping name is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0, 'Base price cannot be negative']
    },
    pricePerItem: {
        type: Number,
        required: [true, 'Price per item is required'],
        min: [0, 'Price per item cannot be negative']
    },
    maxItemsForBase: {
        type: Number,
        default: 1,
        min: [1, 'Max items for base must be at least 1']
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%']
    },
    discountActive: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
ShippingSchema.index({ state: 1, isActive: 1 });

module.exports = mongoose.model('Shipping', ShippingSchema);