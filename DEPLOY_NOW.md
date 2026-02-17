# 🚀 Deploy GoogleHubs to Production NOW

## ✅ Your Build is Ready!
Build Status: **SUCCESS** (1.19 MB)

---

## Option 1: One-Command Deploy (5 minutes)

### Deploy to Vercel (EASIEST)

```bash
npx vercel --prod
```

**That's it!** Follow the prompts and you're live.

---

### Deploy to Netlify

```bash
npx netlify-cli deploy --prod --dir=dist
```

---

## Option 2: Use the Deploy Script

```bash
./deploy.sh
```

This will:
- Check prerequisites
- Build your project
- Deploy to your chosen platform
- Show post-deployment checklist

---

## What Happens Next?

### After Deployment:

1. **You'll get a live URL:**
   - Vercel: `https://googlehubs-xxx.vercel.app`
   - Netlify: `https://googlehubs-xxx.netlify.app`

2. **Add your environment variables:**
   - Go to your platform dashboard
   - Add all VITE_ variables from your .env file
   - **IMPORTANT:** Use PRODUCTION keys, not test keys!

3. **Deploy Supabase Edge Functions:**
   ```bash
   supabase functions deploy stripe-checkout
   supabase functions deploy stripe-webhooks
   supabase functions deploy prospects-api
   ```

4. **Set Supabase Secrets:**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
   ```

---

## Critical: Switch to Production Keys

### Before Going Live, Replace These:

**In your deployment platform (Vercel/Netlify):**

```env
# Stripe - MUST use live keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY

# Supabase - Already production
VITE_SUPABASE_URL=https://tocklatovmhdempnvzpq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Google APIs - Production keys
VITE_GOOGLE_PLACES_API_KEY=YOUR_PRODUCTION_KEY
VITE_GOOGLE_MAPS_API_KEY=YOUR_PRODUCTION_KEY
VITE_GEMINI_API_KEY=YOUR_PRODUCTION_KEY

# Social APIs
VITE_FACEBOOK_ACCESS_TOKEN=YOUR_PRODUCTION_TOKEN
VITE_LINKEDIN_CLIENT_ID=YOUR_PRODUCTION_ID
VITE_LINKEDIN_ACCESS_TOKEN=YOUR_PRODUCTION_TOKEN
```

**In Supabase Dashboard → Edge Functions → Secrets:**

```env
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

---

## Stripe Production Setup (REQUIRED)

### 1. Switch to Live Mode in Stripe
- Go to: https://dashboard.stripe.com
- Toggle OFF "Test mode" (top right corner)

### 2. Create Live Products
- Go to: Products → Create Product
- Create 3 products:
  - **Starter:** $97/month + $970/year
  - **Professional:** $197/month + $1,970/year
  - **Enterprise:** $497/month + $4,970/year
- For each price, enable "3-day free trial"

### 3. Get Price IDs
- Copy the Price IDs (they start with `price_`)
- You need 6 total (monthly + annual for each tier)

### 4. Update Edge Function
Edit `supabase/functions/stripe-checkout/index.ts`:

```typescript
const pricing = {
  starter: {
    monthly: { price: 97, priceId: "price_LIVE_MONTHLY_ID" },
    annual: { price: 970, priceId: "price_LIVE_ANNUAL_ID" }
  },
  professional: {
    monthly: { price: 197, priceId: "price_LIVE_MONTHLY_ID" },
    annual: { price: 1970, priceId: "price_LIVE_ANNUAL_ID" }
  },
  enterprise: {
    monthly: { price: 497, priceId: "price_LIVE_MONTHLY_ID" },
    annual: { price: 4970, priceId: "price_LIVE_ANNUAL_ID" }
  }
};
```

### 5. Redeploy Edge Function
```bash
supabase functions deploy stripe-checkout
```

### 6. Set Up Webhooks
- Go to: https://dashboard.stripe.com/webhooks
- Click "Add endpoint"
- URL: `https://tocklatovmhdempnvzpq.supabase.co/functions/v1/stripe-webhooks`
- Select events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- Click "Add endpoint"
- Copy the webhook signing secret (starts with `whsec_`)
- Add to Supabase secrets:
  ```bash
  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
  ```

---

## Test Your Production Deployment

### 1. Visit Your Live URL

### 2. Test Sign-Up Flow
- Click "Start Free Trial"
- Enter a real email
- Should redirect to Stripe Checkout

### 3. Test Payment
- Use a real card with small amount ($1)
- Test card: `4242 4242 4242 4242` (test mode only)
- Complete checkout
- Should redirect back to dashboard

### 4. Verify in Stripe
- Check Stripe Dashboard → Payments
- Should see the test subscription
- Verify 3-day trial is set

### 5. Check Database
- Go to Supabase Dashboard → Table Editor
- Check `subscriptions` table
- Should have your subscription record

---

## Custom Domain (Optional)

### Vercel:
1. Go to: Project Settings → Domains
2. Add your domain: `googlehubs.com`
3. Add DNS records from your registrar
4. Done!

### Netlify:
1. Go to: Site Settings → Domain Management
2. Add custom domain
3. Update DNS records
4. Done!

---

## Monitoring & Analytics

### Add Google Analytics
1. Get tracking ID from Google Analytics
2. Add to your site's `<head>` tag
3. Track sign-ups, conversions, revenue

### Set Up Error Tracking
1. Sign up for Sentry: https://sentry.io
2. Add Sentry SDK to your project
3. Monitor errors in production

### Uptime Monitoring
1. Sign up for UptimeRobot: https://uptimerobot.com (free)
2. Add your live URL
3. Get alerts if site goes down

---

## You're Ready! 🎉

**Everything you need is ready:**

✅ Build successful (1.19 MB optimized)
✅ Deployment configs created (vercel.json, netlify.toml)
✅ Deploy script ready (./deploy.sh)
✅ Edge functions ready to deploy
✅ Database schema complete
✅ Stripe integration ready
✅ All features implemented

---

## Deploy Commands Summary

```bash
# Quick deploy to Vercel
npx vercel --prod

# OR Quick deploy to Netlify
npx netlify-cli deploy --prod --dir=dist

# OR Use the automated script
./deploy.sh

# Then deploy edge functions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhooks
supabase functions deploy prospects-api
supabase functions deploy google-places-search
supabase functions deploy facebook-business-search
supabase functions deploy linkedin-company-search

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

---

## Support & Documentation

- **Full Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Stripe Setup Guide:** `STRIPE_SETUP.md`
- **Production Checklist:** `PRODUCTION_READY_CHECKLIST.md`
- **Pricing Strategy:** `PRICING_STRATEGY.md`

---

## Questions?

- Vercel issues: https://vercel.com/docs
- Netlify issues: https://docs.netlify.com
- Supabase issues: https://supabase.com/docs
- Stripe issues: https://stripe.com/docs

---

## Deploy NOW!

```bash
npx vercel --prod
```

**You'll be live in 5 minutes.** 🚀

---

**Next Steps After Deployment:**
1. Set environment variables in platform dashboard
2. Deploy edge functions to Supabase
3. Switch Stripe to live mode
4. Set up webhooks
5. Test with real payment
6. Share with first customers!

Your GoogleHubs platform is production-ready. Time to launch! 🎊
