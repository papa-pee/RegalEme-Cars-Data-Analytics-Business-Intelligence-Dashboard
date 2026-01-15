import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; positive: boolean };
  variant?: 'gold' | 'blue' | 'cyan' | 'violet';
  className?: string;
}

const variantStyles = {
  gold: {
    iconBg: 'bg-gold/10',
    iconColor: 'text-gold',
    valueClass: 'kpi-value',
  },
  blue: {
    iconBg: 'bg-royal/10',
    iconColor: 'text-royal-light',
    valueClass: 'text-royal-light text-3xl font-bold',
  },
  cyan: {
    iconBg: 'bg-cyan/10',
    iconColor: 'text-cyan',
    valueClass: 'text-cyan text-3xl font-bold',
  },
  violet: {
    iconBg: 'bg-violet/10',
    iconColor: 'text-violet-light',
    valueClass: 'text-violet-light text-3xl font-bold',
  },
};

export const KPICard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'gold',
  className,
}: KPICardProps) => {
  const styles = variantStyles[variant];
  
  return (
    <div className={cn('kpi-card group transition-all duration-300 hover:scale-[1.02]', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className={cn(styles.valueClass, 'transition-all duration-300')}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend.positive ? 'text-emerald-400' : 'text-red-400'
            )}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'p-3 rounded-xl transition-all duration-300',
            styles.iconBg,
            styles.iconColor,
            'group-hover:scale-110'
          )}>
            {icon}
          </div>
        )}
      </div>
      
      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};
