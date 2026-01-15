import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export const ChartCard = ({
  title,
  subtitle,
  children,
  className,
  action,
}: ChartCardProps) => {
  return (
    <div className={cn('chart-card flex flex-col', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold font-display text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
};
