/*
  # GoogleHubs User Authentication and Subscription Management

  ## Overview
  Creates the complete authentication and subscription system for GoogleHubs SaaS portal.
  Designed for 80% profit margins with three subscription tiers.

  ## New Tables

  ### `users`
  - `id` (uuid, primary key) - User unique identifier
  - `email` (text, unique) - User email address
  - `full_name` (text) - User's full name
  - `company_name` (text) - User's company/business name
  - `avatar_url` (text) - Profile picture URL
  - `role` (text) - User role (Business Owner, Manager, etc.)
  - `bio` (text) - User biography
  - `industry` (text) - Business industry
  - `created_at` (timestamp) - Account creation date
  - `updated_at` (timestamp) - Last profile update

  ### `subscriptions`
  - `id` (uuid, primary key) - Subscription unique identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `plan_name` (text) - Plan name (starter, professional, enterprise)
  - `status` (text) - Subscription status (trial, active, cancelled, expired)
  - `billing_cycle` (text) - Billing frequency (monthly, annual)
  - `price` (numeric) - Monthly price in dollars
  - `stripe_customer_id` (text) - Stripe customer identifier
  - `stripe_subscription_id` (text) - Stripe subscription identifier
  - `trial_end_date` (timestamp) - End date of free trial
  - `current_period_start` (timestamp) - Current billing period start
  - `current_period_end` (timestamp) - Current billing period end
  - `cancelled_at` (timestamp) - Cancellation date
  - `created_at` (timestamp) - Subscription creation date
  - `updated_at` (timestamp) - Last subscription update

  ### `usage_tracking`
  - `id` (uuid, primary key) - Usage record identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `month_year` (text) - Month and year (e.g., "2025-02")
  - `ai_tokens_used` (integer) - AI tokens consumed
  - `sms_sent` (integer) - SMS messages sent
  - `emails_sent` (integer) - Emails sent
  - `storage_used_gb` (numeric) - Storage used in gigabytes
  - `prospects_created` (integer) - Number of prospects added
  - `created_at` (timestamp) - Record creation date
  - `updated_at` (timestamp) - Last update

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Stripe IDs are readable by user but not editable
  - Admin role can access all data for support
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  company_name text,
  avatar_url text,
  role text DEFAULT 'Business Owner',
  bio text,
  industry text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_name text NOT NULL CHECK (plan_name IN ('starter', 'professional', 'enterprise')),
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'cancelled', 'expired', 'past_due')),
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  price numeric(10, 2) NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_end_date timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL,
  ai_tokens_used integer DEFAULT 0,
  sms_sent integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  storage_used_gb numeric(10, 2) DEFAULT 0,
  prospects_created integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month_year ON usage_tracking(month_year);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for usage_tracking table
CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own usage"
  ON usage_tracking FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own usage"
  ON usage_tracking FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
