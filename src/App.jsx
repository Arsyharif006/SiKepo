import React, { useState, useEffect } from 'react';
import { FiHome, FiList, FiPieChart, FiSettings } from 'react-icons/fi';
import Dashboard from './components/Dashboard.jsx';
import Transactions from './components/Transactions.jsx';
import Reports from './components/Reports.jsx';
import Settings from './components/Settings.jsx';
import LoadingAnimation from './components/LoadingAnimation.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [background, setBackground] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Show loading animation
    setIsLoading(true);
    
    // Ambil background dari localStorage
    const savedBackground = localStorage.getItem('expense-tracker-bg');
    if (savedBackground) {
      setBackground(savedBackground);
    }
    
    // Load dark mode setting
    const savedDarkMode = localStorage.getItem('expense-tracker-dark-mode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
    
    // Apply dark mode to root element
    if (savedDarkMode === 'true') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Simulate data loading with a timeout
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading animation
    
    return () => clearTimeout(loadingTimer);
  }, []);
  
  // Listen for storage events (for dark mode changes)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDarkMode = localStorage.getItem('expense-tracker-dark-mode');
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode === 'true');
      }
      
      const savedBackground = localStorage.getItem('expense-tracker-bg');
      setBackground(savedBackground || '');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Cek localStorage saat pertama kali load
  useEffect(() => {
    // Inisialisasi localStorage jika belum ada
    if (!localStorage.getItem('expense-tracker-balance')) {
      localStorage.setItem('expense-tracker-balance', '0');
    }
    
    if (!localStorage.getItem('expense-tracker-transactions')) {
      localStorage.setItem('expense-tracker-transactions', JSON.stringify([]));
    }

    // Cek dan hapus data yang lebih dari 1 tahun
    const clearOldData = () => {
      const transactions = JSON.parse(localStorage.getItem('expense-tracker-transactions') || '[]');
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const filteredTransactions = transactions.filter(t => new Date(t.date) > oneYearAgo);
      localStorage.setItem('expense-tracker-transactions', JSON.stringify(filteredTransactions));
    };
    
    clearOldData();
    
    // Set interval untuk menjalankan clearOldData setiap bulan
    const intervalId = setInterval(clearOldData, 30 * 24 * 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Function to handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  // Render tab yang aktif
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onRefresh={handleRefresh} />;
      case 'transactions':
        return <Transactions onRefresh={handleRefresh} />;
      case 'reports':
        return <Reports onRefresh={handleRefresh} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onRefresh={handleRefresh} />;
    }
  };

  // Function to get button class based on active state
  const getButtonClass = (tabName) => {
    const baseClass = "bottom-bar-item flex flex-col items-center justify-center transition-colors duration-200";
    
    if (activeTab === tabName) {
      return darkMode 
        ? `${baseClass} dark-active` // Use the custom dark-active class for dark mode
        : `${baseClass} active`;     // Use the standard active class for light mode
    }
    
    return baseClass;
  };

  return (
    <div 
      className={`h-full min-h-screen pb-16 ${darkMode ? 'dark' : ''}`}
      style={{
        background: background ? `url(${background})` : (darkMode ? '#1f2937' : 'white'),
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <LoadingAnimation isLoading={isLoading} />
      
      {!isLoading && renderActiveTab()}
      
      <div className="bottom-bar grid grid-cols-4 h-16 fixed bottom-0 left-0 right-0 shadow-lg border-t">
        <button 
          className={getButtonClass('dashboard')}
          onClick={() => setActiveTab('dashboard')}
        >
          <FiHome size={24} />
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        <button 
          className={getButtonClass('transactions')}
          onClick={() => setActiveTab('transactions')}
        >
          <FiList size={24} />
          <span className="text-xs mt-1">Transaksi</span>
        </button>
        <button 
          className={getButtonClass('reports')}
          onClick={() => setActiveTab('reports')}
        >
          <FiPieChart size={24} />
          <span className="text-xs mt-1">Laporan</span>
        </button>
        <button 
          className={getButtonClass('settings')}
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings size={24} />
          <span className="text-xs mt-1">Pengaturan</span>
        </button>
      </div>
    </div>
  );
}

export default App;