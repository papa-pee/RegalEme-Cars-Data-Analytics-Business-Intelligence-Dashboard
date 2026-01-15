import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartCard } from './ChartCard';
import { formatCurrency, formatNumber } from '@/lib/dataProcessing';

interface ProfitByBrandChartProps {
  data: { brand: string; profit: number; quantity: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-light border border-border/50 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'Profit' 
              ? formatCurrency(entry.value) 
              : formatNumber(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ProfitByBrandChart = ({ data }: ProfitByBrandChartProps) => {
  return (
    <ChartCard
      title="Profit vs Quantity by Brand"
      subtitle="Brand performance and efficiency"
      className="h-full"
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis 
              dataKey="brand" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(210 40% 98%)', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(220 30% 15%)' }} />
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
            />
            <Bar 
              yAxisId="left"
              dataKey="quantity" 
              name="Quantity"
              fill="hsl(38 92% 50%)"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="profit" 
              name="Profit"
              stroke="hsl(263 70% 50%)"
              strokeWidth={3}
              dot={{ fill: 'hsl(263 70% 50%)', strokeWidth: 0, r: 5 }}
              activeDot={{ r: 7, stroke: 'hsl(263 70% 65%)', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};
