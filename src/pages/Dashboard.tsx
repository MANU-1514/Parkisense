import { Heart, Thermometer, Activity, Droplets } from 'lucide-react';
import { useSensorData } from '@/hooks/use-sensor-data';
import { VitalCard } from '@/components/dashboard/VitalCard';
import { SeverityGauge } from '@/components/dashboard/SeverityGauge';
import { DeviceStatusBadge } from '@/components/dashboard/DeviceStatusBadge';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { LiveChart } from '@/components/dashboard/LiveChart';
import { getHeartRateStatus } from '@/lib/types';

const Dashboard = () => {
  const { readings, latestReading, alerts, deviceStatus, isDemo, acknowledgeAlert } = useSensorData();

  const bpmHistory = readings.map(r => ({ value: r.heartRate }));
  const tempHistory = readings.map(r => ({ value: r.temperature }));
  const tremorHistory = readings.map(r => ({ value: r.tremorFrequency }));
  const spo2History = readings.map(r => ({ value: r.spo2 }));

  return (
    <div className="bg-background">
      {/* Sub-header */}
      <div className="border-b border-border bg-card/50 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Patient Telemetry: Live Stream</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Parkinson's Disease Monitoring</p>
        </div>
        <DeviceStatusBadge status={deviceStatus} isDemo={isDemo} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Vital Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <VitalCard
            label="Heart Rate"
            value={latestReading?.heartRate ?? '--'}
            unit="BPM"
            icon={<Heart className="h-4 w-4" />}
            color="text-destructive"
            chartData={bpmHistory}
            chartColor="hsl(343 81% 49%)"
            lastUpdated={latestReading?.timestamp}
            status={latestReading ? getHeartRateStatus(latestReading.heartRate) : 'normal'}
          />
          <VitalCard
            label="SpO₂"
            value={latestReading?.spo2 ?? '--'}
            unit="%"
            icon={<Droplets className="h-4 w-4" />}
            color="text-primary"
            chartData={spo2History}
            chartColor="hsl(199 89% 48%)"
            lastUpdated={latestReading?.timestamp}
            status={latestReading ? (latestReading.spo2 < 90 ? 'critical' : latestReading.spo2 < 94 ? 'warning' : 'normal') : 'normal'}
          />
          <VitalCard
            label="Wrist Temperature"
            value={latestReading?.temperature ?? '--'}
            unit="°C"
            icon={<Thermometer className="h-4 w-4" />}
            color="text-accent-foreground"
            chartData={tempHistory}
            chartColor="hsl(262 83% 58%)"
            lastUpdated={latestReading?.timestamp}
          />
          <VitalCard
            label="Tremor Frequency"
            value={latestReading?.tremorFrequency ?? '--'}
            unit="Hz"
            icon={<Activity className="h-4 w-4" />}
            color="text-warning"
            chartData={tremorHistory}
            chartColor="hsl(38 92% 50%)"
            lastUpdated={latestReading?.timestamp}
          />
        </div>

        {/* Severity + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SeverityGauge hz={latestReading?.tremorFrequency ?? 0} timestamp={latestReading?.timestamp} />
          </div>
          <AlertPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
        </div>

        {/* Live Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          <LiveChart readings={readings} dataKey="heartRate" label="Heart Rate Trend" color="hsl(343 81% 49%)" unit="BPM" />
          <LiveChart readings={readings} dataKey="spo2" label="SpO₂ Trend" color="hsl(199 89% 48%)" unit="%" />
          <LiveChart readings={readings} dataKey="temperature" label="Temperature Trend" color="hsl(262 83% 58%)" unit="°C" />
          <LiveChart readings={readings} dataKey="tremorFrequency" label="Tremor Frequency Trend" color="hsl(38 92% 50%)" unit="Hz" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
