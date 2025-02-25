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
data.push({
date: formatDate(date),
amount: amount
});
});

// Urutkan berdasarkan tanggal
return data.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Format tanggal menjadi lebih pendek
const formatDate = (dateStr) => {
const date = new Date(dateStr);
return `${date.getDate()}/${date.getMonth() + 1}`;
};

const chartData = getChartData();

if (chartData.length === 0) {
return <p className="text-center text-gray-500 py-4">Tidak ada data pengeluaran</p>;
}

return (
<div className="h-64">
<ResponsiveContainer width="100%" height="100%">
<LineChart
  data={chartData}
  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
  <Line 
    type="monotone" 
    dataKey="amount" 
    stroke="#3B82F6" 
    activeDot={{ r: 8 }} 
    name="Pengeluaran"
  />
</LineChart>
</ResponsiveContainer>
</div>
);
}

export default TransactionChart;