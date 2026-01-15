import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartCard } from './ChartCard';
import { formatCurrency } from '@/lib/dataProcessing';

interface RevenueByCountryChartProps {
  data: { country: string; revenue: number; percentage: number }[];
}

const COLORS = ['hsl(188 94% 43%)', 'hsl(263 70% 50%)'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-navy-light border border-border/50 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground">{data.country}</p>
        <p className="text-sm text-cyan">{formatCurrency(data.revenue)}</p>
        <p className="text-xs text-muted-foreground">{data.percentage.toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
};

export const RevenueByCountryChart = ({ data }: RevenueByCountryChartProps) => {
  return (
    <ChartCard
      title="Revenue by Country"
      subtitle="Market performance comparison"
      className="h-full"
    >
      <div className="flex items-center h-full">
        <div className="w-1/2 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="revenue"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-1/2 space-y-4">
          {data.map((item, index) => (
            <div key={item.country} className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{item.country}</span>
                  <span className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                </div>
                <p className="text-lg font-semibold" style={{ color: COLORS[index % COLORS.length] }}>
                  {formatCurrency(item.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};
