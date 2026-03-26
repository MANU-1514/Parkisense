import { useState, useMemo, useCallback, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { generateHistoricalData } from '@/lib/demo-data';
import { getSeverity, SensorReading } from '@/lib/types';
import { getThingSpeakConfig } from '@/components/DatabaseSettingsDialog';
import { Button } from '@/components/ui/button';

const History = () => {
  const config = getThingSpeakConfig();
  const isConnected = !!config;
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h');
  const [thingSpeakData, setThingSpeakData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(false);

  const demoData = useMemo(() => (isConnected ? [] : generateHistoricalData(200)), [isConnected]);

  const fetchThingSpeakHistory = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.thingspeak.com/channels/${config.channelId}/feeds.json?api_key=${config.readApiKey}&results=200`
      );
      if (!res.ok) return;
      const json = await res.json();
      const feeds = json.feeds || [];
      const readings: SensorReading[] = feeds
        .map((f: any, i: number) => {
          const heartRate = parseFloat(f.field1);
          const spo2 = parseFloat(f.field2);
          const temperature = parseFloat(f.field3);
          const tremorFrequency = parseFloat(f.field4);
          if (isNaN(heartRate) || isNaN(temperature) || isNaN(tremorFrequency)) return null;
          return {
            id: `ts-${f.entry_id || i}`,
            heartRate,
            temperature,
            tremorFrequency,
            spo2: isNaN(spo2) ? 97 : spo2,
            severity: getSeverity(tremorFrequency).label,
            timestamp: f.created_at,
          };
        })
        .filter(Boolean) as SensorReading[];
      setThingSpeakData(readings);
    } catch (err) {
      console.error('ThingSpeak history fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    if (isConnected) fetchThingSpeakHistory();
  }, [isConnected, fetchThingSpeakHistory]);

  const allData = isConnected ? thingSpeakData : demoData;

  const filtered = useMemo(() => {
    const now = Date.now();
    const ranges = { '1h': 3600000, '6h': 21600000, '24h': 86400000 };
    return allData.filter(r => now - new Date(r.timestamp).getTime() < ranges[timeRange]);
  }, [allData, timeRange]);

  const chartData = filtered.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString('en-US', { hour12: false, minute: '2-digit' }),
    heartRate: r.heartRate,
    spo2: r.spo2,
    tremorFrequency: r.tremorFrequency,
    temperature: r.temperature,
  }));

  return (
    <div className="bg-background">
      {/* Sub-header */}
      <div className="border-b border-border bg-card/50 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Historical Data</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isConnected ? 'ThingSpeak channel readings' : 'Demo sensor readings archive'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchThingSpeakHistory}
            disabled={loading || !isConnected}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
            {(['1h', '6h', '24h'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium clinical-transition ${
                  timeRange === range ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Historical Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HistoryChart data={chartData} dataKey="heartRate" label="Heart Rate" color="hsl(343 81% 49%)" unit="BPM" />
          <HistoryChart data={chartData} dataKey="spo2" label="SpO₂" color="hsl(199 89% 48%)" unit="%" />
          <HistoryChart data={chartData} dataKey="tremorFrequency" label="Tremor Frequency" color="hsl(38 92% 50%)" unit="Hz" />
          <HistoryChart data={chartData} dataKey="temperature" label="Temperature" color="hsl(262 83% 58%)" unit="°C" />
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Readings Log</h3>
            <span className="text-xs text-muted-foreground tabular-nums">{filtered.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-[11px] font-medium text-muted-foreground px-5 py-2.5">Timestamp</th>
                  <th className="text-right text-[11px] font-medium text-muted-foreground px-5 py-2.5">BPM</th>
                  <th className="text-right text-[11px] font-medium text-muted-foreground px-5 py-2.5">SpO₂ %</th>
                  <th className="text-right text-[11px] font-medium text-muted-foreground px-5 py-2.5">Temp °C</th>
                  <th className="text-right text-[11px] font-medium text-muted-foreground px-5 py-2.5">Tremor Hz</th>
                  <th className="text-center text-[11px] font-medium text-muted-foreground px-5 py-2.5">Severity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((row) => {
                  const sev = getSeverity(row.tremorFrequency);
                  return (
                    <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20 clinical-transition">
                      <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground tabular-nums">
                        {new Date(row.timestamp).toLocaleString('en-US', { hour12: false })}
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono text-xs tabular-nums">{row.heartRate}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-xs tabular-nums">{row.spo2}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-xs tabular-nums">{row.temperature}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-xs tabular-nums">{row.tremorFrequency}</td>
                      <td className="px-5 py-2.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${sev.bg} ${sev.color}`}>
                          {sev.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

function HistoryChart({ data, dataKey, label, color, unit }: { data: any[]; dataKey: string; label: string; color: string; unit: string }) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`hist-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215 16% 47%)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215 16% 47%)' }} tickLine={false} axisLine={false} width={35} domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip contentStyle={{ background: 'hsl(0 0% 100%)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
            <Area type="stepAfter" dataKey={dataKey} stroke={color} strokeWidth={1.5} fill={`url(#hist-${dataKey})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default History;
