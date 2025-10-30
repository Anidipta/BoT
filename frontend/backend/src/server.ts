import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(json());

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Supabase URL or service role key is not set in env (SUPABASE_SERVICE_ROLE / VITE_SUPABASE_SERVICE_ROLE).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });

app.post('/api/upsert-wallet', async (req, res) => {
  try {
    const { address, balance, tokenCount, metricValue } = req.body;
    if (!address) return res.status(400).json({ error: 'address is required' });

    // 1) upsert wallets
    await supabase.from('wallets').upsert({ address, connected_at: new Date().toISOString(), is_fake: false }, { onConflict: 'address' });

    // 2) upsert native balance
    if (typeof balance === 'number') {
      await supabase.from('native_balances').upsert({ wallet_address: address, balance, updated_at: new Date().toISOString() }, { onConflict: 'wallet_address' });
    }

    // 3) insert analytics metric if provided
    if (typeof metricValue === 'number') {
      await supabase.from('analytics_metrics').insert({ metric_name: `wallet_summary_${address}`, metric_value: metricValue, metric_data: { tokenCount }, calculated_at: new Date().toISOString() });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error in /api/upsert-wallet', err);
    return res.status(500).json({ error: 'internal_error', detail: String(err) });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
