# Google OAuth Setup Guide

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API (or Google Identity API)
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add these URLs:

**Authorized JavaScript origins:**
- `http://localhost:5173` (for development)
- `https://yourdomain.com` (for production)

**Authorized redirect URIs:**
- `https://your-project-ref.supabase.co/auth/v1/callback`

## 2. Configure in Supabase Dashboard

1. Go to Authentication > Providers
2. Enable Google
3. Add your Google Client ID and Client Secret
4. Save the configuration

## 3. Update your app domain settings

Make sure your site URL is configured in Supabase:
- Go to Authentication > URL Configuration
- Set your Site URL to your domain