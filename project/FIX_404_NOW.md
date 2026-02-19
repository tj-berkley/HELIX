# 🔧 Fix Your 404 Error - Deploy GoogleHubs NOW

## Your Problem:
You're seeing "Site not found" on Netlify because **your site hasn't been deployed yet**.

---

## ⚡ Quick Fix (3 commands)

Open your terminal and run these commands:

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login to Netlify (browser will open)
netlify login

# 3. Build and deploy
npm run build && netlify deploy --prod --dir=dist
```

**That's it!** Follow the prompts:
- "Create & configure a new site?" → Press **Enter** (Yes)
- "Team?" → Select your team (or press **Enter**)
- "Site name?" → Type `googlehubs` (or whatever you want)

You'll get a live URL in 30 seconds! 🎉

---

## ✅ Expected Result

After running those 3 commands, you'll see:

```
✔ Deploy is live!
   URL: https://googlehubs.netlify.app
```

Visit that URL - your site will be live!

---

## 🔑 Important: Add Environment Variables

After deployment, your site needs API keys to work properly:

1. **Go to:** https://app.netlify.com
2. **Click** your site (googlehubs)
3. **Go to:** Site settings → Environment variables
4. **Click:** Add a variable
5. **Add these one by one:**

Copy these from your `.env` file:

| Variable Name | Copy from .env |
|--------------|----------------|
| `VITE_SUPABASE_URL` | Line 6 |
| `VITE_SUPABASE_ANON_KEY` | Line 7 |
| `VITE_GEMINI_API_KEY` | Line 1 |
| `VITE_GOOGLE_PLACES_API_KEY` | Line 4 |
| `VITE_GOOGLE_MAPS_API_KEY` | Line 5 |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Line 11 |
| `VITE_FACEBOOK_ACCESS_TOKEN` | Line 18 |
| `VITE_LINKEDIN_CLIENT_ID` | Line 21 |
| `VITE_LINKEDIN_ACCESS_TOKEN` | Line 22 |

6. **After adding all variables, redeploy:**

```bash
netlify deploy --prod --dir=dist
```

---

## 🌐 Connect Your Custom Domain (googlehubs.com)

### In Netlify:
1. Go to: **Domain settings**
2. Click: **Add custom domain**
3. Enter: `googlehubs.com`
4. Click: **Verify**

### At Your Domain Registrar:
(Where you bought googlehubs.com - like GoDaddy, Namecheap, etc.)

Add these DNS records:

**Record 1:**
```
Type: A
Name: @
Value: 75.2.60.5
```

**Record 2:**
```
Type: CNAME
Name: www
Value: [your-site-name].netlify.app
```

**Wait:** 5-60 minutes for DNS to propagate

---

## 🧪 Test Your Site

Once deployed, test these:

### ✅ Test 1: Homepage
Visit: `https://googlehubs.netlify.app`
- Should see: Landing page with "Write Your Book. Create Your Movie."

### ✅ Test 2: Navigation
Click: "Start Free Trial" button
- Should see: Sign up form

### ✅ Test 3: Dark Mode
Click: 🌙 icon in top right
- Should toggle: Light/Dark theme

---

## 🆘 Still Having Issues?

### Issue: "Build failed"
**Solution:**
```bash
# Check if build works locally
npm run build

# If it works, try deploying again
netlify deploy --prod --dir=dist
```

### Issue: "Command not found: netlify"
**Solution:**
```bash
# Reinstall Netlify CLI
npm install -g netlify-cli

# Or use npx (no install needed)
npx netlify-cli deploy --prod --dir=dist
```

### Issue: White screen after deployment
**Solution:**
1. Go to Netlify Dashboard
2. Click: Deploys → Click latest deploy
3. Check: Deploy log for errors
4. Usually means: Missing environment variables

### Issue: "Failed to fetch" errors
**Solution:**
- Check environment variables are set correctly
- Make sure you redeployed after adding them
- Check Supabase Edge Functions are deployed (see below)

---

## 🚀 Deploy Supabase Functions (For Full Functionality)

Your payment system and prospecting tools need these functions deployed:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref tocklatovmhdempnvzpq

# Deploy all functions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhooks
supabase functions deploy prospects-api
supabase functions deploy google-places-search
supabase functions deploy facebook-business-search
supabase functions deploy linkedin-company-search
supabase functions deploy purchase-credits
```

---

## 📊 Deployment Checklist

- [ ] Netlify CLI installed
- [ ] Logged in to Netlify
- [ ] Project built successfully
- [ ] Site deployed to Netlify
- [ ] Environment variables added
- [ ] Site redeployed with env vars
- [ ] Custom domain configured (optional)
- [ ] DNS records updated (optional)
- [ ] Supabase functions deployed (optional but recommended)
- [ ] Site tested and working

---

## 🎯 Quick Command Reference

```bash
# Full deployment (one command)
npm run build && netlify deploy --prod --dir=dist

# Check status
netlify status

# Open site in browser
netlify open:site

# View deployment logs
netlify logs

# Redeploy
netlify deploy --prod --dir=dist
```

---

## ⏱️ How Long Does This Take?

- **Initial setup:** 2 minutes
- **First deployment:** 1 minute
- **Adding env variables:** 3 minutes
- **DNS propagation:** 5-60 minutes
- **Total:** 10-15 minutes (excluding DNS)

---

## 💡 Pro Tips

1. **Always build before deploying:**
   ```bash
   npm run build
   ```

2. **Keep a deploy script handy:**
   ```bash
   # Add to package.json scripts:
   "deploy": "npm run build && netlify deploy --prod --dir=dist"

   # Then just run:
   npm run deploy
   ```

3. **Test locally first:**
   ```bash
   npm run dev
   # Check http://localhost:5173
   ```

4. **Check Netlify build logs** if deployment fails

---

## 🔗 Helpful Links

- **Netlify Dashboard:** https://app.netlify.com
- **Netlify Docs:** https://docs.netlify.com
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com

---

## Ready to Deploy?

**Run these 3 commands NOW:**

```bash
npm install -g netlify-cli
netlify login
npm run build && netlify deploy --prod --dir=dist
```

**You'll be live in 2 minutes!** 🚀
