const mongoose = require('mongoose');

const Product = new mongoose.Schema({
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [3, 'Product name must be at least 3 characters long'],
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        trim: true,
        lowercase: true,
        index: true
    },
    sku: {
        type: String,
        trim: true,
        index: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
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
    sizes: {
        type: [String],
        default: []
    },
    colors: {
        type: [String],
        default: []
    },
    price: {
        type: Number,
        min: [0, 'Price cannot be negative'],
        default: 0
    },
    quantity: {
        type: Number,
        min: [0, 'Quantity cannot be negative'],
        default: 0
    },
    category: {
        type: String,
        trim: true,
        maxlength: [50, 'Category cannot exceed 50 characters']
    },
    productType: {
        type: String,
        enum: ['clothing', 'footwear'],
        default: 'clothing'
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const ProductDb = mongoose.model('Product', Product);

module.exports = ProductDb;