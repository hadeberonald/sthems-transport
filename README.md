# Sthem's and Save's Transport Service Website

A professional, full-featured website for a Johannesburg-based guesthouse and transport service business. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

### Customer-Facing Website
- **Elegant Landing Page**: Professional design with smooth animations and brand-consistent styling
- **Package Booking System**: Pre-designed all-inclusive Johannesburg tour packages
- **Flexible Booking**: Custom booking option allowing guests to select individual services
- **Service Catalog**: Browse and select from accommodation, transport, and attraction services
- **Gallery**: Visual showcase of the property and services
- **Responsive Design**: Fully responsive across all devices

### Admin Portal
- **Dashboard Analytics**: View bookings, revenue, and key metrics at a glance
- **Booking Management**: 
  - View all bookings with detailed information
  - Update booking statuses (pending → confirmed → checked-in → checked-out)
  - Process cancellations
- **Service Management**: 
  - View all services
  - Manage pricing and availability
  - Add new services (structure in place)
- **Package Management**:
  - View all tour packages
  - Create custom packages (structure in place)
  - Update package details and pricing

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **Email**: Nodemailer (ready for integration)
- **Icons**: Lucide React

## Design System

### Brand Colors
- Primary: `#11203d` (Deep Navy)
- Primary Dark: `#0a1628`
- Accent Orange: `#e96411`
- Accent Teal: `#0e9aa1`

### Typography
- Display Font: Cormorant Garamond (serif)
- Body Font: Montserrat (sans-serif)

### Design Philosophy
- Clean, professional aesthetic
- Elegant animations and transitions
- High-contrast accessibility
- Generous whitespace
- No emoji usage (professional tone)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone and install dependencies**
```bash
cd sthems-transport
npm install
```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - This will create all tables and insert sample data

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email (optional for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Sthems and Saves Transport <noreply@sthems.com>
```

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin Access

Navigate to `/admin` and use the default password: `admin123`

**IMPORTANT**: Change this password in production! Implement proper authentication.

## Project Structure

```
sthems-transport/
├── app/
│   ├── page.tsx              # Homepage
│   ├── booking/
│   │   └── page.tsx          # Booking page
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Navigation.tsx        # Main navigation
│   └── Footer.tsx            # Footer component
├── lib/
│   └── supabase.ts           # Supabase client & types
├── public/
│   └── images/               # Static images (add your images here)
├── supabase-schema.sql       # Database schema
└── package.json
```

## Database Schema

### Tables
- **services**: Individual services (accommodation, transport, attractions)
- **packages**: Pre-designed tour packages
- **bookings**: Customer bookings with status tracking
- **guesthouse_rooms**: Room inventory (optional)
- **gallery_images**: Gallery photos

See `supabase-schema.sql` for complete schema with sample data.

## Key Features Implementation

### Booking Flow

**Package Booking**:
1. Customer selects a package from homepage
2. Fills out booking form with dates and guest details
3. Booking is created with status "pending"
4. Admin receives notification (email integration pending)
5. Admin confirms or rejects via dashboard
6. Customer receives confirmation email

**Flexible Booking**:
1. Customer selects "Custom Package"
2. Chooses individual services (lodging, transport, attractions)
3. Selects dates and number of guests
4. System calculates total based on selections
5. Same confirmation flow as package booking

### Admin Dashboard Features

**Booking Management**:
- View all bookings in table format
- Filter by status
- Update status with one click
- View detailed booking information in modal
- Track revenue and key metrics

**Service Management** (expandable):
- View all services with pricing
- Toggle active/inactive status
- Edit service details
- Add new services

**Package Management** (expandable):
- View all packages
- Edit package details and inclusions
- Create new packages
- Set pricing and duration

## Customization Guide

### Adding Images

1. **Homepage Hero**: Replace background in `app/page.tsx` hero section
2. **Service Images**: Add to `/public/images/services/` and update service records
3. **Gallery**: Upload via admin portal or manually to `/public/images/gallery/`

### Modifying Packages

Use the admin portal or directly in Supabase:
```sql
UPDATE packages 
SET name = 'New Package Name',
    price = 6500.00,
    inclusions = ARRAY['Item 1', 'Item 2']
WHERE id = 'package_id';
```

### Adding New Services

In Supabase or via admin portal (when implemented):
```sql
INSERT INTO services (name, description, price, category)
VALUES ('New Service', 'Description', 1500.00, 'attraction');
```

### Email Integration

Uncomment and configure nodemailer in a new API route:

```typescript
// app/api/send-booking-email/route.ts
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const booking = await request.json();
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: booking.customer_email,
    subject: 'Booking Confirmation',
    html: `<p>Your booking has been confirmed...</p>`,
  });
}
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## Security Considerations

### Before Production

1. **Authentication**: Implement proper admin authentication (NextAuth.js, Supabase Auth, etc.)
2. **Environment Variables**: Never commit `.env.local`
3. **API Routes**: Add authentication middleware to API routes
4. **Rate Limiting**: Implement rate limiting on booking endpoints
5. **Input Validation**: Add server-side validation for all forms
6. **CORS**: Configure appropriate CORS policies
7. **SQL Injection**: Use Supabase's parameterized queries (already implemented)

### Supabase Security

1. **Row Level Security**: Already enabled with basic policies
2. **API Keys**: Use separate keys for development and production
3. **Database Backups**: Enable automatic backups in Supabase

## Future Enhancements

### Planned Features
- [ ] Email notifications (nodemailer integration)
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Real-time availability calendar
- [ ] Customer review system
- [ ] Multi-language support
- [ ] Advanced admin analytics
- [ ] Mobile app (React Native)
- [ ] SMS notifications for bookings
- [ ] Loyalty program
- [ ] Dynamic pricing based on season

### Admin Portal Enhancements
- [ ] Complete CRUD operations for services and packages
- [ ] Bulk operations for bookings
- [ ] Export bookings to CSV/PDF
- [ ] Customer management system
- [ ] Revenue reports and analytics
- [ ] Inventory management for rooms
- [ ] Staff management and access controls

## Support and Customization

For customization help or feature additions, refer to:
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Supabase: https://supabase.com/docs
- TypeScript: https://www.typescriptlang.org/docs

## License

Proprietary - All rights reserved by Sthem's and Save's Transport Service

---

Built with precision and professionalism for Sthem's and Save's Transport Service
