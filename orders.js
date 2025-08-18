// Create order in Supabase
async function createOrder(orderData) {
    try {
        // Insert order into database
        const { data: order, error } = await window.supabaseClient
            .from('orders')
            .insert([orderData])
            .select();

        if (error) throw error;

        // Send confirmation email
        if (order && order[0]) {
            const emailDetails = {
                orderId: order[0].id,
                email: orderData.email,
                productName: orderData.product_name,
                quantity: orderData.quantity,
                price: orderData.price || orderData.total_amount / orderData.quantity,
                totalAmount: orderData.total_amount,
                deliveryMethod: orderData.delivery_option,
                address: orderData.address
            };

            await window.emailUtils.sendOrderConfirmationEmail(emailDetails);
        }

        return order;
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order. Please try again.');
    }
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        // Get order details first
        const { data: orderData, error: fetchError } = await window.supabaseClient
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError) throw fetchError;

        // Update status
        const { data: updatedOrder, error: updateError } = await window.supabaseClient
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select();

        if (updateError) throw updateError;

        // Send status update email
        if (orderData) {
            const emailDetails = {
                orderId: orderData.id,
                email: orderData.email,
                productName: orderData.product_name,
                quantity: orderData.quantity,
                totalAmount: orderData.total_amount,
                deliveryMethod: orderData.delivery_option,
                trackingLink: orderData.tracking_link
            };

            await window.emailUtils.sendOrderStatusEmail(emailDetails, newStatus);
        }

        return updatedOrder;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw new Error('Failed to update order status. Please try again.');
    }
}

window.createOrder = createOrder;
window.updateOrderStatus = updateOrderStatus;