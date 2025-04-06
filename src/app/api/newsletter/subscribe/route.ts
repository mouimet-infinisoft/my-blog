import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the provided API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Create a default audience ID for testing
    const defaultAudienceId = 'default';

    // Add subscriber to Resend contacts
    const { data, error } = await resend.contacts.create({
      audienceId: defaultAudienceId,
      email,
      firstName: name || undefined,
      unsubscribed: false,
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: 'Failed to add subscriber' }, { status: 500 });
    }

    // Send welcome email
    await resend.emails.send({
      from: `Infinisoft Blog <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to the Infinisoft Blog Newsletter',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Infinisoft Blog Newsletter</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #0d9488;
              color: white;
              padding: 20px;
              text-align: center;
            }
            .content {
              padding: 20px;
              background-color: #f9fafb;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #6b7280;
            }
            a {
              color: #0d9488;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to the Infinisoft Blog!</h1>
            </div>
            <div class="content">
              <p>Hello ${name || 'there'},</p>
              <p>Thank you for subscribing to the Infinisoft Blog newsletter! We're excited to have you join our community.</p>
              <p>Here's what you can expect:</p>
              <ul>
                <li>Updates on new articles and series</li>
                <li>Technical insights and tutorials</li>
                <li>Programming best practices</li>
                <li>Industry news and trends</li>
              </ul>
              <p>Visit our blog at <a href="${process.env.SITE_URL}">${process.env.SITE_URL}</a> to explore our existing content.</p>
              <p>We're committed to providing valuable content that helps you grow as a developer.</p>
              <p>Best regards,<br>The Infinisoft Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Infinisoft. All rights reserved.</p>
              <p>You're receiving this email because you subscribed to our newsletter.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 });
  }
}
