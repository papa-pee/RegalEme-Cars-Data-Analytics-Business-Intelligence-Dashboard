import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartCard } from './ChartCard';
import { formatCurrency } from '@/lib/dataProcessing';

interface RevenueByCityChartProps {
  data: { city: string; country: string; revenue: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-navy-light border border-border/50 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground">{data.city}</p>
        <p className="text-xs text-muted-foreground mb-1">{data.country}</p>
        <p className="text-sm text-cyan">{formatCurrency(data.revenue)}</p>
      </div>
    );
  }
  return null;
};

export const RevenueByCityChart = ({ data }: RevenueByCityChartProps) => {
  // Take top 8 cities for visibility
  const displayData = data.slice(0, 8);
  
  return (
    <ChartCard
      title="Revenue by City"
      subtitle="Top performing cities"
      className="h-full"
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={displayData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <XAxis 
              dataKey="city" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(210 40% 98%)', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(220 30% 15%)' }} />
            <defs>
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(188 94% 50%)" />
                <stop offset="100%" stopColor="hsl(188 94% 35%)" />
              </linearGradient>
            </defs>
            <Bar 
              dataKey="revenue" 
              fill="url(#cyanGradient)"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};
