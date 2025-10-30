# Flow Blockchain Explorer - Book of Truth

A real-time Flow testnet blockchain explorer with pixel-art retro aesthetic. Connect your wallet and get comprehensive account data, transaction history, token information, and more.

## ✨ Features

- **Real Flow Wallet Integration**: Connect with Flow testnet wallet using FCL
- **Comprehensive Data Extraction**: 
  - Account balance & staking info
  - Transaction history with full details
  - Token holdings & collections
  - Deployed contracts count
- **Advanced Web Scraping**: Puppeteer-based Flowscan scraping with reliable data extraction
- **Pixel-Art Retro Theme**: 80s/90s arcade-inspired UI with neon cyan, lime, magenta accents
- **Local Data Persistence**: localStorage snapshots with change detection (max 500 per wallet)
- **Interactive Charts**: Radar chart for transaction volume, stacked bar chart for deployments
- **1-Minute Polling**: Auto-refresh every 60 seconds

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Flow testnet wallet (e.g., Flow Testnet Wallet browser extension)
- MongoDB (optional, for backend storage)

### Installation

```bash
cd frontend
npm install
```

### Running the App

#### Option 1: Frontend Only (No Scraping)
```bash
npm run dev
```
Starts Vite dev server on `http://localhost:5173`
- Uses Flow REST API for balance & contracts
- No Flowscan scraping (read-only Flow data)

#### Option 2: With Backend Scraper (Full Features)
```bash
npm run dev:full
```
Starts both:
- Backend scraper API on `http://localhost:8787` (requires MongoDB)
- Frontend dev server on `http://localhost:5173`

If MongoDB is not running locally, set `MONGODB_URL` env var:
```bash
MONGODB_URL=mongodb://your-mongo-host/book_of_truth npm run dev:full
```

#### Option 3: Manual - Start Backend and Frontend Separately
```bash
# Terminal 1: Backend scraper API
npm run api

# Terminal 2: Frontend dev server
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Flow Configuration
VITE_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
VITE_FLOW_DISCOVERY=https://fcl-discovery.onflow.org/testnet/authn

# MongoDB (optional, for backend storage)
MONGODB_URL=mongodb://localhost:27017/book_of_truth

# Allow database drop (backend only, requires explicit body confirmation)
ALLOW_DB_DROP=false
```

## 📊 Data Flow

### Frontend-Only Mode
```
Flow REST API → Dashboard → localStorage
```

### With Backend Scraper
```
Puppeteer Scraper → Flowscan (HTML) ─┐
                                      ├→ Backend API → MongoDB
Flow REST API ─────────────────────────┤
                                      └→ Frontend → localStorage
```

### Data Persistence
- **localStorage**: Per-wallet snapshots stored under `flowscan_snapshots_v1_<ADDRESS>`
- **MongoDB** (if running): Raw snapshots in `flowscan_snapshots` collection
- **Change Detection**: Compares JSON hash of current vs last snapshot; skips duplicate saves

## 🎨 Theme

**Retro Arcade Pixel-Art Palette:**
- Base: Deep navy/purple (`#0a0e27`, `#1a1d3a`)
- Accents: Neon cyan (`#00d9ff`), lime green (`#00ff00`), magenta (`#ff00ff`)
- Text: Light gray (`#cccccc`), bright white (`#ffffff`)
- Borders: Black (`#000000`) with pixel-perfect shadows

All styling via TailwindCSS + custom CSS in `src/index.css`.

## 📱 Components

### `Dashboard.tsx`
- Main wallet dashboard with extraction logic
- Stats cards (contracts, transactions, events, collections, FLOW balance)
- Wallet metric (balance + contract count)
- Recent logs (extraction activity)
- Transaction volume radar chart
- Contract deployments stacked bar chart

### `ChartCard.tsx`
- Supports multiple chart types: bar, radar, stacked
- Uses Recharts for professional visualizations
- Respects pixel-art theme colors

### `LandingPage.tsx`
- Onboarding page with feature list
- Connect wallet button with preconnect optimization
- Quickstart walkthrough

## 🔄 Extraction Logic

**Trigger**: Every 60 seconds (configurable in Dashboard effect)

**Data Extracted:**
1. **Balance** from Flow REST API (`/v1/accounts/{address}`)
2. **Deployed Contracts** count from account contracts
3. **Account Summary** from Flowscan (if scraper available)
   - Primary/staked/delegated FLOW
   - Storage usage
4. **Transactions** from Flowscan (if scraper available)
   - Transaction ID, timestamp, type, status, hash
5. **Tokens** from Flowscan (if scraper available)
6. **Collections** from Flowscan (if scraper available)

**Change Detection**: Compares JSON hash of current vs previous snapshot
- Only saves if different (avoids duplicate storage entries)
- Logs activity in "Recent Logs" panel

## 🐛 Troubleshooting

### Issue: "Wallet connect taking a long time"
**Solution**: Connection warming is enabled. If still slow, check network latency to FCL discovery and Flow REST nodes.

### Issue: "Scraper endpoint not available (503)"
**Solution**: Backend API not running. Start with `npm run dev:full` or manually with `npm run api`.

### Issue: "ENOTFOUND testnet.flowscan.org"
**Solution**: DNS/network issue on your machine. Check:
- Network connectivity
- DNS settings (try `8.8.8.8`)
- Corporate firewall blocking Flow domains

### Issue: "No changes detected; skipping save"
**Solution**: Normal behavior when wallet data hasn't changed. Snapshots only save on actual changes.

### Issue: "MongoDB connection failed"
**Solution**: Ensure MongoDB is running or set correct `MONGODB_URL` env var. Backend gracefully falls back if unavailable.

## 📦 Dependencies

- **@onflow/fcl**: Flow Client Library for wallet connect
- **react/react-dom**: UI framework
- **recharts**: Advanced charting
- **puppeteer**: Headless browser scraping
- **mongodb**: Optional backend database
- **tailwindcss**: Utility-first CSS
- **lucide-react**: Icon library

## 📚 API Endpoints (Backend)

### GET `/api/scrape/:address`
Scrape Flowscan account page data using Puppeteer.

**Response:**
```json
{
  "address": "0x0fe1ee9b555dcafc",
  "scrapedAt": "2025-10-30T...",
  "summary": {
    "primary": "100,000.0010",
    "staked": "0.0000",
    "delegated": "0.0000",
    "total": "100,000.0010"
  },
  "transactions": [ ... ],
  "tokens": [ ... ],
  "collections": [ ... ],
  "success": true
}
```

### POST `/api/upsert-wallet`
Save wallet data to MongoDB (optional backend storage).

### POST `/api/drop-db`
Drop MongoDB database (requires `ALLOW_DB_DROP=true` and `{ confirm: "DELETE" }` body).

## 🎯 Next Steps

- [ ] Add snapshots viewer (browse historical data)
- [ ] Export snapshots to JSON
- [ ] Integration with Dune Analytics
- [ ] Multi-chain support
- [ ] Advanced filtering & search

## 📄 License

Open source • Built with ❤️ for Flow community
