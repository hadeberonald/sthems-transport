# Deployment Guide

## Quick Deployment to Vercel

### Step 1: Prepare Your Repository

```bash
git init
git add .
git commit -m "Initial commit: Sthem's Transport Service website"
```

Push to GitHub:
```bash
git remote add origin https://github.com/yourusername/sthems-transport.git
git branch -M main
git push -u origin main
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to SQL Editor and run the entire `supabase-schema.sql` file
4. Go to Settings → API to get your credentials:
   - Project URL (e.g., https://xxxxx.supabase.co)
   - Anon/Public key

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

6. Click "Deploy"

Your site will be live at `your-project.vercel.app` in ~2 minutes!

## Custom Domain Setup

### On Vercel

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain (e.g., sthemsandsaves.co.za)
4. Follow the DNS configuration instructions

### DNS Configuration

Add these records to your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Alternative Deployment Options

### Netlify

1. Connect your GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variables
4. Deploy

### DigitalOcean App Platform

1. Create a new app from GitHub
2. Select your repository
3. Choose Web Service
4. Build command: `npm run build`
5. Run command: `npm start`
6. Add environment variables
7. Deploy

### Self-Hosting (Ubuntu/VPS)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/yourusername/sthems-transport.git
cd sthems-transport

# Install dependencies
npm install

# Build
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start npm --name "sthems-transport" -- start

# Make PM2 start on boot
pm2 startup
pm2 save
```

#### Nginx Configuration (Self-Hosting)

```nginx
server {
    listen 80;
    server_name sthemsandsaves.co.za www.sthemsandsaves.co.za;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment Checklist

### Essential
- [ ] Test all booking flows
- [ ] Verify admin login works
- [ ] Check mobile responsiveness
- [ ] Test form submissions
- [ ] Verify Supabase connection
- [ ] Update contact information
- [ ] Add real images to gallery
- [ ] Set up SSL certificate (automatic on Vercel/Netlify)

### Security
- [ ] Change admin password from default
- [ ] Implement proper authentication
- [ ] Add rate limiting
- [ ] Enable CORS protection
- [ ] Set up monitoring/logging

### Optimization
- [ ] Add real images and optimize them
- [ ] Set up analytics (Google Analytics, Plausible, etc.)
- [ ] Configure caching headers
- [ ] Enable compression
- [ ] Add sitemap.xml
- [ ] Submit to search engines

### Business
- [ ] Configure email notifications
- [ ] Set up payment gateway
- [ ] Add booking confirmation emails
- [ ] Create cancellation policy page
- [ ] Add terms and conditions
- [ ] Set up customer support system

## Monitoring and Maintenance

### Vercel Analytics

Enable in your Vercel dashboard:
1. Go to project settings
2. Enable Analytics
3. View real-time traffic and performance

### Error Tracking

Consider adding Sentry:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
});
```

### Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

### Database Backups

1. In Supabase, go to Database → Backups
2. Enable automatic daily backups
3. Test restore process

## Scaling Considerations

### When You Grow

1. **Database**:
   - Upgrade Supabase plan for more connections
   - Add database indexes for frequently queried fields
   - Implement connection pooling

2. **Images**:
   - Use Supabase Storage for user-uploaded images
   - Implement image optimization (next/image)
   - Consider CDN for static assets

3. **Caching**:
   - Implement Redis for session management
   - Cache frequently accessed data
   - Use Vercel Edge caching

4. **Performance**:
   - Implement lazy loading
   - Code splitting
   - Server-side rendering optimization

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

1. Check environment variables are set correctly
2. Verify Supabase project is active
3. Check RLS policies aren't blocking queries
4. Verify API keys haven't expired

### Styling Issues

1. Clear browser cache
2. Check Tailwind config
3. Verify CSS is being generated: `npm run build`
4. Check for conflicting styles

## Support Resources

- **Next.js**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support
- **Supabase Docs**: https://supabase.com/docs
- **Community**: Stack Overflow, GitHub Issues

---

Need help? Check the main README.md or contact your developer.
