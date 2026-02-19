# Deploy GoogleHubs to Netlify - Quick Fix

## You're seeing "Site not found" because the site hasn't been deployed yet.

## ✅ QUICK FIX - Deploy in 3 Steps

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

This will open your browser. Log in with your Netlify account (or create one - it's free).

### Step 3: Deploy Your Site

```bash
# Build your project first
npm run build

# Deploy to production
netlify deploy --prod --dir=dist
```

The CLI will ask you:
1. **Create & configure a new site?** → Yes
2. **Team?** → Choose your team (or personal)
3. **Site name?** → `googlehubs` (or whatever you want)

That's it! You'll get a live URL like: `https://googlehubs.netlify.app`

---

## Alternative: Deploy via Netlify Dashboard (Drag & Drop)

If you prefer using the UI:

1. **Build your project:**
   ```bash
   npm run build
   ```

2. **Go to:** https://app.netlify.com/drop

3. **Drag the `dist` folder** into the drop zone

4. **Done!** You'll get a live URL immediately

---

## IMPORTANT: Add Environment Variables

After deployment, you MUST add your environment variables:

1. Go to: https://app.netlify.com
2. Select your site
3. Go to: **Site settings → Environment variables**
4. Click **Add a variable**
5. Add these variables one by one:

```
VITE_SUPABASE_URL=https://tocklatovmhdempnvzpq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvY2tsYXRvdm1oZGVtcG52enBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MzMwNjgsImV4cCI6MjA1NTMwOTA2OH0.G7Q5K6S1k7v4C0QNxR8Q7jH8Z6M3N9L5P2W1Y4X0K8R
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_PLACES_API_KEY=your_google_places_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY (change to pk_live_ for production)
VITE_FACEBOOK_ACCESS_TOKEN=your_facebook_token
VITE_LINKEDIN_CLIENT_ID=your_linkedin_id
VITE_LINKEDIN_ACCESS_TOKEN=your_linkedin_token
```

6. **Redeploy** after adding variables:
   ```bash
   netlify deploy --prod --dir=dist
   ```

---

## Connect Custom Domain (googlehubs.com)

1. Go to: **Site settings → Domain management**
2. Click **Add custom domain**
3. Enter: `googlehubs.com`
4. Follow the DNS instructions from Netlify
5. Add these DNS records at your domain registrar:

**For Netlify:**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: [your-site].netlify.app
```

6. Wait for DNS propagation (5-60 minutes)
7. Netlify will automatically provision SSL certificate

---

## Troubleshooting

### "Build failed" error?
Check the build logs in Netlify dashboard. Usually means missing environment variables.

### Still showing 404?
- Clear your browser cache
- Wait 2-3 minutes for deployment to propagate
- Check Netlify dashboard → Deploys → Latest deploy should show "Published"

### Functions not working?
Your Supabase Edge Functions are separate. Make sure they're deployed:
```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhooks
supabase functions deploy prospects-api
```

---

## Status Check

After deployment, test these:

1. **Homepage:** `https://your-site.netlify.app` → Should load landing page
2. **Sign up:** Click "Start Free Trial" → Should open form
3. **Sign in:** Should show login form
4. **Dashboard:** After login → Should show dashboard

---

## Quick Deploy Command (One-Liner)

```bash
npm run build && netlify deploy --prod --dir=dist
```

---

## Need Help?

- **Netlify Status:** https://www.netlifystatus.com
- **Build Logs:** Netlify Dashboard → Deploys → Click latest deploy
- **Support:** https://answers.netlify.com

---

## Your Site Will Be Live At:

- **Temporary URL:** `https://your-site-name.netlify.app`
- **Custom Domain:** `https://googlehubs.com` (after DNS setup)

Deploy now and you'll be live in 3 minutes! 🚀
