/*
  # Create Prospects and Reports System

  1. New Tables
    - `prospects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `place_id` (text, unique per user)
      - `business_name` (text)
      - `address` (text)
      - `phone` (text)
      - `website` (text)
      - `rating` (numeric)
      - `total_ratings` (integer)
      - `types` (jsonb)
      - `contact_info` (jsonb) - enriched contact data
      - `ai_score` (integer) - business profile score
      - `ai_score_details` (jsonb)
      - `is_pinned` (boolean)
      - `email_valid` (boolean)
      - `phone_valid` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `prospect_reports`
      - `id` (uuid, primary key)
      - `prospect_id` (uuid, references prospects)
      - `user_id` (uuid, references auth.users)
      - `report_type` (text) - 'google_business' or 'ai_audit'
      - `report_data` (jsonb)
      - `status` (text) - 'pending', 'completed', 'failed'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own prospects and reports
*/

-- Create prospects table
CREATE TABLE IF NOT EXISTS prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  place_id text NOT NULL,
  business_name text NOT NULL,
  address text,
  phone text,
  website text,
  rating numeric,
  total_ratings integer,
  types jsonb DEFAULT '[]'::jsonb,
  contact_info jsonb DEFAULT '{}'::jsonb,
  ai_score integer,
  ai_score_details jsonb DEFAULT '{}'::jsonb,
  is_pinned boolean DEFAULT false,
  email_valid boolean,
  phone_valid boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, place_id)
);

-- Create prospect_reports table
CREATE TABLE IF NOT EXISTS prospect_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('google_business', 'ai_audit')),
  report_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_reports ENABLE ROW LEVEL SECURITY;

-- Prospects policies
CREATE POLICY "Users can view own prospects"
  ON prospects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prospects"
  ON prospects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prospects"
  ON prospects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prospects"
  ON prospects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Prospect reports policies
CREATE POLICY "Users can view own reports"
  ON prospect_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON prospect_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON prospect_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON prospect_reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prospects_user_id ON prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_prospects_place_id ON prospects(place_id);
CREATE INDEX IF NOT EXISTS idx_prospects_pinned ON prospects(user_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_prospect_reports_prospect_id ON prospect_reports(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospect_reports_user_id ON prospect_reports(user_id);
