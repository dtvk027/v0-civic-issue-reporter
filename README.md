# CivicReport - Civic Issue Reporting Platform

A comprehensive civic-tech platform that enables citizens to report municipal issues and allows city staff to manage and resolve them efficiently.

## Features

### For Citizens
- 📱 **Mobile-first reporting** - Report issues on the go with location capture
- 🗺️ **Interactive map** - View all reported issues in your area
- 📊 **Personal dashboard** - Track your submitted reports and their status
- 🔔 **Real-time notifications** - Get updates when your issues are addressed
- 📸 **Photo uploads** - Include images with your reports

### For Municipal Staff
- 🏛️ **Admin dashboard** - Comprehensive overview of all civic issues
- 📈 **Analytics & reporting** - Performance metrics and exportable reports
- 👥 **Issue assignment** - Assign issues to specific staff members
- 💬 **Progress tracking** - Add updates and communicate with citizens
- ⚡ **Real-time updates** - Live notifications and status changes

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Maps**: Google Maps JavaScript API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account and project
- Google Maps API key (for map functionality)

### Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database URLs (provided by Supabase integration)
POSTGRES_URL=your_postgres_connection_string
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url

# Google Maps (MUST be public for client-side usage)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Development redirect URL for email confirmations
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
\`\`\`

### Installation

1. **Clone and install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up the database**
   
   Run the SQL scripts in order to create the database schema:
   - `scripts/001_create_database_schema.sql`
   - `scripts/002_create_profile_trigger.sql` 
   - `scripts/003_create_notification_triggers.sql`

3. **Configure Supabase Authentication**
   
   In your Supabase dashboard:
   - Go to Authentication > Settings
   - Configure your site URL: `http://localhost:3000` (development)
   - Set redirect URLs: `http://localhost:3000/dashboard`

4. **Set up Google Maps API (IMPORTANT - Security Required)**
   
   **Step 1: Get API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Maps JavaScript API and Places API
   - Create an API key

   **Step 2: Secure Your API Key (CRITICAL)**
   \`\`\`
   ⚠️  SECURITY WARNING: The Google Maps API key must be public (NEXT_PUBLIC_) 
   to work in the browser, but MUST be restricted to prevent abuse.
   \`\`\`
   
   In Google Cloud Console, restrict your API key:
   - **Application restrictions**: HTTP referrers (web sites)
   - **Website restrictions**: Add your domains:
     - `http://localhost:3000/*` (development)
     - `https://yourdomain.com/*` (production)
     - `https://*.vercel.app/*` (if using Vercel)
   
   - **API restrictions**: Restrict to only needed APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API (if needed)

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Security Considerations

### Google Maps API Key Security

**Why the API key is public:**
- Google Maps JavaScript API requires client-side access
- The `NEXT_PUBLIC_` prefix makes it available in the browser
- This is the standard and expected pattern for Google Maps

**How to secure it:**
1. **Domain restrictions** - Most important security measure
2. **API restrictions** - Limit to only needed Google services  
3. **Usage monitoring** - Set up billing alerts and quotas
4. **Regular rotation** - Change API keys periodically

**Never do this:**
- ❌ Use the same API key for server-side operations
- ❌ Leave API key unrestricted
- ❌ Commit API keys to version control
- ❌ Use production API keys in development

### Additional Security Measures

- All database operations use Row Level Security (RLS)
- User authentication required for data modifications
- Role-based access control for admin features
- Input validation and sanitization
- HTTPS required in production

## Email Configuration

### Development
The app uses Supabase's built-in email service for development, which has rate limits. Users will receive confirmation emails, but delivery may be delayed.

### Production Setup
For production, configure a custom SMTP provider in Supabase:

1. Go to your Supabase dashboard
2. Navigate to Authentication > Settings > SMTP Settings
3. Configure your preferred email provider (SendGrid, Mailgun, etc.)
4. Update email templates as needed

**Recommended SMTP Providers:**
- SendGrid (free tier available)
- Mailgun (free tier available)  
- Amazon SES
- Postmark

## Database Schema

The platform uses the following main tables:

- **profiles** - User profiles extending Supabase auth.users
- **issues** - Civic issues reported by citizens
- **issue_updates** - Progress updates and comments on issues
- **notifications** - Real-time notifications for users

All tables use Row Level Security (RLS) for data protection.

## User Roles

- **citizen** - Can report issues and view their own submissions
- **staff** - Can manage and update issues, view analytics
- **admin** - Full access to all features and user management

## API Routes

- `GET/POST /api/issues` - Issue management
- `GET/POST /api/notifications` - Notification handling
- `GET /api/reports/export` - Export reports as CSV/PDF

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Update these for production deployment:
- Remove `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`
- Update Supabase redirect URLs to your production domain
- **CRITICAL**: Update Google Maps API key domain restrictions to include your production domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section below
- Open an issue on GitHub
- Contact your system administrator

## Troubleshooting

### Email Issues
- **Not receiving emails?** Check spam folder and verify Supabase SMTP configuration
- **Email confirmation not working?** Ensure redirect URLs are correctly configured

### Map Issues  
- **Maps not loading?** Verify Google Maps API key and billing is enabled
- **"This page can't load Google Maps correctly" error?** Check API key domain restrictions
- **Location not detected?** Check browser permissions for location access
- **API key security warnings?** This is expected - ensure domain restrictions are properly configured

### Authentication Issues
- **Can't sign in after email confirmation?** Clear browser cache and try again
- **Redirect loops?** Check environment variables and Supabase URL configuration

### Security Warnings
- **Google Maps API key exposed warning?** This is expected behavior - ensure domain restrictions are configured
- **CORS errors?** Check Supabase project settings and allowed origins

## License

This project is licensed under the MIT License - see the LICENSE file for details.
