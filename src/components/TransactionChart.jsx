// components/TransactionChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function TransactionChart({ transactions }) {
  // Proses data untuk chart
  const getChartData = () => {
    const data = [];
    const dailyExpenses = {};
    
    // Kelompokkan pengeluaran berdasarkan tanggal
    transactions.forEach(t => {
      if (t.type === 'expense') {
        if (!dailyExpenses[t.date]) {
          dailyExpenses[t.date] = 0;
        }
        dailyExpenses[t.date] += t.amount;
      }
    });
    
    // Ubah ke format yang sesuai untuk chart
    Object.entries(dailyExpenses).forEach(([date, amount]) => {
      // Ubah format tanggal untuk pengurutan yang benar
      const [year, month, day] = date.split('-');
      
      data.push({
        rawDate: date, // Simpan tanggal asli untuk pengurutan
        date: `${day}/${month}`, // Format tanggal untuk tampilan
        amount: amount
      });
    });
    
    // Urutkan berdasarkan tanggal dari lama ke baru
    return data.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  };
  
  const chartData = getChartData();
  
  if (chartData.length === 0) {
    return <p className="text-center text-gray-500 py-4">Tidak ada data pengeluaran</p>;
  }
  
  // Custom Tooltip untuk format mata uang Indonesia
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-md">
          <p className="font-semibold">{`Tanggal: ${label}`}</p>
          <p>{`Pengeluaran: Rp ${payload[0].value.toLocaleString('id-ID')}`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Format angka pada sumbu Y
  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}jt`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}rb`;
    }
    return value;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Grafik Pengeluaran</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={true} 
              tickLine={true}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12 }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3B82F6"
              activeDot={{ r: 8 }}
              name="Pengeluaran"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3B82F6' }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TransactionChart;