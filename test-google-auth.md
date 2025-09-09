# Testing Google OAuth

## Before Testing:
1. ✅ Configure Google OAuth in Google Cloud Console
2. ✅ Enable Google provider in Supabase Dashboard  
3. ✅ Add your Google Client ID/Secret to Supabase
4. ✅ Set correct redirect URLs

## Test Steps:

### 1. Test the UI
- Go to your app
- Click "Sign In" 
- You should see:
  - Email/password form
  - "Or continue with" divider
  - "Continue with Google" button with Google logo

### 2. Test Google Sign-In Flow
- Click "Continue with Google"
- Should redirect to Google OAuth consent screen
- After approving, should redirect back to your app
- User should be signed in automatically

### 3. Verify Profile Creation
- Check Supabase Dashboard > Authentication > Users
- New Google user should appear
- Check Database > profiles table
- Profile should be created with Google display name

### 4. Test Comments
- Try commenting as Google user
- Should work normally with Google display name

## Troubleshooting:
- **"Invalid redirect URI"**: Check your Google OAuth redirect URLs
- **"Provider not enabled"**: Enable Google in Supabase Auth settings
- **Profile not created**: Check the `handle_new_user()` function logs