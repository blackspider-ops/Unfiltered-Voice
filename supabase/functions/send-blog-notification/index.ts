import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
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
    const { postId } = await req.json()

    if (!postId) {
      throw new Error('Post ID is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the published post details
    const { data: post, error: postError } = await supabaseClient
      .from('posts')
      .select('id, title, excerpt, content, slug, category, created_at')
      .eq('id', postId)
      .eq('is_published', true)
      .single()

    if (postError || !post) {
      throw new Error('Post not found or not published')
    }

    // Get all registered users (subscribers)
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from('profiles')
      .select('email, display_name')
      .not('email', 'is', null)

    if (subscribersError) {
      throw new Error('Failed to fetch subscribers')
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No subscribers found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('Resend API key not configured')
    }

    // Generate excerpt if not provided
    const { data: excerptData } = await supabaseClient.rpc('get_post_excerpt', {
      post_excerpt: post.excerpt,
      post_content: post.content
    });
    
    const finalExcerpt = excerptData || 'A new post has been published. Click to read the full article.';

    // Create the email content
    const postUrl = `https://www.unfilteredvoice.me/${post.category}/${post.slug}`
    const unsubscribeUrl = `https://www.unfilteredvoice.me/unsubscribe`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Post: ${post.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .post-title { font-size: 24px; font-weight: 600; color: #2d3748; margin: 0 0 15px 0; line-height: 1.3; }
          .post-meta { color: #718096; font-size: 14px; margin-bottom: 20px; }
          .post-excerpt { font-size: 16px; color: #4a5568; line-height: 1.6; margin-bottom: 30px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
          .cta-button:hover { transform: translateY(-2px); }
          .footer { background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { margin: 0; color: #718096; font-size: 14px; }
          .footer a { color: #667eea; text-decoration: none; }
          .category-badge { display: inline-block; background: #edf2f7; color: #4a5568; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>The Unfiltered Voice</h1>
            <p>New post published</p>
          </div>
          
          <div class="content">
            <div class="category-badge">${post.category}</div>
            <h2 class="post-title">${post.title}</h2>
            <div class="post-meta">
              Published ${new Date(post.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            
            <div class="post-excerpt">${finalExcerpt}</div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${postUrl}" class="cta-button">Read More</a>
            </div>
          </div>
          
          <div class="footer">
            <p>You're receiving this because you're subscribed to The Unfiltered Voice.</p>
            <p><a href="${unsubscribeUrl}">Unsubscribe</a> | <a href="https://www.unfilteredvoice.me">Visit Website</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send one email with all subscribers in BCC (much more efficient!)
    const subscriberEmails = subscribers.map(sub => sub.email)
    console.log(`Sending blog notification to ${subscriberEmails.length} subscribers via BCC`)

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'The Unfiltered Voice <noreply@unfilteredvoice.me>',
          to: ['noreply@unfilteredvoice.me'], // Send to self as primary recipient
          bcc: subscriberEmails, // All subscribers in BCC
          subject: `New Post: ${post.title}`,
          html: emailHtml,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to send BCC email:', errorText)
        throw new Error(`Email sending failed: ${errorText}`)
      }

      const emailResult = await response.json()
      console.log('BCC email sent successfully:', emailResult)
      
      // All emails were sent successfully in one go
      const results = subscriberEmails.map(email => ({ email, success: true }))
      const successCount = results.filter(r => r.success).length
      const failureCount = 0 // BCC either works for all or fails for all
      
      console.log(`BCC email sent successfully to ${successCount} subscribers`)
    } catch (error) {
      console.error('BCC email failed:', error)
      // If BCC fails, all emails fail
      const results = subscriberEmails.map(email => ({ email, success: false }))
      const successCount = 0
      const failureCount = subscriberEmails.length

      // Log the notification in the database
      await supabaseClient
        .from('email_notifications')
        .insert({
          post_id: postId,
          notification_type: 'new_post',
          recipients_count: subscribers.length,
          success_count: successCount,
          failure_count: failureCount,
          sent_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Email notification sent successfully to ${successCount} subscribers via BCC`,
          details: { 
            successCount, 
            failureCount, 
            totalSubscribers: subscribers.length,
            method: 'BCC',
            efficient: true
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
        }
      )
    }

  } catch (error) {
    console.error('Error in send-blog-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})