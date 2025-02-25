// components/Transactions.jsx
import React, { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'expense', 'income'
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    // Ambil data dari localStorage
    const savedTransactions = JSON.parse(localStorage.getItem('expense-tracker-transactions') || '[]');
    setTransactions(savedTransactions);
    
    // Set filter awal
    filterTransactions(savedTransactions, search, filter, currentMonth, currentYear);
  }, []);
  
  useEffect(() => {
    filterTransactions(transactions, search, filter, currentMonth, currentYear);
  }, [search, filter, currentMonth, currentYear]);
  
  const filterTransactions = (transactions, searchText, filterType, month, year) => {
    let filtered = [...transactions];
    
    // Filter berdasarkan bulan dan tahun
    filtered = filtered.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
    
    // Filter berdasarkan tipe
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    // Filter berdasarkan teks pencarian
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Urutkan berdasarkan waktu (terbaru dulu)
    filtered.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
    
    setFilteredTransactions(filtered);
  };
  
  const handleDelete = (timestamp) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      const transaction = transactions.find(t => t.timestamp === timestamp);
      const newTransactions = transactions.filter(t => t.timestamp !== timestamp);
      
      // Update saldo
      const currentBalance = parseFloat(localStorage.getItem('expense-tracker-balance') || '0');
      let newBalance;
      
      if (transaction.type === 'expense') {
        newBalance = currentBalance + transaction.amount; // Kembalikan uang yang dikeluarkan
      } else {
        newBalance = currentBalance - transaction.amount; // Kurangi uang yang diterima
      }
      
      localStorage.setItem('expense-tracker-balance', newBalance.toString());
      localStorage.setItem('expense-tracker-transactions', JSON.stringify(newTransactions));
      
      setTransactions(newTransactions);
      filterTransactions(newTransactions, search, filter, currentMonth, currentYear);
      
      toast.success('Transaksi berhasil dihapus');
    }
  };
  
  const handleMonthChange = (e) => {
    setCurrentMonth(parseInt(e.target.value));
  };
  
  const handleYearChange = (e) => {
    setCurrentYear(parseInt(e.target.value));
  };
  
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  // Menghitung total untuk pengeluaran dan pemasukan
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6 text-center">Riwayat Transaksi</h1>
      
      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex space-x-2 mb-4">
          <select 
            className="flex-1 p-2 border rounded-lg"
            value={currentMonth}
            onChange={handleMonthChange}
          >
            {monthNames.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          
          <select 
            className="w-24 p-2 border rounded-lg"
            value={currentYear}
            onChange={handleYearChange}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
              <FiSearch className="text-gray-500" />
            </span>
            <input
              type="text"
              className="w-full p-2 pl-8 border rounded-lg"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="w-32 p-2 border rounded-lg"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Semua</option>
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-sm font-semibold text-gray-600 mb-1">Total Pengeluaran</h2>
          <p className="text-xl font-bold text-red-500">Rp {totalExpense.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-sm font-semibold text-gray-600 mb-1">Total Pemasukan</h2>
          <p className="text-xl font-bold text-green-500">Rp {totalIncome.toLocaleString('id-ID')}</p>
        </div>
      </div>
      
      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-600 mb-4">Daftar Transaksi</h2>
        
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.timestamp} className="flex justify-between items-start border-b pb-3">
                <div className="flex-1">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('id-ID')} {transaction.time}
                  </p>
                </div>
                <div className="flex items-center">
                  <p className={`font-semibold mr-2 ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                    {transaction.type === 'expense' ? '-' : '+'} Rp {parseFloat(transaction.amount).toLocaleString('id-ID')}
                  </p>
                  <button 
                    className="text-gray-500 hover:text-red-500"
                    onClick={() => handleDelete(transaction.timestamp)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">Tidak ada transaksi pada periode ini</p>
        )}
      </div>
    </div>
  );
}

export default Transactions;