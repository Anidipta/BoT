import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import DetailPage from './components/DetailPage';
import './lib/flow';
import * as fcl from '@onflow/fcl';

type Page = 'landing' | 'dashboard' | 'detail';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [walletAddress, setWalletAddress] = useState('');
  const [detailCategory, setDetailCategory] = useState('');

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unsubscribe = fcl.currentUser().subscribe((user: any) => {
      if (user && user.addr) {
        setWalletAddress(user.addr);
        setCurrentPage('dashboard');
      } else {
        setWalletAddress('');
        setCurrentPage('landing');
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleConnect = () => {
    // trigger Flow wallet authentication (testnet configured in lib/flow)
    fcl.authenticate();
  };

  const handleViewDetails = (category: string) => {
    setDetailCategory(category);
    setCurrentPage('detail');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  return (
    <>
      {currentPage === 'landing' && <LandingPage onConnect={handleConnect} />}
      {currentPage === 'dashboard' && (
        <Dashboard walletAddress={walletAddress} onViewDetails={handleViewDetails} />
      )}
      {currentPage === 'detail' && (
        <DetailPage category={detailCategory} onBack={handleBackToDashboard} />
      )}
    </>
  );
}

export default App;
