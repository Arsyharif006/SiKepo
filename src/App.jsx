

// App.jsx
import React, { useState, useEffect } from 'react';
import { FiHome, FiList, FiPieChart, FiSettings } from 'react-icons/fi';
import Dashboard from './components/Dashboard.jsx';
import Transactions from './components/Transactions.jsx';
import Reports from './components/Reports.jsx';
import Settings from './components/Settings.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [background, setBackground] = useState('');

  useEffect(() => {
    // Ambil background dari localStorage
    const savedBackground = localStorage.getItem('expense-tracker-bg');
    if (savedBackground) {
      setBackground(savedBackground);
    }
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

  // Render tab yang aktif
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div 
    className="h-full pb-16"
    style={{
      background: background ? `url(${background}) center/cover no-repeat` : 'white'
    }}
  >
    {renderActiveTab()}
    
    <div className="bottom-bar grid grid-cols-4 h-16">
      <button 
        className={`bottom-bar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <FiHome size={24} />
        <span className="text-xs mt-1">Dashboard</span>
      </button>
      <button 
        className={`bottom-bar-item ${activeTab === 'transactions' ? 'active' : ''}`}
        onClick={() => setActiveTab('transactions')}
      >
        <FiList size={24} />
        <span className="text-xs mt-1">Transaksi</span>
      </button>
      <button 
        className={`bottom-bar-item ${activeTab === 'reports' ? 'active' : ''}`}
        onClick={() => setActiveTab('reports')}
      >
        <FiPieChart size={24} />
        <span className="text-xs mt-1">Laporan</span>
      </button>
      <button 
        className={`bottom-bar-item ${activeTab === 'settings' ? 'active' : ''}`}
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

