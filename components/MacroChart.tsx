
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { NutritionData } from '../types';

interface MacroChartProps {
  data: NutritionData;
}

const MacroChart: React.FC<MacroChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Protein', value: data.protein, color: '#d97706' }, // amber-600
    { name: 'Carbs', value: data.carbs, color: '#334155' },    // slate-700
    { name: 'Fat', value: data.fat, color: '#94a3b8' },       // slate-400
  ];

  const totalMacros = data.protein + data.carbs + data.fat;
  
  if (totalMacros === 0) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MacroChart;
