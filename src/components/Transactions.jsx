// components/Transactions.jsx
import React, { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiTrash2, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [displayTransactions, setDisplayTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'expense', 'income'
  
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
    
    // Set filter awal
    filterAndPaginateTransactions(savedTransactions);
  }, []);
  
  useEffect(() => {
    filterAndPaginateTransactions(transactions);
  }, [search, filter, filterType, currentMonth, currentYear, dateRange, currentPage, itemsPerPage]);
  
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
      <div className="bg-white p-4 mb-6 text-center">
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
      </div>
      <div className="container mx-auto px-4 py-6 pb-20">
        
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="mb-4">
            {/* Tab untuk memilih jenis filter tanggal */}
            <div className="flex border-b mb-4">
              <button 
                className={`px-4 py-2 ${filterType === 'month' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => handleFilterTypeChange('month')}
              >
                Filter Bulanan
              </button>
              <button 
                className={`px-4 py-2 ${filterType === 'range' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => handleFilterTypeChange('range')}
              >
                Rentang Tanggal
              </button>
            </div>
            
            {filterType === 'month' ? (
              <div className="flex space-x-2">
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
            ) : (
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center">
                  <label className="mr-2 text-sm">Dari:</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      value={dateRange.startDate}
                      onChange={handleDateRangeChange}
                      className="p-2 border rounded-lg pr-8"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <FiCalendar className="text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <label className="mr-2 text-sm">Sampai:</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="endDate"
                      value={dateRange.endDate}
                      onChange={handleDateRangeChange}
                      className="p-2 border rounded-lg pr-8"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <FiCalendar className="text-gray-500" />
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-600">Daftar Transaksi</h2>
            
            {/* Tampilkan item per halaman */}
            <div className="flex items-center">
              <label className="text-sm mr-2">Tampilkan:</label>
              <select
                className="p-1 border rounded"
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
                  .map(([date, transactionsForDate]) => (
                    <div key={date} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 font-medium">
                        {formatDate(date)}
                      </div>
                      
                      <div className="divide-y">
                        {transactionsForDate.map((transaction) => (
                          <div 
                            key={transaction.timestamp} 
                            className="px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-gray-500">{transaction.time}</p>
                            </div>
                            <div className="flex items-center">
                              <p className={`font-semibold mr-3 ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
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
                    </div>
                  ))}
              </div>
              
              {/* Pagination Controls */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan {Math.min(filteredTransactions.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredTransactions.length, currentPage * itemsPerPage)} dari {filteredTransactions.length} transaksi
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <FiChevronLeft size={18} />
                  </button>
                  
                  {generatePaginationNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? goToPage(page) : null}
                      className={`px-3 py-1 rounded-md ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : page === '...'
                          ? 'text-gray-600 cursor-default'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <FiChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-4">Tidak ada transaksi pada periode ini</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Transactions;