import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { NumericFormat } from 'react-number-format';

function TransactionForm({ type, onClose, onSubmit, currentBalance, darkMode }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [formattedDate, setFormattedDate] = useState('');
  const [formattedTime, setFormattedTime] = useState('');
  
  // Inisialisasi tanggal dan waktu saat komponen dimuat
  useEffect(() => {
    updateDateTime();
  }, []);
  
  // Fungsi untuk memperbarui tanggal dan waktu
  const updateDateTime = () => {
    const now = new Date();
    
    // Format untuk tampilan di form
    const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    setFormattedDate(now.toLocaleDateString('id-ID', dateOptions));
    setFormattedTime(now.toTimeString().split(' ')[0].substring(0, 5));
  };
  
  // Handler untuk NumericFormat
  const handleAmountValueChange = (values) => {
    // values.floatValue berisi nilai numerik tanpa formatting
    setAmount(values.floatValue || '');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error('Silakan masukkan jumlah yang valid');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Deskripsi tidak boleh kosong');
      return;
    }
    
    // Jika pengeluaran, pastikan tidak melebihi saldo
    if (type === 'expense' && parseFloat(amount) > currentBalance) {
      toast.error('Pengeluaran tidak boleh melebihi saldo saat ini');
      return;
    }
    
    // Siapkan data transaksi dengan tanggal yang benar
    const now = new Date();
    
    // Format tanggal YYYY-MM-DD menggunakan tanggal lokal yang benar
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    // Format waktu HH:MM
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    const transaction = {
      type,
      amount: parseFloat(amount),
      description,
      date: currentDate,
      time: currentTime,
      timestamp: now.getTime() // Add timestamp for better sorting
    };
    
    // Update localStorage
    // 1. Update saldo
    const newBalance = type === 'expense' 
      ? currentBalance - parseFloat(amount)
      : currentBalance + parseFloat(amount);
    localStorage.setItem('expense-tracker-balance', newBalance.toString());
    
    // 2. Simpan transaksi - changed to prepend new transaction
    const transactions = JSON.parse(localStorage.getItem('expense-tracker-transactions') || '[]');
    // Add new transaction at the beginning to ensure newest appears first
    transactions.unshift(transaction);
    localStorage.setItem('expense-tracker-transactions', JSON.stringify(transactions));
    
    // Log untuk debugging
    console.log('Transaksi disimpan:', transaction);
    
    // Panggil callback
    onSubmit();
  };
  
  return (
    <div className={`fixed inset-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} bg-opacity-75 flex items-center justify-center z-50`}>
      <div className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg w-full max-w-md mx-4 shadow-lg`}>
        <div className={`flex justify-between items-center p-4 ${darkMode ? 'border-b border-gray-700' : 'border-b'}`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {type === 'expense' ? 'Tambah Pengeluaran' : 'Tambah Pemasukan'}
          </h2>
          <button onClick={onClose} className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className={`block mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Jumlah (Rp)</label>
            <NumericFormat
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
              value={amount}
              onValueChange={handleAmountValueChange}
              className={`w-full p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Contoh: Rp 50.000"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className={`block mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Deskripsi</label>
            <textarea
              type="text"
              className={`w-full p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'expense' ? "Contoh: Beli Bensin" : "Contoh: Gajian Nih"}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className={`block mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tanggal & Waktu</label>
            <input
              type="text"
              className={`w-full p-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-600 border-gray-700 text-gray-300' 
                  : 'bg-gray-100 border-gray-300 text-gray-700'
              }`}
              value={`${formattedDate} ${formattedTime}`}
              disabled
            />
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tanggal dan waktu saat ini: {formattedDate} {formattedTime}
            </p>
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
              type === 'expense' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;