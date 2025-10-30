# Web Scraping Implementation - Book of Truth

## What Was Added

You now have **reliable web scraping** using **Puppeteer** to extract all Flowscan account data properly.

### 📦 New Files

1. **`api/scraper.js`** - Puppeteer-based scraper
   - Launches headless Chrome
   - Navigates to Flowscan account page
   - Extracts account summary (balance, staking, delegation, storage)
   - Scrapes transaction table with timestamps, types, statuses
   - Extracts tokens, collections from separate tabs
   - Returns structured JSON data

2. **`api/server.js`** - Enhanced backend API
   - New endpoint: `GET /api/scrape/:address`
   - Calls Puppeteer scraper and returns data
   - Optionally stores in MongoDB
   - Graceful error handling

3. **`start-dev.js`** - Automated startup script
   - Starts both backend API and frontend in parallel
   - Handles graceful shutdown

4. **`test-scraper.js`** - Standalone test utility
   - Test scraper without running full app
   - Usage: `node test-scraper.js 0x0fe1ee9b555dcafc`

5. **`SCRAPER_README.md`** - Comprehensive scraper documentation

### 🔄 Updated Files

1. **`package.json`**
   - Added `puppeteer` dependency
   - New scripts: `npm run dev:full`, `npm run api`

2. **`src/components/Dashboard.tsx`**
   - Updated extraction logic to call backend scraper
   - Falls back to Flow REST if scraper unavailable
   - Displays scraped transaction, token, collection data in logs

## 🚀 How to Use

### Option 1: Frontend Only (No Scraping)
```bash
npm run dev
```
- Uses only Flow REST API
- Fast, no external dependencies

### Option 2: Full Stack with Scraping
```bash
# Make sure MongoDB is running locally, or set MONGODB_URL env var
npm run dev:full
```

This starts:
- ✅ Backend scraper API on `http://localhost:8787`
- ✅ Frontend dev server on `http://localhost:5173`

### Option 3: Test Scraper Independently
```bash
node test-scraper.js 0x0fe1ee9b555dcafc
```

Outputs:
```json
{
  "address": "0x0fe1ee9b555dcafc",
  "summary": {
    "primary": "100,000.0010",
    "staked": "0.0000",
    "total": "100,000.0010"
  },
  "transactions": [
    {
      "id": "287638987",
      "timestamp": "October 30, 2025 22:31:52",
      "type": "FT",
      "status": "SEALED",
      "hash": "434d00e16d2d34a2..."
    }
  ],
  "tokens": [ ... ],
  "collections": [ ... ]
}
```

## 📊 Data Extracted

When scraper runs, it extracts:

✅ **Account Summary**
- Primary FLOW balance
- Staked FLOW
- Delegated FLOW
- Total FLOW
- Storage usage

✅ **Transactions**
- Transaction ID
- Timestamp
- Type (FT, NFT, Interaction, etc.)
- Status (SEALED, FINALIZED, etc.)
- Transaction hash
- Links

✅ **Tokens**
- Token name
- Balance
- Contract address

✅ **Collections**
- Collection name
- Item count
- Collection address

## 🔧 Architecture

```
Dashboard.tsx
    ↓
Extraction every 60s
    ↓
Try Backend Scraper (http://localhost:8787/api/scrape/:address)
    ├─→ Puppeteer launches headless Chrome
    ├─→ Navigates to Flowscan account page
    ├─→ Extracts all tables & data
    └─→ Returns JSON
    ↓
Fallback to Flow REST (if scraper unavailable)
    ├─→ /v1/accounts/:address (balance, contracts)
    └─→ Returns JSON
    ↓
localStorage Snapshot
    ├─→ Stores in browser under flowscan_snapshots_v1_{address}
    ├─→ Change detection (skips if unchanged)
    └─→ Max 500 snapshots per wallet
    ↓
Dashboard Display
    ├─→ Stats cards
    ├─→ Recent logs
    ├─→ Charts (radar, stacked bar)
    └─→ Activity panel
```

## ✨ Benefits

✅ **Reliable Data** - Puppeteer scrapes actual HTML, not flaky APIs
✅ **Complete Info** - Gets all fields shown on Flowscan UI
✅ **Fallback Support** - Works without scraper (Flow REST only)
✅ **Change Detection** - Only saves when data changes
✅ **Local Privacy** - All data stored in browser
✅ **Optional Backend** - Can add MongoDB for central storage

## ⚠️ Important Notes

- **Puppeteer requires Chromium** - First run downloads ~500MB
- **Headless browser** - Uses headless mode (no visible window)
- **Timeout: 30s** - If Flowscan is slow, might timeout
- **DNS/Network** - Still subject to your network connectivity
- **Respects Rate Limits** - Use reasonable polling intervals

## 📝 Logs

Check the "Recent Logs" panel in Dashboard for extraction status:
- `Starting data extraction for...`
- `Scraped account data from Flowscan: X transactions`
- `Flow balance: X FLOW`
- `Found X contracts deployed`
- `Snapshot saved...`
- `No changes detected` (if data unchanged)

## 🐛 Troubleshooting

**Q: Scraper hangs or times out**
A: Flowscan might be slow. Try increasing timeout in `scraper.js` (line 23: change `30000` to `60000` ms)

**Q: "Backend scraper unavailable (503)"**
A: Make sure backend is running: `npm run api` in another terminal

**Q: Getting old data**
A: Change detection prevents re-saving identical data. This is normal. Wait for wallet data to actually change.

**Q: Browser window appears during scraping**
A: Headless mode is enabled. If not, check line 11 in `api/scraper.js`: should be `headless: true`

## 🎯 Next Steps

1. ✅ Try `npm run dev:full` to start everything
2. ✅ Connect your Flow testnet wallet
3. ✅ Watch the extraction logs
4. ✅ See transactions, tokens, collections appear
5. ✅ Export snapshots to JSON (coming soon)
6. ✅ Integrate with Dune Analytics (coming soon)
