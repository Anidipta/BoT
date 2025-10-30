![BoT — Book of Truth](logo.png)

# BoT — Book of Truth

## Overview

**BoT (Book of Truth)** is a **privacy-first developer toolkit** for the **Flow Testnet** that connects directly to a real Flow wallet, scrapes authoritative data from **Flowscan** and **Flow REST**, and stores **per-wallet snapshots locally** for fast, auditable account inspection and lightweight analytics.

---

## Unique Selling Proposition (USP)

* 🧠 **Local-first blockchain observability** — capture full, verifiable account snapshots directly in your browser (no telemetry leaves your machine unless you choose to share it).
* ⚡ **Fast, developer-friendly workflow** — connect a Flow wallet and get a comprehensive snapshot (balances, tokens, transactions, keys, collections, etc.) in under a minute.
* 🧩 **Zero setup** — everything runs in the frontend; just start the dev server and go (Vite proxy handles CORS).
* 🪄 **Extensible to production** — the same scraping/parsing model scales server-side for team analytics and multi-user environments.

---

## Vision

Empower **developers, auditors, and researchers** to access, archive, and analyze on-chain truths **without sacrificing privacy or speed**.

BoT bridges the gap between **ad-hoc scraping** and **robust analytics pipelines**, enabling instant, reproducible, and auditable blockchain insights.

---

## The Idea

Most blockchain analytics workflows require either heavy infrastructure or repeatedly re-running ad-hoc queries. BoT provides a middle path:
- Let the developer or user own the extraction lifecycle by keeping snapshots local (privacy-first).
- Provide a single-click path from wallet → snapshot with both structured API data and page-derived UX details (transaction links, table rows, human-readable labels).
- Make it trivial to graduate to central analytics (MongoDB/SQL + scheduled server jobs) when broader aggregation is required.

## Features (what the product does)

- Wallet Integration
  - Flow Testnet wallet connect using FCL.
  - Quick address display + disconnect with automatic cleanup for local snapshots.

- Full Account Extraction (on connect and periodic updates)
  - Flow REST balance and account metadata.
  - Flowscan API endpoints: account, transactions, tokens, nfts, events.
  - Public Flowscan account page scraping for transaction links, table rows and additional UI-only fields (Storage, Staked, Delegated, etc.).
  - Tab-by-tab scraping: transactions, scheduled items, keys, token lists, FT/NFT transfers, collections.
  - Change detection: snapshots are persisted only when the extracted content changes vs the last snapshot.

- Local Persistence & Privacy
  - Per-wallet snapshots stored in browser localStorage under `flowscan_snapshots_v1_<WALLET_ADDR>`.
  - Snapshots include raw API responses + parsed HTML snippets and per-tab parsed tables.
  - Configurable retention (by default up to N snapshots, configurable in code or UI).

- Developer Convenience & UX
  - Dev-time Vite proxy to avoid CORS when calling Flowscan during local development.
  - **Optional backend scraper** using Puppeteer for reliable HTML extraction (transactions, tokens, collections).
  - Minimal setup: run the frontend, connect a wallet, view logs and snapshots immediately.
  - Interactive charts: radar chart for transaction volume, stacked bar chart for deployments.
  - Pixel-art retro theme with neon accents.

- Export & Extendability
  - Export snapshots to JSON to feed offline tools or analytics pipelines.
  - Optionally plug in a server-side persistence layer (MongoDB/Postgres/Supabase) for multi-user environments.

## Dune Analytics integration (how it fits)

BoT focuses on per-wallet, verifiable snapshots. Dune Analytics is a complementary analytics platform focused on large-scale query and visualization over entire on-chain datasets.

### How they work together (recommended patterns):
- Export snapshots
  - Users or administrators can export local snapshots (JSON) and load them into a Dune dataset ingestion point (or store them in a central DB that Dune queries).
- Curated insights
  - Use BoT to identify interesting addresses and epochs. Export those snapshots and use Dune to run large-scale, cross-address queries (e.g., cohort analysis of token transfer patterns, staking behavior, or NFT flows linked to these addresses).
- Embedding Dune charts
  - While BoT is primarily local-first, a production deployment that stores snapshots centrally can surface Dune charts embedded in the dashboard (Dune's public embed URLs or iFrames) to complement the snapshot view with aggregated charts and historical trends.

### Suggested integration workflow
- Lightweight: Export snapshot JSON → Upload to a shared storage area → Use Dune to build a dataset or visualizations referencing the uploaded data.
- Server-backed: Persist snapshots into a shared DB (Mongo/Postgres). Configure Dune to query that DB (or export snapshots into a Dune-supported ingestion pipeline) to build dashboards.


---

## 🎯 Target Users

* 👨‍💻 **Flow developers** needing rapid account diagnostics.
* 🔍 **Auditors & researchers** verifying keys, state, and transactions.
* 📈 **Data analysts** promoting wallet-level data into larger analytics (Dune, Tableau, BigQuery).

---

## 🧰 Technical Stack

* **Frontend:** Vite + React + TypeScript
* **Styling:** TailwindCSS (custom extended theme)
* **Flow Auth:** @onflow/fcl
* **Data Extraction:** Flow REST + Flowscan API + **Puppeteer (optional backend scraper)**
* **Charts:** Recharts (radar, stacked bar, simple bar)
* **Backend (optional):** Express + MongoDB
* **Dev Tools:** Vite proxy for local CORS bypass

---

## 🛣️ Roadmap / Next Steps

* 🪟 **Snapshots Viewer:** in-app viewer with filtering, sorting, and per-tab rendering.
* 📦 **Export/Import:** JSON tools + bulk uploader for DB ingestion.
* 🌐 **Server Mode:** background extractors and persistence for multi-user analytics.
* 🧩 **Parsers:** structured objects (txHash, block, timestamp, etc.) for all tabs.
* 🧮 **Monitoring & Retention:** configurable diffs, compression, and archival.

---

## 🔍 Why It Works

✅ **Privacy-first** — you decide when data leaves your browser.
✅ **Incremental adoption** — start local, scale to cloud as needed.
✅ **Auditable & reproducible** — raw data and parsed views saved together for traceability.

---


## ⚡ Call to Action

> 🪄 Connect your **Flow Testnet wallet**, capture your first **account snapshot** in under a minute, and export it to fuel **your analytics workflows** — from local debugging to full-scale dashboards with **Dune Analytics** or your favorite tools.