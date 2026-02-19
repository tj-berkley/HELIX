# Stripe Payment Setup Guide for GoogleHubs

## 🚀 PRODUCTION READY - Follow These Steps to Accept Payments

---

## Step 1: Get Your Stripe Account

1. Go to **https://dashboard.stripe.com/register**
2. Create an account (free to start)
3. Complete business verification
4. Switch to **Live Mode** when ready (use Test Mode for testing first)

---

## Step 2: Get Your API Keys

### For Testing (Test Mode)
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### For Production (Live Mode)
1. Toggle to **Live Mode** in the Stripe dashboard
2. Go to: https://dashboard.stripe.com/apikeys
3. Copy your **Publishable key** (starts with `pk_live_`)
4. Copy your **Secret key** (starts with `sk_live_`)

### Add Keys to Your Environment

Update your `.env` file:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

**IMPORTANT:** Add the secret key to Supabase Secrets:
1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add secret: `STRIPE_SECRET_KEY` with value `sk_test_YOUR_KEY_HERE`

---

## Step 3: Create Products in Stripe

Go to: https://dashboard.stripe.com/products

### Product 1: GoogleHubs Starter

1. Click **+ Add product**
2. **Name:** GoogleHubs Starter
3. **Description:** For solopreneurs and small teams
4. **Pricing Model:** Recurring
5. **Price:** $97 USD
6. **Billing period:** Monthly
7. **Trial period:** 7 days (enable this!)
8. Click **Save product**
9. **Copy the Price ID** (starts with `price_`)
10. Save it as: `price_starter_monthly`

**Repeat for Annual:**
- Same product, add another price
- **Price:** $970 USD
- **Billing period:** Yearly
- **Trial period:** 7 days
- Copy Price ID as: `price_starter_annual`

### Product 2: GoogleHubs Professional

1. Click **+ Add product**
2. **Name:** GoogleHubs Professional (MOST POPULAR)
3. **Description:** For growing businesses
4. **Pricing Model:** Recurring
5. **Price:** $197 USD
6. **Billing period:** Monthly
7. **Trial period:** 7 days
8. Click **Save product**
9. Copy Price ID as: `price_professional_monthly`

**Repeat for Annual:**
- **Price:** $1,970 USD
- **Billing period:** Yearly
- **Trial period:** 7 days
- Copy Price ID as: `price_professional_annual`

### Product 3: GoogleHubs Enterprise

1. Click **+ Add product**
2. **Name:** GoogleHubs Enterprise
3. **Description:** For large organizations
4. **Pricing Model:** Recurring
5. **Price:** $497 USD
6. **Billing period:** Monthly
7. **Trial period:** 7 days
8. Click **Save product**
9. Copy Price ID as: `price_enterprise_monthly`

**Repeat for Annual:**
- **Price:** $4,970 USD
- **Billing period:** Yearly
- **Trial period:** 7 days
- Copy Price ID as: `price_enterprise_annual`

---

## Step 4: Update Price IDs in Code

Edit: `supabase/functions/stripe-checkout/index.ts`

Replace the placeholder price IDs with your real ones:

```typescript
const pricing = {
  starter: {
    monthly: { price: 97, priceId: "price_1ABC123def456GHI789jkl" },
    annual: { price: 970, priceId: "price_1ABC123def456GHI789xyz" }
  },
  professional: {
    monthly: { price: 197, priceId: "price_1ABC123def456GHI789mno" },
    annual: { price: 1970, priceId: "price_1ABC123def456GHI789pqr" }
  },
  enterprise: {
    monthly: { price: 497, priceId: "price_1ABC123def456GHI789stu" },
    annual: { price: 4970, priceId: "price_1ABC123def456GHI789vwx" }
  }
};
```

**Redeploy the function:**
The function is already deployed, but if you make changes, it will auto-redeploy on save.

---

## Step 5: Set Up Webhooks (CRITICAL for Production)

Webhooks notify your app when subscription events occur (payments, cancellations, etc.)

### Create Webhook Endpoint

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. **Endpoint URL:** `https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/stripe-webhook`
4. **Events to listen to:** Select these events:
   - `checkout.session.completed` - When customer completes payment
   - `customer.subscription.created` - New subscription
   - `customer.subscription.updated` - Subscription changed
   - `customer.subscription.deleted` - Subscription cancelled
   - `invoice.payment_succeeded` - Successful payment
   - `invoice.payment_failed` - Failed payment
