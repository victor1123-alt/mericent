const Paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY || 'sk_test_4f78aa184158eb5a59c8f52bc265ba02213af9e9');
const mongoose = require('mongoose');
const OrderDb = require('../models/orders');
const { sendEmail } = require('../utils/emailService');

/**
 * Initialize Paystack payment
 */
const initializePayment = async (req, res) => {
    try {
        const {
            amount,
            items,
            shipping,
            delivery,
            orderId,
            email,
            name,
            phone
        } = req.body;

        console.log('Initializing payment with data:', req.body);
        // Validate required fields
        if (!amount || !email || !items || items.length === 0) {
            console.log({ amount: !amount, email: email, items: items.length });

            return res.status(400).json({
                success: false,
                message: 'Missing required payment fields'
            });
        }



        // Convert amount to kobo (Paystack expects amount in kobo)
        const amountInKobo = Math.round(amount * 100);

        // Create payment data for Paystack
        const paymentData = {
            amount: amountInKobo,
            email: email || delivery?.email,
            //   reference: `order_${orderId || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            reference: orderId,
            callback_url: `${process.env.FRONTEND_URL || 'https://mericent-git-main-markcode.vercel.app'}/checkout/success`,
            metadata: {
                orderId,
                items,
                shipping,
                delivery,
                custom_fields: [
                    {
                        display_name: "Customer Name",
                        variable_name: "customer_name",
                        value: name || delivery?.fullName || 'Guest User'
                    },
                    {
                        display_name: "Phone",
                        variable_name: "phone",
                        value: phone || delivery?.phone || ''
                    }
                ]
            }
        };

        // console.log('Payment initialization data:', paymentData);
        // Initialize payment with Payst ack
        const paymentResponse = await Paystack.transaction.initialize(paymentData);

        if (paymentResponse.status) {
            // Update order with payment reference if orderId exists and is valid
            if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
                try {
                    await OrderDb.findOneAndUpdate({orderNumber:orderId}, {
                        paymentReference: paymentResponse.data.reference,
                        paymentStatus: 'pending',
                        paymentMethod: 'paystack'
                    });
                } catch (updateError) {
                    console.error('Error updating order with payment reference:', updateError);
                    // Don't fail the payment initialization if order update fails
                }
            }

            return res.json({
                success: true,
                payment_url: paymentResponse.data.authorization_url,
                reference: paymentResponse.data.reference,
                access_code: paymentResponse.data.access_code
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Payment initialization failed',
                error: paymentResponse.message
            });
        }

    } catch (error) {
        console.error('Payment initialization error:', error);
        return res.status(500).json({
            success: false,
            message: 'Payment initialization failed',
            error: error.message
        });
    }
};

/**
 * Verify Paystack payment
 */
const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.body;

        console.log('Verifying payment with reference:', reference);

        if (!reference) {
            return res.status(400).json({
                success: false,
                message: 'Payment reference is required'
            });
        }

        // Verify payment with Paystack
        const verificationResponse = await Paystack.transaction.verify({ reference });

        if (verificationResponse.status) {
            const paymentData = verificationResponse.data;

            // Update order status based on payment status
            if (paymentData.status === 'success') {
                // Find and update the order
                console.log('Verifying payment for reference:', reference);
                const order = await OrderDb.findOneAndUpdate(
                    { orderNumber: reference },
                    {
                        paymentStatus: 'paid',
                        paymentMethod: 'paystack',
                        paidAt: new Date(),
                        transactionId: paymentData.id
                    },
                    { new: true }
                ).populate('userId', 'email firstName lastName');

                console.log('Order updated after payment verification:', order);

                if (order) {
                    // Send payment success email (don't fail payment if email fails)
                    const emailToSend = order.userId?.email || order.guestInfo?.email;
                    if (emailToSend) {
                        try {
                            await sendEmail(emailToSend, 'paymentSuccess', order);
                        } catch (emailError) {
                            console.error('Failed to send payment success email:', emailError);
                            // Don't fail the payment verification
                        }
                    }

                    return res.json({
                        success: true,
                        message: 'Payment verified successfully',
                        order: order,
                        paymentData: {
                            status: paymentData.status,
                            amount: paymentData.amount / 100, // Convert back from kobo
                            reference: paymentData.reference,
                            transaction_id: paymentData.id
                        }
                    });
                } else {
                    return res.status(404).json({
                        success: false,
                        message: 'Order not found for this payment reference'
                    });
                }
            } else {
                // Payment failed or pending
                await OrderDb.findOneAndUpdate(
                    { paymentReference: reference },
                    {
                        paymentStatus: paymentData.status,
                        paymentMethod: 'paystack'
                    }
                );

                return res.json({
                    success: false,
                    message: `Payment ${paymentData.status}`,
                    paymentData: {
                        status: paymentData.status,
                        reference: paymentData.reference
                    }
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                error: verificationResponse.message
            });
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
};

/**
 * Handle Paystack webhook
 */
const handleWebhook = async (req, res) => {
    try {
        // Verify webhook signature (recommended for production)
        const secret = process.env.PAYSTACK_SECRET_KEY;
        const hash = require('crypto').createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(400).send('Invalid signature');
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            const paymentData = event.data;

            // Update order status
            const order = await OrderDb.findOneAndUpdate(
                { paymentReference: paymentData.reference },
                {
                    paymentStatus: 'paid',
                    paymentMethod: 'paystack',
                    paidAt: new Date(),
                    transactionId: paymentData.id
                },
                { new: true }
            ).populate('userId', 'email firstName lastName');

            // Send payment success email (don't fail webhook if email fails)
            const emailToSend = order?.userId?.email || order?.guestInfo?.email;
            if (emailToSend) {
                try {
                    await sendEmail(emailToSend, 'paymentSuccess', order);
                } catch (emailError) {
                    console.error('Failed to send payment success email from webhook:', emailError);
                    // Don't fail the webhook processing
                }
            }

            console.log('Payment webhook processed successfully');
        }

        res.sendStatus(200);

    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Webhook processing failed');
    }
};

module.exports = {
    initializePayment,
    verifyPayment,
    handleWebhook
};