import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseExcelFile } from '@/lib/dataProcessing';
import { DashboardData } from '@/types/data';

interface FileUploadProps {
  onDataLoaded: (data: DashboardData) => void;
}

export const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setFileName(file.name);
    
    try {
      const data = await parseExcelFile(file);
      onDataLoaded(data);
    } catch (err) {
      setError('Failed to parse Excel file. Please check the format.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [onDataLoaded]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-2xl">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="text-regal-green green-glow">RegalEme</span>
            <span className="text-foreground"> Cars</span>
          </h1>
          <p className="text-muted-foreground text-lg">Sales & Market Performance Dashboard</p>
        </div>
        
        {/* Upload Zone */}
        <label
          htmlFor="file-upload"
          className={cn(
            'upload-zone flex flex-col items-center justify-center cursor-pointer',
            isDragging && 'border-regal-green/50 bg-regal-green/5',
            isLoading && 'pointer-events-none opacity-75'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleInputChange}
            disabled={isLoading}
          />
          
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-regal-green/30 border-t-regal-green animate-spin" />
              <p className="text-muted-foreground">Processing {fileName}...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 text-destructive">
              <AlertCircle className="w-16 h-16" />
              <p>{error}</p>
              <p className="text-sm text-muted-foreground">Click or drag to try again</p>
            </div>
          ) : fileName ? (
            <div className="flex flex-col items-center gap-4 text-emerald-400">
              <CheckCircle className="w-16 h-16" />
              <p>Successfully loaded {fileName}</p>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-regal-green/20 rounded-full blur-xl animate-pulse" />
                <div className="relative p-6 bg-navy-light rounded-full border border-regal-green/20">
                  <Upload className="w-12 h-12 text-regal-green" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground">
                  Drop your Excel file here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Supports .xlsx and .xls files</span>
              </div>
            </>
          )}
        </label>
        
        {/* Expected Format Info */}
        <div className="mt-8 p-6 rounded-xl bg-muted/50 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-3">Expected Excel Format</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-regal-green font-medium mb-1">Sheet 1: dealers</p>
              <p className="text-muted-foreground text-xs">DealerID, DealerName, City, Country</p>
            </div>
            <div>
              <p className="text-burgundy-light font-medium mb-1">Sheet 2: models</p>
              <p className="text-muted-foreground text-xs">ModelID, Brand, Model, Segment, etc.</p>
            </div>
            <div>
              <p className="text-foreground font-medium mb-1">Sheet 3: sales</p>
              <p className="text-muted-foreground text-xs">SaleID, Date, DealerID, ModelID, etc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};