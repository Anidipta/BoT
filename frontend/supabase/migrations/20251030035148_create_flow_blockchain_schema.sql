/*
  # Book of Truth - Flow Blockchain Data Schema

  ## Overview
  This migration creates the complete database schema for storing and querying Flow blockchain data,
  including Cadence and EVM information for testnet visualization.

  ## New Tables
  
  ### 1. `wallets`
  Stores connected wallet information
  - `id` (uuid, primary key)
  - `address` (text, unique) - Flow wallet address
  - `name` (text) - Display name
  - `connected_at` (timestamptz) - Connection timestamp
  - `is_fake` (boolean) - Flag for preview/fake wallets
  
  ### 2. `contracts`
  Stores smart contract deployments
  - `id` (uuid, primary key)
  - `address` (text) - Contract address
  - `name` (text) - Contract name
  - `type` (text) - 'cadence' or 'evm'
  - `deployed_at` (timestamptz) - Deployment time
  - `code_hash` (text) - Contract code hash
  - `transaction_count` (integer) - Number of transactions
  
  ### 3. `transactions`
  Stores transaction records
  - `id` (uuid, primary key)
  - `tx_hash` (text, unique) - Transaction hash
  - `from_address` (text) - Sender address
  - `to_address` (text) - Receiver address
  - `type` (text) - Transaction type
  - `status` (text) - 'success' or 'failed'
  - `gas_used` (numeric) - Gas consumed
  - `timestamp` (timestamptz) - Transaction time
  - `block_number` (integer) - Block height
  
  ### 4. `events`
  Stores blockchain events
  - `id` (uuid, primary key)
  - `event_type` (text) - Event name
  - `contract_address` (text) - Emitting contract
  - `transaction_id` (uuid) - Related transaction
  - `data` (jsonb) - Event data payload
  - `timestamp` (timestamptz) - Event time
  
  ### 5. `token_collections`
  Stores NFT and token collections
  - `id` (uuid, primary key)
  - `name` (text) - Collection name
  - `symbol` (text) - Token symbol
  - `contract_address` (text) - Collection contract
  - `total_supply` (numeric) - Total tokens
  - `owner_count` (integer) - Unique owners
  - `created_at` (timestamptz) - Creation time
  
  ### 6. `tokens`
  Stores individual tokens/NFTs
  - `id` (uuid, primary key)
  - `collection_id` (uuid) - Parent collection
  - `token_id` (text) - Token identifier
  - `owner_address` (text) - Current owner
  - `metadata` (jsonb) - Token metadata
  - `last_transfer` (timestamptz) - Last transfer time
  
  ### 7. `native_balances`
  Stores native FLOW token balances
  - `id` (uuid, primary key)
  - `wallet_address` (text) - Wallet address
  - `balance` (numeric) - FLOW balance
  - `updated_at` (timestamptz) - Last update time
  
  ### 8. `analytics_metrics`
  Stores calculated analytics and metrics
  - `id` (uuid, primary key)
  - `metric_name` (text) - Metric identifier
  - `metric_value` (numeric) - Calculated value
  - `metric_data` (jsonb) - Additional data
  - `calculated_at` (timestamptz) - Calculation time
  
  ## Security
  - Enable RLS on all tables
  - Public read access for authenticated users
  - Restricted write access (service role only for data population)
  
  ## Notes
  1. Initial data will be fake/preview data for testnet visualization
  2. All timestamps use timestamptz for proper timezone handling
  3. JSONB columns allow flexible data storage for blockchain payloads
  4. Indexes added on frequently queried columns for performance
*/

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text UNIQUE NOT NULL,
  name text DEFAULT 'Flow Wallet',
  connected_at timestamptz DEFAULT now(),
  is_fake boolean DEFAULT false
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('cadence', 'evm')),
  deployed_at timestamptz DEFAULT now(),
  code_hash text,
  transaction_count integer DEFAULT 0
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash text UNIQUE NOT NULL,
  from_address text NOT NULL,
  to_address text,
  type text NOT NULL,
  status text DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  gas_used numeric DEFAULT 0,
  timestamp timestamptz DEFAULT now(),
  block_number integer NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  contract_address text NOT NULL,
  transaction_id uuid REFERENCES transactions(id),
  data jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Create token_collections table
CREATE TABLE IF NOT EXISTS token_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  symbol text NOT NULL,
  contract_address text NOT NULL,
  total_supply numeric DEFAULT 0,
  owner_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES token_collections(id),
  token_id text NOT NULL,
  owner_address text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  last_transfer timestamptz DEFAULT now()
);

-- Create native_balances table
CREATE TABLE IF NOT EXISTS native_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  balance numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Create analytics_metrics table
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_data jsonb DEFAULT '{}'::jsonb,
  calculated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contracts_address ON contracts(address);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(type);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_contract ON events(contract_address);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tokens_owner ON tokens(owner_address);
CREATE INDEX IF NOT EXISTS idx_tokens_collection ON tokens(collection_id);

-- Enable Row Level Security
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE native_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for all data (read-only analytics platform)
CREATE POLICY "Public read access for wallets"
  ON wallets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for contracts"
  ON contracts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for transactions"
  ON transactions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for token_collections"
  ON token_collections FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for tokens"
  ON tokens FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for native_balances"
  ON native_balances FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for analytics_metrics"
  ON analytics_metrics FOR SELECT
  TO anon, authenticated
  USING (true);