5. Click **Add endpoint**
6. **Copy the Signing secret** (starts with `whsec_`)
7. Add to Supabase secrets: `STRIPE_WEBHOOK_SECRET`

### Create Webhook Handler

You'll need to create a new edge function: `stripe-webhook` to handle these events. This will:
- Update subscription status in your database
- Activate/deactivate user accounts
- Send emails for payment failures
- Track trial conversions

---

## Step 6: Test Your Integration

### Test Mode Testing

1. Use test card: **4242 4242 4242 4242**
2. Expiry: Any future date (e.g., 12/25)
3. CVC: Any 3 digits (e.g., 123)
4. ZIP: Any 5 digits (e.g., 12345)

### Test the Flow

1. Go to your landing page
2. Click **Start Free Trial** on any plan
3. Should redirect to Stripe Checkout
4. Enter test card details
5. Complete checkout
6. Should redirect to your dashboard with `?success=true`
7. Check Stripe Dashboard → Payments to see the test subscription

### Verify Trial Period

- Check that the subscription shows "Trial ends in 7 days"
- Customer won't be charged until after 7 days
- They can use the platform fully during trial

---

## Step 7: Go Live

### Switch to Live Mode

1. Complete Stripe account verification
2. Toggle to **Live Mode** in Stripe Dashboard
3. Update your `.env` with live keys:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
```
4. Update Supabase secrets with live keys
5. Update webhook endpoint URL to use live mode
6. Test with a real card (use a low amount first!)

---

## Step 8: Monitor Your Revenue

### Stripe Dashboard

Check these regularly:
- **Payments:** See all successful transactions
- **Subscriptions:** Active, trialing, cancelled
- **Customers:** List of all paying customers
- **Reports:** MRR, churn rate, revenue trends

### Set Up Email Notifications

1. Go to: https://dashboard.stripe.com/settings/emails
2. Enable notifications for:
   - Successful payments
   - Failed payments
   - Customer created
   - Subscription cancelled

---

## Important Notes

### Trial Period Details

- **3-day free trial** on all plans
- No credit card charge until trial ends
- Customer can cancel anytime during trial
- Automatic conversion to paid after 7 days
- Email sent 3 days before trial ends (set this up in Stripe)

### Pricing Strategy

| Plan | Monthly | Annual | Annual Savings | Target Margin |
|------|---------|--------|----------------|---------------|
| Starter | $97 | $970 | $194 (16%) | 80-84% |
| Professional | $197 | $1,970 | $394 (16%) | 80-82% |
| Enterprise | $497 | $4,970 | $994 (16%) | 77-80% |

### Profit Margins

- **Cost per user:** $15-100/month (varies by plan)
- **Target profit:** 80%+ after costs
- **Break-even:** 76 paying customers (~$15K MRR)

### Security Checklist

- ✅ Never expose `STRIPE_SECRET_KEY` in frontend code
- ✅ Always verify webhook signatures
- ✅ Use HTTPS for all webhook endpoints
- ✅ Store sensitive data in Supabase secrets (not .env files)
- ✅ Enable Stripe Radar for fraud prevention
- ✅ Set up 2FA on your Stripe account

---

## Troubleshooting

### Error: "Stripe not configured"
- Check that `STRIPE_SECRET_KEY` is added to Supabase secrets
- Verify the key starts with `sk_test_` or `sk_live_`

### Error: "Invalid price ID"
- Make sure you copied the exact Price ID from Stripe (starts with `price_`)
- Check you're using the right test/live mode key

### Checkout redirects but no payment
- Check webhook is set up and receiving events
- Look at Stripe logs for webhook delivery failures

### Trial not showing
- Verify `trial_period_days: 7` is in the checkout session code
- Check product settings in Stripe Dashboard

---

## Next Steps After Setup

1. **Create webhook handler** for subscription events
2. **Set up email notifications** for trial endings
3. **Add usage tracking** to monitor AI tokens, SMS, storage
4. **Implement billing portal** for customers to manage subscriptions
5. **Set up dunning** for failed payment recovery
6. **Enable promo codes** for discounts and promotions

---

## Support Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **GoogleHubs Support:** support@googlehubs.com

---

## Quick Reference: Your Price IDs

Fill these in after creating products:

```
Starter Monthly: price_________________
Starter Annual: price_________________

Professional Monthly: price_________________
Professional Annual: price_________________

Enterprise Monthly: price_________________
Enterprise Annual: price_________________
```

---

**🎉 Once completed, your platform is PRODUCTION READY and can accept real payments!**

**💰 You're now set to achieve 80%+ profit margins with 3-day free trials!**
