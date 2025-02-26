import React, { useState, useEffect } from 'react';
import { FiSearch, FiTrash2, FiCalendar, FiChevronLeft, FiChevronRight, FiMinus, FiPlus, FiList } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import AnimatedClock from './AnimateClock'; // Import the same clock component from Dashboard

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [displayTransactions, setDisplayTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'expense', 'income'
  const [darkMode, setDarkMode] = useState(false);
  
  // Filter tanggal
  const [filterType, setFilterType] = useState('month'); // 'month', 'range'
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    // Ambil data dari localStorage
    const savedTransactions = JSON.parse(localStorage.getItem('expense-tracker-transactions') || '[]');
    setTransactions(savedTransactions);
    
    // Load dark mode setting
    const savedDarkMode = localStorage.getItem('expense-tracker-dark-mode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
    
    // Set filter awal
    filterAndPaginateTransactions(savedTransactions);
  }, []);
  
  useEffect(() => {
    filterAndPaginateTransactions(transactions);
  }, [search, filter, filterType, currentMonth, currentYear, dateRange, currentPage, itemsPerPage]);
  
  // Listen for dark mode changes
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
  
  const filterAndPaginateTransactions = (allTransactions) => {
    let filtered = [...allTransactions];
    
    // Filter berdasarkan periode waktu
    if (filterType === 'month') {
      // Filter berdasarkan bulan dan tahun
      filtered = filtered.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
    } else if (filterType === 'range' && dateRange.startDate && dateRange.endDate) {
      // Filter berdasarkan rentang tanggal
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59); // Set ke akhir hari
      
      filtered = filtered.filter(t => {
        const date = new Date(t.date);
        return date >= startDate && date <= endDate;
      });
    }
    
    // Filter berdasarkan tipe transaksi
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter);
    }
    
    // Filter berdasarkan teks pencarian
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Urutkan berdasarkan waktu (terbaru dulu)
    filtered.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
    
    // Hitung total halaman
    const total = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(total);
    
    // Batasi halaman saat ini jika melebihi total halaman
    const validCurrentPage = Math.min(currentPage, total || 1);
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }
    
    // Simpan hasil filter
    setFilteredTransactions(filtered);
    
    // Pagination - ambil hanya yang ditampilkan di halaman saat ini
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayTransactions(filtered.slice(startIndex, endIndex));
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
      filterAndPaginateTransactions(newTransactions);
      
      toast.success('Transaksi berhasil dihapus');
    }
  };
  
  const handleMonthChange = (e) => {
    setCurrentMonth(parseInt(e.target.value));
  };
  
  const handleYearChange = (e) => {
    setCurrentYear(parseInt(e.target.value));
  };
  
  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };
  
  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    setCurrentPage(1); // Reset ke halaman pertama saat ganti filter
  };
  
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset ke halaman pertama
  };
  
  // Navigasi halaman
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Menghasilkan nomor halaman untuk pagination
  const generatePaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Tampilkan semua halaman jika total halaman <= maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Selalu tampilkan halaman pertama
      pages.push(1);
      
      // Hitung awal dan akhir blok tengah
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Penyesuaian jika di awal atau akhir
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      // Tambahkan ellipsis setelah halaman pertama jika perlu
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Tambahkan blok tengah
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Tambahkan ellipsis sebelum halaman terakhir jika perlu
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Selalu tampilkan halaman terakhir
      pages.push(totalPages);
    }
    
    return pages;
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
  
  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* Updated header dengan styling yang sama seperti Dashboard dengan icon di kanan */}
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-4 mb-6 shadow-md transition-colors duration-300`}>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
          <div className="flex items-center space-x-3">
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg transition-colors duration-300`}>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-2 pb-20">
        
        {/* Filter Bar dengan styling yang lebih konsisten dengan Dashboard */}
        <motion.div 
          className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-lg shadow-lg p-6 mb-6 relative overflow-hidden transition-colors duration-300`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className={`absolute top-0 right-0 w-24 h-24 ${darkMode ? 'bg-blue-900 opacity-30' : 'bg-blue-50 opacity-50'} rounded-bl-full -mt-8 -mr-8 transition-colors duration-300`}></div>
          
          <div className="flex justify-between items-start mb-4">
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-600'} flex items-center transition-colors duration-300`}>
              Filter Transaksi
            </h2>
          </div>
          
          <div className="mb-4">
            {/* Tab untuk memilih jenis filter tanggal */}
            <div className={`flex ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b mb-4 transition-colors duration-300`}>
              <button 
                className={`px-4 py-2 ${filterType === 'month' 
                  ? (darkMode ? 'border-b-2 border-blue-500 text-blue-400' : 'border-b-2 border-blue-600 text-blue-600') 
                  : (darkMode ? 'text-gray-300' : 'text-gray-600')} transition-colors duration-300`}
                onClick={() => handleFilterTypeChange('month')}
              >
                Filter Bulanan
              </button>
              <button 
                className={`px-4 py-2 ${filterType === 'range' 
                  ? (darkMode ? 'border-b-2 border-blue-500 text-blue-400' : 'border-b-2 border-blue-600 text-blue-600') 
                  : (darkMode ? 'text-gray-300' : 'text-gray-600')} transition-colors duration-300`}
                onClick={() => handleFilterTypeChange('range')}
              >
                Rentang Tanggal
              </button>
            </div>
            
            {filterType === 'month' ? (
              <div className="flex space-x-2">
                <select 
                  className={`flex-1 p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg transition-colors duration-300`}
                  value={currentMonth}
                  onChange={handleMonthChange}
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                
                <select 
                  className={`w-24 p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg transition-colors duration-300`}
                  value={currentYear}
                  onChange={handleYearChange}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center">
                  <label className={`mr-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>Dari:</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      value={dateRange.startDate}
                      onChange={handleDateRangeChange}
                      className={`p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg pr-8 transition-colors duration-300`}
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <FiCalendar className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`} />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <label className={`mr-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>Sampai:</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="endDate"
                      value={dateRange.endDate}
                      onChange={handleDateRangeChange}
                      className={`p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg pr-8 transition-colors duration-300`}
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <FiCalendar className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Filter Pencarian dan Tipe */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <FiSearch className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`} />
              </span>
              <input
                type="text"
                className={`w-full p-2 pl-8 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'} border rounded-lg transition-colors duration-300`}
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select 
              className={`w-32 p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg transition-colors duration-300`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Semua</option>
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </div>
        </motion.div>
        
        {/* Summary Cards - Sesuaikan dengan style Dashboard yang lebih modern */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div 
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 relative overflow-hidden transition-colors duration-300`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={`absolute top-0 right-0 w-16 h-16 ${darkMode ? 'bg-red-900 opacity-20' : 'bg-red-50 opacity-50'} rounded-bl-full -mt-4 -mr-4 transition-colors duration-300`}></div>
            <h2 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1 flex items-center transition-colors duration-300`}>
              <FiMinus className="mr-2 text-red-600" /> Total Pengeluaran
            </h2>
            <p className="text-xl font-bold text-red-600">Rp {totalExpense.toLocaleString('id-ID')}</p>
          </motion.div>
          <motion.div 
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 relative overflow-hidden transition-colors duration-300`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={`absolute top-0 right-0 w-16 h-16 ${darkMode ? 'bg-green-900 opacity-20' : 'bg-green-50 opacity-50'} rounded-bl-full -mt-4 -mr-4 transition-colors duration-300`}></div>
            <h2 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1 flex items-center transition-colors duration-300`}>
              <FiPlus className="mr-2 text-green-600" /> Total Pemasukan
            </h2>
            <p className="text-xl font-bold text-green-600">Rp {totalIncome.toLocaleString('id-ID')}</p>
          </motion.div>
        </div>
        
        {/* Transactions List - Dengan styling yang konsisten dengan Dashboard */}
        <motion.div 
  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 relative overflow-hidden transition-colors duration-300`}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.3 }}
>
  
  <div className="flex justify-between items-center mb-4">
    <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-600'} flex items-center transition-colors duration-300`}>
      <FiList className="mr-2 text-blue-600" /> Daftar Transaksi
    </h2>
    
    {/* Tampilkan item per halaman */}
    <div className="flex items-center">
      <label className={`text-sm mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Tampilkan:</label>
      <select
        className={`p-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded transition-colors duration-300`}
        value={itemsPerPage}
        onChange={handleItemsPerPageChange}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </div>
  </div>
  
  {filteredTransactions.length > 0 ? (
    <>
      <div className="space-y-4">
        {/* Transaksi dikelompokkan berdasarkan tanggal */}
        {Object.entries(
          displayTransactions.reduce((groups, transaction) => {
            const date = transaction.date;
            if (!groups[date]) {
              groups[date] = [];
            }
            groups[date].push(transaction);
            return groups;
          }, {})
        ).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
          .map(([date, transactionsForDate], groupIndex) => (
            <motion.div 
              key={date} 
              className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border rounded-lg overflow-hidden shadow-sm transition-colors duration-300`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * groupIndex }}
            >
              <div className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-600'} px-4 py-2 font-medium flex items-center transition-colors duration-300`}>
                <FiCalendar className="mr-2" />
                {formatDate(date)}
              </div>
              
              <div className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y transition-colors duration-300`}>
                {transactionsForDate.map((transaction, index) => (
                  <motion.div 
                    key={transaction.timestamp} 
                    className={`px-4 py-3 flex justify-between items-center ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-300`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                  >
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-600'} transition-colors duration-300`}>{transaction.description}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>{transaction.time}</p>
                    </div>
                    <div className="flex items-center">
                      <p className={`font-semibold mr-3 ${
                        transaction.type === 'expense' 
                          ? (darkMode ? 'text-red-400' : 'text-red-600')  
                          : (darkMode ? 'text-green-400' : 'text-green-600')
                      } transition-colors duration-300`}>
                        {transaction.type === 'expense' ? '-' : '+'} Rp {parseFloat(transaction.amount).toLocaleString('id-ID')}
                      </p>
                      <motion.button 
                        className={`${darkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-500 hover:text-red-600'} transition-colors duration-300`}
                        onClick={() => handleDelete(transaction.timestamp)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiTrash2 />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
      </div>
      
      {/* Pagination Controls - Updated style to match theme */}
      <div className="mt-6 flex items-center justify-between">
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
          Menampilkan {Math.min(filteredTransactions.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredTransactions.length, currentPage * itemsPerPage)} dari {filteredTransactions.length} transaksi
        </div>
        
        <div className="flex items-center space-x-1">
          <motion.button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1 
                ? (darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed') 
                : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50')
            } transition-colors duration-300`}
            whileHover={currentPage !== 1 ? { scale: 1.1 } : {}}
            whileTap={currentPage !== 1 ? { scale: 0.9 } : {}}
          >
            <FiChevronLeft size={18} />
          </motion.button>
          
          {generatePaginationNumbers().map((page, index) => (
            <motion.button
              key={index}
              onClick={() => typeof page === 'number' ? goToPage(page) : null}
              className={`px-3 py-1 rounded-md ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? (darkMode ? 'text-gray-400 cursor-default' : 'text-gray-600 cursor-default')
                  : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50')
              } transition-colors duration-300`}
              whileHover={typeof page === 'number' && page !== currentPage ? { scale: 1.1 } : {}}
              whileTap={typeof page === 'number' && page !== currentPage ? { scale: 0.9 } : {}}
            >
              {page}
            </motion.button>
          ))}
          
          <motion.button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md ${
              currentPage === totalPages 
                ? (darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed') 
                : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50')
            } transition-colors duration-300`}
            whileHover={currentPage !== totalPages ? { scale: 1.1 } : {}}
            whileTap={currentPage !== totalPages ? { scale: 0.9 } : {}}
          >
            <FiChevronRight size={18} />
          </motion.button>
        </div>
      </div>
    </>
  ) : (
    <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} py-4 transition-colors duration-300`}>Tidak ada transaksi pada periode ini</p>
  )}
</motion.div>
      </div>
    </>
  );
}

export default Transactions;