/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    // Add your Supabase storage domain here when you set it up
    // domains: ['your-project.supabase.co'],
  },
  experimental: {
    // Enable if needed
  },
}

module.exports = nextConfig
