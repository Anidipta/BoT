import { useEffect, useState, useRef, useCallback } from 'react';
import * as fcl from '@onflow/fcl';
import { Activity, FileCode, Coins, Zap, ArrowRight, Wallet } from 'lucide-react';
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
      addLog(`Starting data extraction for ${addr}`);

      // Try to scrape from backend first (if available)
      let scrapedData = null;
      try {
        const scrapeRes = await fetch(`http://localhost:8787/api/scrape/${addr}`);
        if (scrapeRes.ok) {
          scrapedData = await scrapeRes.json();
          addLog(`Scraped account data from Flowscan: ${scrapedData.transactions?.length || 0} transactions`);
        } else {
          addLog(`Backend scraper unavailable (${scrapeRes.status}), falling back to Flow REST`);
        }
      } catch (err) {
        addLog(`Backend scraper not available: ${String(err).slice(0, 50)}`);
      }

      // Fetch balance from Flow REST
      let balance = 0;
      try {
        const res = await fetch(`https://rest-testnet.onflow.org/v1/accounts/${addr}`);
        if (res.ok) {
          const json = await res.json();
          balance = Number(json?.account?.balance ?? json?.balance ?? 0) / 1e8;
          addLog(`Flow balance: ${balance.toFixed(2)} FLOW`);
        } else {
          addLog(`Flow REST responded ${res.status}`);
        }
      } catch (err) {
        addLog(`Failed to fetch Flow balance: ${String(err).slice(0, 50)}`);
      }

      // Collect data
      const details: Record<string, unknown> = {
        balance,
        fetched_at: new Date().toISOString(),
        account: null,
        flowscanData: scrapedData
      };

      // Compute token count and metric
      let tokenCount = 0;
      try {
        // Fetch account data which includes contract info
        const accountRes = await fetch(`https://rest-testnet.onflow.org/v1/accounts/${addr}`);
        if (accountRes.ok) {
          const accountData = await accountRes.json();
          details.account = accountData;
          
          // Count contracts deployed
          if (accountData.account?.contracts) {
            tokenCount = Object.keys(accountData.account.contracts).length;
            addLog(`Found ${tokenCount} contracts deployed`);
          }
        }
      } catch (err) {
        addLog(`Failed to fetch account details: ${String(err).slice(0, 50)}`);
      }

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
          addLog(`Snapshot saved (balance=${balance.toFixed(2)}, contracts=${tokenCount})`);
        } else {
          addLog('No changes detected');
        }
      } catch (e) {
        addLog(`Failed to save snapshot: ${String(e).slice(0, 50)}`);
      }

      setWalletMetric(metricValue);
      setStats((s) => ({ ...s, flowBalance: Number(balance), totalContracts: tokenCount }));
    } catch (error) {
      console.error('Extraction error:', error);
      addLog(`Error: ${String(error).slice(0, 50)}`);
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
    <div className="min-h-screen bg-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* HEADER: Wallet Info + Disconnect */}
        <header className="mb-8 border-4 border-cyan-50 bg-blue-100 p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2">WALLET</h1>
              <div className="text-slate-700 font-mono text-sm">
                Chain: <span className="neon-text-lime">Flow Testnet</span>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-blue-200 border-2 border-cyan-50 px-4 py-3">
                <div className="text-cyan-300 text-xs font-bold mb-1">ADDRESS</div>
                <div className="text-slate-700 text-xs font-mono neon-text">{formatAddr(walletAddress)}</div>
              </div>
              <button
                onClick={handleDisconnect}
                className="pixel-button bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 border-2 border-red-800"
              >
                Disconnect
              </button>
            </div>
          </div>
        </header>

        {/* MAIN STATS GRID */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="pixel-card">
            <div className="flex items-center justify-between mb-2">
              <FileCode className="w-8 h-8 text-cyan-400" />
              <div className="text-right">
                <div className="text-yellow-400 text-2xl font-bold">{stats.totalContracts}</div>
                <div className="text-cyan-300 text-xs">contracts</div>
              </div>
            </div>
            <button onClick={() => onViewDetails('contracts')} className="text-yellow-400 text-xs hover:text-yellow-300">view →</button>
          </div>

          <div className="pixel-card">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-yellow-400" />
              <div className="text-right">
                <div className="text-cyan-400 text-2xl font-bold">{stats.totalTransactions}</div>
                <div className="text-cyan-300 text-xs">transactions</div>
              </div>
            </div>
            <button onClick={() => onViewDetails('transactions')} className="text-cyan-400 text-xs hover:text-cyan-300">view →</button>
          </div>

          <div className="pixel-card">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-fuchsia-400" />
              <div className="text-right">
                <div className="text-fuchsia-400 text-2xl font-bold">{stats.totalEvents}</div>
                <div className="text-cyan-300 text-xs">events</div>
              </div>
            </div>
            <button onClick={() => onViewDetails('events')} className="text-fuchsia-400 text-xs hover:text-fuchsia-300">view →</button>
          </div>
        </div>

        {/* SECONDARY STATS GRID */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="pixel-card">
            <div className="flex items-center justify-between mb-2">
              <Coins className="w-8 h-8 text-yellow-400" />
              <div className="text-right">
                <div className="text-yellow-400 text-2xl font-bold">{stats.totalCollections}</div>
                <div className="text-cyan-300 text-xs">collections</div>
              </div>
            </div>
            <button onClick={() => onViewDetails('collections')} className="text-yellow-400 text-xs hover:text-yellow-300">view →</button>
          </div>

          <div className="pixel-card stat-highlight">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-8 h-8 text-cyan-400" />
              <div className="text-right">
                <div className="neon-text text-2xl font-bold">{stats.flowBalance.toFixed(2)}</div>
                <div className="text-cyan-300 text-xs">FLOW tokens</div>
              </div>
            </div>
            <button onClick={() => onViewDetails('balance')} className="text-cyan-400 text-xs hover:text-cyan-300">view →</button>
          </div>
        </div>

        {/* METRIC + LOGS PANEL */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Wallet Metric Card */}
          <div className="pixel-card border-4 border-cyan-400">
            <h3 className="neon-text text-xs font-bold mb-3">WALLET METRIC</h3>
            <div className="neon-text-lime text-4xl font-mono font-bold mb-1">
              {walletMetric !== null ? walletMetric.toFixed(0) : '—'}
            </div>
            <div className="text-cyan-300 text-xs">(balance + token count)</div>
          </div>

          {/* Recent Logs Panel */}
          <div className="pixel-card md:col-span-2">
            <h3 className="neon-text text-xs font-bold mb-3">RECENT LOGS</h3>
            <div className="bg-blue-50 border-2 border-cyan-50 p-2 max-h-24 overflow-auto text-xs font-mono text-cyan-300">
              {logs.length === 0 ? (
                <div className="text-slate-500">&gt; awaiting activity...</div>
              ) : (
                logs.map((l, idx) => (
                  <div key={idx} className="mb-0.5 text-cyan-400">
                    <span className="text-yellow-400">&gt;</span> {l}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
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
            type="radar"
          />
          <ChartCard
            title="Contract Deployments"
            data={[
              { label: 'Cadence', value: stats.totalContracts * 0.6, value2: stats.totalContracts * 0.4 },
              { label: 'EVM', value: stats.totalContracts * 0.4, value2: stats.totalContracts * 0.3 }
            ]}
            color="yellow"
            type="stacked"
          />
        </div>

        {/* RECENT ACTIVITY SECTION */}
        <div className="pixel-card border-4 border-cyan-400">
          <div className="flex items-center justify-between mb-6">
            <h2 className="neon-text text-xl font-bold">RECENT ACTIVITY</h2>
            <button
              onClick={() => onViewDetails('transactions')}
              className="neon-text text-xs hover:text-cyan-300 flex items-center gap-2"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            &gt; Connect wallet to see activity
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-cyan-300 text-xs font-mono">
          <div>Polling every 60 seconds • <span className="neon-text-lime">✓ Flow REST Online</span></div>
        </div>
      </div>
    </div>
  );
}
