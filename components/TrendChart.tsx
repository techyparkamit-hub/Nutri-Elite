
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { HistoryItem } from '../types';

interface TrendChartProps {
  history: HistoryItem[];
}

const TrendChart: React.FC<TrendChartProps> = ({ history }) => {
  // Process history data: Group by date and calculate averages
  const processData = () => {
    const dailyData: Record<string, { calories: number; protein: number; count: number; rawDate: number }> = {};

    history.forEach((item) => {
      const date = new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
      if (!dailyData[date]) {
        dailyData[date] = { calories: 0, protein: 0, count: 0, rawDate: item.timestamp };
      }
      dailyData[date].calories += item.data.calories;
      dailyData[date].protein += item.data.protein;
      dailyData[date].count += 1;
    });

    return Object.entries(dailyData)
      .map(([date, values]) => ({
        date,
        Calories: Math.round(values.calories / values.count),
        Protein: parseFloat((values.protein / values.count).toFixed(1)),
        rawDate: values.rawDate
      }))
      .sort((a, b) => a.rawDate - b.rawDate); // Sort chronologically
  };

  const chartData = processData();

  if (chartData.length < 2) {
    return (
      <div className="w-full py-12 px-6 text-center border-2 border-dashed border-slate-100 rounded-3xl">
        <p className="text-slate-400 font-serif italic">Search for more items to see your nutritional trends emerge.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] mt-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h3 className="text-sm uppercase tracking-[0.2em] text-slate-400 font-bold">Trend Analysis</h3>
          <p className="text-xs text-slate-500 mt-1">Daily average based on your inquiries</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
            dy={10}
          />
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Calories"
            stroke="#d97706"
            strokeWidth={3}
            dot={{ fill: '#d97706', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Avg. Calories (kcal)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Protein"
            stroke="#334155"
            strokeWidth={3}
            dot={{ fill: '#334155', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Avg. Protein (g)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
