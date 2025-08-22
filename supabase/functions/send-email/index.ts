// supabase/functions/send-email/index.ts
import { serve, SmtpClient } from './deps.ts'

const SMTP_HOSTNAME = Deno.env.get('SMTP_HOSTNAME') || 'smtp.gmail.com'
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587')
const SMTP_USERNAME = Deno.env.get('SMTP_USERNAME') || 'your-email@gmail.com'
const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD') || 'your-app-specific-password'

interface OrderDetails {
  orderId?: string;
  productName?: string;
  quantity?: number;
  totalAmount?: number;
  deliveryMethod?: string;
  address?: string;
  status?: string;
  statusMessage?: string;
  trackingLink?: string;
  action?: string;
  message?: string;
  htmlContent?: string;
}

function getEmailContent(type: string, orderDetails: OrderDetails): string {
  switch (type) {
    case 'order_confirmation':
      return `
        <h2>Order Confirmation - #${orderDetails.orderId}</h2>
        <p>Thank you for your order!</p>
        <h3>Order Details:</h3>
        <ul>
          <li>Product: ${orderDetails.productName}</li>
          <li>Quantity: ${orderDetails.quantity}</li>
          <li>Total Amount: ₦${orderDetails.totalAmount?.toLocaleString() ?? 'N/A'}</li>
          <li>Delivery Method: ${orderDetails.deliveryMethod ?? 'N/A'}</li>
          ${orderDetails.address ? `<li>Delivery Address: ${orderDetails.address}</li>` : ''}
        </ul>
        <p>We will process your order soon.</p>
      `

    case 'order_status_update':
      return `
        <h2>Order Status Update - #${orderDetails.orderId ?? 'Unknown'}</h2>
        <p>${orderDetails.statusMessage ?? 'Your order status has been updated.'}</p>
        <h3>Order Details:</h3>
        <ul>
          <li>Product: ${orderDetails.productName ?? 'N/A'}</li>
          <li>New Status: ${orderDetails.status ?? 'N/A'}</li>
          ${orderDetails.trackingLink ? `<li>Tracking Link: <a href="${orderDetails.trackingLink}">Track Your Order</a></li>` : ''}
        </ul>
      `

    case 'admin_action':
      return `
        <h2>Order Update - #${orderDetails.orderId ?? 'Unknown'}</h2>
        <p>Your order has been updated by our admin team:</p>
        <h3>Update Details:</h3>
        <ul>
          <li>Product: ${orderDetails.productName ?? 'N/A'}</li>
          <li>Action: ${orderDetails.action ?? 'N/A'}</li>
          <li>Message: ${orderDetails.message ?? 'No additional message.'}</li>
        </ul>
      `

    default:
      return orderDetails.htmlContent || ''
  }
}

serve(async (req) => {
  try {
    const { type = 'custom', to, subject, orderDetails } = await req.json()

    const client = new SmtpClient()
    await client.connectTLS({
      hostname: SMTP_HOSTNAME,
      port: SMTP_PORT,
      username: SMTP_USERNAME,
      password: SMTP_PASSWORD,
    })

    const htmlContent = getEmailContent(type, orderDetails)

    await client.send({
      from: SMTP_USERNAME,
      to: to,
      subject: subject,
      content: htmlContent,
      html: htmlContent,
    })

    await client.close()

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
