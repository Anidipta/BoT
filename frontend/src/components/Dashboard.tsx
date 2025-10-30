import { useEffect, useState, useRef } from 'react';
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

  const addLog = (message: string) => {
    const ts = new Date().toISOString();
    setLogs((l) => [
      `${ts} - ${message}`,
      ...l.slice(0, 49) // keep last 50
    ]);
    console.debug(message);
  };

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
  }, [walletAddress]);

  // Extract data from Flow REST, upsert wallet and balances, compute a simple metric and save it
  const extractAndSaveWalletData = async (addr: string) => {
    try {
      // Use backend API to upsert and compute metrics so service-role keys are kept server-side
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
      const flowscanBase = 'https://testnet.flowscan.org/api';
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

      // Common endpoints to try — Flowscan uses several paths; tolerate failures
      await tryFetch(`/address/${addr}`, 'account');
      await tryFetch(`/address/${addr}/transactions`, 'transactions');
      await tryFetch(`/address/${addr}/tokens`, 'tokens');
      await tryFetch(`/address/${addr}/nfts`, 'nfts');
      await tryFetch(`/address/${addr}/events`, 'events');

      // Compute token count and metric client-side, then persist snapshot in localStorage
      try {
        let tokenCount = 0;
        if (details.tokens && Array.isArray(details.tokens)) tokenCount = details.tokens.length;
        else if (details.nfts && Array.isArray(details.nfts)) tokenCount = details.nfts.length;
        else if (Array.isArray(details.transactions)) tokenCount = details.transactions.length;

        const metricValue = Number(balance || 0) + Number(tokenCount || 0);

        // save snapshot locally (frontend-only per user request)
        try {
          const key = 'flowscan_snapshots_v1';
          const raw = localStorage.getItem(key);
          const arr = raw ? JSON.parse(raw) : [];
          arr.unshift({ wallet: addr, balance, tokenCount, metricValue, details, fetched_at: new Date().toISOString() });
          // keep only recent 500 snapshots to avoid unbounded growth
          const trimmed = arr.slice(0, 500);
          localStorage.setItem(key, JSON.stringify(trimmed));
          addLog(`Saved snapshot locally (tokens=${tokenCount}, metric=${metricValue})`);
        } catch (e) {
          addLog(`Failed to save snapshot locally: ${String(e)}`);
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
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-yellow-400 text-2xl md:text-3xl">DASHBOARD</h1>
            <div className="flex items-center gap-3">
              <div className="bg-blue-800 border-4 border-blue-600 px-4 py-2 pixel-corners">
                <div className="flex items-center gap-2 text-cyan-300 text-xs">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-mono">{formatAddr(walletAddress)}</span>
                </div>
              </div>
              <button
                onClick={() => fcl.unauthenticate()}
                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 text-xs pixel-corners"
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
          <div className="bg-blue-800 border-4 border-blue-600 p-4 pixel-corners inline-block">
            <h3 className="text-yellow-400 text-sm">Computed Wallet Metric</h3>
            <div className="text-cyan-200 text-2xl font-mono mt-2">{walletMetric !== null ? walletMetric : '—'}</div>
            <p className="text-blue-300 text-xs mt-1">(balance + token count)</p>
          </div>

          <div className="bg-blue-800 border-4 border-blue-600 p-4 pixel-corners flex-1">
            <h3 className="text-yellow-400 text-sm">Recent Logs</h3>
            <div className="mt-2 text-xs text-blue-300 font-mono max-h-36 overflow-auto">
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

        <div className="bg-blue-800 border-4 border-blue-600 p-6 pixel-corners">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-yellow-400 text-xl">Recent Activity</h2>
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
