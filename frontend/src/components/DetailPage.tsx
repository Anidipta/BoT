import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Search } from 'lucide-react';

interface DetailPageProps {
  category: string;
  onBack: () => void;
}

export default function DetailPage({ category, onBack }: DetailPageProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [category]);

  const loadData = async () => {
    setLoading(true);
    try {
      let query;
      switch (category) {
        case 'contracts':
          query = supabase.from('contracts').select('*').order('deployed_at', { ascending: false });
          break;
        case 'transactions':
          query = supabase.from('transactions').select('*').order('timestamp', { ascending: false });
          break;
        case 'events':
          query = supabase.from('events').select('*').order('timestamp', { ascending: false });
          break;
        case 'collections':
          query = supabase.from('token_collections').select('*').order('created_at', { ascending: false });
          break;
        case 'balance':
          query = supabase.from('native_balances').select('*').order('updated_at', { ascending: false });
          break;
        default:
          query = supabase.from('transactions').select('*').order('timestamp', { ascending: false });
      }
      const { data: result } = await query;
      setData(result || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryTitle = () => {
    const titles: { [key: string]: string } = {
      contracts: 'Smart Contracts',
      transactions: 'Transactions',
      events: 'Blockchain Events',
      collections: 'NFT Collections',
      balance: 'Native Balances'
    };
    return titles[category] || 'Details';
  };

  const renderTableHeaders = () => {
    switch (category) {
      case 'contracts':
        return (
          <>
            <th className="px-4 py-3 text-left text-xs">Name</th>
            <th className="px-4 py-3 text-left text-xs">Address</th>
            <th className="px-4 py-3 text-left text-xs">Type</th>
            <th className="px-4 py-3 text-left text-xs">Transactions</th>
          </>
        );
      case 'transactions':
        return (
          <>
            <th className="px-4 py-3 text-left text-xs">Hash</th>
            <th className="px-4 py-3 text-left text-xs">From</th>
            <th className="px-4 py-3 text-left text-xs">Type</th>
            <th className="px-4 py-3 text-left text-xs">Status</th>
            <th className="px-4 py-3 text-left text-xs">Block</th>
          </>
        );
      case 'events':
        return (
          <>
            <th className="px-4 py-3 text-left text-xs">Event Type</th>
            <th className="px-4 py-3 text-left text-xs">Contract</th>
            <th className="px-4 py-3 text-left text-xs">Timestamp</th>
          </>
        );
      case 'collections':
        return (
          <>
            <th className="px-4 py-3 text-left text-xs">Name</th>
            <th className="px-4 py-3 text-left text-xs">Symbol</th>
            <th className="px-4 py-3 text-left text-xs">Total Supply</th>
            <th className="px-4 py-3 text-left text-xs">Owners</th>
          </>
        );
      case 'balance':
        return (
          <>
            <th className="px-4 py-3 text-left text-xs">Wallet Address</th>
            <th className="px-4 py-3 text-left text-xs">Balance (FLOW)</th>
            <th className="px-4 py-3 text-left text-xs">Last Updated</th>
          </>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (item: any) => {
    switch (category) {
      case 'contracts':
        return (
          <>
            <td className="px-4 py-3 text-xs">{item.name}</td>
            <td className="px-4 py-3 text-xs font-mono">{item.address.slice(0, 12)}...</td>
            <td className="px-4 py-3 text-xs">
              <span className={`px-2 py-1 pixel-corners ${
                item.type === 'cadence' ? 'bg-green-600' : 'bg-blue-600'
              }`}>
                {item.type}
              </span>
            </td>
            <td className="px-4 py-3 text-xs">{item.transaction_count}</td>
          </>
        );
      case 'transactions':
        return (
          <>
            <td className="px-4 py-3 text-xs font-mono">{item.tx_hash.slice(0, 16)}...</td>
            <td className="px-4 py-3 text-xs font-mono">{item.from_address.slice(0, 12)}...</td>
            <td className="px-4 py-3 text-xs">{item.type}</td>
            <td className="px-4 py-3 text-xs">
              <span className={`px-2 py-1 pixel-corners ${
                item.status === 'success' ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {item.status}
              </span>
            </td>
            <td className="px-4 py-3 text-xs">{item.block_number}</td>
          </>
        );
      case 'events':
        return (
          <>
            <td className="px-4 py-3 text-xs">{item.event_type}</td>
            <td className="px-4 py-3 text-xs font-mono">{item.contract_address.slice(0, 12)}...</td>
            <td className="px-4 py-3 text-xs">{new Date(item.timestamp).toLocaleString()}</td>
          </>
        );
      case 'collections':
        return (
          <>
            <td className="px-4 py-3 text-xs">{item.name}</td>
            <td className="px-4 py-3 text-xs font-bold">{item.symbol}</td>
            <td className="px-4 py-3 text-xs">{item.total_supply}</td>
            <td className="px-4 py-3 text-xs">{item.owner_count}</td>
          </>
        );
      case 'balance':
        return (
          <>
            <td className="px-4 py-3 text-xs font-mono">{item.wallet_address.slice(0, 16)}...</td>
            <td className="px-4 py-3 text-xs font-bold">{Number(item.balance).toFixed(2)}</td>
            <td className="px-4 py-3 text-xs">{new Date(item.updated_at).toLocaleString()}</td>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-red-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <button
            onClick={onBack}
            className="bg-orange-800 border-4 border-orange-600 px-4 py-2 text-yellow-400 hover:bg-orange-700 transition-colors pixel-corners flex items-center gap-2 mb-6 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-yellow-400 text-2xl md:text-3xl mb-4">{getCategoryTitle()}</h1>
          <div className="bg-orange-800 border-4 border-orange-600 p-4 pixel-corners">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-300" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-orange-900 border-2 border-orange-700 px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-400 pixel-corners"
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center text-yellow-400 text-xl animate-pulse">Loading...</div>
        ) : (
          <div className="bg-orange-800 border-4 border-orange-600 pixel-corners overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-900 text-yellow-400">
                  <tr>{renderTableHeaders()}</tr>
                </thead>
                <tbody className="text-white">
                  {filteredData.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="border-b-2 border-orange-700 hover:bg-orange-700/50 transition-colors"
                    >
                      {renderTableRow(item)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredData.length === 0 && (
              <div className="text-center py-12 text-orange-300">
                No data found
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-orange-300 text-xs text-center">
          Showing {filteredData.length} of {data.length} records
        </div>
      </div>
    </div>
  );
}
