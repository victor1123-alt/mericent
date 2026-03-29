# Email Notification Setup

This document explains how to set up email notifications for order status updates and payment confirmations.

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env` file in the backend directory:

#### For Development (Gmail)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

#### For Production (Brevo/Sendinblue)
```env
BREVO_SMTP_USER=your-brevo-smtp-username
BREVO_SMTP_PASS=your-brevo-smtp-password
BREVO_FROM_EMAIL=your-verified-sender@yourdomain.com
```

### 2. Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this 16-character app password as `EMAIL_PASS` in your `.env` file
   - **Important**: Do NOT use your regular Gmail password - it must be an app password

### 3. Brevo Setup (Recommended for Production)

Brevo (formerly Sendinblue) is a reliable, affordable email service that works well in hosted environments.

1. **Create a Brevo Account**:
   - Go to [brevo.com](https://www.brevo.com) and sign up for a free account
   - Verify your email address

2. **Get SMTP Credentials**:
   - Go to your Brevo dashboard
   - Navigate to SMTP & API → SMTP
   - Note down your SMTP server details (usually: smtp-relay.brevo.com, port 587)
   - Copy the SMTP login and password

3. **Verify Sender Email**:
   - In Brevo dashboard, go to Senders & IP → Senders
   - Add and verify your sender email address
   - This will be your `BREVO_FROM_EMAIL`

4. **Set Environment Variables**:
   ```env
   BREVO_SMTP_USER=your-smtp-login@brevo.com
   BREVO_SMTP_PASS=your-smtp-password
   BREVO_FROM_EMAIL=your-verified-email@yourdomain.com
   ```

### 4. Alternative Email Services

For production, other reliable options include:
- SendGrid
- Mailgun
- AWS SES
- Postmark

Update the transporter configuration in `utils/emailService.js` accordingly.

## Testing Email Configuration

To test if your email setup is working:

1. Start the backend server: `cd backend && npm run dev`
2. Check the console for any email-related errors
3. If emails are not sending, verify:
   - For Gmail: `EMAIL_USER` is your Gmail address, `EMAIL_PASS` is a 16-character app password
   - For Brevo: SMTP credentials are correct and sender email is verified
   - 2FA is enabled on your Gmail account (if using Gmail)
   - Less secure app access is NOT enabled (use app passwords instead)

## Email Templates

The system sends emails for:

### Payment Success
- Triggered when payment is verified successfully
- Contains order details, items, and shipping information

### Order Status Updates
- Triggered when order status changes to:
  - `processing`
  - `shipped`
  - `delivered`
- Contains order status and relevant information

## Testing

To test the email functionality:

1. Make sure your `.env` variables are set correctly
2. Start the backend server: `npm run dev`
3. Process a payment or update an order status through the admin panel
4. Check the console logs for email sending confirmation

## Troubleshooting

- **Emails not sending**: Check your credentials and app password
- **Connection errors**: Verify firewall settings and internet connection
- **Template errors**: Check the order data structure in the email templates
- **Brevo timeouts**: Ensure you're using the correct SMTP server (smtp-relay.brevo.com:587)

## Security Notes

- Never commit email credentials to version control
- Use environment variables for sensitive data
- Consider using dedicated email services for production
- Implement rate limiting for email sending to prevent abuse