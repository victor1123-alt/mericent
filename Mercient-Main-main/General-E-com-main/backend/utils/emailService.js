const axios = require('axios');
require('dotenv').config();
// Brevo API configuration
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// Email templates
const emailTemplates = {
  paymentSuccess: (order) => {
    // Determine customer name and email
    const customerName = order.userId 
      ? `${order.userId.firstName} ${order.userId.lastName}`
      : order.guestInfo?.name || 'Customer';
    
    const customerEmail = order.userId?.email || order.guestInfo?.email;
    
    // Determine shipping address
    const shippingAddress = order.shippingAddress;
    const shippingInfo = shippingAddress 
      ? `${shippingAddress.city || ''}, ${shippingAddress.state || ''}, ${shippingAddress.country || ''}`.replace(/^, |, $/, '')
      : 'Shipping address not provided';

    return {
      subject: 'Payment Successful - Order Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Payment Successful!</h2>
          <p>Dear ${customerName},</p>
          <p>Your payment has been successfully processed. Here are your order details:</p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3>Order #${order.orderNumber}</h3>
            <p><strong>Total Amount:</strong> ₦${order.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          <h4>Items Ordered:</h4>
          <ul>
            ${order.items?.map(item => `
              <li>${item.productName} - Quantity: ${item.quantity} - ₦${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
            `).join('')}
          </ul>

          <p><strong>Shipping Address:</strong></p>
          <p>${shippingInfo}</p>

          <p>Thank you for shopping with us! We'll send you another email when your order ships.</p>

          <p>Best regards,<br>Mercient Team</p>
        </div>
      `
    };
  },

  orderStatusUpdate: (order, status) => {
    // Determine customer name
    const customerName = order.userId 
      ? `${order.userId.firstName} ${order.userId.lastName}`
      : order.guestInfo?.name || 'Customer';

    const statusMessages = {
      processing: {
        title: 'Order Processing Started',
        message: 'We have started processing your order. Our team is preparing your items for shipment.'
      },
      shipped: {
        title: 'Order Shipped',
        message: 'Your order has been shipped and is on its way to you.'
      },
      delivered: {
        title: 'Order Delivered',
        message: 'Your order has been successfully delivered. Thank you for shopping with us!'
      }
    };

    const statusInfo = statusMessages[status] || {
      title: `Order Status Updated: ${status}`,
      message: `Your order status has been updated to: ${status}`
    };

    return {
      subject: `Order Update: ${statusInfo.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">${statusInfo.title}</h2>
          <p>Dear ${customerName},</p>
          <p>${statusInfo.message}</p>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3>Order #${order.orderNumber}</h3>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Total Amount:</strong> ₦${order.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <p>If you have any questions, please don't hesitate to contact our support team.</p>

          <p>Best regards,<br>Mercient Team</p>
        </div>
      `
    };
  }
};

// Send email function
const sendEmail = async (to, template, data, status = null) => {
  try {
    const templateFn = emailTemplates[template];

    if (!templateFn) {
      throw new Error(`Email template "${template}" not found`);
    }

    const templateContent =
      template === 'orderStatusUpdate'
        ? templateFn(data, status)
        : templateFn(data);

    const senderEmail =
      process.env.BREVO_FROM_EMAIL || process.env.EMAIL_FROM;

    if (!senderEmail) {
      throw new Error('Sender email not configured');
    }

    const emailData = {
      sender: {
        name: 'Mercient Team',
        email: senderEmail
      },
      to: [{ email: to }],
      subject: templateContent.subject,
      htmlContent: templateContent.html
    };

    const response = await axios.post(
      BREVO_API_URL,
      emailData,
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.messageId
    };

  } catch (error) {
    console.error('Email error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

module.exports = {
  sendEmail,
  emailTemplates
};