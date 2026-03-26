import { Wifi, WifiOff } from 'lucide-react';
import { DeviceStatus } from '@/lib/types';

interface DeviceStatusBadgeProps {
  status: DeviceStatus;
  isDemo: boolean;
}

export function DeviceStatusBadge({ status, isDemo }: DeviceStatusBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      {isDemo && (
        <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
          DEMO
        </span>
      )}
      <div className="flex items-center gap-2">
        {status.connected ? (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
            </span>
            <Wifi className="h-3.5 w-3.5 text-success" />
            <span className="text-xs font-medium text-success">Node-01: Active</span>
          </>
        ) : (
          <>
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Node-01: Disconnected</span>
          </>
        )}
      </div>
      {status.lastSeen && (
        <span className="font-mono text-[10px] text-muted-foreground/50 tabular-nums">
          Last: {new Date(status.lastSeen).toLocaleTimeString('en-US', { hour12: false })}
        </span>
      )}
    </div>
  );
}
