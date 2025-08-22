import EmailService from './emailService.js';

class OrderService {
    static async createOrder(orderData) {
        try {
            // Get the current user
            const { data: { user }, error: userError } = await globalThis.supabaseClient.auth.getUser();
            if (userError) throw userError;

            // Create the order in the database
            const { data: order, error } = await globalThis.supabaseClient
                .from('orders')
                .insert([{
                    ...orderData,
                    user_id: user.id,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            // Send order confirmation email
            await EmailService.sendOrderConfirmation({
                orderId: order.id,
                email: user.email,
                productName: orderData.product_name,
                quantity: orderData.quantity,
                totalAmount: orderData.total_amount,
                deliveryMethod: orderData.delivery_method,
                address: orderData.delivery_address
            });

            return order;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    static async updateOrderStatus(orderId, newStatus) {
        try {
            // Update order status in database
            const { data: order, error } = await globalThis.supabaseClient
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)
                .select()
                .single();

            if (error) throw error;

            // Get user email
            const { data: user } = await globalThis.supabaseClient
                .from('profiles')
                .select('email')
                .eq('id', order.user_id)
                .single();

            // Send status update email
            await EmailService.sendOrderStatusUpdate({
                orderId: order.id,
                email: user.email,
                productName: order.product_name,
                status: newStatus,
                trackingLink: order.tracking_link
            }, newStatus);

            return order;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    static async handleAdminAction(orderId, action, message) {
        try {
            // Get order details
            const { data: order, error } = await globalThis.supabaseClient
                .from('orders')
                .select('*, profiles(email)')
                .eq('id', orderId)
                .single();

            if (error) throw error;

            // Send admin action email
            await EmailService.sendAdminAction({
                orderId: order.id,
                email: order.profiles.email,
                productName: order.product_name,
                action,
                message
            }, action, message);

            return order;
        } catch (error) {
            console.error('Error handling admin action:', error);
            throw error;
        }
    }

    // Helper method to format currency
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    }
}

// Export the service
export default OrderService;
