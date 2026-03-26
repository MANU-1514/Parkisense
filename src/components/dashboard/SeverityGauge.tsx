import { getSeverity } from '@/lib/types';

interface SeverityGaugeProps {
  hz: number;
  timestamp?: string;
}

export function SeverityGauge({ hz, timestamp }: SeverityGaugeProps) {
  const severity = getSeverity(hz);
  const percentage = Math.min((hz / 10) * 100, 100);

  return (
    <div className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] clinical-transition">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">Tremor Severity</span>
        {timestamp && (
          <span className="font-mono text-[10px] text-muted-foreground/60 tabular-nums">
            {new Date(timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className={`text-4xl font-bold tabular-nums ${severity.color}`}>
          {hz.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">Hz</span>
        <div className={`ml-auto px-3 py-1.5 rounded-lg text-sm font-semibold ${severity.bg} ${severity.color} ring-1 ${severity.ringColor}`}>
          {severity.label}
        </div>
      </div>

      {/* Segmented gauge bar */}
      <div className="flex gap-1 h-2.5 rounded-full overflow-hidden bg-muted">
        <div
          className="rounded-full clinical-transition"
          style={{
            width: `${Math.min(percentage, 30)}%`,
            backgroundColor: percentage > 0 ? 'hsl(160 84% 39%)' : undefined,
          }}
        />
        <div
          className="rounded-full clinical-transition"
          style={{
            width: `${Math.max(0, Math.min(percentage - 30, 30))}%`,
            backgroundColor: percentage > 30 ? 'hsl(38 92% 50%)' : undefined,
          }}
        />
        <div
          className="rounded-full clinical-transition"
          style={{
            width: `${Math.max(0, percentage - 60)}%`,
            backgroundColor: percentage > 60 ? 'hsl(343 81% 49%)' : undefined,
          }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-muted-foreground">0 Hz</span>
        <span className="text-[10px] text-muted-foreground">3 Hz</span>
        <span className="text-[10px] text-muted-foreground">6 Hz</span>
        <span className="text-[10px] text-muted-foreground">10 Hz</span>
      </div>
    </div>
  );
}
