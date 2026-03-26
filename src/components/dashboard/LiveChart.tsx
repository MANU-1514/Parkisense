import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SensorReading } from '@/lib/types';

interface LiveChartProps {
  readings: SensorReading[];
  dataKey: keyof Pick<SensorReading, 'heartRate' | 'temperature' | 'tremorFrequency' | 'spo2'>;
  label: string;
  color: string;
  unit: string;
}

export function LiveChart({ readings, dataKey, label, color, unit }: LiveChartProps) {
  const data = readings.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }),
    value: r[dataKey],
  }));

  return (
    <div className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`chart-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: 'hsl(215 16% 47%)' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(215 16% 47%)' }}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 1', 'dataMax + 1']}
              width={35}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(0 0% 100%)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelStyle={{ fontFamily: 'JetBrains Mono', fontSize: '10px' }}
            />
            <Area
              type="stepAfter"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#chart-${dataKey})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
