/*
  # Create games table for BloxRisks

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `game_type` (text)
      - `bet_amount` (numeric)
      - `payout` (numeric)
      - `result` (jsonb)
      - `seed` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `games` table
    - Add policy for users to read their own games
    - Add policy for users to insert their own games
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  game_type text NOT NULL,
  bet_amount numeric NOT NULL DEFAULT 0,
  payout numeric NOT NULL DEFAULT 0,
  result jsonb,
  seed text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own games"
  ON games
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS games_user_id_created_at_idx ON games(user_id, created_at DESC);