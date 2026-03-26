import { AlertTriangle, Heart, Check } from 'lucide-react';
import { Alert } from '@/lib/types';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}

export function AlertPanel({ alerts, onAcknowledge }: AlertPanelProps) {
  const unacknowledged = alerts.filter(a => !a.acknowledged);
  const recent = alerts.slice(0, 10);

  return (
    <div className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Alert Monitor</h3>
        {unacknowledged.length > 0 && (
          <span className="px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-xs font-semibold tabular-nums">
            {unacknowledged.length} active
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No alerts recorded</p>
        ) : (
          recent.map(alert => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg clinical-transition ${
                alert.acknowledged 
                  ? 'bg-muted/50 opacity-60' 
                  : alert.severity === 'critical' 
                    ? 'bg-destructive/5 ring-1 ring-destructive/15' 
                    : 'bg-warning/5 ring-1 ring-warning/15'
              }`}
            >
              {alert.type === 'tremor' ? (
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              ) : (
                <Heart className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{alert.message}</p>
                <p className="font-mono text-[10px] text-muted-foreground tabular-nums mt-0.5">
                  {new Date(alert.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                </p>
              </div>
              {!alert.acknowledged && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="shrink-0 p-1 rounded-md hover:bg-muted clinical-transition"
                  title="Acknowledge"
                >
                  <Check className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
