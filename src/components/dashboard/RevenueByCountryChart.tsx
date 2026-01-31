import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartCard } from './ChartCard';
import { formatCurrency } from '@/lib/dataProcessing';
import { DrillDownData } from './DrillDownModal';

interface RevenueByCountryChartProps {
  data: { country: string; revenue: number; percentage: number }[];
  onDrillDown?: (data: DrillDownData) => void;
}

// Ghana Green, Nigeria Green (slightly different shade)
const COLORS = ['hsl(145 70% 45%)', 'hsl(340 60% 40%)'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-navy-light border border-border/50 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground">{data.country}</p>
        <p className="text-sm text-regal-green">{formatCurrency(data.revenue)}</p>
        <p className="text-xs text-muted-foreground">{data.percentage.toFixed(1)}% of total</p>
        <p className="text-xs text-muted-foreground mt-2 italic">Click for details</p>
      </div>
    );
  }
  return null;
};

export const RevenueByCountryChart = ({ data, onDrillDown }: RevenueByCountryChartProps) => {
  const handleClick = (entry: any) => {
    if (onDrillDown && entry) {
      onDrillDown({
        type: 'country',
        label: 'Country',
        value: entry.country,
      });
    }
  };

  return (
    <ChartCard
      title="Revenue by Country"
      subtitle="Market performance comparison • Click to drill down"
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
                onClick={(_, index) => handleClick(data[index])}
                className="cursor-pointer"
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
            <div 
              key={item.country} 
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => handleClick(item)}
            >
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