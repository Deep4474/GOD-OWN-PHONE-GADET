// supabase/functions/send-email/index.ts
import { serve, SmtpClient } from './deps.ts'

const SMTP_HOSTNAME = Deno.env.get('SMTP_HOSTNAME') || 'smtp.gmail.com'
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587')
const SMTP_USERNAME = Deno.env.get('SMTP_USERNAME') || 'your-email@gmail.com'
const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD') || 'your-app-specific-password'

serve(async (req) => {
  try {
    const { to, subject, htmlContent } = await req.json()

    const client = new SmtpClient()
    await client.connectTLS({
      hostname: SMTP_HOSTNAME,
      port: SMTP_PORT,
      username: SMTP_USERNAME,
      password: SMTP_PASSWORD,
    })

    await client.send({
      from: SMTP_USERNAME,
      to: to,
      subject: subject,
      content: htmlContent,
      html: htmlContent,
    })

    await client.close()

    return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
