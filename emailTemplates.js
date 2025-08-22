import { emailConfig, emailStyles } from './config/emailConfig.js';

// Create base email layout
const createEmailLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: ${emailStyles.fontFamily};
            font-size: ${emailStyles.fontSize};
            line-height: 1.6;
            color: ${emailStyles.dark};
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: ${emailStyles.maxWidth};
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: ${emailStyles.primary};
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            background-color: white;
            padding: 20px;
        }
        .footer {
            background-color: ${emailStyles.light};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: ${emailStyles.secondary};
        }
        .order-details {
            background-color: ${emailStyles.light};
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .button {
            background-color: ${emailStyles.button.backgroundColor};
            color: ${emailStyles.button.color} !important;
            padding: ${emailStyles.button.padding};
            border-radius: ${emailStyles.button.borderRadius};
            text-decoration: none;
            display: inline-block;
            margin-top: 15px;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            margin: 0 10px;
            color: ${emailStyles.primary};
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${emailConfig.shopName}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>${emailConfig.footerText}</p>
            <div class="social-links">
                <a href="${emailConfig.socialLinks.facebook}">Facebook</a>
                <a href="${emailConfig.socialLinks.instagram}">Instagram</a>
                <a href="${emailConfig.socialLinks.whatsapp}">WhatsApp</a>
            </div>
            <p>
                Contact us:<br>
                Email: ${emailConfig.shopEmail}<br>
                Phone: ${emailConfig.shopPhone}<br>
                Address: ${emailConfig.shopAddress}
            </p>
        </div>
    </div>
</body>
</html>
`;

const emailTemplates = {
    orderConfirmation: (orderDetails) => createEmailLayout(`
        <h2>Thank You for Your Order!</h2>
        <p>We're excited to confirm your order with God's Own Phone Gadget.</p>
        
        <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
            <p><strong>Product:</strong> ${orderDetails.productName}</p>
            <p><strong>Quantity:</strong> ${orderDetails.quantity}</p>
            <p><strong>Total Amount:</strong> ₦${orderDetails.totalAmount.toLocaleString()}</p>
            <p><strong>Delivery Method:</strong> ${orderDetails.deliveryMethod}</p>
            <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
        </div>
        
        <p>What happens next?</p>
        <ol>
            <li>We'll process your order and send you a confirmation when it's ready.</li>
            <li>You'll receive tracking information once your order ships.</li>
            <li>We'll notify you when your order is out for delivery.</li>
        </ol>

        <a href="track-order?id=${orderDetails.orderId}" class="button">Track Your Order</a>
    `),

    orderStatus: (orderDetails, status) => createEmailLayout(`
        <h2>Order Status Update</h2>
        <p>There's an update about your order!</p>
        
        <div class="order-details">
            <h3>Current Status: ${status}</h3>
            <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
            <p><strong>Product:</strong> ${orderDetails.productName}</p>
            <p><strong>Status Message:</strong> ${emailConfig.statusMessages[status]}</p>
            ${orderDetails.trackingLink ? `
                <p><strong>Tracking Information:</strong></p>
                <a href="${orderDetails.trackingLink}" class="button">Track Shipment</a>
            ` : ''}
        </div>

        <p>If you have any questions about your order, please don't hesitate to contact us.</p>
    `),

    adminAction: (orderDetails, action, message) => createEmailLayout(`
        <h2>Important Order Update</h2>
        <p>We have an important update about your order.</p>
        
        <div class="order-details">
            <h3>Update Details</h3>
            <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
            <p><strong>Action Taken:</strong> ${action}</p>
            <p><strong>Message:</strong> ${message}</p>
        </div>

        <p>If you need to discuss this update, please contact our customer service team.</p>
        <a href="contact-us" class="button">Contact Support</a>
    `),

    orderDelivered: (orderDetails) => createEmailLayout(`
        <h2>Order Delivered Successfully! 🎉</h2>
        <p>Great news! Your order has been delivered.</p>
        
        <div class="order-details">
            <h3>Delivery Confirmation</h3>
            <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
            <p><strong>Product:</strong> ${orderDetails.productName}</p>
            <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <p>We hope you enjoy your purchase! If you have any feedback about our service, we'd love to hear from you.</p>
        <a href="review-order?id=${orderDetails.orderId}" class="button">Leave a Review</a>
    `)
};

export default emailTemplates;
