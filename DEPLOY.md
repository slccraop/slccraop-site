# SLCCRAOP Deployment Guide

## For Non-Developers: Step-by-Step Setup

This guide walks you through setting up SLCCRAOP for use. No technical coding knowledge required, just follow the steps.

---

## Step 1: Create a Free Supabase Account

1. Go to https://supabase.com
2. Click "Start your project" - sign up with email is free
3. Create a new project
4. Wait for your project to be ready (takes a few minutes)

---

## Step 2: Create a Free Cloudflare Account

1. Go to https://cloudflare.com
2. Sign up for a free account
3. Verify your email address

---

## Step 3: Create a Turnstile Site Key (Bot Protection)

1. In Cloudflare Dashboard, go to "Turnstile"
2. Click "Create Site"
3. Enter a label (e.g., "slccraop-report-form")
4. Select "HTTPS" as the domain
5. Cloudflare will give you a **Site Key** - copy this
6. This key goes in the frontend (visible to users)

---

## Step 4: Get Your Supabase Credentials

1. In your Supabase Dashboard, go to "Settings" → "API"
2. Copy your **Project URL** (looks like: `https://xyz123.supabase.co`)
3. Copy your **Project anon key** (shown under "Project API settings")
   - This goes in the frontend .env file
4. **Important**: Also copy your **Service Role Key** (shown under "Project API settings")
   - This is very powerful - only use for admin tasks, never in frontend
   - This goes in environment variables for Cloudflare Pages

---

## Step 5: Set Up Environment Variables

### For Local Development:

1. In your project folder, copy the example file:
   ```powershell
   copy .env.example .env
   ```

2. Edit the `.env` file and paste:
   ```
   VITE_SUPABASE_URL=your-project-url-here
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### For Cloudflare Pages:

1. In Cloudflare Pages, go to your project settings
2. Find "Environment Variables" 
3. Add these variables:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
   - `SERVICE_ROLE_KEY` = your service role key (admin access)

---

## Step 6: Upload to GitHub (optional)

If you want to use GitHub for version control:

1. Go to https://github.com and create a new repository
2. Follow GitHub's instructions to upload your project folder
3. Or use the command line:
   ```powershell
   git init
   git add .
   git commit -m "Initial SLCCRAOP setup"
   ```

---

## Step 7: Connect Cloudflare Pages

1. In Cloudflare Dashboard, go to "Pages"
2. Click "Create a new project"
3. Connect your GitHub repository (if using GitHub)
4. Or click "Deploy from Terminal" and follow instructions
5. Set the build command: `npm run build`
6. Set the publish directory: `dist`
7. Click "Deploy"

---

## Step 8: Create Your First Staff User (TOTP)

1. After deployment, go to your Supabase Dashboard
2. Navigate to "Authentication" → "Users"
3. Click "Add User"
4. Enter staff email and password
5. Enable "Multi-factor Authentication" → "TOTP"
6. Staff will need an authenticator app (Google Authenticator, Authy, etc.)
7. After setup, staff must use TOTP code to log in

---

## Step 9: Switch Intake Open/Closed

1. In Supabase Dashboard, go to the "cases" table
2. Find the row that controls intake status
3. Update the status field to:
   - `open` - allows new reports to be submitted
   - `closed` - blocks new submissions (existing reports still viewable)

---

## Need Help?

- Check the security checklist: `security/security-checklist.md`
- Review the build manual: `docs/BUILD_MANUAL.md`
- Contact: [your contact method]

---

## Security Reminders

- ✅ Turnstile Site Key is OK to put in the frontend (visible to users)
- ✅ VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are OK for frontend
- ✅ SERVICE_ROLE KEY must ONLY go in environment variables (Cloudflare Pages, not in code)
- ✅ Never share the Service Role Key with anyone who doesn't need admin access
- ✅ All report data is marked FAKE - no real victim/suspect information stored
- ✅ Row Level Security (RLS) protects data at the database level