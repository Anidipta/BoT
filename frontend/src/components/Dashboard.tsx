import { useEffect, useState, useRef, useCallback } from 'react';
import * as fcl from '@onflow/fcl';
import { Activity, FileCode, Coins, Zap, ArrowRight, Wallet } from 'lucide-react';
import StatCard from './StatCard';
import ChartCard from './ChartCard';

interface DashboardProps {
  walletAddress: string;
  onViewDetails: (category: string) => void;
}

export default function Dashboard({ walletAddress, onViewDetails }: DashboardProps) {
  const formatAddr = (addr?: string) => {
    if (!addr) return '';
    if (addr.length <= 8) return addr;
    return `${addr.slice(0, 5)}...${addr.slice(-3)}`;
  };
  const [stats, setStats] = useState({
    totalContracts: 0,
    totalTransactions: 0,
    totalEvents: 0,
    totalCollections: 0,
    flowBalance: 0,
    activeContracts: 0
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [walletMetric, setWalletMetric] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const intervalRef = useRef<number | null>(null);

  const addLog = useCallback((message: string) => {
    const ts = new Date().toISOString();
    setLogs((l) => [
      `${ts} - ${message}`,
      ...l.slice(0, 49) // keep last 50
    ]);
    console.debug(message);
  }, []);

  // localStorage helpers (per-wallet keys)
  const storageKeyFor = useCallback((addr: string) => `flowscan_snapshots_v1_${addr}`, []);

  const loadSnapshots = useCallback((addr: string) => {
    try {
      const raw = localStorage.getItem(storageKeyFor(addr));
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to load snapshots', e);
      return [];
    }
  }, [storageKeyFor]);

  const saveSnapshot = useCallback((addr: string, snapshot: Record<string, unknown>) => {
    try {
      const key = storageKeyFor(addr);
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift(snapshot);
      const trimmed = arr.slice(0, 500);
      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to save snapshot', e);
    }
  }, [storageKeyFor]);

  const clearSnapshots = useCallback((addr: string) => {
    try {
      localStorage.removeItem(storageKeyFor(addr));
      addLog(`Cleared local snapshots for ${addr}`);
    } catch (e) {
      console.warn('Failed to clear snapshots', e);
    }
  }, [storageKeyFor, addLog]);

  const handleDisconnect = () => {
    try {
      if (walletAddress) clearSnapshots(walletAddress);
      setWalletMetric(null);
      addLog('User disconnected');
    } catch (e) {
      console.warn('Error during disconnect cleanup', e);
    }
    fcl.unauthenticate();
  };

  // extraction function memoized so effect can depend on it safely
  const extractAndSaveWalletData = useCallback(async (addr: string) => {
    try {
      addLog(`Starting extraction for ${addr}`);

      // fetch balance from Flow REST
      let balance = 0;
      try {
        const res = await fetch(`https://rest-testnet.onflow.org/v1/accounts/${addr}`);
        if (res.ok) {
          const json = await res.json();
          balance = Number(json?.account?.balance ?? json?.balance ?? 0) / 1e8;
          addLog(`Fetched balance ${balance} FLOW for ${addr}`);
        } else {
          addLog(`Flow REST responded ${res.status} for ${addr}`);
        }
      } catch (err) {
        addLog(`Failed to fetch Flow account: ${String(err)}`);
      }

    // fetch detailed data from Flowscan (testnet) - collect everything we can
    // Use dev proxy when running locally to avoid CORS blocks; in production this will call the real host
    const flowscanBase = import.meta.env.DEV ? '/flowscan-api/api' : 'https://testnet.flowscan.org/api';
    // Also allow fetching the public account HTML page (flowscan.io) to extract tx links
    const flowscanPageBase = import.meta.env.DEV ? '/flowscan-page' : 'https://testnet.flowscan.io';
    const details: Record<string, unknown> = {};
      const tryFetch = async (path: string, key: string) => {
        try {
          const r = await fetch(`${flowscanBase}${path}`);
          if (r.ok) {
            const j = await r.json();
            details[key] = j;
            addLog(`Flowscan: fetched ${key} (${Object.keys(j).length || 'items'})`);
          } else {
            addLog(`Flowscan ${key} responded ${r.status}`);
          }
        } catch (e) {
          addLog(`Flowscan fetch ${key} failed: ${String(e)}`);
        }
      };

      await tryFetch(`/address/${addr}`, 'account');
      await tryFetch(`/address/${addr}/transactions`, 'transactions');
      await tryFetch(`/address/${addr}/tokens`, 'tokens');
      await tryFetch(`/address/${addr}/nfts`, 'nfts');
      await tryFetch(`/address/${addr}/events`, 'events');

      // Also fetch and parse the Flowscan account HTML page to extract transaction links and other page-only data
      try {
        const pageRes = await fetch(`${flowscanPageBase}/account/${addr}`);
        if (pageRes.ok) {
          const html = await pageRes.text();
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const anchors = Array.from(doc.querySelectorAll('a'))
              .map((a) => a.getAttribute('href') || a.href)
              .filter(Boolean) as string[];
            const txLinks = Array.from(new Set(anchors.filter((h) => /transaction|txn|txs|transactions|tx/.test(h))));

            // extract a structured account summary from the page text using heuristics
            const pageText = doc.body ? doc.body.innerText : html;
            const extractNumber = (label: string) => {
              const re = new RegExp(label + '\\s*([\\d,]+\\.?\\d*)', 'i');
              const m = pageText.match(re);
              if (m && m[1]) return m[1].replace(/,/g, '');
              return null;
            };

            const summary: Record<string, string | null> = {};
            summary.primary = extractNumber('Primary') || extractNumber('Primary\\s*FLOW');
            summary.staked = extractNumber('Staked') || null;
            summary.delegated = extractNumber('Delegated') || null;
            summary.total = extractNumber('Total') || extractNumber('Total\\s*FLOW');
            summary.storage_flow = extractNumber('Storage FLOW') || null;
            // storage size (e.g., "1.43 KB / 9,303.91 GB")
            const storageMatch = pageText.match(/Storage[\s\S]{0,40}?([\d.,]+\s*(KB|MB|GB|B))/i);
            summary.storage_size = storageMatch ? storageMatch[1] : null;

            details.page = { txLinks, html_snippet: html.slice(0, 8000), summary };
            addLog(`Flowscan page parsed: ${txLinks.length} tx links found`);

            // attempt to fetch individual tab pages to extract tables (transactions, scheduled, keys, tokens, ft transfers, nft transfers, collections)
            const tabNames = [
              'transactions',
              'scheduled',
              'keys',
              'tokens',
              'ft-transfers',
              'nft-transfers',
              'collections',
            ];
            const tabs: Record<string, unknown> = {};
            for (const tab of tabNames) {
              try {
                const tabRes = await fetch(`${flowscanPageBase}/account/${addr}?tab=${tab}`);
                if (!tabRes.ok) {
                  addLog(`Flowscan tab ${tab} responded ${tabRes.status}`);
                  tabs[tab] = { error: `status ${tabRes.status}` };
                  continue;
                }
                const tabHtml = await tabRes.text();
                const tabDoc = parser.parseFromString(tabHtml, 'text/html');
                // collect table rows as arrays of cell text and links
                const rows = Array.from(tabDoc.querySelectorAll('table tr'));
                const parsedRows = rows.map((tr) => {
                  const cells = Array.from(tr.querySelectorAll('td')).map((td) => td.innerText.trim());
                  const links = Array.from(tr.querySelectorAll('a')).map((a) => a.getAttribute('href') || a.href);
                  return { cells, links };
                }).filter((r) => r.cells.length > 0);
                tabs[tab] = parsedRows;
                addLog(`Parsed ${parsedRows.length} rows from tab ${tab}`);
              } catch (err) {
                addLog(`Failed to fetch/parse tab ${tab}: ${String(err)}`);
                tabs[tab] = { error: String(err) };
              }
            }
            details.page.tabs = tabs;

          } catch (err) {
            addLog(`Flowscan page parse failed: ${String(err)}`);
            details.page = { error: String(err) };
          }
        } else {
          addLog(`Flowscan page responded ${pageRes.status}`);
        }
      } catch (e) {
        addLog(`Flowscan page fetch failed: ${String(e)}`);
      }

      // Compute token count and metric client-side, then persist snapshot in localStorage per-wallet
      try {
        let tokenCount = 0;
        if (details.tokens && Array.isArray(details.tokens)) tokenCount = details.tokens.length;
        else if (details.nfts && Array.isArray(details.nfts)) tokenCount = details.nfts.length;
        else if (Array.isArray(details.transactions)) tokenCount = details.transactions.length;

        const metricValue = Number(balance || 0) + Number(tokenCount || 0);

        // Only persist if details have changed compared to last snapshot
        try {
          const existing = loadSnapshots(addr);
          const last = existing && existing.length > 0 ? existing[0] : null;
          const lastHash = last ? JSON.stringify(last.details || {}) + '|' + String(last.balance || 0) : null;
          const newHash = JSON.stringify(details || {}) + '|' + String(balance || 0);
          if (!lastHash || newHash !== lastHash) {
            const snapshot = { wallet: addr, balance, tokenCount, metricValue, details, fetched_at: new Date().toISOString() };
            saveSnapshot(addr, snapshot);
            addLog(`Saved snapshot locally (tokens=${tokenCount}, metric=${metricValue})`);
          } else {
            addLog('No changes detected vs last snapshot; skipping save');
          }
        } catch (e) {
          addLog(`Failed to load/save snapshot locally: ${String(e)}`);
        }

        setWalletMetric(metricValue);
      } catch (e) {
        addLog(`Failed to compute/save metric locally: ${String(e)}`);
      }

      // Update local UI (balance)
      setStats((s) => ({ ...s, flowBalance: Number(balance) }));
      setStats((s) => ({ ...s, flowBalance: Number(balance) }));
    } catch (error) {
      console.error('Error extracting/saving wallet data:', error);
    }
  }, [addLog, loadSnapshots, saveSnapshot]);

  useEffect(() => {
    if (!walletAddress) return;

    const runExtraction = async () => {
      await extractAndSaveWalletData(walletAddress);
    };

    // run immediately (silent)
    runExtraction();

    // set interval every 1 minute (user requested)
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      runExtraction();
    }, 60000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [walletAddress, extractAndSaveWalletData]);

  


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-fuchsia-700 text-2xl md:text-3xl">DASHBOARD</h1>
            <div className="flex items-center gap-3">
              <div className="bg-white border-2 border-slate-300 px-4 py-2 pixel-corners">
                <div className="flex items-center gap-2 text-slate-700 text-xs">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-mono">{formatAddr(walletAddress)}</span>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="bg-slate-200 hover:bg-slate-100 text-slate-900 px-3 py-1 text-xs pixel-corners border border-slate-300"
              >
                Disconnect
              </button>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<FileCode className="w-8 h-8" />}
            title="Contracts"
            value={stats.totalContracts}
            subtitle={`${stats.activeContracts} active`}
            color="green"
            onClick={() => onViewDetails('contracts')}
          />
          <StatCard
            icon={<Activity className="w-8 h-8" />}
            title="Transactions"
            value={stats.totalTransactions}
            subtitle="Total processed"
            color="blue"
            onClick={() => onViewDetails('transactions')}
          />
          <StatCard
            icon={<Zap className="w-8 h-8" />}
            title="Events"
            value={stats.totalEvents}
            subtitle="Blockchain events"
            color="yellow"
            onClick={() => onViewDetails('events')}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <StatCard
            icon={<Coins className="w-8 h-8" />}
            title="Collections"
            value={stats.totalCollections}
            subtitle="NFT collections"
            color="purple"
            onClick={() => onViewDetails('collections')}
          />
          <StatCard
            icon={<Wallet className="w-8 h-8" />}
            title="FLOW Balance"
            value={`${stats.flowBalance.toFixed(2)}`}
            subtitle="Native tokens"
            color="cyan"
            onClick={() => onViewDetails('balance')}
          />
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="bg-white border-2 border-slate-300 p-4 pixel-corners inline-block">
            <h3 className="text-fuchsia-700 text-sm">Computed Wallet Metric</h3>
            <div className="text-slate-800 text-2xl font-mono mt-2">{walletMetric !== null ? walletMetric : '—'}</div>
            <p className="text-slate-500 text-xs mt-1">(balance + token count)</p>
          </div>

          <div className="bg-white border-2 border-slate-300 p-4 pixel-corners flex-1">
            <h3 className="text-fuchsia-700 text-sm">Recent Logs</h3>
            <div className="mt-2 text-xs text-slate-500 font-mono max-h-36 overflow-auto">
              {logs.length === 0 ? (
                <div className="text-blue-400">No logs yet</div>
              ) : (
                logs.map((l, idx) => (
                  <div key={idx} className="mb-1">{l}</div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Transaction Volume"
            data={[
              { label: 'Mon', value: 45 },
              { label: 'Tue', value: 67 },
              { label: 'Wed', value: 52 },
              { label: 'Thu', value: 89 },
              { label: 'Fri', value: 78 },
              { label: 'Sat', value: 34 },
              { label: 'Sun', value: 56 }
            ]}
            color="cyan"
          />
          <ChartCard
            title="Contract Deployments"
            data={[
              { label: 'Cadence', value: stats.totalContracts * 0.6 },
              { label: 'EVM', value: stats.totalContracts * 0.4 }
            ]}
            color="green"
          />
        </div>

        <div className="bg-white border-2 border-slate-300 p-6 pixel-corners">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-fuchsia-700 text-xl">Recent Activity</h2>
            <button
              onClick={() => onViewDetails('transactions')}
              className="text-cyan-300 hover:text-cyan-200 flex items-center gap-2 text-xs"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((tx) => (
              <div
                key={tx.id}
                className="bg-blue-900/50 border-2 border-blue-700 p-4 pixel-corners hover:bg-blue-900/70 transition-colors cursor-pointer"
                onClick={() => onViewDetails('transactions')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-300 text-xs font-mono">{tx.tx_hash.slice(0, 16)}...</span>
                  <span className={`text-xs px-2 py-1 pixel-corners ${
                    tx.status === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {tx.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-blue-300">
                  <span>{tx.type}</span>
                  <span>Block #{tx.block_number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
