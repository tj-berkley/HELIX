# Credits Purchase System - 50% Markup

## Overview
Users can now purchase platform credits with a **50% markup** to use for AI tokens, SMS, emails, and other premium features.

## System Components

### 1. Database Tables

#### `credit_balances`
Stores each user's current credit balance and lifetime statistics.
- `balance` - Current available credits
- `total_purchased` - Lifetime credits purchased
- `total_used` - Lifetime credits consumed

#### `credit_transactions`
Complete transaction history for all credit purchases and usage.
- Tracks purchases, usage, refunds, bonuses, and adjustments
- Links to Stripe payment intents for purchases
- Maintains balance_after for audit trail

#### `credit_packages`
Pre-configured credit packages with 50% markup pricing.

**Default Packages:**
| Package | Credits | Base Price | Sale Price (50% markup) | Markup |
|---------|---------|-----------|------------------------|--------|
| Starter Pack | $10 | $10.00 | $15.00 | $5.00 |
| Value Pack | $25 | $25.00 | $37.50 | $12.50 |
| Power Pack ⭐ | $50 | $50.00 | $75.00 | $25.00 |
| Pro Pack | $100 | $100.00 | $150.00 | $50.00 |
| Elite Pack | $250 | $250.00 | $375.00 | $125.00 |
| Ultimate Pack | $500 | $500.00 | $750.00 | $250.00 |

### 2. Edge Functions

#### `/functions/v1/purchase-credits`
- Creates Stripe checkout session for one-time credit purchases
- Links payment to specific credit package
- Includes package metadata in payment intent

#### `/functions/v1/stripe-webhooks`
- Enhanced to handle `payment_intent.succeeded` events
- Automatically adds credits to user balance when payment succeeds
- Creates transaction records with Stripe payment intent ID

### 3. Database Functions

#### `add_credits_to_balance()`
- Safely adds credits to user balance
- Creates transaction record
- Returns new balance and transaction ID
- Called automatically by webhook on successful payment

#### `deduct_credits_from_balance()`
- Safely deducts credits for usage
- Checks sufficient balance before deducting
- Creates usage transaction record
- Returns new balance or error if insufficient

### 4. Frontend Component

#### `CreditsManager.tsx`
Located at: `/components/CreditsManager.tsx`

**Features:**
- Display current credit balance with beautiful gradient card
- Show lifetime purchased and used credits
- Grid of available credit packages with pricing
- Highlight popular package (Power Pack - 50 credits)
- One-click purchase flow via Stripe Checkout
- Complete transaction history table
- Responsive design for mobile and desktop

**Access:**
- Navigation: Sidebar → Admin Section → "Buy Credits" 💰
- Route: Set `activePage` to `'credits'`

## Pricing Strategy

### 50% Markup Calculation
```
Sale Price = Base Price × 1.5
Profit = Sale Price - Base Price
Profit Margin = 50%
```

**Example:**
- User purchases Power Pack ($50 credits)
- Platform charges: $75.00
- Platform cost: $50.00
- Platform profit: $25.00 (50% margin)

## User Flow

1. **Navigate to Credits Manager**
   - User clicks "Buy Credits" in sidebar

2. **View Balance**
   - See current balance, total purchased, total used
   - View transaction history

3. **Select Package**
   - Choose from 6 pre-configured packages
   - See original price (crossed out) and sale price

4. **Purchase**
   - Click "Purchase Now"
   - Redirect to Stripe Checkout
   - Enter payment details
   - Complete payment

5. **Credits Added**
   - Webhook receives payment success
   - Credits automatically added to balance
   - Transaction recorded
   - User redirected back to dashboard

6. **Use Credits**
   - Credits deducted automatically when using:
     - AI features (tokens)
     - SMS messaging
     - Email campaigns
     - Other premium features

## Integration Points

