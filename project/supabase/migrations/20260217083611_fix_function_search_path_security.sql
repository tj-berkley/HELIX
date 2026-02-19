/*
  # Fix Function Search Path Security Vulnerabilities
  
  ## Security Issue
  Functions with SECURITY DEFINER and mutable search_path are vulnerable to 
  search path injection attacks. This migration fixes all three flagged functions.
  
  ## Changes
  - Set explicit search_path on `update_updated_at_column`
  - Set explicit search_path on `add_credits_to_balance`
  - Set explicit search_path on `deduct_credits_from_balance`
  
  ## Security Impact
  - Prevents malicious users from hijacking function behavior
  - Ensures functions only access intended schemas
  - Follows PostgreSQL security best practices
*/

-- Create or replace the updated_at trigger function with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

-- Recreate add_credits_to_balance with secure search_path
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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Recreate deduct_credits_from_balance with secure search_path
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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION add_credits_to_balance(uuid, numeric, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_credits_from_balance(uuid, numeric, text, jsonb) TO authenticated;
