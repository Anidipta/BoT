import fs from 'fs';
import { Client } from 'pg';

const conn = process.env.PG_CONN || process.argv[2];
const sqlPath = process.argv[3] || '../supabase/migrations/20251030035148_create_flow_blockchain_schema.sql';

if (!conn) {
  console.error('Usage: PG_CONN="postgres://..." node run_migration.js <connectionString> [sqlPath]');
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');

async function run() {
  const client = new Client({ connectionString: conn });
  try {
    await client.connect();
    console.log('Connected to Postgres, running migration...');
    await client.query(sql);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
}

run();
