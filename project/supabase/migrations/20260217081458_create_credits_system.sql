/*
  # GoogleHubs Credits System
  
  ## Overview
  Enables users to purchase additional platform credits with 50% markup.
  Credits can be used for AI tokens, SMS, emails, and other services.
  
  ## New Tables
  
  ### `credit_balances`
  - `id` (uuid, primary key) - Balance record identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `balance` (numeric) - Current credit balance in dollars
  - `total_purchased` (numeric) - Lifetime credits purchased
  - `total_used` (numeric) - Lifetime credits consumed
  - `created_at` (timestamp) - Record creation date
  - `updated_at` (timestamp) - Last update
  
  ### `credit_transactions`
  - `id` (uuid, primary key) - Transaction identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `type` (text) - Transaction type (purchase, usage, refund, bonus)
  - `amount` (numeric) - Amount in dollars (positive for add, negative for deduct)
  - `balance_after` (numeric) - Balance after transaction
  - `description` (text) - Transaction description
  - `stripe_payment_intent_id` (text) - Stripe payment identifier for purchases
  - `metadata` (jsonb) - Additional transaction data
  - `created_at` (timestamp) - Transaction timestamp
  
  ### `credit_packages`
  - `id` (uuid, primary key) - Package identifier
  - `name` (text) - Package name (e.g., "Starter Pack")
  - `credits` (numeric) - Credit amount in dollars
  - `base_price` (numeric) - Platform cost
  - `sale_price` (numeric) - User price (50% markup)
  - `popular` (boolean) - Featured package flag
  - `active` (boolean) - Package availability
  - `created_at` (timestamp) - Package creation date
  
  ## Security
  - Enable RLS on all tables
  - Users can only access their own balances and transactions
  - Credit packages are publicly readable
  - Only system can modify balances (via functions)
  
  ## Pricing Strategy
  - Base cost: Platform's actual cost per credit
  - Sale price: Base cost + 50% markup
  - Example: $10 base = $15 sale price (50% profit margin)
*/

-- Create credit_balances table
CREATE TABLE IF NOT EXISTS credit_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance numeric(10, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
  total_purchased numeric(10, 2) DEFAULT 0.00 NOT NULL,
  total_used numeric(10, 2) DEFAULT 0.00 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'adjustment')),
  amount numeric(10, 2) NOT NULL,
  balance_after numeric(10, 2) NOT NULL,
  description text NOT NULL,
  stripe_payment_intent_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create credit_packages table
CREATE TABLE IF NOT EXISTS credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits numeric(10, 2) NOT NULL,
  base_price numeric(10, 2) NOT NULL,
  sale_price numeric(10, 2) NOT NULL,
  popular boolean DEFAULT false,
  active boolean DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Insert default credit packages (50% markup)
INSERT INTO credit_packages (name, credits, base_price, sale_price, popular, description) VALUES
  ('Starter Pack', 10.00, 10.00, 15.00, false, '10 credits to get started'),
  ('Value Pack', 25.00, 25.00, 37.50, false, '25 credits - save more'),
  ('Power Pack', 50.00, 50.00, 75.00, true, '50 credits - most popular'),
  ('Pro Pack', 100.00, 100.00, 150.00, false, '100 credits - best value'),
  ('Elite Pack', 250.00, 250.00, 375.00, false, '250 credits - for power users'),
  ('Ultimate Pack', 500.00, 500.00, 750.00, false, '500 credits - maximum savings')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_balances_user_id ON credit_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_balances
CREATE POLICY "Users can view own credit balance"
  ON credit_balances FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own credit balance"
  ON credit_balances FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own credit balance"
  ON credit_balances FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view own credit transactions"
  ON credit_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own credit transactions"
  ON credit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for credit_packages (publicly readable)
CREATE POLICY "Anyone can view active credit packages"
  ON credit_packages FOR SELECT
  TO authenticated
  USING (active = true);

-- Function to update credit balance updated_at timestamp
DROP TRIGGER IF EXISTS update_credit_balances_updated_at ON credit_balances;
CREATE TRIGGER update_credit_balances_updated_at
  BEFORE UPDATE ON credit_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to add credits to user balance
CREATE OR REPLACE FUNCTION add_credits_to_balance(
  p_user_id uuid,
  p_amount numeric,
  p_description text,
  p_stripe_payment_intent_id text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_new_balance numeric;
  v_transaction_id uuid;
BEGIN
  -- Ensure user has a credit balance record
  INSERT INTO credit_balances (user_id, balance, total_purchased)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Update balance
  UPDATE credit_balances
  SET 
    balance = balance + p_amount,
    total_purchased = total_purchased + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  -- Create transaction record
  INSERT INTO credit_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    stripe_payment_intent_id
  )
  VALUES (
    p_user_id,
    'purchase',
    p_amount,
    v_new_balance,
    p_description,
    p_stripe_payment_intent_id
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'transaction_id', v_transaction_id,
    'amount_added', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits from user balance
CREATE OR REPLACE FUNCTION deduct_credits_from_balance(
  p_user_id uuid,
  p_amount numeric,
  p_description text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb AS $$
DECLARE
  v_current_balance numeric;
  v_new_balance numeric;
  v_transaction_id uuid;
BEGIN
  -- Check current balance
  SELECT balance INTO v_current_balance
  FROM credit_balances
  WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No credit balance found for user'
    );
  END IF;
  
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'current_balance', v_current_balance,
      'required_amount', p_amount
    );
  END IF;
  
  -- Deduct credits
  UPDATE credit_balances
  SET 
    balance = balance - p_amount,
    total_used = total_used + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  -- Create transaction record
  INSERT INTO credit_transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    metadata
  )
  VALUES (
    p_user_id,
    'usage',
    -p_amount,
    v_new_balance,
    p_description,
    p_metadata
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'transaction_id', v_transaction_id,
    'amount_deducted', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
