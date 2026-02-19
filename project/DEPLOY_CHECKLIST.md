# ✅ GoogleHubs Deployment Checklist

## Current Status: Site not deployed yet (404 error)

---

## Step-by-Step Deployment (5 minutes)

### ☐ Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### ☐ Step 2: Login to Netlify
```bash
netlify login
```
- Browser will open
- Sign in or create free account
- Close browser when done

### ☐ Step 3: Build Your Project
```bash
npm run build
```
- Should complete successfully
- Creates `dist` folder

### ☐ Step 4: Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```
- Answer prompts:
  - Create new site? → **Yes**
  - Site name? → **googlehubs** (or your choice)
- You'll get a live URL!

### ☐ Step 5: Add Environment Variables
1. Go to: https://app.netlify.com
2. Click your site
3. Go to: **Site settings → Environment variables**
4. Click **Add a variable**
5. Add these (one at a time):

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
VITE_GOOGLE_PLACES_API_KEY
VITE_GOOGLE_MAPS_API_KEY
VITE_STRIPE_PUBLISHABLE_KEY
VITE_FACEBOOK_ACCESS_TOKEN
VITE_LINKEDIN_CLIENT_ID
VITE_LINKEDIN_ACCESS_TOKEN
```

Copy values from your `.env` file

### ☐ Step 6: Redeploy with Environment Variables
```bash
netlify deploy --prod --dir=dist
```

### ☐ Step 7: Test Your Live Site
1. Visit your Netlify URL (e.g., `https://googlehubs.netlify.app`)
2. Click "Start Free Trial" → Should show signup form
3. Try signing up with test email

---

## Connect Custom Domain (googlehubs.com)

### ☐ Step 8: Add Domain in Netlify
1. Netlify Dashboard → **Domain settings**
2. Click **Add custom domain**
3. Enter: `googlehubs.com`
4. Click **Verify**

### ☐ Step 9: Update DNS Records
At your domain registrar (where you bought googlehubs.com):

**Add these DNS records:**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: [your-site-name].netlify.app
```

### ☐ Step 10: Wait for SSL Certificate
- Netlify auto-provisions SSL (1-5 minutes)
- Check: Domain settings → HTTPS
- Should show "Certificate active"

---

## Deploy Supabase Functions (Required for payments)

### ☐ Step 11: Install Supabase CLI
```bash
npm install -g supabase
```

### ☐ Step 12: Login to Supabase
```bash
supabase login
```

### ☐ Step 13: Link Your Project
```bash
supabase link --project-ref tocklatovmhdempnvzpq
```

### ☐ Step 14: Deploy Edge Functions
```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhooks
supabase functions deploy prospects-api
supabase functions deploy google-places-search
supabase functions deploy facebook-business-search
supabase functions deploy linkedin-company-search
supabase functions deploy purchase-credits
```

### ☐ Step 15: Set Supabase Secrets
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

---

## Final Tests

### ☐ Test 1: Homepage Loads
- Visit: `https://googlehubs.com` (or your Netlify URL)
- Should see landing page with "Write Your Book. Create Your Movie."

### ☐ Test 2: Sign Up Works
- Click "Start Free Trial"
- Enter test email
- Should show signup form (no errors)

### ☐ Test 3: Login Works
- Click "Sign In"
- Should show login form

### ☐ Test 4: Stripe Checkout (if configured)
- Click "Start Free Trial" on a plan
- Should redirect to Stripe checkout page

---

## Troubleshooting

### ❌ Still seeing 404?
**Solution:**
```bash
# Rebuild and redeploy
npm run build
netlify deploy --prod --dir=dist
```

### ❌ Blank white page?
**Solution:**
- Check Netlify function logs
- Make sure environment variables are set
- Check browser console for errors

### ❌ "Failed to fetch" errors?
**Solution:**
- Deploy Supabase Edge Functions (Step 14)
- Check Supabase URL is correct in env variables

### ❌ Stripe checkout not working?
**Solution:**
- Set up Stripe products (see STRIPE_SETUP.md)
- Deploy stripe-checkout function
- Add Stripe secret key to Supabase secrets

---

## Quick Commands Reference

```bash
# Build
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Deploy all Supabase functions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhooks
supabase functions deploy prospects-api

# Check deployment status
netlify status

# View logs
netlify logs

# Open site in browser
netlify open:site
```

---

## Support

**Netlify Issues:**
- Dashboard: https://app.netlify.com
- Docs: https://docs.netlify.com
- Status: https://www.netlifystatus.com

**Supabase Issues:**
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Status: https://status.supabase.com

---

## You're Ready! 🚀

Once you complete Steps 1-7, your site will be live and accessible at your Netlify URL.

Complete Steps 8-10 to use your custom domain (googlehubs.com).

Complete Steps 11-15 to enable full functionality (payments, prospecting, etc.).

**Start with Step 1 above and work through each checkbox!**
