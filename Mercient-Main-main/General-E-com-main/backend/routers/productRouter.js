const express = require('express');
const { product, PostProduct, getProductById, updateProduct, deleteProduct } = require('../controlers/ProductController');
const { requireAuth, isAdmin } = require('../middleware/authmiddleware');
const Route = express.Router();
const ProductDb = require('../models/product');

// Public
Route.get('/product', product);
Route.get('/product/:id', getProductById);

// Admin protected routes
Route.post('/productPost', requireAuth, isAdmin, PostProduct);
Route.put('/product/:id', requireAuth, isAdmin, updateProduct);
Route.delete('/product/:id', requireAuth, isAdmin, deleteProduct);

module.exports = Route