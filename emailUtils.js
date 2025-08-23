const { emailConfig } = await import('./config/emailConfig.js');
const emailTemplates = await import('./emailTemplates.js').then(m => m.default);

// Email utility functions
const emailUtils = {
    // Function to send order confirmation email
    async sendOrderConfirmationEmail(orderDetails) {
        try {
            const { data: { _user }, error: userError } = await globalThis.supabaseClient.auth.getUser();
            if (userError) throw userError;

            const { data: _data, error } = await globalThis.supabaseClient.functions.invoke('send-email', {
                body: {
                    type: 'order_confirmation',
                    to: orderDetails.email,
                    subject: emailConfig.subjects.orderConfirmation,
                    html: emailTemplates.orderConfirmation(orderDetails),
                    orderDetails: {
                        orderId: orderDetails.orderId,
                        productName: orderDetails.productName,
                        quantity: orderDetails.quantity,
                        totalAmount: orderDetails.totalAmount,
                        deliveryMethod: orderDetails.deliveryMethod,
                        address: orderDetails.address
                    }
                }
            });

            if (error) throw error;
            return { success: true, message: 'Order confirmation email sent successfully' };
        } catch (error) {
            console.error('Error sending order confirmation email:', error);
            throw new Error('Failed to send order confirmation email');
        }
    },

    // Function to send order status update email
    async sendOrderStatusEmail(orderDetails, newStatus) {
        try {
            const { data: _data, error } = await globalThis.supabaseClient.functions.invoke('send-email', {
                body: {
                    type: 'order_status_update',
                    to: orderDetails.email,
                    subject: emailConfig.subjects[
                        newStatus === 'shipped' ? 'orderShipped' :
                        newStatus === 'delivered' ? 'orderDelivered' :
                        newStatus === 'cancelled' ? 'orderCancelled' : 
                        'orderStatus'
                    ],
                    html: emailTemplates.orderStatus(orderDetails, newStatus),
                    orderDetails: {
                        orderId: orderDetails.orderId,
                        productName: orderDetails.productName,
                        status: newStatus,
                        statusMessage: emailConfig.statusMessages[newStatus],
                        trackingLink: orderDetails.trackingLink
                    }
                }
            });

            if (error) throw error;
            return { success: true, message: 'Status update email sent successfully' };
        } catch (error) {
            console.error('Error sending order status email:', error);
            throw new Error('Failed to send order status update email');
        }
    },

    // Function to send admin action notification email
    async sendAdminActionEmail(orderDetails, action, message) {
        try {
            const { data: _data, error } = await globalThis.supabaseClient.functions.invoke('send-email', {
                body: {
                    type: 'admin_action',
                    to: orderDetails.email,
                    subject: emailConfig.subjects.adminAction,
                    html: emailTemplates.adminAction(orderDetails, action, message),
                    orderDetails: {
                        orderId: orderDetails.orderId,
                        productName: orderDetails.productName,
                        action,
                        message
                    }
                }
            });

            if (error) throw error;
            return { success: true, message: 'Admin action email sent successfully' };
        } catch (error) {
            console.error('Error sending admin action email:', error);
            throw new Error('Failed to send admin action email');
        }
    }
};

// Make email utilities available globally
globalThis.emailUtils = emailUtils;

// Export the utilities
export default emailUtils;
