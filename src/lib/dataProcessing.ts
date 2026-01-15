import * as XLSX from 'xlsx';
import { Dealer, Model, Sale, DashboardData, Filters, AggregatedData } from '@/types/data';

export const parseExcelFile = async (file: File): Promise<DashboardData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Parse dealers sheet
        const dealersSheet = workbook.Sheets['dealers'] || workbook.Sheets[workbook.SheetNames[0]];
        const dealersRaw = XLSX.utils.sheet_to_json(dealersSheet);
        const dealers: Dealer[] = dealersRaw.map((row: any) => ({
          DealerID: String(row.DealerID || row['Dealer ID'] || ''),
          DealerName: String(row.DealerName || row['Dealer Name'] || ''),
          City: String(row.City || ''),
          Country: String(row.Country || ''),
        }));
        
        // Parse models sheet
        const modelsSheet = workbook.Sheets['models'] || workbook.Sheets[workbook.SheetNames[1]];
        const modelsRaw = XLSX.utils.sheet_to_json(modelsSheet);
        const models: Model[] = modelsRaw.map((row: any) => ({
          ModelID: String(row.ModelID || row['Model ID'] || ''),
          Brand: String(row.Brand || ''),
          Model: String(row.Model || ''),
          Segment: String(row.Segment || ''),
          EngineSize: parseFloat(row['EngineSize (L)'] || row.EngineSize || 0),
          Fuel: String(row.Fuel || ''),
          Price: parseFloat(row['Price (USD)'] || row.Price || 0),
          Profit: parseFloat(row['Profit (USD)'] || row.Profit || 0),
        }));
        
        // Parse sales sheet
        const salesSheet = workbook.Sheets['sales'] || workbook.Sheets[workbook.SheetNames[2]];
        const salesRaw = XLSX.utils.sheet_to_json(salesSheet);
        const sales: Sale[] = salesRaw.map((row: any) => {
          let dateValue = row.Date;
          let parsedDate: Date;
          
          if (typeof dateValue === 'number') {
            // Excel serial date number - convert to JS Date
            // Excel dates start from 1900-01-01 (serial number 1)
            const excelEpoch = new Date(1899, 11, 30);
            parsedDate = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
          } else {
            parsedDate = new Date(dateValue);
          }
          
          return {
            SaleID: String(row.SaleID || row['Sale ID'] || ''),
            Date: parsedDate,
            DealerID: String(row.DealerID || row['Dealer ID'] || ''),
            ModelID: String(row.ModelID || row['Model ID'] || ''),
            Quantity: parseInt(row.Quantity || 0),
            TotalPrice: parseFloat(row.TotalPrice || row['Total Price'] || 0),
            TotalProfit: parseFloat(row['Total Profit'] || row.TotalProfit || 0),
          };
        });
        
        resolve({ dealers, models, sales });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const applyFilters = (data: DashboardData, filters: Filters): Sale[] => {
  let filteredSales = [...data.sales];
  
  if (filters.country) {
    const dealerIds = data.dealers
      .filter(d => d.Country === filters.country)
      .map(d => d.DealerID);
    filteredSales = filteredSales.filter(s => dealerIds.includes(s.DealerID));
  }
  
  if (filters.city) {
    const dealerIds = data.dealers
      .filter(d => d.City === filters.city)
      .map(d => d.DealerID);
    filteredSales = filteredSales.filter(s => dealerIds.includes(s.DealerID));
  }
  
  if (filters.brand) {
    const modelIds = data.models
      .filter(m => m.Brand === filters.brand)
      .map(m => m.ModelID);
    filteredSales = filteredSales.filter(s => modelIds.includes(s.ModelID));
  }
  
  if (filters.model) {
    const modelIds = data.models
      .filter(m => m.Model === filters.model)
      .map(m => m.ModelID);
    filteredSales = filteredSales.filter(s => modelIds.includes(s.ModelID));
  }
  
  if (filters.dateRange.start) {
    filteredSales = filteredSales.filter(s => s.Date >= filters.dateRange.start!);
  }
  
  if (filters.dateRange.end) {
    filteredSales = filteredSales.filter(s => s.Date <= filters.dateRange.end!);
  }
  
  return filteredSales;
};

export const aggregateData = (data: DashboardData, filters: Filters): AggregatedData => {
  const filteredSales = applyFilters(data, filters);
  
  // Total KPIs
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.TotalPrice, 0);
  const totalProfit = filteredSales.reduce((sum, s) => sum + s.TotalProfit, 0);
  const totalUnits = filteredSales.reduce((sum, s) => sum + s.Quantity, 0);
  
  // Revenue by Country
  const revenueByCountryMap = new Map<string, number>();
  filteredSales.forEach(sale => {
    const dealer = data.dealers.find(d => d.DealerID === sale.DealerID);
    if (dealer) {
      const current = revenueByCountryMap.get(dealer.Country) || 0;
      revenueByCountryMap.set(dealer.Country, current + sale.TotalPrice);
    }
  });
  
  const revenueByCountry = Array.from(revenueByCountryMap.entries()).map(([country, revenue]) => ({
    country,
    revenue,
    percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
  }));
  
  // Top 3 Cars by Quantity
  const quantityByModel = new Map<string, { brand: string; quantity: number }>();
  filteredSales.forEach(sale => {
    const model = data.models.find(m => m.ModelID === sale.ModelID);
    if (model) {
      const key = `${model.Brand} ${model.Model}`;
      const current = quantityByModel.get(key) || { brand: model.Brand, quantity: 0 };
      quantityByModel.set(key, { brand: model.Brand, quantity: current.quantity + sale.Quantity });
    }
  });
  
  const topCars = Array.from(quantityByModel.entries())
    .map(([model, data]) => ({ model, brand: data.brand, quantity: data.quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);
  
  // Profit and Quantity by Brand
  const brandMetrics = new Map<string, { profit: number; quantity: number }>();
  filteredSales.forEach(sale => {
    const model = data.models.find(m => m.ModelID === sale.ModelID);
    if (model) {
      const current = brandMetrics.get(model.Brand) || { profit: 0, quantity: 0 };
      brandMetrics.set(model.Brand, {
        profit: current.profit + sale.TotalProfit,
        quantity: current.quantity + sale.Quantity,
      });
    }
  });
  
  const profitByBrand = Array.from(brandMetrics.entries())
    .map(([brand, metrics]) => ({ brand, ...metrics }))
    .sort((a, b) => b.profit - a.profit);
  
  // Revenue by City
  const revenueByCityMap = new Map<string, { country: string; revenue: number }>();
  filteredSales.forEach(sale => {
    const dealer = data.dealers.find(d => d.DealerID === sale.DealerID);
    if (dealer) {
      const current = revenueByCityMap.get(dealer.City) || { country: dealer.Country, revenue: 0 };
      revenueByCityMap.set(dealer.City, {
        country: dealer.Country,
        revenue: current.revenue + sale.TotalPrice,
      });
    }
  });
  
  const revenueByCity = Array.from(revenueByCityMap.entries())
    .map(([city, data]) => ({ city, ...data }))
    .sort((a, b) => b.revenue - a.revenue);
  
  return {
    totalRevenue,
    totalProfit,
    totalUnits,
    revenueByCountry,
    topCars,
    profitByBrand,
    revenueByCity,
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};
