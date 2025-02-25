// components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Line } from 'recharts';
import TransactionForm from './TransactionForm';
import TransactionChart from './TransactionChart';

function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [formType, setFormType] = useState('expense'); // 'expense' atau 'income'
  
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
  }, []);
  
  const handleAddClick = (type) => {
    setFormType(type);
    setShowForm(true);
  };
  
  const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  return (
    <>
      <div className="bg-white p-4 mb-6 text-center">
        <h1 className="text-2xl font-bold">Pengelolaan Keuangan</h1>
      </div>
    <div className="container mx-auto px-4 py-6 pb-20">
      
      {/* Balance Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-600 mb-2">Saldo Saat Ini</h2>
        <p className="text-3xl font-bold text-blue-600">Rp {balance.toLocaleString('id-ID')}</p>
        
        <div className="flex mt-4 space-x-2">
          <button
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md flex items-center justify-center"
            onClick={() => handleAddClick('expense')}
          >
            <FiMinus className="mr-1" /> Pengeluaran
          </button>
          <button
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md flex items-center justify-center"
            onClick={() => handleAddClick('income')}
          >
            <FiPlus className="mr-1" /> Pemasukan
          </button>
        </div>
      </div>
      
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
        />
      )}
      
      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-600 mb-4">Pengeluaran Bulanan</h2>
        <TransactionChart transactions={transactions} />
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-600 mb-4">Transaksi Terbaru</h2>
        <div className="space-y-3">
          {getRecentTransactions().length > 0 ? (
            getRecentTransactions().map((transaction, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('id-ID')} {transaction.time}
                  </p>
                </div>
                <p className={`font-semibold ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                  {transaction.type === 'expense' ? '-' : '+'} Rp {parseFloat(transaction.amount).toLocaleString('id-ID')}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Belum ada transaksi</p>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default Dashboard;
