# BoT — Book of Truth

## Overview

BoT is a privacy-first developer toolkit for Flow Testnet that connects a real Flow wallet, scrapes authoritative data from Flowscan and Flow REST, and stores per-wallet snapshots locally for fast, auditable account inspection and lightweight analytics.

## Unique Selling Proposition (USP)

- Local-first blockchain observability: capture full, verifiable account snapshots in the user's browser (no account telemetry shipped unless explicitly configured).
- Fast, developer-friendly workflow: connect a Flow wallet and get a detailed account snapshot (balances, tokens, transactions, transfers, collections, keys, scheduled items) in under a minute.
- Minimal setup: no server required to get started — everything runs in the frontend with a dev-time proxy to avoid CORS.
- Extensible to production: the same scraping/parsing model can be moved server-side and persisted centrally for multi-user analytics.

## Vision

Enable developers, auditors, and researchers to quickly access, archive, and analyze on-chain account truths without trading privacy or dev velocity. BoT's goal is to make account-level forensic data immediately available and reusable — bridging the gap between ad-hoc browser scraping and robust analytics pipelines.

The Idea
--------
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
  - Minimal setup: run the frontend, connect a wallet, view logs and snapshots immediately.
  - Theme and UI tuned for readability and fast scanning (cream/white/silver with neon accents by default).

- Export & Extendability
  - Export snapshots to JSON to feed offline tools or analytics pipelines.
  - Optionally plug in a server-side persistence layer (MongoDB/Postgres/Supabase) for multi-user environments.

## Dune Analytics integration (how it fits)

BoT focuses on per-wallet, verifiable snapshots. Dune Analytics is a complementary analytics platform focused on large-scale query and visualization over entire on-chain datasets.

How they work together (recommended patterns):
- Export snapshots
  - Users or administrators can export local snapshots (JSON) and load them into a Dune dataset ingestion point (or store them in a central DB that Dune queries).
- Curated insights
  - Use BoT to identify interesting addresses and epochs. Export those snapshots and use Dune to run large-scale, cross-address queries (e.g., cohort analysis of token transfer patterns, staking behavior, or NFT flows linked to these addresses).
- Embedding Dune charts
  - While BoT is primarily local-first, a production deployment that stores snapshots centrally can surface Dune charts embedded in the dashboard (Dune's public embed URLs or iFrames) to complement the snapshot view with aggregated charts and historical trends.

Suggested integration workflow
- Lightweight: Export snapshot JSON → Upload to a shared storage area → Use Dune to build a dataset or visualizations referencing the uploaded data.
- Server-backed: Persist snapshots into a shared DB (Mongo/Postgres). Configure Dune to query that DB (or export snapshots into a Dune-supported ingestion pipeline) to build dashboards.

## Target Users

- Blockchain developers building Flow-native dApps who need quick account diagnostics.
- Auditors and security researchers verifying account state, key sets, and historic transactions.
- Data analysts who want a quick way to identify and promote account-level signals into larger analytics workflows (Dune, Tableau, BigQuery).

## Technical Stack 

- Frontend: Vite, React, TypeScript
- Styling: TailwindCSS (extended palette for the custom theme)
- Flow auth: @onflow/fcl (Flow Client Library) for Testnet wallet connectivity
- Data extraction: client-side fetch() against Flow REST and Flowscan API + HTML parsing via DOMParser
- Dev tooling: Vite dev-server proxy (to avoid CORS during local development)

## Roadmap / Next steps

- UX: Add an in-app Snapshots viewer (table + detail view) to avoid using the browser console for inspection — sortable, filterable, with per-tab renderers.
- Export/Import: Add a JSON export/import tool and a small bulk uploader for central DB ingestion.
- Server mode: Add optional server-side extraction/persistence (scheduled jobs, background workers) to support many users and Dune ingest.
- Parsers: Add column-mapping for tabs so transactions, transfers and keys are represented as structured objects with named fields (e.g., txHash, status, block, timestamp).
- Monitoring & retention: Add configurable retention, snapshot diffs, and snapshot compression/archiving.

## Why this approach works

- Privacy-first: developers and users control whether snapshots leave their browser.
- Incremental: start local (no infra), then graduate to shared analytics when you need scale.
- Auditability: raw API responses + page-derived HTML snippets are saved for reproducibility and forensic checks.

## Call to action

Connect your Flow Testnet wallet, inspect a live account in under a minute, and export snapshots to plug into your analytics workflow (Dune or a central DB) for deeper signals and dashboards.