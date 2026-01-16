import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartCard } from './ChartCard';
import { formatCurrency, formatNumber } from '@/lib/dataProcessing';
import { DrillDownData } from './DrillDownModal';

interface ProfitVsSalesBySegmentChartProps {
  data: { segment: string; revenue: number; profit: number; quantity: number }[];
  onDrillDown?: (data: DrillDownData) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-light border border-border/50 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'Quantity' 
              ? formatNumber(entry.value) 
              : formatCurrency(entry.value)}
          </p>
        ))}
        <p className="text-xs text-muted-foreground mt-2 italic">Click for details</p>
      </div>
    );
  }
  return null;
};

export const ProfitVsSalesBySegmentChart = ({ data, onDrillDown }: ProfitVsSalesBySegmentChartProps) => {
  const handleClick = (entry: any) => {
    if (onDrillDown && entry?.activePayload?.[0]?.payload) {
      const segmentData = entry.activePayload[0].payload;
      onDrillDown({
        type: 'segment',
        label: 'Segment',
        value: segmentData.segment,
      });
    }
  };

  return (
    <ChartCard
      title="Profit vs Sales by Segment"
      subtitle="Revenue and profit performance by vehicle segment • Click to drill down"
      className="h-full"
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={handleClick}
            className="cursor-pointer"
          >
            <XAxis 
              dataKey="segment" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(210 40% 98%)', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(220 30% 15%)' }} />
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
            />
            <Bar 
              yAxisId="left"
              dataKey="revenue" 
              name="Sales Revenue"
              fill="hsl(188 70% 45%)"
              radius={[4, 4, 0, 0]}
              barSize={32}
              className="hover:opacity-80 transition-opacity"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="profit" 
              name="Profit"
              stroke="hsl(38 92% 50%)"
              strokeWidth={3}
              dot={{ fill: 'hsl(38 92% 50%)', strokeWidth: 0, r: 5 }}
              activeDot={{ r: 7, stroke: 'hsl(38 92% 65%)', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};
