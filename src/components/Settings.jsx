import React, { useState, useEffect } from 'react';
import { FiSave, FiImage, FiAlertCircle, FiTrash2, FiMoon, FiSun } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { NumericFormat } from 'react-number-format';
import { motion } from 'framer-motion';

function Settings() {
  const [balance, setBalance] = useState(0);
  const [background, setBackground] = useState(localStorage.getItem('expense-tracker-bg') || '');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('expense-tracker-dark-mode') === 'true');

  useEffect(() => {
    const savedBackground = localStorage.getItem('expense-tracker-bg');
    if (savedBackground) {
      setBackground(savedBackground);
    }

    // Load dark mode setting
    const savedDarkMode = localStorage.getItem('expense-tracker-dark-mode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  // Update the document with dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('expense-tracker-dark-mode', newDarkMode.toString());
    window.dispatchEvent(new Event("storage")); // Trigger change event
  };

  const handleBackgroundChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('expense-tracker-bg', reader.result);
        setBackground(reader.result);
        window.dispatchEvent(new Event("storage")); // Memicu perubahan agar App.jsx mendeteksi
        toast.success('Background berhasil diperbarui');
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeBackground = () => {
    localStorage.removeItem('expense-tracker-bg');
    setBackground('');

    window.dispatchEvent(new Event("storage")); // Memicu perubahan
    toast.success('Background dihapus');
  };

  useEffect(() => {
    // Ambil saldo dari localStorage
    const savedBalance = localStorage.getItem('expense-tracker-balance');
    if (savedBalance) {
      setBalance(parseFloat(savedBalance));
    }
  }, []);

  // Handler untuk NumericFormat
  const handleBalanceValueChange = (values) => {
    // values.floatValue berisi nilai numerik tanpa formatting
    setBalance(values.floatValue || 0);
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

    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `expense-tracker-data-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Data berhasil diekspor');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <>
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-4 mb-6 shadow-md transition-colors duration-300`}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <div className="flex items-center space-x-3">
          </div>
        </div>
      </div>

      <motion.div 
        className="container mx-auto px-4 py-6 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Saldo Settings */}
        <motion.div 
          variants={itemVariants}
          className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-4 mb-4 transition-colors duration-300`}
        >
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-600'} mb-4`}>Atur Saldo</h2>

          <div className="mb-4">
            <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Saldo Saat Ini (Rp)</label>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <NumericFormat
                thousandSeparator="."
                decimalSeparator=","
                prefix="Rp "
                value={balance}
                onValueChange={handleBalanceValueChange}
                className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                placeholder="Contoh: Rp 500.000"
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                onClick={updateBalance}
              >
                <FiSave className="mr-1" /> Simpan
              </button>
            </div>
            
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              Catatan: Mengubah saldo secara manual tidak akan mempengaruhi riwayat transaksi
            </p>
          </div>
        </motion.div>

        {/* Dark Mode Toggle */}
        <motion.div 
          variants={itemVariants}
          className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-4 mb-4 transition-colors duration-300`}
        >
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-600'} mb-4`}>Mode Tampilan</h2>
          
          <div className="flex items-center justify-between">
            <span>Mode {darkMode ? 'Gelap' : 'Terang'}</span>
            
            <motion.button 
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              className={`rounded-full p-2 ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-blue-500 text-white'} transition-colors duration-300`}
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </motion.button>
          </div>
        </motion.div>
        
        {/* Background Settings */}
        <motion.div 
          variants={itemVariants}
          className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-4 mb-4 transition-colors duration-300`}
        >
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-600'} mb-4`}>Ubah Background</h2>

          <div className="flex space-x-2">
            <motion.label 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center cursor-pointer"
            >
              <FiImage className="mr-1" /> Pilih Gambar
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleBackgroundChange} 
                className="hidden" 
              />
            </motion.label>

            {background && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center"
                onClick={removeBackground}
              >
                <FiTrash2 className="mr-1" /> Hapus
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div 
          variants={itemVariants}
          className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-4 mb-4 transition-colors duration-300`}
        >
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-600'} mb-4`}>Kelola Data</h2>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-green-500 text-white px-4 py-3 rounded-lg flex items-center justify-center"
              onClick={exportAllData}
            >
              <FiSave className="mr-2" /> Ekspor Semua Data
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-red-500 text-white px-4 py-3 rounded-lg flex items-center justify-center"
              onClick={clearAllData}
            >
              <FiTrash2 className="mr-2" /> Hapus Semua Data
            </motion.button>

            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50 border-yellow-400'} border-l-4 p-4 rounded transition-colors duration-300`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className={`h-5 w-5 ${darkMode ? 'text-yellow-300' : 'text-yellow-400'}`} />
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-yellow-700'}`}>
                    Data disimpan di browser Anda. Menghapus cache browser atau menggunakan perangkat lain akan menghilangkan data.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* About */}
        <motion.div 
          variants={itemVariants}
          className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-4 transition-colors duration-300`}
        >
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-600'} mb-4`}>Tentang Aplikasi</h2>

          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
            Aplikasi Pencatat Keuangan Online adalah alat sederhana untuk membantu Anda melacak pemasukan dan pengeluaran pribadi.
          </p>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
            Data disimpan secara lokal di browser Anda dan tidak dikirim ke server manapun.
          </p>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Versi 3.1.0
          </p>
        </motion.div>
      </motion.div>
    </>
  );
}

export default Settings;