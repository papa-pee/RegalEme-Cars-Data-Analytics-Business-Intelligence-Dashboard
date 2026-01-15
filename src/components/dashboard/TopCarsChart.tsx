import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { ChartCard } from './ChartCard';
import { formatNumber } from '@/lib/dataProcessing';
import { DrillDownData } from './DrillDownModal';

interface TopCarsChartProps {
  data: { model: string; brand: string; quantity: number }[];
  onDrillDown?: (data: DrillDownData) => void;
}

const COLORS = ['hsl(43 74% 52%)', 'hsl(38 80% 45%)', 'hsl(43 50% 40%)'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-navy-light border border-border/50 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground">{data.model}</p>
        <p className="text-xs text-muted-foreground mb-1">{data.brand}</p>
        <p className="text-sm text-gold">{formatNumber(data.quantity)} units sold</p>
        <p className="text-xs text-muted-foreground mt-2 italic">Click for details</p>
      </div>
    );
  }
  return null;
};

export const TopCarsChart = ({ data, onDrillDown }: TopCarsChartProps) => {
  const handleBarClick = (entry: any) => {
    if (onDrillDown && entry) {
      onDrillDown({
        type: 'model',
        label: 'Model',
        value: entry.model,
        additionalInfo: entry.brand,
      });
    }
  };

  return (
    <ChartCard
      title="Top 3 Cars Sold"
      subtitle="Best-selling models by quantity • Click to drill down"
      className="h-full"
    >
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 12 }}
            />
            <YAxis 
              type="category" 
              dataKey="model"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(210 40% 98%)', fontSize: 12 }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(220 30% 15%)' }} />
            <Bar 
              dataKey="quantity" 
              radius={[0, 4, 4, 0]}
              barSize={28}
              onClick={handleBarClick}
              className="cursor-pointer"
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};
