import { useEffect, useRef, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface VitalCardProps {
  label: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  chartData: { value: number }[];
  chartColor: string;
  lastUpdated?: string;
  status?: 'normal' | 'warning' | 'critical';
}

export function VitalCard({ label, value, unit, icon, color, chartData, chartColor, lastUpdated, status = 'normal' }: VitalCardProps) {
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setFlash(true);
      prevValue.current = value;
      const timer = setTimeout(() => setFlash(false), 150);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const statusBorder = status === 'critical' 
    ? 'shadow-[0_0_0_1px_rgba(225,29,72,0.3),0_4px_12px_rgba(225,29,72,0.1)]' 
    : status === 'warning'
    ? 'shadow-[0_0_0_1px_rgba(245,158,11,0.3),0_4px_12px_rgba(245,158,11,0.1)]'
    : 'shadow-[var(--shadow-card)]';

  return (
    <div className={`bg-card rounded-xl p-5 clinical-transition ${statusBorder} ${flash ? 'flash-update' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`${color} opacity-70`}>{icon}</div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        {lastUpdated && (
          <span className="font-mono text-[10px] text-muted-foreground/60 tabular-nums">
            {new Date(lastUpdated).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        
        <div className="w-[120px] h-[40px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
              <Area
                type="stepAfter"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={1.5}
                fill={`url(#grad-${label})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
