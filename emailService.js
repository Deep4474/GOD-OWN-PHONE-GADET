// Email service configuration
import { createClient } from '@supabase/supabase-js';
import emailTemplates from './emailTemplates.js';

// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

class EmailService {
    static async sendEmail(options) {
        try {
            const { to, subject, type, data } = options;
            
            // Get the appropriate template
            let htmlContent = '';
            switch (type) {
                case 'order_confirmation':
                    htmlContent = emailTemplates.orderConfirmation(data);
                    break;
                case 'order_status':
                    htmlContent = emailTemplates.orderStatus(data, data.status, data.message);
                    break;
                case 'admin_action':
                    htmlContent = emailTemplates.adminAction(data, data.action, data.message);
                    break;
                default:
                    throw new Error('Invalid email type');
            }

            // Call Supabase Edge Function to send email
            const { data: response, error } = await supabase.functions.invoke('send-email', {
                body: {
                    type,
                    to,
                    subject,
                    orderDetails: data
                }
            });

            if (error) throw error;
            return response;
        } catch (error) {
            console.error('Email service error:', error);
            throw new Error('Failed to send email');
        }
    }

    // Helper method for order confirmation
    static async sendOrderConfirmation(orderDetails) {
        return this.sendEmail({
            to: orderDetails.email,
            subject: `Order Confirmation - #${orderDetails.orderId}`,
            type: 'order_confirmation',
            data: orderDetails
        });
    }

    // Helper method for order status updates
    static async sendOrderStatusUpdate(orderDetails, status) {
        return this.sendEmail({
            to: orderDetails.email,
            subject: `Order Status Update - #${orderDetails.orderId}`,
            type: 'order_status',
            data: {
                ...orderDetails,
                status,
                message: `Your order status has been updated to ${status}`
            }
        });
    }

    // Helper method for admin actions
    static async sendAdminAction(orderDetails, action, message) {
        return this.sendEmail({
            to: orderDetails.email,
            subject: `Order Update - #${orderDetails.orderId}`,
            type: 'admin_action',
            data: {
                ...orderDetails,
                action,
                message
            }
        });
    }
}

// Export the service
export default EmailService;
