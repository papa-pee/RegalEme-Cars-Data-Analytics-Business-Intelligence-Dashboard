import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/dataProcessing';
import { DashboardData, Sale } from '@/types/data';

export type DrillDownType = 'country' | 'city' | 'brand' | 'model';

export interface DrillDownData {
  type: DrillDownType;
  label: string;
  value: string;
  additionalInfo?: string;
}

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  drillDownData: DrillDownData | null;
  dashboardData: DashboardData;
}

export const DrillDownModal = ({ isOpen, onClose, drillDownData, dashboardData }: DrillDownModalProps) => {
  if (!drillDownData) return null;

  const getFilteredSales = (): Sale[] => {
    const { type, value } = drillDownData;
    
    switch (type) {
      case 'country': {
        const dealerIds = dashboardData.dealers
          .filter(d => d.Country === value)
          .map(d => d.DealerID);
        return dashboardData.sales.filter(s => dealerIds.includes(s.DealerID));
      }
      case 'city': {
        const dealerIds = dashboardData.dealers
          .filter(d => d.City === value)
          .map(d => d.DealerID);
        return dashboardData.sales.filter(s => dealerIds.includes(s.DealerID));
      }
      case 'brand': {
        const modelIds = dashboardData.models
          .filter(m => m.Brand === value)
          .map(m => m.ModelID);
        return dashboardData.sales.filter(s => modelIds.includes(s.ModelID));
      }
      case 'model': {
        // value contains "Brand Model" format, extract model name
        const modelName = drillDownData.additionalInfo || value.split(' ').slice(1).join(' ');
        const modelIds = dashboardData.models
          .filter(m => m.Model === modelName || `${m.Brand} ${m.Model}` === value)
          .map(m => m.ModelID);
        return dashboardData.sales.filter(s => modelIds.includes(s.ModelID));
      }
      default:
        return [];
    }
  };

  const filteredSales = getFilteredSales();
  
  // Enrich sales with dealer and model info
  const enrichedSales = filteredSales.map(sale => {
    const dealer = dashboardData.dealers.find(d => d.DealerID === sale.DealerID);
    const model = dashboardData.models.find(m => m.ModelID === sale.ModelID);
    return {
      ...sale,
      dealerName: dealer?.DealerName || 'Unknown',
      city: dealer?.City || 'Unknown',
      country: dealer?.Country || 'Unknown',
      brand: model?.Brand || 'Unknown',
      model: model?.Model || 'Unknown',
      segment: model?.Segment || 'Unknown',
    };
  }).sort((a, b) => b.Date.getTime() - a.Date.getTime());

  // Calculate summary stats
  const totalRevenue = enrichedSales.reduce((sum, s) => sum + s.TotalPrice, 0);
  const totalProfit = enrichedSales.reduce((sum, s) => sum + s.TotalProfit, 0);
  const totalUnits = enrichedSales.reduce((sum, s) => sum + s.Quantity, 0);
  const avgOrderValue = enrichedSales.length > 0 ? totalRevenue / enrichedSales.length : 0;

  const getTypeLabel = () => {
    switch (drillDownData.type) {
      case 'country': return 'Country';
      case 'city': return 'City';
      case 'brand': return 'Brand';
      case 'model': return 'Model';
      default: return 'Data';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-card border-border/50 max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
              {getTypeLabel()}
            </Badge>
            <span className="text-foreground">{drillDownData.value}</span>
            {drillDownData.additionalInfo && (
              <span className="text-muted-foreground text-sm font-normal">
                ({drillDownData.additionalInfo})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 my-4">
          <div className="bg-muted/50 rounded-lg p-3 border border-border/30">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-lg font-semibold text-gold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 border border-border/30">
            <p className="text-xs text-muted-foreground">Total Profit</p>
            <p className="text-lg font-semibold text-violet">{formatCurrency(totalProfit)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 border border-border/30">
            <p className="text-xs text-muted-foreground">Units Sold</p>
            <p className="text-lg font-semibold text-cyan">{formatNumber(totalUnits)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 border border-border/30">
            <p className="text-xs text-muted-foreground">Avg Order Value</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(avgOrderValue)}</p>
          </div>
        </div>

        {/* Sales Table */}
        <ScrollArea className="h-[400px] rounded-lg border border-border/30">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Model</TableHead>
                <TableHead className="text-muted-foreground">Dealer</TableHead>
                <TableHead className="text-muted-foreground">Location</TableHead>
                <TableHead className="text-muted-foreground text-right">Qty</TableHead>
                <TableHead className="text-muted-foreground text-right">Revenue</TableHead>
                <TableHead className="text-muted-foreground text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrichedSales.slice(0, 50).map((sale) => (
                <TableRow key={sale.SaleID} className="border-border/20 hover:bg-muted/30">
                  <TableCell className="text-foreground">
                    {sale.Date.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="text-foreground font-medium">{sale.model}</span>
                      <span className="text-muted-foreground text-xs ml-2">{sale.brand}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sale.dealerName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {sale.city}, {sale.country}
                  </TableCell>
                  <TableCell className="text-right text-foreground">{sale.Quantity}</TableCell>
                  <TableCell className="text-right text-gold">{formatCurrency(sale.TotalPrice)}</TableCell>
                  <TableCell className="text-right text-cyan">{formatCurrency(sale.TotalProfit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {enrichedSales.length > 50 && (
            <div className="p-3 text-center text-sm text-muted-foreground border-t border-border/30">
              Showing 50 of {enrichedSales.length} transactions
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
