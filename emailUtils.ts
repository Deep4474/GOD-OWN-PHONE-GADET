// Define types for Supabase client
interface SupabaseUser {
    id: string;
    email?: string;
    role?: string;
}

interface SupabaseError {
    message: string;
    status?: number;
}

interface EmailFunctionBody {
    type: 'order_confirmation' | 'order_status_update' | 'admin_action';
    to: string;
    subject: string;
    html: string;
    orderDetails: Record<string, unknown>;
}

type SupabaseClient = {
    auth: {
        getUser(): Promise<{ data: { user: SupabaseUser | null }, error: SupabaseError | null }>;
    };
    functions: {
        invoke(name: string, options: { body: EmailFunctionBody }): Promise<{ data: unknown, error: SupabaseError | null }>;
    };
};

import { emailConfig } from './config/emailConfig.js';
import emailTemplates from './emailTemplates.js';

// Extend the global namespace
declare global {
    interface Window {
        supabaseClient: SupabaseClient;
        emailUtils: typeof emailUtils;
    }
    var supabaseClient: SupabaseClient;
    var emailUtils: typeof emailUtils;
}

// Define interfaces for type safety
interface OrderDetails {
    orderId: string;
    email: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    deliveryMethod: string;
    address?: string;
    trackingLink?: string;
}

interface EmailResponse {
    success: boolean;
    message: string;
}

// Define email configuration types
interface EmailConfig {
    shopName: string;
    shopEmail: string;
    shopPhone: string;
    shopAddress: string;
    socialLinks: {
        facebook: string;
        instagram: string;
        whatsapp: string;
    };
    subjects: {
        orderConfirmation: string;
        orderShipped: string;
        orderDelivered: string;
        orderCancelled: string;
        adminAction: string;
    };
    statusMessages: {
        pending: string;
        confirmed: string;
        processing: string;
        shipped: string;
        delivered: string;
        cancelled: string;
    };
    footerText: string;
}

// Define order status type
type OrderStatus = keyof EmailConfig['statusMessages'];

// Email utility functions with TypeScript types
const emailUtils = {
    // Function to send order confirmation email
    async sendOrderConfirmationEmail(orderDetails: OrderDetails): Promise<EmailResponse> {
        try {
            const { data: { user: _user }, error: userError } = await (globalThis as typeof globalThis & { supabaseClient: SupabaseClient }).supabaseClient.auth.getUser();
            if (userError) throw userError;

            const { data: _data, error } = await (globalThis as typeof globalThis & { supabaseClient: SupabaseClient }).supabaseClient.functions.invoke('send-email', {
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
    async sendOrderStatusEmail(orderDetails: OrderDetails, newStatus: OrderStatus): Promise<EmailResponse> {
        try {
            const { data: _data, error } = await (globalThis as typeof globalThis & { supabaseClient: SupabaseClient }).supabaseClient.functions.invoke('send-email', {
                body: {
                    type: 'order_status_update',
                    to: orderDetails.email,
                    subject: newStatus === 'shipped' ? emailConfig.subjects.orderShipped :
                            newStatus === 'delivered' ? emailConfig.subjects.orderDelivered :
                            newStatus === 'cancelled' ? emailConfig.subjects.orderCancelled :
                            emailConfig.subjects.orderConfirmation,
                    html: emailTemplates.orderStatus(orderDetails, newStatus),
                    orderDetails: {
                        orderId: orderDetails.orderId,
                        productName: orderDetails.productName,
                        status: newStatus,
                        statusMessage: emailConfig.statusMessages[newStatus as keyof typeof emailConfig.statusMessages],
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
    async sendAdminActionEmail(orderDetails: OrderDetails, action: string, message: string): Promise<EmailResponse> {
        try {
            const { data: _data, error } = await (globalThis as typeof globalThis & { supabaseClient: SupabaseClient }).supabaseClient.functions.invoke('send-email', {
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
(globalThis as typeof globalThis & { emailUtils: typeof emailUtils }).emailUtils = emailUtils;

// Export the utilities
export default emailUtils;
