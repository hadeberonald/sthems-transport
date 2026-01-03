import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// This is a template API route for sending booking confirmation emails
// To use: Uncomment and configure with your email credentials

export async function POST(request: NextRequest) {
  try {
    const booking = await request.json();

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Customer confirmation email
    const customerEmail = {
      from: process.env.EMAIL_FROM,
      to: booking.customer_email,
      subject: 'Booking Confirmation - Sthem\'s and Save\'s Transport Service',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #11203d; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11203d, #0e9aa1); color: white; padding: 30px; text-align: center; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .booking-details { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; background: #e96411; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmation</h1>
              <p>Sthem's and Save's Transport Service</p>
            </div>
            
            <div class="content">
              <p>Dear ${booking.customer_name},</p>
              
              <p>Thank you for your booking request. We have received your details and are pleased to confirm your reservation.</p>
              
              <div class="booking-details">
                <h3>Booking Details</h3>
                <div class="detail-row">
                  <span><strong>Booking Reference:</strong></span>
                  <span>${booking.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Check-in Date:</strong></span>
                  <span>${new Date(booking.check_in_date).toLocaleDateString('en-ZA', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Check-out Date:</strong></span>
                  <span>${new Date(booking.check_out_date).toLocaleDateString('en-ZA', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Number of Guests:</strong></span>
                  <span>${booking.number_of_guests}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Total Amount:</strong></span>
                  <span><strong>R${booking.total_price.toLocaleString()}</strong></span>
                </div>
              </div>
              
              ${booking.special_requests ? `
                <div style="margin: 20px 0; padding: 15px; background: #fff3e0; border-left: 4px solid #e96411;">
                  <strong>Your Special Requests:</strong><br>
                  ${booking.special_requests}
                </div>
              ` : ''}
              
              <p>Our team will review your booking and send you a final confirmation within 24 hours.</p>
              
              <h3>What's Next?</h3>
              <ul>
                <li>You will receive a final confirmation email within 24 hours</li>
                <li>Payment instructions will be included in the confirmation</li>
                <li>Feel free to contact us if you have any questions</li>
              </ul>
              
              <center>
                <a href="tel:+27XXXXXXXXX" class="button">Contact Us</a>
              </center>
              
              <p>We look forward to welcoming you to Johannesburg!</p>
              
              <p>Warm regards,<br>
              <strong>The Sthem's and Save's Team</strong></p>
            </div>
            
            <div class="footer">
              <p>Sthem's and Save's Transport Service<br>
              Johannesburg, Gauteng, South Africa<br>
              Phone: +27 XX XXX XXXX | Email: info@sthemsandsaves.co.za</p>
              <p>If you did not make this booking, please contact us immediately.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Admin notification email
    const adminEmail = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to admin
      subject: `New Booking Request - ${booking.customer_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #11203d; color: white; padding: 20px; }
            .content { background: white; padding: 20px; border: 1px solid #ddd; }
            .alert { background: #e96411; color: white; padding: 15px; margin: 20px 0; border-radius: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .label { font-weight: bold; width: 40%; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Booking Request</h2>
            </div>
            
            <div class="content">
              <div class="alert">
                <strong>Action Required:</strong> A new booking has been submitted and requires your review.
              </div>
              
              <h3>Customer Information</h3>
              <table>
                <tr>
                  <td class="label">Name:</td>
                  <td>${booking.customer_name}</td>
                </tr>
                <tr>
                  <td class="label">Email:</td>
                  <td><a href="mailto:${booking.customer_email}">${booking.customer_email}</a></td>
                </tr>
                <tr>
                  <td class="label">Phone:</td>
                  <td><a href="tel:${booking.customer_phone}">${booking.customer_phone}</a></td>
                </tr>
              </table>
              
              <h3>Booking Details</h3>
              <table>
                <tr>
                  <td class="label">Booking Type:</td>
                  <td>${booking.booking_type}</td>
                </tr>
                <tr>
                  <td class="label">Check-in:</td>
                  <td>${new Date(booking.check_in_date).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td class="label">Check-out:</td>
                  <td>${new Date(booking.check_out_date).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td class="label">Guests:</td>
                  <td>${booking.number_of_guests}</td>
                </tr>
                <tr>
                  <td class="label">Total:</td>
                  <td><strong>R${booking.total_price.toLocaleString()}</strong></td>
                </tr>
              </table>
              
              ${booking.special_requests ? `
                <h3>Special Requests</h3>
                <p style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
                  ${booking.special_requests}
                </p>
              ` : ''}
              
              <p style="margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" 
                   style="background: #0e9aa1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  View in Dashboard
                </a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(customerEmail),
      transporter.sendMail(adminEmail),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Emails sent successfully' 
    });

  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}
