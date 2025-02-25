

// components/Settings.jsx
import React, { useState, useEffect } from 'react';
import { FiSave, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

function Settings() {
const [balance, setBalance] = useState(0);

useEffect(() => {
// Ambil saldo dari localStorage
const savedBalance = localStorage.getItem('expense-tracker-balance');
if (savedBalance) {
setBalance(parseFloat(savedBalance));
}
}, []);

const handleBalanceChange = (e) => {
setBalance(e.target.value);
};

const updateBalance = () => {
if (isNaN(balance) || balance < 0) {
toast.error('Masukkan saldo yang valid');
return;
}

localStorage.setItem('expense-tracker-balance', balance.toString());
toast.success('Saldo berhasil diperbarui');
};

const clearAllData = () => {
if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
localStorage.setItem('expense-tracker-balance', '0');
localStorage.setItem('expense-tracker-transactions', JSON.stringify([]));
setBalance(0);
toast.success('Semua data berhasil dihapus');
}
};

const exportAllData = () => {
const transactions = JSON.parse(localStorage.getItem('expense-tracker-transactions') || '[]');

if (transactions.length === 0) {
toast.error('Tidak ada transaksi untuk diekspor');
return;
}

// Ekspor data sebagai JSON
const dataStr = JSON.stringify({
balance: parseFloat(localStorage.getItem('expense-tracker-balance') || '0'),
transactions: transactions
}, null, 2);

const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
const exportFileDefaultName = `expense-tracker-data-${new Date().toISOString().split('T')[0]}.json`;

const linkElement = document.createElement('a');
linkElement.setAttribute('href', dataUri);
linkElement.setAttribute('download', exportFileDefaultName);
linkElement.click();

toast.success('Data berhasil diekspor');
};

return (
<div className="container mx-auto px-4 py-6 pb-20">
<h1 className="text-2xl font-bold mb-6 text-center">Pengaturan</h1>

{/* Saldo Settings */}
<div className="bg-white rounded-lg shadow-md p-4 mb-4">
<h2 className="text-lg font-semibold text-gray-600 mb-4">Atur Saldo</h2>

<div className="mb-4">
  <label className="block text-gray-700 mb-2">Saldo Saat Ini (Rp)</label>
  <div className="flex space-x-2">
    <input
      type="number"
      className="flex-1 p-2 border rounded-lg"
      value={balance}
      onChange={handleBalanceChange}
      placeholder="Contoh: 500000"
    />
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
      onClick={updateBalance}
    >
      <FiSave className="mr-1" /> Simpan
    </button>
  </div>
  <p className="text-xs text-gray-500 mt-1">
    Catatan: Mengubah saldo secara manual tidak akan mempengaruhi riwayat transaksi
  </p>
</div>
</div>

{/* Data Management */}
<div className="bg-white rounded-lg shadow-md p-4 mb-4">
<h2 className="text-lg font-semibold text-gray-600 mb-4">Kelola Data</h2>

<div className="space-y-4">
  <button
    className="w-full bg-green-500 text-white px-4 py-3 rounded-lg flex items-center justify-center"
    onClick={exportAllData}
  >
    <FiSave className="mr-2" /> Ekspor Semua Data
  </button>
  
  <button
    className="w-full bg-red-500 text-white px-4 py-3 rounded-lg flex items-center justify-center"
    onClick={clearAllData}
  >
    <FiTrash2 className="mr-2" /> Hapus Semua Data
  </button>
  
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
    <div className="flex">
      <div className="flex-shrink-0">
        <FiAlertCircle className="h-5 w-5 text-yellow-400" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-yellow-700">
          Data disimpan di browser Anda. Menghapus cache browser atau menggunakan perangkat lain akan menghilangkan data.
        </p>
      </div>
    </div>
  </div>
</div>
</div>

{/* About */}
<div className="bg-white rounded-lg shadow-md p-4">
<h2 className="text-lg font-semibold text-gray-600 mb-4">Tentang Aplikasi</h2>

<p className="text-gray-600 mb-2">
  Aplikasi Pencatat Pengeluaran adalah alat sederhana untuk membantu Anda melacak keuangan pribadi.
</p>
<p className="text-gray-600 mb-2">
  Data disimpan secara lokal di browser Anda dan tidak dikirim ke server manapun.
</p>
<p className="text-gray-600">
  Versi 1.0.0
</p>
</div>
</div>
);
}

export default Settings;