import { useState, useEffect } from 'react';
import { Database, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DatabaseSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'failed';

const STORAGE_KEY = 'neurosync-thingspeak-config';

interface ThingSpeakConfig {
  channelId: string;
  readApiKey: string;
  writeApiKey: string;
}

function loadConfig(): ThingSpeakConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { channelId: '', readApiKey: '', writeApiKey: '' };
}

export function getThingSpeakConfig(): ThingSpeakConfig | null {
  const config = loadConfig();
  if (config.channelId && config.readApiKey) return config;
  return null;
}

export function DatabaseSettingsDialog({ open, onOpenChange }: DatabaseSettingsDialogProps) {
  const [config, setConfig] = useState<ThingSpeakConfig>(loadConfig);
  const [status, setStatus] = useState<ConnectionStatus>('idle');

  useEffect(() => {
    if (open) {
      const saved = loadConfig();
      setConfig(saved);
      setStatus(saved.channelId && saved.readApiKey ? 'connected' : 'idle');
    }
  }, [open]);

  const handleTest = async () => {
    if (!config.channelId || !config.readApiKey) return;
    setStatus('testing');

    try {
      const res = await fetch(
        `https://api.thingspeak.com/channels/${config.channelId}/feeds/last.json?api_key=${config.readApiKey}`
      );
      setStatus(res.ok ? 'connected' : 'failed');
    } catch {
      setStatus('failed');
    }
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    onOpenChange(false);
  };

  const handleDisconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig({ channelId: '', readApiKey: '', writeApiKey: '' });
    setStatus('idle');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            ThingSpeak Connection
          </DialogTitle>
          <DialogDescription>
            Connect to your ThingSpeak channel to receive real-time sensor data from the IoT device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status indicator */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {status === 'idle' && <XCircle className="h-4 w-4 text-muted-foreground" />}
            {status === 'testing' && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
            {status === 'connected' && <CheckCircle2 className="h-4 w-4 text-success" />}
            {status === 'failed' && <XCircle className="h-4 w-4 text-destructive" />}
            <span className="text-sm font-medium">
              {status === 'idle' && 'Not connected'}
              {status === 'testing' && 'Testing connection…'}
              {status === 'connected' && 'Connected'}
              {status === 'failed' && 'Connection failed'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="channel-id" className="text-xs">Channel ID</Label>
              <Input
                id="channel-id"
                placeholder="e.g. 1234567"
                value={config.channelId}
                onChange={(e) => setConfig(prev => ({ ...prev, channelId: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="read-key" className="text-xs">Read API Key</Label>
              <Input
                id="read-key"
                type="password"
                placeholder="e.g. ABC123XYZ..."
                value={config.readApiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, readApiKey: e.target.value }))}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Found in ThingSpeak → Channel → API Keys → Read API Key.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="write-key" className="text-xs">Write API Key (optional)</Label>
              <Input
                id="write-key"
                type="password"
                placeholder="e.g. DEF456UVW..."
                value={config.writeApiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, writeApiKey: e.target.value }))}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Only needed if sending data from this dashboard. The NodeMCU uses its own Write API Key.</p>
            </div>
          </div>

          {/* Field mapping info */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-[11px] font-semibold text-foreground mb-1">Expected ThingSpeak Field Mapping</p>
            <ul className="text-[10px] text-muted-foreground space-y-0.5">
              <li><span className="font-mono text-foreground">field1</span> → Heart Rate (BPM)</li>
              <li><span className="font-mono text-foreground">field2</span> → Temperature (°C)</li>
              <li><span className="font-mono text-foreground">field3</span> → Tremor Frequency (Hz)</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {status === 'connected' && (
            <Button variant="outline" size="sm" onClick={handleDisconnect} className="mr-auto">
              Disconnect
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleTest} disabled={!config.channelId || !config.readApiKey || status === 'testing'}>
            Test Connection
          </Button>
          <Button size="sm" onClick={handleSave} disabled={status !== 'connected'}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
