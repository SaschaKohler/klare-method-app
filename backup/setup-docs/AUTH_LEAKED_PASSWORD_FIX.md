# Auth Configuration Fix for Leaked Password Protection

## Issue
Supabase Auth leaked password protection is currently disabled. This means users can set passwords that have been compromised in data breaches.

## Solution
Enable leaked password protection in your Supabase dashboard:

### Steps to Fix:
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Settings**
3. Find **Password Security** section
4. Enable **"Prevent the use of compromised passwords"**
5. This will check passwords against HaveIBeenPwned.org database

### Why This Matters:
- ✅ Prevents users from using passwords that are known to be compromised
- ✅ Improves overall security of your application
- ✅ Reduces risk of credential stuffing attacks
- ✅ No code changes required - purely configuration

### Technical Details:
- Uses HaveIBeenPwned.org API for compromise checking
- Checks happen at registration and password change
- No actual passwords are sent to external services
- Uses secure hash comparison methods

This setting cannot be configured via SQL migration - it must be enabled in the Supabase Dashboard.
