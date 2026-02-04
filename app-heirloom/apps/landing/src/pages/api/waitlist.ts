import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

// Welcome email HTML template
const getWelcomeEmailHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to Heirloom</title>
  <style>
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100%; height: 100%; }
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F5EE; font-family: 'Inter', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F8F5EE;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color: #0C3B2E; padding: 40px 40px 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 500; color: #F8F5EE; letter-spacing: 0.5px;">Heirloom</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color: #C4A464; height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 24px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 400; color: #0C3B2E; line-height: 1.3;">Welcome to Heirloom</h2>
              <p style="margin: 0 0 20px 0; font-family: 'Inter', Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #2A2A2A;">Thank you for joining us. Your family's story begins here.</p>
              <p style="margin: 0 0 20px 0; font-family: 'Inter', Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #2A2A2A;">Heirloom is a place to preserve the voices, memories, and wisdom of the people you love. We're building something meaningful, and we wanted you to be among the first to know.</p>
              <p style="margin: 0 0 32px 0; font-family: 'Inter', Arial, sans-serif; font-size: 16px; line-height: 1.7; color: #2A2A2A;">When we're ready, you'll be the first to receive an invitation.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 16px 0;">
                    <div style="border-top: 1px solid #E8E4DB; width: 60px;"></div>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-style: italic; line-height: 1.6; color: #0C3B2E;">"Every family carries a story worth keeping."</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F8F5EE; padding: 32px 40px; border-top: 1px solid #E8E4DB;">
              <p style="margin: 0 0 8px 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #6B6B6B; text-align: center;">With warmth,</p>
              <p style="margin: 0 0 20px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; color: #0C3B2E; text-align: center;">The Heirloom Team</p>
              <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #9B9B9B; text-align: center;"><a href="https://theheirloom.site" style="color: #0C3B2E; text-decoration: none;">theheirloom.site</a></p>
            </td>
          </tr>
        </table>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 560px;">
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0; font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #9B9B9B;">You received this because you joined the Heirloom waitlist.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Send welcome email via SendGrid
async function sendWelcomeEmail(toEmail: string, sendgridApiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: 'hello@theheirloom.site', name: 'Heirloom' },
        subject: 'Welcome to Heirloom',
        content: [
          { type: 'text/html', value: getWelcomeEmailHtml() },
        ],
      }),
    });

    if (!response.ok) {
      console.error('SendGrid error:', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get credentials from environment (try Cloudflare runtime first, then import.meta.env)
    const runtime = (locals as any).runtime?.env || {};
    const supabaseUrl = runtime.SUPABASE_URL || import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = runtime.SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    const sendgridApiKey = runtime.SENDGRID_API_KEY || import.meta.env.SENDGRID_API_KEY;

    console.log('SendGrid API key present:', !!sendgridApiKey);

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const normalizedEmail = email.toLowerCase().trim();

    // Insert email into waitlist table
    const { error } = await supabase
      .from('waitlist')
      .insert([
        {
          email: normalizedEmail,
          source: 'landing_page',
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      // Handle duplicate email gracefully
      if (error.code === '23505') {
        return new Response(JSON.stringify({ message: 'Already on the waitlist!' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Failed to join waitlist' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send welcome email (don't fail signup if email fails)
    if (sendgridApiKey) {
      console.log('Attempting to send welcome email to:', normalizedEmail);
      const emailSent = await sendWelcomeEmail(normalizedEmail, sendgridApiKey);
      console.log('Email sent result:', emailSent);
    } else {
      console.log('No SendGrid API key found, skipping email');
    }

    return new Response(JSON.stringify({ message: 'Successfully joined waitlist!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
