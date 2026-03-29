const ProductDb = require('../models/product');
const slugify = require('slugify');

// Helper function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// GET /api/product - paginated list with filters
const product = async (req, res) => {
    try {
        const { category, search, sortBy, sortOrder, page = 1, limit = 12 } = req.query;

        let query = {};

        // Filter by category if provided
        if (category) {
            query.category = { $regex: category, $options: 'i' }; // Case-insensitive match
        }

        // Search in productName or description if provided
        if (search) {
            query.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page, 10));
        const perPage = Math.max(1, parseInt(limit, 10));

        // Fetch all matching products
        let allProducts = await ProductDb.find(query);

        // Sorting
        if (sortBy) {
            const order = sortOrder === 'desc' ? -1 : 1;
            allProducts.sort((a, b) => {
                if (a[sortBy] < b[sortBy]) return order === 1 ? -1 : 1;
                if (a[sortBy] > b[sortBy]) return order === 1 ? 1 : -1;
                return 0;
            });
        } else {
            // If no sortBy, shuffle for random order
            shuffleArray(allProducts);
        }

        const total = allProducts.length;
        const pages = Math.ceil(total / perPage);

        // Apply pagination
        const products = allProducts.slice((pageNum - 1) * perPage, pageNum * perPage);

        res.json({ data: products, total, page: pageNum, pages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/product/:id - single product
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const productItem = await ProductDb.findById(id);
        if (!productItem) return res.status(404).json({ error: 'Product not found' });
        res.json(productItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/product/:id - update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body || {};

        if (update.productName) {
            update.slug = slugify(update.productName, { lower: true, strict: true });
        }

        const updated = await ProductDb.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ error: 'Product not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/product/:id - delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const removed = await ProductDb.findByIdAndDelete(id);
        if (!removed) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const PostProduct = async (req, res) => {
    try {
        const { productName, description, price, quantity, category, productType, isAvailable, img, images, sizes, colors, sku } = req.body;

        if (!productName) {
            return res.status(400).json({ error: "'productName' is required in the request body" });
        }

        const productData = {
            productName,
            slug: slugify(productName, { lower: true, strict: true }),
            sku,
            description,
            price,
            quantity,
            category,
            productType: productType || 'clothing', // Default to 'clothing' if not provided
            isAvailable,
            img,
            images: Array.isArray(images) ? images : [],
            sizes: Array.isArray(sizes) ? sizes : [],
            colors: Array.isArray(colors) ? colors : []
        };

        const postProduct = await ProductDb.create(productData);
        res.status(201).json(postProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = { product, PostProduct, getProductById, updateProduct, deleteProduct };