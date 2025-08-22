import OrderService from './orderService.js';

// Admin order management handlers
const adminOrderHandlers = {
    // Initialize admin order handlers
    init() {
        // Listen for status change events
        document.addEventListener('orderStatusChange', async (e) => {
            const { orderId, newStatus } = e.detail;
            try {
                await OrderService.updateOrderStatus(orderId, newStatus);
                globalThis.utils.showSuccess('Status updated successfully');
            } catch (error) {
                globalThis.utils.showError('Failed to update order status');
                console.error(error);
            }
        });

        // Listen for admin action events
        document.addEventListener('adminAction', async (e) => {
            const { orderId, action, message } = e.detail;
            try {
                await OrderService.handleAdminAction(orderId, action, message);
                globalThis.utils.showSuccess('Action completed successfully');
            } catch (error) {
                globalThis.utils.showError('Failed to complete action');
                console.error(error);
            }
        });
    },

    // Handle order status update
    async updateOrderStatus(orderId, newStatus) {
        try {
            // Update the order status
            await OrderService.updateOrderStatus(orderId, newStatus);
            
            // Show success message
            const statusMessage = document.getElementById('statusMessage');
            if (statusMessage) {
                statusMessage.textContent = `Order status updated to: ${newStatus}`;
                statusMessage.style.color = '#28a745';
                statusMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error updating status:', error);
            // Show error message
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = 'Failed to update order status';
                errorMessage.style.display = 'block';
            }
        }
    },

    // Handle admin action
    async takeAction(orderId, action, message) {
        try {
            // Process the admin action
            await OrderService.handleAdminAction(orderId, action, message);
            
            // Show success message
            const actionMessage = document.getElementById('actionMessage');
            if (actionMessage) {
                actionMessage.textContent = 'Action completed successfully';
                actionMessage.style.color = '#28a745';
                actionMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error taking action:', error);
            // Show error message
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = 'Failed to complete action';
                errorMessage.style.display = 'block';
            }
        }
    }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    adminOrderHandlers.init();
});

export default adminOrderHandlers;
