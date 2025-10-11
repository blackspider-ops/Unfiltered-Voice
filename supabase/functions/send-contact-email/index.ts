import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, message } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all owner emails
    const { data: ownerEmails } = await supabaseClient.rpc('get_owner_emails')

    if (!ownerEmails || ownerEmails.length === 0) {
      throw new Error('No owner emails found')
    }

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    console.log('Resend API Key exists:', !!resendApiKey)
    console.log('Owner emails:', ownerEmails)

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables')
      throw new Error('Email service not configured')
    }

    if (resendApiKey) {
      console.log('Attempting to send email...')
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'The Unfiltered Voice <noreply@unfilteredvoice.me>',
          to: ownerEmails,
          subject: `New Contact Message from ${name}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Contact Message</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 300; }
                .content { padding: 30px; }
                .message-box { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
                .footer { background: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>New Contact Message</h1>
                </div>
                <div class="content">
                  <p><strong>From:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Message:</strong></p>
                  <div class="message-box">
                    ${message.replace(/\n/g, '<br>')}
                  </div>
                  <div style="text-align: center;">
                    <a href="https://www.unfilteredvoice.me/admin" class="cta-button">View in Admin Panel</a>
                  </div>
                </div>
                <div class="footer">
                  <p>This message was sent from your website contact form at unfilteredvoice.me</p>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      })

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text()
        console.error('Resend API error:', errorText)
        throw new Error(`Failed to send email: ${errorText}`)
      }
      
      const emailResult = await emailResponse.json()
      console.log('Email sent successfully:', emailResult)
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})