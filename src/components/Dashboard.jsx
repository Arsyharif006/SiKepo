// components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiMinus, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import TransactionForm from './TransactionForm';
import TransactionChart from './TransactionChart';
import AnimatedClock from './AnimateClock';

function Dashboard({ onRefresh }) {
  const [balance, setBalance] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [formType, setFormType] = useState('expense'); // 'expense' atau 'income'
  const [currentTime, setCurrentTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Ambil saldo dari localStorage
    const savedBalance = localStorage.getItem('expense-tracker-balance');
    if (savedBalance) {
      setBalance(parseFloat(savedBalance));
    }

    // Ambil transaksi
    const savedTransactions = localStorage.getItem('expense-tracker-transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    
    // Load dark mode setting
    const savedDarkMode = localStorage.getItem('expense-tracker-dark-mode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }

    // Update jam setiap detik
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);
  
  // Listen for storage events (for dark mode changes)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedDarkMode = localStorage.getItem('expense-tracker-dark-mode');
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddClick = (type) => {
    setFormType(type);
    setShowForm(true);
  };

  const getRecentTransactions = () => {
    // This ensures the newest transactions are at the top
    return transactions
      .sort((a, b) => {
        // Sort by timestamp if available, otherwise use date
        if (a.timestamp && b.timestamp) {
          return b.timestamp - a.timestamp;
        }
        return new Date(b.date) - new Date(a.date);
      })
      .slice(0, 5);
  };

  // Menghitung total pemasukan dan pengeluaran bulan ini
  const getCurrentMonthSummary = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return { income, expense };
  };

  const { income, expense } = getCurrentMonthSummary();

  // Format tanggal untuk header
  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Menghitung perubahan persentase
  const calculatePercentageChange = () => {
    if (income === 0) return 0;
    return ((income - expense) / income * 100).toFixed(1);
  };

  const percentageChange = calculatePercentageChange();
  const isPositive = percentageChange >= 0;

  return (
    <>
      {/* Updated header with dark mode support */}
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-4 mb-6 shadow-md transition-colors duration-300`}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-3">
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg transition-colors duration-300`}>
              <AnimatedClock darkMode={darkMode} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2 pb-20">
        {/* Trading-Style Balance Card with dark mode support */}
        <motion.div
          className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg p-6 mb-6 relative overflow-hidden transition-colors duration-300`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className={`absolute top-0 right-0 w-24 h-24 ${darkMode ? 'bg-blue-900 opacity-30' : 'bg-blue-50 opacity-50'} rounded-bl-full -mt-8 -mr-8 transition-colors duration-300`}></div>

          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2 flex items-center transition-colors duration-300`}>
                <FiDollarSign className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} /> Saldo Saat Ini
              </h2>

              <p className={`text-4xl font-bold ${darkMode ? 'text-blue-400' : 'bg-clip-text text-transparent bg-blue-600'} transition-colors duration-300`}>
                Rp {balance.toLocaleString('id-ID')}
              </p>
            </div>

            <div className={`px-3 py-1 rounded-md flex items-center ${isPositive ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700') : (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700')} transition-colors duration-300`}>
              <span className="text-2xl mr-1">{isPositive ? '↑' : '↓'}</span>
              <span className="font-bold">{Math.abs(percentageChange)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 mb-6">
            <div className={`${darkMode ? 'bg-red-900 bg-opacity-50' : 'bg-red-50'} p-3 rounded-lg flex justify-between items-center transition-colors duration-300`}>
              <div>
                <p className={`text-md md:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Pengeluaran</p>
                <p className={`text-md md:text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'} transition-colors duration-300`}>
                  Rp {expense.toLocaleString('id-ID')}
                </p>
              </div>
              <div className={`${darkMode ? 'text-red-400' : 'text-red-500'} text-xl sm:text-2xl md:text-3xl transition-colors duration-300`}>↓</div>
            </div>
            <div className={`${darkMode ? 'bg-green-900 bg-opacity-50' : 'bg-green-50'} p-3 rounded-lg flex justify-between items-center transition-colors duration-300`}>
              <div>
                <p className={`text-md md:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Pemasukan</p>
                <p className={`text-md md:text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} transition-colors duration-300`}>
                  Rp {income.toLocaleString('id-ID')}
                </p>
              </div>
              <div className={`${darkMode ? 'text-green-400' : 'text-green-500'} text-xl sm:text-2xl md:text-3xl transition-colors duration-300`}>↑</div>
            </div>
          </div>

          <div className="flex space-x-2">
            <motion.button
              className={`flex-1 ${darkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white py-3 px-4 rounded-md flex items-center justify-center shadow-md transition-colors duration-300`}
              onClick={() => handleAddClick('expense')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiMinus className="mr-2" /> Pengeluaran
            </motion.button>
            <motion.button
              className={`flex-1 ${darkMode ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'} text-white py-3 px-4 rounded-md flex items-center justify-center shadow-md transition-colors duration-300`}
              onClick={() => handleAddClick('income')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiPlus className="mr-2" /> Pemasukan
            </motion.button>
          </div>
        </motion.div>

        {/* Transaction Form Modal */}
        {showForm && (
          <TransactionForm
            type={formType}
            onClose={() => setShowForm(false)}
            onSubmit={() => {
              setShowForm(false);
              // Refresh data
              const savedBalance = localStorage.getItem('expense-tracker-balance');
              if (savedBalance) {
                setBalance(parseFloat(savedBalance));
              }

              const savedTransactions = localStorage.getItem('expense-tracker-transactions');
              if (savedTransactions) {
                setTransactions(JSON.parse(savedTransactions));
              }

              toast.success(formType === 'expense' ? 'Pengeluaran berhasil dicatat!' : 'Pemasukan berhasil dicatat!');
            }}
            currentBalance={balance}
            darkMode={darkMode}
          />
        )}

        {/* Chart with dark mode support */}
        <motion.div
          className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-4 mb-6 transition-colors duration-300`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 transition-colors duration-300`}>Pengeluaran Bulanan</h2>
          <TransactionChart transactions={transactions} darkMode={darkMode} />
        </motion.div>

        {/* Recent Transactions with dark mode support */}
        <motion.div
          className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-4 transition-colors duration-300`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 transition-colors duration-300`}>Transaksi Terbaru</h2>
          <div className="space-y-3">
            {getRecentTransactions().length > 0 ? (
              getRecentTransactions().map((transaction, index) => (
                <motion.div
                  key={transaction.timestamp || index}
                  className={`flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b pb-2 transition-colors duration-300`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                      {new Date(transaction.date).toLocaleDateString('id-ID')} {transaction.time}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className={`font-semibold ${transaction.type === 'expense' ? (darkMode ? 'text-red-400' : 'text-red-500') : (darkMode ? 'text-green-400' : 'text-green-500')} transition-colors duration-300`}>
                      {transaction.type === 'expense' ? '-' : '+'} Rp {parseFloat(transaction.amount).toLocaleString('id-ID')}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Belum ada transaksi</p>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Dashboard;