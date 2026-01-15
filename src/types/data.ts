export interface Dealer {
  DealerID: string;
  DealerName: string;
  City: string;
  Country: string;
}

export interface Model {
  ModelID: string;
  Brand: string;
  Model: string;
  Segment: string;
  EngineSize: number;
  Fuel: string;
  Price: number;
  Profit: number;
}

export interface Sale {
  SaleID: string;
  Date: Date;
  DealerID: string;
  ModelID: string;
  Quantity: number;
  TotalPrice: number;
  TotalProfit: number;
}

export interface DashboardData {
  dealers: Dealer[];
  models: Model[];
  sales: Sale[];
}

export interface Filters {
  country: string | null;
  city: string | null;
  brand: string | null;
  model: string | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface TrendData {
  value: number;
  positive: boolean;
}

export interface AggregatedData {
  totalRevenue: number;
  totalProfit: number;
  totalUnits: number;
  revenueTrend: TrendData | null;
  profitTrend: TrendData | null;
  unitsTrend: TrendData | null;
  revenueByCountry: { country: string; revenue: number; percentage: number }[];
  topCars: { model: string; brand: string; quantity: number }[];
  profitByBrand: { brand: string; profit: number; quantity: number }[];
  revenueByCity: { city: string; country: string; revenue: number }[];
}
