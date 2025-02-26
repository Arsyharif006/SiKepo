import React, { useState, useEffect } from 'react';
import { FiDownload, FiPieChart, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import TransactionChart from './TransactionChart';
// Import library ExcelJS untuk membuat file Excel dengan formatting
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

function Reports() {
    const [transactions, setTransactions] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [categories, setCategories] = useState({});
    const [darkMode, setDarkMode] = useState(false);

    // Di dalam useEffect pertama
    useEffect(() => {
        // Ambil data dari localStorage
        const savedTransactions = JSON.parse(localStorage.getItem('expense-tracker-transactions') || '[]');
        setTransactions(savedTransactions);

        // Load dark mode setting
        const savedDarkMode = localStorage.getItem('expense-tracker-dark-mode');
        if (savedDarkMode !== null) {
            setDarkMode(savedDarkMode === 'true');
        }

        // Analisis kategori
        analyzeTransactions(savedTransactions, currentMonth, currentYear);

        // Listen for storage events (for dark mode changes)
        const handleStorageChange = () => {
            const updatedDarkMode = localStorage.getItem('expense-tracker-dark-mode');
            if (updatedDarkMode !== null) {
                setDarkMode(updatedDarkMode === 'true');
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Tambahkan variabel baru untuk saldo total
    const totalBalance = parseFloat(localStorage.getItem('expense-tracker-balance') || '0');

    useEffect(() => {
        analyzeTransactions(transactions, currentMonth, currentYear);
    }, [currentMonth, currentYear]);

    const analyzeTransactions = (transactions, month, year) => {
        // Filter transaksi bulan ini
        const filteredTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === month && date.getFullYear() === year;
        });

        // Analisis kategori
        const expenseByCategory = {};

        filteredTransactions.forEach(t => {
            if (t.type === 'expense') {
                // Ekstrak kata kunci dari deskripsi
                const description = t.description.toLowerCase();

                // Daftar kata kunci yang ingin dideteksi (bisa ditambahkan sesuai kebutuhan)
                const keywordCategories = [
                    'bensin', 'parkir', 'makanan', 'makan', 'belanja', 'transportasi',
                    'pulsa', 'internet', 'listrik', 'air', 'sewa', 'tagihan', 'obat',
                    'kesehatan', 'pendidikan', 'hiburan', 'pakaian', 'donasi', 'jajan', 'angkot'
                ];

                // Cari kata kunci dalam deskripsi
                let category = 'Lainnya'; // Default kategori jika tidak ada yang cocok

                for (const keyword of keywordCategories) {
                    if (description.includes(keyword)) {
                        category = keyword.charAt(0).toUpperCase() + keyword.slice(1); // Kapitalisasi kata kunci
                        break; // Gunakan kata kunci pertama yang ditemukan
                    }
                }

                // Update jumlah untuk kategori ini
                if (!expenseByCategory[category]) {
                    expenseByCategory[category] = 0;
                }
                expenseByCategory[category] += t.amount;
            }
        });

        setCategories(expenseByCategory);
    };

    const handleMonthChange = (e) => {
        setCurrentMonth(parseInt(e.target.value));
    };

    const handleYearChange = (e) => {
        setCurrentYear(parseInt(e.target.value));
    };
    
    const exportToExcel = async () => {
        // Filter transaksi bulan ini
        const filteredTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
    
        if (filteredTransactions.length === 0) {
            toast.error('Tidak ada transaksi untuk diekspor');
            return;
        }
    
        // Buat workbook dan worksheet baru
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Transaksi ${monthNames[currentMonth]} ${currentYear}`);
        
        // Set properti dokumen
        workbook.creator = 'Aplikasi Keuangan';
        workbook.lastModifiedBy = 'Pengguna';
        workbook.created = new Date();
        workbook.modified = new Date();
        
        // Atur lebar kolom yang lebih ideal
        worksheet.columns = [
            { header: 'Tanggal', key: 'date', width: 15 },
            { header: 'Waktu', key: 'time', width: 10 },
            { header: 'Tipe', key: 'type', width: 15 },
            { header: 'Jumlah', key: 'amount', width: 18 },
            { header: 'Deskripsi', key: 'description', width: 40 }
        ];
    
        // Tambahkan judul laporan dengan styling yang lebih baik
        worksheet.mergeCells('A1:E1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `LAPORAN KEUANGAN`;
        titleCell.font = {
            size: 18,
            bold: true,
            color: { argb: '000000' }
        };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).height = 30;
        
        // Tambahkan sub-judul
        worksheet.mergeCells('A2:E2');
        const subtitleCell = worksheet.getCell('A2');
        subtitleCell.value = `${monthNames[currentMonth].toUpperCase()} ${currentYear}`;
        subtitleCell.font = {
            size: 14,
            bold: true,
            color: { argb: '404040' }
        };
        subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(2).height = 25;
    
        // Tambahkan spasi
        worksheet.addRow([]);
    
        // Tambahkan ringkasan keuangan dengan header yang lebih baik
        worksheet.mergeCells('A4:E4');
        const summaryTitleCell = worksheet.getCell('A4');
        summaryTitleCell.value = 'RINGKASAN KEUANGAN';
        summaryTitleCell.font = {
            size: 14,
            bold: true,
            color: { argb: '000000' }
        };
        summaryTitleCell.alignment = { horizontal: 'center' };
        worksheet.getRow(4).height = 25;
        
        // Tambahkan gradien background untuk judul ringkasan
        summaryTitleCell.fill = {
            type: 'gradient',
            gradient: 'angle',
            degree: 90,
            stops: [
                {position: 0, color: {argb: 'E6F2F5'}},
                {position: 1, color: {argb: 'FFFFFF'}}
            ]
        };
        summaryTitleCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    
        // Buat data ringkasan keuangan
        const summaryData = [
            ['Pemasukan', `Rp ${totalIncome.toLocaleString('id-ID')}`, '', 'Pengeluaran', `Rp ${totalExpense.toLocaleString('id-ID')}`],
            ['Selisih Bulan Ini', `Rp ${balance.toLocaleString('id-ID')}`, '', 'Saldo Total', `Rp ${totalBalance.toLocaleString('id-ID')}`]
        ];
    
        // Buat header ringkasan keuangan dengan improved styling
        const summaryHeaderRow = worksheet.addRow(['Keterangan', 'Jumlah', '', 'Keterangan', 'Jumlah']);
        summaryHeaderRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'D9D9D9' }
            };
            cell.font = { bold: true, size: 12 };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        worksheet.getRow(5).height = 22;
    
        // Tambahkan data ringkasan dengan border & format warna yang lebih baik
        let rowIndex = 6;
        summaryData.forEach((rowData) => {
            const row = worksheet.addRow(rowData);
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle' };
    
                // Warna teks dan styling berdasarkan tipe
                if (colNumber === 2) {
                    cell.font = { color: { argb: '008000' }, bold: true }; // Hijau untuk pemasukan
                    cell.alignment = { horizontal: 'right' };
                }
                if (colNumber === 5) {
                    cell.font = { color: { argb: 'FF0000' }, bold: true }; // Merah untuk pengeluaran
                    cell.alignment = { horizontal: 'right' };
                }
                if (colNumber === 1 || colNumber === 4) {
                    cell.alignment = { horizontal: 'left' };
                }
            });
            worksheet.getRow(rowIndex).height = 22;
            rowIndex++;
        });
    
        // Tambahkan spasi
        worksheet.addRow([]);
        worksheet.addRow([]);
    
        // Tambahkan judul daftar transaksi dengan styling yang lebih baik
        const transactionRowIndex = worksheet.rowCount;
        worksheet.mergeCells(`A${transactionRowIndex}:E${transactionRowIndex}`);
        const transactionTitleCell = worksheet.getCell(`A${transactionRowIndex}`);
        transactionTitleCell.value = 'DAFTAR TRANSAKSI';
        transactionTitleCell.font = {
            size: 14,
            bold: true,
            color: { argb: '000000' }
        };
        transactionTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(transactionRowIndex).height = 25;
        
        // Styling untuk judul transaksi
        transactionTitleCell.fill = {
            type: 'gradient',
            gradient: 'angle',
            degree: 90,
            stops: [
                {position: 0, color: {argb: 'E6F2F5'}},
                {position: 1, color: {argb: 'FFFFFF'}}
            ]
        };
        transactionTitleCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    
        // Tambahkan header tabel transaksi dengan styling yang lebih baik
        const headerRow = worksheet.addRow(['Tanggal', 'Waktu', 'Tipe', 'Jumlah', 'Deskripsi']);
        headerRow.height = 22;
    
        // Format header tabel
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'D9D9D9' }
            };
            cell.font = {
                bold: true,
                size: 12
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    
        // Tambahkan data transaksi dengan formatting yang lebih baik
        filteredTransactions.forEach(t => {
            const dateObj = new Date(t.date);
            const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
            
            const row = worksheet.addRow([
                formattedDate,
                t.time,
                t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
                t.amount,
                t.description
            ]);
            
            row.height = 20;
    
            // Format sel-sel data transaksi
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle' };
    
                // Format sel berdasarkan tipe konten
                if (colNumber === 3) {
                    cell.alignment = { horizontal: 'center' };
                }
                
                // Format sel jumlah dengan warna dan format angka
                if (colNumber === 4) {
                    cell.numFmt = '#,##0.00';
                    cell.alignment = { horizontal: 'right' };
                    if (t.type === 'income') {
                        cell.font = { color: { argb: '008000' } }; // Hijau untuk pemasukan
                    } else {
                        cell.font = { color: { argb: 'FF0000' } }; // Merah untuk pengeluaran
                    }
                }
                
                // Rata kiri untuk deskripsi
                if (colNumber === 5) {
                    cell.alignment = { horizontal: 'left' };
                }
            });
        });
    
        // Tambahkan zebra striping untuk memudahkan pembacaan
        let startRow = headerRow.number + 1;
        let endRow = worksheet.rowCount;
        
        for (let i = startRow; i <= endRow; i += 2) {
            worksheet.getRow(i).eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'F5F5F5' }
                };
            });
        }
    
        // Tambahkan spasi
        worksheet.addRow([]);
        worksheet.addRow([]);
    
        // Tambahkan rincian kategori pengeluaran jika ada
        if (Object.keys(categories).length > 0) {
            // Tambahkan judul kategori dengan styling yang lebih baik
            const categoryRowIndex = worksheet.rowCount;
            worksheet.mergeCells(`A${categoryRowIndex}:E${categoryRowIndex}`);
            const categoryTitleCell = worksheet.getCell(`A${categoryRowIndex}`);
            categoryTitleCell.value = 'RINCIAN KATEGORI PENGELUARAN';
            categoryTitleCell.font = {
                size: 14,
                bold: true,
                color: { argb: '000000' }
            };
            categoryTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.getRow(categoryRowIndex).height = 25;
            
            // Styling untuk judul kategori
            categoryTitleCell.fill = {
                type: 'gradient',
                gradient: 'angle',
                degree: 90,
                stops: [
                    {position: 0, color: {argb: 'E6F2F5'}},
                    {position: 1, color: {argb: 'FFFFFF'}}
                ]
            };
            categoryTitleCell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
    
            // Tambahkan header tabel kategori dengan styling yang lebih baik
            const categoryHeaderRow = worksheet.addRow(['Kategori', 'Jumlah', 'Persentase']);
            categoryHeaderRow.height = 22;
    
            // Format header tabel kategori
            categoryHeaderRow.eachCell((cell, colIndex) => {
                if (colIndex <= 3) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'D9D9D9' }
                    };
                    cell.font = {
                        bold: true,
                        size: 12
                    };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                }
            });
    
            // Tambahkan data kategori dengan styling yang lebih baik
            let categoryRowCount = 0;
            Object.entries(categories)
                .sort((a, b) => b[1] - a[1])
                .forEach(([category, amount]) => {
                    const percentage = ((amount / totalExpense) * 100).toFixed(1);
                    const row = worksheet.addRow([
                        category,
                        amount,
                        `${percentage}%`
                    ]);
                    
                    row.height = 20;
                    categoryRowCount++;
    
                    // Format sel-sel data kategori
                    row.eachCell((cell, colIndex) => {
                        if (colIndex <= 3) {
                            cell.border = {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            };
                            cell.alignment = { vertical: 'middle' };
                            
                            // Format khusus sesuai kolom
                            if (colIndex === 1) {
                                cell.alignment = { horizontal: 'left' };
                            } else if (colIndex === 2) {
                                cell.numFmt = '#,##0.00';
                                cell.alignment = { horizontal: 'right' };
                                cell.font = { color: { argb: 'FF0000' } }; // Merah untuk pengeluaran
                            } else if (colIndex === 3) {
                                cell.alignment = { horizontal: 'center' };
                            }
                        }
                    });
                });
                
            // Tambahkan zebra striping untuk memudahkan pembacaan kategori
            startRow = categoryHeaderRow.number + 1;
            endRow = startRow + categoryRowCount - 1;
            
            for (let i = startRow; i <= endRow; i += 2) {
                worksheet.getRow(i).eachCell((cell, colIndex) => {
                    if (colIndex <= 3) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'F5F5F5' }
                        };
                    }
                });
            }
            
            // Tambahkan footer dengan total kategori
            const footerRow = worksheet.addRow(['TOTAL', totalExpense, '100%']);
            footerRow.height = 22;
            
            footerRow.eachCell((cell, colIndex) => {
                if (colIndex <= 3) {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'double' },
                        right: { style: 'thin' }
                    };
                    cell.font = { bold: true };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'ECECEC' }
                    };
                    
                    // Format khusus sesuai kolom
                    if (colIndex === 1) {
                        cell.alignment = { horizontal: 'right' };
                    } else if (colIndex === 2) {
                        cell.numFmt = '#,##0.00';
                        cell.alignment = { horizontal: 'right' };
                        cell.font = { bold: true, color: { argb: 'FF0000' } };
                    } else if (colIndex === 3) {
                        cell.alignment = { horizontal: 'center' };
                    }
                }
            });
        }
    
        // Tambahkan footer laporan
        worksheet.addRow([]);
        const footerRowIndex = worksheet.rowCount + 1;
        worksheet.mergeCells(`A${footerRowIndex}:E${footerRowIndex}`);
        const footerCell = worksheet.getCell(`A${footerRowIndex}`);
        const currentDate = new Date();
        footerCell.value = `Laporan dibuat pada: ${currentDate.toLocaleDateString('id-ID')} ${currentDate.toLocaleTimeString('id-ID')}`;
        footerCell.font = { italic: true, size: 10, color: { argb: '808080' } };
        footerCell.alignment = { horizontal: 'center' };
    
        // Ekspor file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Laporan_Keuangan_${monthNames[currentMonth]}_${currentYear}.xlsx`);
    
        toast.success('Berhasil mengekspor data transaksi');
    };

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Menghitung total pengeluaran dan pemasukan
    const filteredTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // Menghitung perubahan persentase (mirip dengan Dashboard)
    const calculatePercentageChange = () => {
        if (totalIncome === 0) return 0;
        return ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1);
    };

    const percentageChange = calculatePercentageChange();
    const isPositive = percentageChange >= 0;

    return (
        <>
            {/* Updated header with dark mode support */}
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-4 mb-6 shadow-md transition-colors duration-300`}>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
                    <div className="flex items-center space-x-3">
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-2 pb-20">
                {/* Trading-Style Balance Card - with dark mode support */}
                <motion.div
                    className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-lg shadow-md p-5 mb-6 relative overflow-hidden transition-colors duration-300`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className={`absolute top-0 right-0 w-24 h-24 ${darkMode ? 'bg-blue-900' : 'bg-blue-50'} rounded-bl-full -mt-8 -mr-8 opacity-50`}></div>

                    {/* Month/Year selector in card */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2 flex items-center transition-colors duration-300`}>
                                Ringkasan Keuangan
                            </h2>

                            <div className="flex space-x-2 items-center">
                                <select
                                    className={`px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'} text-sm transition-colors duration-300`}
                                    value={currentMonth}
                                    onChange={handleMonthChange}
                                >
                                    {monthNames.map((month, index) => (
                                        <option key={index} value={index}>{month}</option>
                                    ))}
                                </select>

                                <select
                                    className={`px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'} text-sm transition-colors duration-300`}
                                    value={currentYear}
                                    onChange={handleYearChange}
                                >
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>

                                <motion.button
                                    className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-3 rounded-md flex items-center justify-center shadow-md text-sm transition-colors duration-300`}
                                    onClick={exportToExcel}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <FiDownload className="mr-1" /> Ekspor
                                </motion.button>
                            </div>
                        </div>
                    </div>
                {/* Income/Expense cards - with dark mode support */}
                <div className="grid grid-cols-2 gap-4 mt-4 mb-6">
                    <div className={`${darkMode ? 'bg-red-900/30' : 'bg-red-50'} p-3 rounded-lg flex justify-between items-center transition-colors duration-300`}>
                        <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Pengeluaran</p>
                            <p className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'} transition-colors duration-300`}>Rp {totalExpense.toLocaleString('id-ID')}</p>
                        </div>
                        <div className={`${darkMode ? 'text-red-400' : 'text-red-500'} text-2xl transition-colors duration-300`}>↓</div>
                    </div>
                    <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-50'} p-3 rounded-lg flex justify-between items-center transition-colors duration-300`}>
                        <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Pemasukan</p>
                            <p className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} transition-colors duration-300`}>Rp {totalIncome.toLocaleString('id-ID')}</p>
                        </div>
                        <div className={`${darkMode ? 'text-green-400' : 'text-green-500'} text-2xl transition-colors duration-300`}>↑</div>
                    </div>
                </div>

                {/* Additional cards - with dark mode support */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} p-3 rounded-lg flex justify-between items-center transition-colors duration-300`}>
                        <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Selisih Bulan Ini</p>
                            <p className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-300`}>Rp {balance.toLocaleString('id-ID')}</p>
                        </div>
                        <div className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} text-2xl transition-colors duration-300`}>{balance >= 0 ? '✓' : '!'}</div>
                    </div>
                    <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} p-3 rounded-lg flex justify-between items-center transition-colors duration-300`}>
                        <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Saldo Total</p>
                            <p className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-300`}>Rp {totalBalance.toLocaleString('id-ID')}</p>
                        </div>
                        <div className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} text-2xl transition-colors duration-300`}>{totalBalance >= 0 ? <FiDollarSign className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} /> : '!'}</div>
                    </div>
                </div>
                </motion.div>

                {/* Charts - with dark mode support */}
                <motion.div
                    className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-lg shadow-md p-4 mb-6 transition-colors duration-300`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 flex items-center transition-colors duration-300`}>
                        <FiPieChart className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-300`} /> Grafik Pengeluaran
                    </h2>
                    <TransactionChart transactions={filteredTransactions} darkMode={darkMode} />
                </motion.div>

                {/* Category Breakdown - with dark mode support */}
                <motion.div
                    className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-lg shadow-md p-4 mb-6 transition-colors duration-300`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 flex items-center transition-colors duration-300`}>
                        <FiPieChart className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-300`} /> Rincian Kategori Pengeluaran
                    </h2>

                    {Object.keys(categories).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(categories)
                                .sort((a, b) => b[1] - a[1])
                                .map(([category, amount], index) => (
                                    <motion.div
                                        key={index}
                                        className={`flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b pb-2 transition-colors duration-300`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{category}</p>
                                            <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5 mt-1 transition-colors duration-300`}>
                                                <div
                                                    className={`${darkMode ? 'bg-blue-500' : 'bg-blue-600'} h-2.5 rounded-full transition-colors duration-300`}
                                                    style={{ width: `${Math.min(100, (amount / totalExpense) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="ml-4 text-right">
                                            <p className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-500'} transition-colors duration-300`}>Rp {amount.toLocaleString('id-ID')}</p>
                                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>{((amount / totalExpense) * 100).toFixed(1)}%</p>
                                        </div>
                                    </motion.div>
                                ))
                            }
                        </div>
                    ) : (
                        <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} py-4 transition-colors duration-300`}>Tidak ada data pengeluaran</p>
                    )}
                </motion.div>

                {/* Monthly Comparison - with dark mode support */}
                <motion.div
                    className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-lg shadow-md p-4 transition-colors duration-300`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 flex items-center transition-colors duration-300`}>
                        <FiCalendar className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-300`} /> Ringkasan Bulanan
                    </h2>

                    <div className="overflow-x-auto w-full">
                        <table className="min-w-full table-fixed">
                            <thead>
                                <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors duration-300`}>
                                    <th className={`py-2 px-4 text-left whitespace-nowrap w-[100px] font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Bulan</th>
                                    <th className={`py-2 px-4 text-right whitespace-nowrap w-[120px] font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Pemasukan</th>
                                    <th className={`py-2 px-4 text-right whitespace-nowrap w-[120px] font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Pengeluaran</th>
                                    <th className={`py-2 px-4 text-right whitespace-nowrap w-[140px] font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Selisih Bulan</th>
                                    <th className={`py-2 px-4 text-right whitespace-nowrap w-[130px] font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Saldo Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getMonthlySummary().map((month, index) => {
                                    const monthBalance = month.income - month.expense;
                                    // Calculate running balance
                                    const runningBalance = calculateRunningBalance(month);

                                    return (
                                        <tr key={index} className={`${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'} border-b transition-colors duration-300`}>
                                            <td className="py-2 px-4 whitespace-nowrap overflow-hidden text-ellipsis">{month.monthName} {month.year}</td>
                                            <td className={`py-2 px-4 text-right whitespace-nowrap ${darkMode ? 'text-green-400' : 'text-green-600'} transition-colors duration-300`}>Rp {month.income.toLocaleString('id-ID')}</td>
                                            <td className={`py-2 px-4 text-right whitespace-nowrap ${darkMode ? 'text-red-400' : 'text-red-600'} transition-colors duration-300`}>Rp {month.expense.toLocaleString('id-ID')}</td>
                                            <td className={`py-2 px-4 text-right whitespace-nowrap ${monthBalance >= 0 ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600')} transition-colors duration-300`}>
                                                Rp {monthBalance.toLocaleString('id-ID')}
                                            </td>
                                            <td className={`py-2 px-4 text-right whitespace-nowrap ${runningBalance >= 0 ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-red-400' : 'text-red-600')} transition-colors duration-300`}>
                                                Rp {runningBalance.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </>
    );

    // Function to get monthly summary data
    function getMonthlySummary() {
        // Group transactions by month and year
        const monthlyData = {};
        
        transactions.forEach(t => {
            const date = new Date(t.date);
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${month}`;
            
            if (!monthlyData[key]) {
                monthlyData[key] = {
                    month,
                    year,
                    monthName: monthNames[month],
                    income: 0,
                    expense: 0
                };
            }
            
            if (t.type === 'income') {
                monthlyData[key].income += t.amount;
            } else {
                monthlyData[key].expense += t.amount;
            }
        });
        
        // Convert to array and sort by date (newest first)
        return Object.values(monthlyData)
            .sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });
    }
    
    // Function to calculate running balance up to a specific month
    function calculateRunningBalance(targetMonth) {
        // Sum up all transactions up to and including the target month
        let balance = 0;
        
        transactions.forEach(t => {
            const date = new Date(t.date);
            const month = date.getMonth();
            const year = date.getFullYear();
            
            // Include transaction if it's on or before the target month
            if (year < targetMonth.year || (year === targetMonth.year && month <= targetMonth.month)) {
                if (t.type === 'income') {
                    balance += t.amount;
                } else {
                    balance -= t.amount;
                }
            }
        });
        
        return balance;
    }
}

export default Reports;

                                            