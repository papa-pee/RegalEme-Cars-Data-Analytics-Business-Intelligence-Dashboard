import { useMemo } from 'react';
import { format } from 'date-fns';
import { Filter, X, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardData, Filters } from '@/types/data';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface FilterPanelProps {
  data: DashboardData;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export const FilterPanel = ({ data, filters, onFiltersChange }: FilterPanelProps) => {
  const countries = useMemo(() => 
    [...new Set(data.dealers.map(d => d.Country))].sort(),
    [data.dealers]
  );
  
  const cities = useMemo(() => {
    let dealersList = data.dealers;
    if (filters.country) {
      dealersList = dealersList.filter(d => d.Country === filters.country);
    }
    return [...new Set(dealersList.map(d => d.City))].sort();
  }, [data.dealers, filters.country]);
  
  const brands = useMemo(() => 
    [...new Set(data.models.map(m => m.Brand))].sort(),
    [data.models]
  );
  
  const models = useMemo(() => {
    let modelsList = data.models;
    if (filters.brand) {
      modelsList = modelsList.filter(m => m.Brand === filters.brand);
    }
    return [...new Set(modelsList.map(m => m.Model))].sort();
  }, [data.models, filters.brand]);
  
  const hasActiveFilters = filters.country || filters.city || filters.brand || 
    filters.model || filters.dateRange.start || filters.dateRange.end;
  
  const clearFilters = () => {
    onFiltersChange({
      country: null,
      city: null,
      brand: null,
      model: null,
      dateRange: { start: null, end: null },
    });
  };
  
  const updateFilter = (key: keyof Omit<Filters, 'dateRange'>, value: string | null) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset dependent filters
    if (key === 'country') {
      newFilters.city = null;
    }
    if (key === 'brand') {
      newFilters.model = null;
    }
    
    onFiltersChange(newFilters);
  };

  const dateRange: DateRange | undefined = filters.dateRange.start || filters.dateRange.end
    ? {
        from: filters.dateRange.start || undefined,
        to: filters.dateRange.end || undefined,
      }
    : undefined;

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        start: range?.from || null,
        end: range?.to || null,
      },
    });
  };
  
  return (
    <div className="filter-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="w-4 h-4 text-gold" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground h-8 px-2"
          >
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.country || 'all'}
          onValueChange={(v) => updateFilter('country', v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[140px] bg-navy border-border/50 text-sm">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent className="bg-navy-light border-border/50">
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map(country => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.city || 'all'}
          onValueChange={(v) => updateFilter('city', v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[140px] bg-navy border-border/50 text-sm">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent className="bg-navy-light border-border/50">
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.brand || 'all'}
          onValueChange={(v) => updateFilter('brand', v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[140px] bg-navy border-border/50 text-sm">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent className="bg-navy-light border-border/50">
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map(brand => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.model || 'all'}
          onValueChange={(v) => updateFilter('model', v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[160px] bg-navy border-border/50 text-sm">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent className="bg-navy-light border-border/50">
            <SelectItem value="all">All Models</SelectItem>
            {models.map(model => (
              <SelectItem key={model} value={model}>{model}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[260px] justify-start text-left font-normal bg-navy border-border/50 text-sm",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Select date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 bg-navy-light border-border/50" 
            align="start"
          >
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
