import { useState } from 'react';
import { DashboardData } from '@/types/data';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { Dashboard } from '@/components/dashboard/Dashboard';

const Index = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  
  const handleDataLoaded = (loadedData: DashboardData) => {
    setData(loadedData);
  };
  
  const handleReset = () => {
    setData(null);
  };
  
  if (!data) {
    return <FileUpload onDataLoaded={handleDataLoaded} />;
  }
  
  return <Dashboard data={data} onReset={handleReset} />;
};

export default Index;
