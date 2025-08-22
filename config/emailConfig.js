// Email Configuration
export const emailConfig = {
    // Your shop details
    shopName: "God's Own Phone Gadget",
    shopEmail: "noreply@godsownphonegadget.com",
    shopPhone: "+234 XXX XXX XXXX",
    shopAddress: "Your Shop Address, Nigeria",
    
    // Social media links
    socialLinks: {
        facebook: "https://facebook.com/godsownphonegadget",
        instagram: "https://instagram.com/godsownphonegadget",
        whatsapp: "https://wa.me/234XXXXXXXXXX"
    },
    
    // Email subjects
    subjects: {
        orderConfirmation: "Thank you for your order! - God's Own Phone Gadget",
        orderShipped: "Your order has been shipped! - God's Own Phone Gadget",
        orderDelivered: "Your order has been delivered - God's Own Phone Gadget",
        orderCancelled: "Order Cancellation Notice - God's Own Phone Gadget",
        adminAction: "Important Update About Your Order - God's Own Phone Gadget"
    },
    
    // Status messages
    statusMessages: {
        pending: "Your order is pending confirmation",
        confirmed: "Your order has been confirmed and is being processed",
        processing: "Your order is being prepared for shipping",
        shipped: "Your order is on its way to you!",
        delivered: "Your order has been delivered",
        cancelled: "Your order has been cancelled"
    },

    // Email footer
    footerText: "Thank you for shopping with God's Own Phone Gadget - Your Trusted Source for Quality Phones"
};

// Email colors and styling
export const emailStyles = {
    primary: "#007bff",
    secondary: "#6c757d",
    success: "#28a745",
    danger: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
    light: "#f8f9fa",
    dark: "#343a40",
    
    // Font settings
    fontFamily: "Arial, sans-serif",
    fontSize: "16px",
    
    // Container settings
    maxWidth: "600px",
    
    // Button styles
    button: {
        backgroundColor: "#007bff",
        color: "#ffffff",
        padding: "12px 25px",
        borderRadius: "5px",
        textDecoration: "none",
        display: "inline-block",
        marginTop: "15px"
    }
};

export default { emailConfig, emailStyles };
