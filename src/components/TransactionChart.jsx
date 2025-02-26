import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function TransactionChart({ transactions, darkMode }) {
  // Process data for chart
  const getChartData = () => {
    const data = [];
    const dailyExpenses = {};
    
    // Group expenses by date
    transactions.forEach(t => {
      if (t.type === 'expense') {
        if (!dailyExpenses[t.date]) {
          dailyExpenses[t.date] = 0;
        }
        dailyExpenses[t.date] += t.amount;
      }
    });
    
    // Convert to format suitable for chart
    Object.entries(dailyExpenses).forEach(([date, amount]) => {
      // Format date for proper sorting
      const [year, month, day] = date.split('-');
      
      data.push({
        rawDate: date, // Save original date for sorting
        date: `${day}/${month}`, // Format date for display
        amount: amount
      });
    });
    
    // Sort by date from oldest to newest
    return data.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  };
  
  const chartData = getChartData();
  
  if (chartData.length === 0) {
    return (
      <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} py-4 transition-colors duration-300`}>
        Tidak ada data pengeluaran
      </p>
    );
  }
  
  // Custom Tooltip with dark mode support
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} p-2 border ${darkMode ? 'border-gray-600' : 'border-gray-200'} rounded shadow-md transition-colors duration-300`}>
          <p className="font-semibold">{`Tanggal: ${label}`}</p>
          <p>{`Pengeluaran: Rp ${payload[0].value.toLocaleString('id-ID')}`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Format numbers on Y axis
  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}jt`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}rb`;
    }
    return value;
  };
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={darkMode ? "#3f4650" : "#e2e8f0"} 
          />
          <XAxis 
            dataKey="date" 
            axisLine={true} 
            tickLine={true}
            tick={{ fontSize: 12, fill: darkMode ? "#9ca3af" : "#4b5563" }}
            stroke={darkMode ? "#6b7280" : "#9ca3af"}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            axisLine={true}
            tickLine={true}
            tick={{ fontSize: 12, fill: darkMode ? "#9ca3af" : "#4b5563" }}
            stroke={darkMode ? "#6b7280" : "#9ca3af"}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke={darkMode ? "#60a5fa" : "#3B82F6"}
            activeDot={{ r: 8, fill: darkMode ? "#60a5fa" : "#3B82F6" }}
            name="Pengeluaran"
            strokeWidth={2}
            dot={{ r: 4, fill: darkMode ? "#60a5fa" : "#3B82F6" }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TransactionChart;