### To Deduct Credits in Your Code:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Example: Deduct $0.50 for AI usage
const { data, error } = await fetch(`${supabaseUrl}/rest/v1/rpc/deduct_credits_from_balance`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${userToken}`,
  },
  body: JSON.stringify({
    p_user_id: userId,
    p_amount: 0.50,
    p_description: 'AI content generation - 1000 tokens',
    p_metadata: {
      feature: 'ai_generation',
      tokens: 1000,
      model: 'gemini-pro'
    }
  })
});

if (data.success) {
  console.log('Credits deducted. New balance:', data.new_balance);
} else {
  console.error('Insufficient credits:', data.error);
  // Show user option to purchase more credits
}
```

### To Check User Balance:

```typescript
const response = await fetch(
  `${supabaseUrl}/rest/v1/credit_balances?user_id=eq.${userId}`,
  {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${userToken}`,
    },
  }
);

const balance = await response.json();
console.log('Current balance:', balance[0]?.balance);
```

## Security

### Row Level Security (RLS)
- ✅ Users can only view their own balances and transactions
- ✅ Users cannot manually edit their balance (must use functions)
- ✅ Credit packages are publicly readable but not editable
- ✅ Only system functions can modify balances

### Transaction Integrity
- All balance changes are logged in `credit_transactions`
- Each transaction includes `balance_after` for audit trail
- Stripe payment intent ID linked to purchases
- Metadata stored in JSONB for flexibility

## Revenue Tracking

### Query Total Revenue
```sql
SELECT
  SUM(base_price) as platform_cost,
  SUM(sale_price) as total_revenue,
  SUM(sale_price - base_price) as total_profit,
  COUNT(*) as total_purchases
FROM credit_transactions ct
JOIN credit_packages cp ON ct.metadata->>'packageId' = cp.id::text
WHERE ct.type = 'purchase'
  AND ct.created_at >= '2026-01-01';
```

### Query by User
```sql
SELECT
  u.email,
  cb.balance as current_balance,
  cb.total_purchased,
  cb.total_used,
  (cb.total_purchased * 1.5) as revenue_from_user,
  (cb.total_purchased * 0.5) as profit_from_user
FROM credit_balances cb
JOIN users u ON cb.user_id = u.id
ORDER BY cb.total_purchased DESC;
```

## Testing

### Test Credit Purchase Flow
1. Navigate to Credits Manager
2. Click "Purchase Now" on any package
3. Use Stripe test card: `4242 4242 4242 4242`
4. Exp: Any future date, CVC: Any 3 digits
5. Complete purchase
6. Verify credits added to balance
7. Check transaction appears in history

### Test Credit Deduction
1. Use the RPC function to deduct credits
2. Verify balance decreases
3. Verify transaction appears with negative amount
4. Try to deduct more than available balance
5. Verify error returned

## Webhooks Configuration

**Important:** Configure Stripe webhook endpoint:
```
Endpoint URL: https://your-supabase-url.supabase.co/functions/v1/stripe-webhooks
Events to listen for:
- checkout.session.completed
- payment_intent.succeeded
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

## Future Enhancements

### Potential Features:
- [ ] Bulk discounts (buy 500+, get 60% markup instead of 50%)
- [ ] Subscription-based credit bundles (monthly allocation)
- [ ] Credit expiration dates (encourage usage)
- [ ] Referral bonus credits (free credits for referrals)
- [ ] Auto-reload when balance drops below threshold
- [ ] Credit gifting (transfer credits to other users)
- [ ] Usage analytics dashboard (where credits are spent)
- [ ] Custom packages for enterprise users

## Profit Calculations

### Monthly Revenue Projection
Assuming 100 users purchase credits monthly:

| Scenario | Avg Purchase | Monthly Revenue | Monthly Cost | Monthly Profit |
|----------|-------------|----------------|--------------|----------------|
| Conservative | $75 | $7,500 | $5,000 | $2,500 (50%) |
| Moderate | $150 | $15,000 | $10,000 | $5,000 (50%) |
| Aggressive | $300 | $30,000 | $20,000 | $10,000 (50%) |

### Annual Revenue Projection
- 1,000 active users × $150 avg = $150,000/year revenue
- Platform cost: $100,000/year
- **Net profit: $50,000/year (50% margin)**

## Support

For issues or questions:
- Check transaction history for failed purchases
- Verify Stripe webhook events are being received
- Check Supabase logs for function errors
- Review database transaction records

---

**System Status:** ✅ Fully implemented and ready for production
**Last Updated:** February 17, 2026
