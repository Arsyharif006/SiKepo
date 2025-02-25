import React, { useState, useEffect } from 'react';
import { FiDownload, FiPieChart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import TransactionChart from './TransactionChart';
// Import library ExcelJS untuk membuat file Excel dengan formatting
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

function Reports() {
    const [transactions, setTransactions] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [categories, setCategories] = useState({});

    // Di dalam useEffect pertama
    useEffect(() => {
        // Ambil data dari localStorage
        const savedTransactions = JSON.parse(localStorage.getItem('expense-tracker-transactions') || '[]');
        setTransactions(savedTransactions);

        // Analisis kategori
        analyzeTransactions(savedTransactions, currentMonth, currentYear);
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

    // Fungsi untuk mengekspor ke Excel yang sudah diformat
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

        // Tambahkan judul laporan
        worksheet.mergeCells('A1:E1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `Laporan Keuangan - ${monthNames[currentMonth]} ${currentYear}`;
        titleCell.font = {
            size: 16,
            bold: true,
            color: { argb: '000000' }
        };
        titleCell.alignment = { horizontal: 'center' };

        // Tambahkan spasi
        worksheet.addRow([]);

        // Tambahkan ringkasan keuangan
        worksheet.mergeCells('A3:E3');
        const summaryTitleCell = worksheet.getCell('A3');
        summaryTitleCell.value = 'Ringkasan Keuangan';
        summaryTitleCell.font = {
            size: 14,
            bold: true,
            color: { argb: '000000' }
        };

        const summaryData = [
            ['Pemasukan', `Rp ${totalIncome.toLocaleString('id-ID')}`, '', 'Pengeluaran', `Rp ${totalExpense.toLocaleString('id-ID')}`],
            ['Selisih Bulan Ini', `Rp ${balance.toLocaleString('id-ID')}`, '', 'Saldo Total', `Rp ${totalBalance.toLocaleString('id-ID')}`]
        ];
        
        // Buat header ringkasan keuangan dengan background
        const summaryHeaderRow = worksheet.addRow(['Keterangan', 'Jumlah', '', 'Keterangan', 'Jumlah']);
        summaryHeaderRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'DDDDDD' }
            };
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        
        // Tambahkan data ringkasan dengan border & format warna
        summaryData.forEach((rowData) => {
            const row = worksheet.addRow(rowData);
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
        
                // Warna teks pemasukan hijau dan pengeluaran merah
                if (colNumber === 2) cell.font = { color: { argb: '008000' } }; // Hijau untuk pemasukan
                if (colNumber === 5) cell.font = { color: { argb: 'FF0000' } }; // Merah untuk pengeluaran
            });
        });
        

        // Tambahkan spasi
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Buat header untuk transaksi
        worksheet.mergeCells('A7:E7');
        const transactionTitleCell = worksheet.getCell('A7');
        transactionTitleCell.value = 'Daftar Transaksi';
        transactionTitleCell.font = {
            size: 14,
            bold: true,
            color: { argb: '000000' }
        };

        // Tambahkan header tabel transaksi
        const headerRow = worksheet.addRow(['Tanggal', 'Waktu', 'Tipe', 'Jumlah', 'Deskripsi']);

        // Format header tabel
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'DDDDDD' }
            };
            cell.font = {
                bold: true
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Tambahkan data transaksi
        filteredTransactions.forEach(t => {
            const row = worksheet.addRow([
                t.date,
                t.time,
                t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
                t.amount,
                t.description
            ]);

            // Format sel-sel data transaksi
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Format sel jumlah dengan warna berdasarkan tipe
                if (colNumber === 4) {
                    cell.numFmt = '#,##0.00';
                    if (t.type === 'income') {
                        cell.font = { color: { argb: '008000' } }; // Hijau untuk pemasukan
                    } else {
                        cell.font = { color: { argb: 'FF0000' } }; // Merah untuk pengeluaran
                    }
                }
            });
        });

        // Tambahkan spasi
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Tambahkan rincian kategori pengeluaran jika ada
        if (Object.keys(categories).length > 0) {
            // Tambahkan judul kategori
            worksheet.mergeCells('A' + (worksheet.rowCount + 1) + ':E' + (worksheet.rowCount + 1));
            const categoryTitleCell = worksheet.getCell('A' + worksheet.rowCount);
            categoryTitleCell.value = 'Rincian Kategori Pengeluaran';
            categoryTitleCell.font = {
                size: 14,
                bold: true,
                color: { argb: '000000' }
            };

            // Tambahkan header tabel kategori
            const categoryHeaderRow = worksheet.addRow(['Kategori', 'Jumlah', 'Persentase']);

            // Format header tabel kategori
            for (let i = 1; i <= 3; i++) {
                categoryHeaderRow.getCell(i).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'DDDDDD' }
                };
                categoryHeaderRow.getCell(i).font = {
                    bold: true
                };
                categoryHeaderRow.getCell(i).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }

            // Tambahkan data kategori
            Object.entries(categories)
                .sort((a, b) => b[1] - a[1])
                .forEach(([category, amount]) => {
                    const percentage = ((amount / totalExpense) * 100).toFixed(1);
                    const row = worksheet.addRow([
                        category,
                        amount,
                        `${percentage}%`
                    ]);

                    // Format sel-sel data kategori
                    for (let i = 1; i <= 3; i++) {
                        row.getCell(i).border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                    }

                    // Format jumlah
                    row.getCell(2).numFmt = '#,##0.00';
                    row.getCell(2).font = { color: { argb: 'FF0000' } }; // Merah untuk pengeluaran
                });
        }

        // Atur lebar kolom agar lebih baik
        worksheet.columns.forEach((column) => {
            column.width = 20;
        });

        // Ekspor file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `transaksi_${monthNames[currentMonth]}_${currentYear}.xlsx`);

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

    return (
        <>
              <div className="bg-white p-4 mb-6 text-center">
        <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
      </div>
        <div className="container mx-auto px-4 py-6 pb-20">

            {/* Month Selector */}
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

                    <button
                        className="bg-blue-500 text-white px-4 rounded-lg flex items-center"
                        onClick={exportToExcel}
                    >
                        <FiDownload className="mr-1" /> Ekspor
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-sm font-semibold text-gray-600 mb-1">Pemasukan</h2>
                    <p className="text-lg font-bold text-green-500">Rp {totalIncome.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-sm font-semibold text-gray-600 mb-1">Pengeluaran</h2>
                    <p className="text-lg font-bold text-red-500">Rp {totalExpense.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-sm font-semibold text-gray-600 mb-1">Selisih Bulan Ini</h2>
                    <p className={`text-lg font-bold ${balance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                        Rp {balance.toLocaleString('id-ID')}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-sm font-semibold text-gray-600 mb-1">Saldo Total</h2>
                    <p className={`text-lg font-bold ${totalBalance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                        Rp {totalBalance.toLocaleString('id-ID')}
                    </p>
                </div>
            </div>
            {/* Charts */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-600 mb-4 flex items-center">
                    <FiPieChart className="mr-2" /> Grafik Pengeluaran
                </h2>
                <TransactionChart transactions={filteredTransactions} />
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-600 mb-4">Rincian Kategori Pengeluaran</h2>

                {Object.keys(categories).length > 0 ? (
                    <div className="space-y-3">
                        {Object.entries(categories)
                            .sort((a, b) => b[1] - a[1])
                            .map(([category, amount], index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <p className="font-medium">{category}</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${Math.min(100, (amount / totalExpense) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="ml-4 text-right">
                                        <p className="font-semibold text-red-500">Rp {amount.toLocaleString('id-ID')}</p>
                                        <p className="text-xs text-gray-500">{((amount / totalExpense) * 100).toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">Tidak ada data pengeluaran</p>
                )}
            </div>

            {/* Monthly Comparison - Updated to match summary cards */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold text-gray-600 mb-4">Ringkasan Bulanan</h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 text-left whitespace-nowrap min-w-[100px]">Bulan</th>
                                <th className="py-2 px-4 text-right whitespace-nowrap min-w-[120px]">Pemasukan</th>
                                <th className="py-2 px-4 text-right whitespace-nowrap min-w-[120px]">Pengeluaran</th>
                                <th className="py-2 px-4 text-right whitespace-nowrap min-w-[140px]">Selisih Bulan</th>
                                <th className="py-2 px-4 text-right whitespace-nowrap min-w-[130px]">Saldo Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getMonthlySummary().map((month, index) => {
                                const monthBalance = month.income - month.expense;
                                // Calculate running balance
                                const runningBalance = calculateRunningBalance(month);

                                return (
                                    <tr key={index} className="border-b">
                                        <td className="py-2 px-4 whitespace-nowrap min-w-[100px]">{month.monthName} {month.year}</td>
                                        <td className="py-2 px-4 text-right text-green-500">
                                            Rp {month.income.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-2 px-4 text-right text-red-500">
                                            Rp {month.expense.toLocaleString('id-ID')}
                                        </td>
                                        <td className={`py-2 px-4 text-right font-medium ${monthBalance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                                            Rp {monthBalance.toLocaleString('id-ID')}
                                        </td>
                                        <td className={`py-2 px-4 text-right font-medium ${runningBalance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                                            Rp {runningBalance.toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </>
    );

    // Fungsi untuk mendapatkan ringkasan bulanan
    function getMonthlySummary() {
        const summary = [];
        const months = {};

        // Kelompokkan transaksi berdasarkan bulan dan tahun
        transactions.forEach(t => {
            const date = new Date(t.date);
            const monthYear = `${date.getFullYear()}-${date.getMonth()}`;

            if (!months[monthYear]) {
                months[monthYear] = {
                    month: date.getMonth(),
                    year: date.getFullYear(),
                    income: 0,
                    expense: 0
                };
            }

            if (t.type === 'income') {
                months[monthYear].income += t.amount;
            } else {
                months[monthYear].expense += t.amount;
            }
        });

        // Konversi ke array dan urutkan berdasarkan tanggal (terbaru dulu)
        Object.values(months).forEach(month => {
            summary.push({
                monthName: monthNames[month.month],
                year: month.year,
                income: month.income,
                expense: month.expense
            });
        });

        return summary.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        }).slice(0, 6); // Ambil 6 bulan terakhir saja
    }

   // Modify the calculateRunningBalance function
function calculateRunningBalance(currentMonth) {
    // Get the base total balance from localStorage
    const savedTotalBalance = parseFloat(localStorage.getItem('expense-tracker-balance') || '0');
    
    // Get all months sorted chronologically (earliest first)
    const allMonths = getMonthlySummary().sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });
    
    // Find the index of our target month
    const currentMonthIndex = allMonths.findIndex(month => 
        month.monthName === currentMonth.monthName && month.year === currentMonth.year
    );
    
    // Get future months (those that come after our target month)
    const futureMonths = allMonths.slice(currentMonthIndex + 1);
    
    // Calculate adjustments for future months (we need to subtract these from the current total)
    let futureAdjustments = 0;
    for (const month of futureMonths) {
        futureAdjustments += (month.income - month.expense);
    }
    
    // Return the totalBalance minus future adjustments
    return savedTotalBalance - futureAdjustments;
}
}

export default Reports;