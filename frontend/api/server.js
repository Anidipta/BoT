import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import { scrapeFlowscanAccount } from './scraper.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MONGODB_URL = process.env.MONGODB_URL || process.env.VITE_MONGODB_URL;

if (!MONGODB_URL) {
  console.error('MONGODB_URL is not set in env. Set MONGODB_URL in .env or environment.');
  process.exit(1);
}

let dbClient;
let db;

const connectMongo = async () => {
  if (dbClient) return;
  dbClient = new MongoClient(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  await dbClient.connect();
  // If connection string contains a db name, client.db() will return it; otherwise default to 'book_of_truth'
  db = dbClient.db();
  console.log('Connected to MongoDB');
};

// New endpoint: Scrape Flowscan account page
app.get('/api/scrape/:address', async (req, res) => {
  try {
    const { address } = req.params;
    if (!address) return res.status(400).json({ error: 'address is required' });

    console.log(`[API] Scraping account: ${address}`);
    const result = await scrapeFlowscanAccount(address);

    if (!result.success) {
      return res.status(500).json({ error: 'scrape_failed', detail: result.error });
    }

    // Store scraped data in MongoDB
    try {
      await connectMongo();
      const snapshots = db.collection('flowscan_snapshots');
      await snapshots.insertOne({
        address,
        scrapedAt: new Date(),
        data: result
      });
    } catch (err) {
      console.warn('Failed to store in MongoDB:', err);
    }

    return res.json(result);
  } catch (err) {
    console.error('Error in /api/scrape/:address', err);
    return res.status(500).json({ error: 'internal_error', detail: String(err) });
  }
});

app.post('/api/upsert-wallet', async (req, res) => {
  try {
    // accept optional 'details' object with raw Flowscan responses
    const { address, balance, tokenCount, metricValue, details } = req.body;
    if (!address) return res.status(400).json({ error: 'address is required' });

    await connectMongo();

    const wallets = db.collection('wallets');
    const nativeBalances = db.collection('native_balances');
    const analytics = db.collection('analytics_metrics');

    // upsert wallet (save only wallet)
    await wallets.updateOne({ address }, { $set: { address, connected_at: new Date(), is_fake: false } }, { upsert: true });

    if (typeof balance === 'number') {
      await nativeBalances.updateOne({ wallet_address: address }, { $set: { wallet_address: address, balance, updated_at: new Date() } }, { upsert: true });
    }

    // compute tokenCount server-side if not provided
    let resolvedTokenCount = typeof tokenCount === 'number' ? tokenCount : null;
    if (resolvedTokenCount === null) {
      const tokensCol = db.collection('tokens');
      try {
        resolvedTokenCount = await tokensCol.countDocuments({ owner_address: address });
      } catch (err) {
        console.warn('tokens collection missing or count failed', err);
        resolvedTokenCount = 0;
      }
    }

    const metricVal = Number(balance || 0) + Number(resolvedTokenCount || 0);

    // store optional raw details snapshot from Flowscan (if provided)
    if (details) {
      const snapshots = db.collection('flowscan_snapshots');
      await snapshots.insertOne({ wallet: address, details, fetched_at: new Date() });
    }

    await analytics.insertOne({ metric_name: `wallet_summary_${address}`, metric_value: metricVal, metric_data: { tokenCount: resolvedTokenCount }, calculated_at: new Date() });

    return res.json({ ok: true, metricValue: metricVal, tokenCount: resolvedTokenCount });
  } catch (err) {
    console.error('Error in /api/upsert-wallet', err);
    return res.status(500).json({ error: 'internal_error', detail: String(err) });
  }
});

// Optional safe endpoint to drop the database: requires explicit body.confirm === 'DELETE' and env ALLOW_DB_DROP=true
app.post('/api/drop-db', async (req, res) => {
  try {
    if (process.env.ALLOW_DB_DROP !== 'true') return res.status(403).json({ error: 'DB drop not allowed. Set ALLOW_DB_DROP=true to enable.' });
    const { confirm } = req.body;
    if (confirm !== 'DELETE') return res.status(400).json({ error: "Provide { confirm: 'DELETE' } in body to drop DB" });
    await connectMongo();
    const dbName = db.databaseName;
    await db.dropDatabase();
    console.log(`Dropped database ${dbName}`);
    return res.json({ ok: true, dropped: dbName });
  } catch (err) {
    console.error('Error dropping DB', err);
    return res.status(500).json({ error: 'internal_error', detail: String(err) });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
