(function () {
	const mongoose = require('mongoose');
	const OrderDb = require('../models/orders');
	const ProductDb = require('../models/product');
	const { sendEmail } = require('../utils/emailService');

	// Helper to validate ObjectId
	function isValidObjectId(id) {
		return mongoose.Types.ObjectId.isValid(id);
	}

	/**
	 * List orders for the authenticated user
	 */
	const getOrders = async (req, res) => {
		try {
			const userId = req.user.id;
			console.log('Fetching orders for user:', userId);
			const orders = await OrderDb.find({ userId }).sort({ createdAt: -1 }).populate('items.productId', 'productName');
			return res.json({ success: true, orders });
		} catch (error) {
			return res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
		}
	};

	/**
	 * Get a single order by id (user must own it or be admin)
	 */
	const getOrderById = async (req, res) => {
		try {
			const { id } = req.params;
			if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid order id' });

			const order = await OrderDb.findById(id).populate('items.productId', 'productName description');
			if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

			const uid = req.user.id;
			if (order.userId.toString() !== uid && req.user.role !== 'admin') {
				return res.status(403).json({ success: false, message: 'Access denied' });
			}

			return res.json({ success: true, order });
		} catch (error) {
			return res.status(500).json({ success: false, message: 'Error fetching order', error: error.message });
		}
	};

	/**
	 * Admin: list all orders (optional filters via query)
	 */
	const getAllOrders = async (req, res) => {
		try {
			// This route is protected by isAdmin middleware
			const { status, paymentStatus, userId } = req.query;
			const filter = {};
			if (status) filter.status = status;
			if (paymentStatus) filter.paymentStatus = paymentStatus;
			if (userId && isValidObjectId(userId)) filter.userId = userId;

			const orders = await OrderDb.find(filter).sort({ createdAt: -1 }).populate('userId', 'firstName lastName email');
			return res.json({ success: true, orders });
		} catch (error) {
			return res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
		}
	};

	/**
	 * Admin: update order status
	 */
	const updateOrderStatus = async (req, res) => {
		try {
			const { id } = req.params;
			const { status } = req.body;
			if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid order id' });
			if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

			const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
			if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status value' });

			const order = await OrderDb.findById(id).populate('userId', 'email firstName lastName');
			if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

			order.status = status;
			// If cancelled or refunded, set paymentStatus accordingly if needed
			if (status === 'refunded') order.paymentStatus = 'refunded';
			if (status === 'cancelled' && order.paymentStatus === 'paid') order.paymentStatus = 'refunded';

			await order.save();

			// Send email notification for status updates
			const emailToSend = order.userId?.email || order.guestInfo?.email;
			if (emailToSend && ['processing', 'shipped', 'delivered'].includes(status)) {
				await sendEmail(emailToSend, 'orderStatusUpdate', order, status);
			}

			return res.json({ success: true, message: 'Order status updated', order });
		} catch (error) {
			return res.status(500).json({ success: false, message: 'Error updating order status', error: error.message });
		}
	};

	/**
	 * Cancel an order by the owner (if allowed)
	 */
	const cancelOrder = async (req, res) => {
		try {
			const { id } = req.params;
			if (!isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid order id' });

			const order = await OrderDb.findById(id).populate('items.productId');
			if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

			const uid = req.user.id;
			if (order.userId.toString() !== uid && req.user.role !== 'admin') {
				return res.status(403).json({ success: false, message: 'Access denied' });
			}

			// Business rule: only pending or processing orders can be canceled by user
			if (!['pending', 'processing'].includes(order.status) && req.user.role !== 'admin') {
				return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
			}

			// Update order status and paymentStatus
			order.status = 'cancelled';
			if (order.paymentStatus === 'paid') {
				order.paymentStatus = 'refunded';
				// Note: actual refund process should be handled via payment gateway integration
			}

			// Restock products
			for (const item of order.items) {
				try {
					await ProductDb.findByIdAndUpdate(item.productId._id || item.productId, { $inc: { quantity: item.quantity } });
				} catch (err) {
					// log and continue
					console.error('Error restocking product', err.message);
				}
			}

			await order.save();
			return res.json({ success: true, message: 'Order cancelled', order });
		} catch (error) {
			return res.status(500).json({ success: false, message: 'Error cancelling order', error: error.message });
		}
	};


	/**
	 * Create an order for an authenticated user OR guest (public route).
	 * If req.user exists -> create user order, otherwise create guest order using cartId cookie.
	 */
	const createOrderPublic = async (req, res) => {

		const userId = req.user && req.user.id;

		try {
			const { items, shippingAddress, paymentMethod, guestInfo } = req.body;


			let guestId = req.cookies && req.cookies.cartId;

			if (!items || !Array.isArray(items) || items.length === 0) {
				return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
			}

			if (!shippingAddress) {

				return res.status(400).json({ success: false, message: 'Shipping address is required' });
			}

			const allowedPayments = ['credit_card', 'paypal', 'cash_on_delivery', 'stripe', 'paystack', "whatsapp", 'other'];
			if (!paymentMethod || !allowedPayments.includes(paymentMethod)) {

				return res.status(400).json({ success: false, message: 'Invalid payment method' });
			}



			// Validate stock and prepare order items
			const orderItems = [];
			// console.log(items);

			for (const it of items) {
				console.log("i've reached here");

				if (!it.productId || !it.quantity) return res.status(400).json({ success: false, message: 'Each item needs productId and quantity' });
				const product = await ProductDb.findById(it.productId);
				console.log("products", product.img);

				if (!product) return res.status(404).json({ success: false, message: `Product not found: ${it.productId}` });
				if (!product.isAvailable) return res.status(400).json({ success: false, message: `Product not available: ${product.productName}` });
				// console.log(product.quantity);

				if (product.quantity < it.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.productName}` });
				// console.log("products2", product);

				orderItems.push({ productId: product._id, productName: product.productName, quantity: it.quantity, price: product.price, img: product.img });
				// console.log(orderItems);

			}

			// console.log(orderItems);

			// console.log("newOrder created",items.length);

			// If guest and no guestId cookie, create one
			if (!userId && !guestId) {
				guestId = `guest_${new mongoose.Types.ObjectId().toString()}`;
				res.cookie('cartId', guestId, {
					httpOnly: true,
					sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
					secure: process.env.NODE_ENV === 'production',
					maxAge: 30 * 24 * 60 * 60 * 1000
				});


			}

			const orderData = {
				items: orderItems,
				shippingAddress,
				paymentMethod,
				status: 'pending',
				paymentStatus: 'pending'
			};


			if (userId) orderData.userId = userId;
			else orderData.guestId = guestId;
			if (guestInfo) orderData.guestInfo = guestInfo;

			console.log(orderData);
			const newOrder = await OrderDb.create(orderData);



			// Decrease stock
			for (const it of orderItems) {

				await ProductDb.findByIdAndUpdate(it.productId, { $inc: { quantity: -it.quantity } });
			}



			// Clear guest cart if exists
			if (guestId) {
				const CartDb = require('../models/cart');
				await CartDb.findOneAndUpdate({ guestId }, { items: [], totalPrice: 0, totalItems: 0 });
			}





			return res.status(201).json({ success: true, order: newOrder });
		} catch (error) {
			console.log(error);

			return res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
		}
	};

	/**
	 * Attach guest orders to authenticated user. Uses cookie cartId or body.guestId to identify orders.
	 */
	const attachGuestOrdersToUser = async (req, res) => {
		try {
			const userId = req.user && req.user.id;
			if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

			const guestId = req.cookies?.cartId || req.body?.guestId;
			if (!guestId) return res.status(400).json({ success: false, message: 'guestId is required' });

			const orders = await OrderDb.find({ guestId });
			if (!orders || orders.length === 0) return res.json({ success: true, message: 'No guest orders to attach', attached: 0 });

			let attached = 0;
			for (const order of orders) {
				order.userId = userId;
				order.guestId = undefined;
				await order.save();
				attached++;
			}

			return res.json({ success: true, message: 'Guest orders attached', attached });
		} catch (error) {
			return res.status(500).json({ success: false, message: 'Error attaching guest orders', error: error.message });
		}
	};

	module.exports = {
		getOrders,
		getOrderById,
		getAllOrders,
		updateOrderStatus,
		cancelOrder,
		createOrder: createOrderPublic,
		attachGuestOrdersToUser
	};

})();

