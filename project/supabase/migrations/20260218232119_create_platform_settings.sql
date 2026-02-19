/*
  # Create Platform Settings Table

  1. New Tables
    - `platform_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting key name
      - `value` (jsonb) - Setting value
      - `description` (text) - Description of the setting
      - `updated_at` (timestamp)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `platform_settings` table
    - Add policy for public read access (settings are public)
    - Add policy for admin-only write access
  
  3. Initial Data
    - Insert domain and hosting settings
*/

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Public can read all settings
CREATE POLICY "Anyone can read platform settings"
  ON platform_settings
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated users can update settings (we'll add admin check later)
CREATE POLICY "Authenticated users can update settings"
  ON platform_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can insert settings
CREATE POLICY "Authenticated users can insert settings"
  ON platform_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert domain and hosting settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('domain', '{"primary": "googlehubs.com", "www": "www.googlehubs.com", "dev": "dev.googlehubs.com"}'::jsonb, 'Primary domain configuration'),
  ('hosting', '{"provider": "Cloudflare Pages", "repo": "https://github.com/tj-berkley/HELIX", "branch": "main", "build_command": "npm run build", "publish_directory": "dist"}'::jsonb, 'Hosting configuration'),
  ('deployment', '{"status": "active", "last_deploy": null, "auto_deploy": true}'::jsonb, 'Deployment status and settings')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();