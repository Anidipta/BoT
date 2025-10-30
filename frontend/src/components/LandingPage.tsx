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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-16 pt-12">
          <div className="inline-block bg-yellow-400 text-green-900 px-8 py-4 mb-6 pixel-corners">
            <Book className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl md:text-4xl mb-2">BOOK OF TRUTH</h1>
          </div>
          <p className="text-green-200 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            The Ultimate Flow Blockchain Explorer
          </p>
        </header>

        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-green-800/50 border-4 border-green-600 p-6 hover:bg-green-700/50 transition-colors pixel-corners"
              >
                <div className="text-yellow-400 mb-4">{feature.icon}</div>
                <h3 className="text-yellow-400 text-lg mb-3">{feature.title}</h3>
                <p className="text-green-200 text-xs leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-green-800 border-4 border-green-600 p-8 pixel-corners">
          <h2 className="text-yellow-400 text-xl mb-6 text-center">How to Access</h2>
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-400 text-green-900 w-8 h-8 flex items-center justify-center flex-shrink-0 pixel-corners text-sm font-bold">
                1
              </div>
              <p className="text-green-200 text-xs leading-relaxed pt-1">
                Click the Connect Wallet button below
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-yellow-400 text-green-900 w-8 h-8 flex items-center justify-center flex-shrink-0 pixel-corners text-sm font-bold">
                2
              </div>
              <p className="text-green-200 text-xs leading-relaxed pt-1">
                Access the dashboard with real-time analytics
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-yellow-400 text-green-900 w-8 h-8 flex items-center justify-center flex-shrink-0 pixel-corners text-sm font-bold">
                3
              </div>
              <p className="text-green-200 text-xs leading-relaxed pt-1">
                Explore contracts, transactions, tokens, and more
              </p>
            </div>
          </div>

          <button
            onClick={onConnect}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-green-900 py-4 px-6 flex items-center justify-center gap-3 transition-colors pixel-corners text-sm font-bold"
          >
            <Wallet className="w-6 h-6" />
            <span>CONNECT WALLET</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <footer className="text-center mt-16 text-green-400 text-xs">
          <p>Book of Truth - Flow Blockchain Explorer</p>
          <p className="mt-2">Powered by Cadence & EVM</p>
        </footer>
      </div>
    </div>
  );
}
