// components/TransactionForm.jsx
import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { NumericFormat } from 'react-number-format';

function TransactionForm({ type, onClose, onSubmit, currentBalance }) {
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
      timestamp: now.getTime()
    };
    
    // Update localStorage
    // 1. Update saldo
    const newBalance = type === 'expense' 
      ? currentBalance - parseFloat(amount)
      : currentBalance + parseFloat(amount);
    localStorage.setItem('expense-tracker-balance', newBalance.toString());
    
    // 2. Simpan transaksi
    const transactions = JSON.parse(localStorage.getItem('expense-tracker-transactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('expense-tracker-transactions', JSON.stringify(transactions));
    
    // Log untuk debugging
    console.log('Transaksi disimpan:', transaction);
    
    // Panggil callback
    onSubmit();
  };
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {type === 'expense' ? 'Tambah Pengeluaran' : 'Tambah Pemasukan'}
          </h2>
          <button onClick={onClose} className="text-gray-500">
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Jumlah (Rp)</label>
            <NumericFormat
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
              value={amount}
              onValueChange={handleAmountValueChange}
              className="w-full p-2 border rounded-lg"
              placeholder="Contoh: Rp 50.000"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Deskripsi</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'expense' ? "Contoh: Bensin" : "Contoh: Gajian"}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Tanggal & Waktu</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg bg-gray-100"
              value={`${formattedDate} ${formattedTime}`}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
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