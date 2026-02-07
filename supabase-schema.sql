-- Bet on B.U.D. Database Schema
-- Run this in your Supabase SQL Editor

-- Create the guesses table
CREATE TABLE IF NOT EXISTS guesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  sex VARCHAR(4) NOT NULL CHECK (sex IN ('boy', 'girl')),
  guess_date DATE NOT NULL,
  contribution_amount INTEGER NOT NULL CHECK (contribution_amount >= 10),
  parenting_advice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure email format is valid
  CONSTRAINT valid_email CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Create an index on email for quick lookups
CREATE INDEX IF NOT EXISTS idx_guesses_email ON guesses(email);

-- Create an index on guess_date for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_guesses_date ON guesses(guess_date);

-- Enable Row Level Security (RLS)
ALTER TABLE guesses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (public submissions)
CREATE POLICY "Anyone can submit a guess" ON guesses
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anyone to read guesses (for displaying all guesses later)
CREATE POLICY "Anyone can view guesses" ON guesses
  FOR SELECT
  USING (true);

-- Note: For production, you may want to:
-- 1. Restrict SELECT to authenticated users only
-- 2. Add rate limiting
-- 3. Add a payment_status column to track Stripe payments
