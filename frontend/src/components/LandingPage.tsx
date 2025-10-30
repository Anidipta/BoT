import { Book, Database, TrendingUp, Lock, Wallet, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onConnect: () => void;
}

export default function LandingPage({ onConnect }: LandingPageProps) {
  const features = [
    {
      icon: <Database className="w-8 h-8" />,
      title: 'Blockchain Data',
      description: 'Access complete Flow testnet data including contracts, transactions, and events'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Analytics',
      description: 'Visualize trends with interactive charts and comprehensive metrics'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'EVM + Cadence',
      description: 'Explore both EVM and Cadence smart contracts in one place'
    },
    {
      icon: <Book className="w-8 h-8" />,
      title: 'Token Explorer',
      description: 'Browse NFT collections, tokens, and native FLOW balances'
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* HEADER */}
        <header className="text-center mb-16 pt-12">
          <div className="inline-block bg-cyan-400 text-blue-900 px-8 py-6 mb-6 border-4 border-cyan-50">
            <img 
              src="https://raw.githubusercontent.com/Anidipta/BoT/main/logo.png" 
              alt="Book of Truth Logo" 
              className="w-16 h-16 mb-4 inline-block"
            />
            <h1 className="text-3xl md:text-4xl font-bold">BOOK OF TRUTH</h1>
            <div className="text-xs mt-2 font-mono">Flow Blockchain Explorer</div>
          </div>
          <p className="text-slate-700 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-mono mt-6">
            Complete on-chain data • <span className="neon-text">Real-time analytics</span> • Pixel-perfect insights
          </p>
        </header>

        {/* FEATURES GRID */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="pixel-card border-4 border-cyan-50 hover:border-yellow-400 transition-colors"
              >
                <div className="text-cyan-400 mb-3">{feature.icon}</div>
                <h3 className="neon-text text-sm font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA PANEL */}
        <div className="max-w-2xl mx-auto pixel-card border-4 border-cyan-400">
          <h2 className="neon-text text-lg font-bold mb-6 text-center">QUICKSTART</h2>
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <div className="bg-yellow-400 text-blue-900 w-7 h-7 flex items-center justify-center flex-shrink-0 border-2 border-cyan-50 text-xs font-bold">
                1
              </div>
              <p className="text-slate-700 text-xs leading-relaxed pt-0.5 font-mono">
                Click the Connect Wallet button
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-yellow-400 text-blue-900 w-7 h-7 flex items-center justify-center flex-shrink-0 border-2 border-cyan-50 text-xs font-bold">
                2
              </div>
              <p className="text-slate-700 text-xs leading-relaxed pt-0.5 font-mono">
                Sign with Flow testnet wallet
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-yellow-400 text-blue-900 w-7 h-7 flex items-center justify-center flex-shrink-0 border-2 border-cyan-50 text-xs font-bold">
                3
              </div>
              <p className="text-slate-700 text-xs leading-relaxed pt-0.5 font-mono">
                Explore contracts, tokens, transactions & more
              </p>
            </div>
          </div>

          <button
            onMouseEnter={() => {
              // warm up discovery endpoints to reduce latency when user clicks
              try {
                // preconnect domains
                const preconnect = (href: string) => {
                  const l = document.createElement('link');
                  l.rel = 'preconnect';
                  l.href = href;
                  l.crossOrigin = 'anonymous';
                  document.head.appendChild(l);
                };
                preconnect('https://fcl-discovery.onflow.org');
                preconnect('https://rest-testnet.onflow.org');
                preconnect('https://testnet.flowscan.org');
                // warm fetch (no-cors) to start DNS/TLS handshake
                try { fetch('https://fcl-discovery.onflow.org/testnet/authn', { mode: 'no-cors' }); } catch { /* ignore */ }
              } catch {
                // ignore
              }
            }}
            onClick={onConnect}
            className="w-full pixel-button bg-cyan-400 hover:bg-yellow-400 text-blue-900 py-3 px-6 flex items-center justify-center gap-3 font-bold border-4 border-cyan-50"
          >
            <Wallet className="w-6 h-6" />
            <span>CONNECT WALLET</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* FOOTER */}
        <footer className="text-center mt-16 text-cyan-300 text-xs font-mono">
          <p className="neon-text">BOOK OF TRUTH</p>
          <p className="text-slate-600 mt-2">Flow Testnet Explorer • Powered by FCL & Flowscan</p>
        </footer>
      </div>
    </div>
  );
}
