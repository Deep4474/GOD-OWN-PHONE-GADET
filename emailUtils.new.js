import { emailConfig } from './config/emailConfig.js';
import emailTemplates from './emailTemplates.js';

/**
 * Email utility functions for handling all email communications
 */
const emailUtils = {
    /**
     * Send order confirmation email to customer
     */
    async sendOrderConfirmationEmail(orderDetails) {
        try {
            const { data: { _user }, error: userError } = await globalThis.supabaseClient.auth.getUser();
            if (userError) throw userError;

            const { data, error } = await globalThis.supabaseClient.functions.invoke('send-email', {
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
            return data;
        } catch (error) {
            console.error('Error sending order confirmation email:', error);
            throw new Error('Failed to send order confirmation email');
        }
    },

    /**
     * Send order status update email to customer
     */
    async sendOrderStatusEmail(orderDetails, newStatus) {
        try {
            const { data, error } = await globalThis.supabaseClient.functions.invoke('send-email', {
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
            return data;
        } catch (error) {
            console.error('Error sending order status email:', error);
            throw new Error('Failed to send order status update email');
        }
    },

    /**
     * Send admin action notification email to customer
     */
    async sendAdminActionEmail(orderDetails, action, message) {
        try {
            const { data, error } = await globalThis.supabaseClient.functions.invoke('send-email', {
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
            return data;
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
