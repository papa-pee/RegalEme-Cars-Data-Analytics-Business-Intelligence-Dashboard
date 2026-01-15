import { useState, useMemo, useCallback } from 'react';
import { DollarSign, TrendingUp, Car, RefreshCcw } from 'lucide-react';
import exodusLogo from '@/assets/exodus-logo.png';
import { Button } from '@/components/ui/button';
import { DashboardData, Filters } from '@/types/data';
import { aggregateData, formatCurrency, formatNumber } from '@/lib/dataProcessing';
import { KPICard } from './KPICard';
import { FilterPanel } from './FilterPanel';
import { RevenueByCountryChart } from './RevenueByCountryChart';
import { TopCarsChart } from './TopCarsChart';
import { ProfitByBrandChart } from './ProfitByBrandChart';
import { RevenueByCityChart } from './RevenueByCityChart';
import { DrillDownModal, DrillDownData } from './DrillDownModal';

interface DashboardProps {
  data: DashboardData;
  onReset: () => void;
}

const initialFilters: Filters = {
  country: null,
  city: null,
  brand: null,
  model: null,
  dateRange: { start: null, end: null },
};

export const Dashboard = ({ data, onReset }: DashboardProps) => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  
  const aggregated = useMemo(() => 
    aggregateData(data, filters),
    [data, filters]
  );

  const handleDrillDown = useCallback((drillData: DrillDownData) => {
    setDrillDownData(drillData);
    setIsDrillDownOpen(true);
  }, []);

  const handleCloseDrillDown = useCallback(() => {
    setIsDrillDownOpen(false);
    setDrillDownData(null);
  }, []);
  
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={exodusLogo} 
              alt="EXODUS Cars Logo" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-3xl font-display font-bold">
                <span className="text-gold gold-glow">EXODUS</span>
                <span className="text-foreground"> Cars</span>
              </h1>
              <p className="text-muted-foreground mt-1">Sales & Market Performance Dashboard</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onReset}
            className="border-border/50 bg-muted hover:bg-muted/80"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Upload New Data
          </Button>
        </div>
        
        {/* Filters */}
        <FilterPanel 
          data={data} 
          filters={filters} 
          onFiltersChange={setFilters} 
        />
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="Total Revenue"
            value={formatCurrency(aggregated.totalRevenue)}
            icon={<DollarSign className="w-6 h-6" />}
            variant="gold"
            trend={aggregated.revenueTrend || undefined}
          />
          <KPICard
            title="Total Profit"
            value={formatCurrency(aggregated.totalProfit)}
            icon={<TrendingUp className="w-6 h-6" />}
            variant="violet"
            trend={aggregated.profitTrend || undefined}
          />
          <KPICard
            title="Units Sold"
            value={formatNumber(aggregated.totalUnits)}
            icon={<Car className="w-6 h-6" />}
            variant="cyan"
            trend={aggregated.unitsTrend || undefined}
          />
        </div>
        
        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueByCountryChart 
            data={aggregated.revenueByCountry} 
            onDrillDown={handleDrillDown}
          />
          <TopCarsChart 
            data={aggregated.topCars} 
            onDrillDown={handleDrillDown}
          />
        </div>
        
        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfitByBrandChart 
            data={aggregated.profitByBrand} 
            onDrillDown={handleDrillDown}
          />
          <RevenueByCityChart 
            data={aggregated.revenueByCity} 
            onDrillDown={handleDrillDown}
          />
        </div>
        
        {/* Footer */}
        <div className="pt-6 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            EXODUS Cars Analytics Dashboard • Data last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Drill-down Modal */}
      <DrillDownModal
        isOpen={isDrillDownOpen}
        onClose={handleCloseDrillDown}
        drillDownData={drillDownData}
        dashboardData={data}
      />
    </div>
  );
};
