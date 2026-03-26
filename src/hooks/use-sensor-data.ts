import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorReading, Alert, DeviceStatus, getSeverity, getHeartRateStatus } from '@/lib/types';
import { generateDemoReading } from '@/lib/demo-data';
import { getThingSpeakConfig } from '@/components/DatabaseSettingsDialog';

const MAX_READINGS = 60;
const DISCONNECT_TIMEOUT = 60000;
const DEMO_INTERVAL = 2000;
const THINGSPEAK_POLL_INTERVAL = 15000; // ThingSpeak free tier: 15s minimum

export function useSensorData() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({ connected: false, lastSeen: null });
  const [isDemo, setIsDemo] = useState(true);
  const demoInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const readingCounter = useRef(0);
  const lastEntryId = useRef<number>(0);

  const addReading = useCallback((data: Omit<SensorReading, 'id'>) => {
    readingCounter.current++;
    const reading: SensorReading = { ...data, id: `r-${readingCounter.current}` };

    setReadings(prev => {
      const next = [...prev, reading];
      return next.length > MAX_READINGS ? next.slice(-MAX_READINGS) : next;
    });

    setDeviceStatus({ connected: true, lastSeen: reading.timestamp });

    // Check alerts
    const severity = getSeverity(reading.tremorFrequency);
    if (severity.label === 'Severe') {
      setAlerts(prev => [{
        id: `a-${Date.now()}`,
        type: 'tremor' as const,
        message: `Severe tremor detected: ${reading.tremorFrequency} Hz`,
        severity: 'critical' as const,
        timestamp: reading.timestamp,
        acknowledged: false,
      }, ...prev].slice(0, 50));
    }

    const hrStatus = getHeartRateStatus(reading.heartRate);
    if (hrStatus === 'critical') {
      setAlerts(prev => [{
        id: `a-${Date.now()}-hr`,
        type: 'heartRate' as const,
        message: `Abnormal heart rate: ${reading.heartRate} BPM`,
        severity: 'critical' as const,
        timestamp: reading.timestamp,
        acknowledged: false,
      }, ...prev].slice(0, 50));
    }
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  }, []);

  // Demo data generator
  useEffect(() => {
    if (!isDemo) return;
    demoInterval.current = setInterval(() => {
      addReading(generateDemoReading());
    }, DEMO_INTERVAL);
    return () => { if (demoInterval.current) clearInterval(demoInterval.current); };
  }, [isDemo, addReading]);

  // Connection watchdog
  useEffect(() => {
    const watchdog = setInterval(() => {
      if (deviceStatus.lastSeen) {
        const elapsed = Date.now() - new Date(deviceStatus.lastSeen).getTime();
        if (elapsed > DISCONNECT_TIMEOUT) {
          setDeviceStatus(prev => ({ ...prev, connected: false }));
        }
      }
    }, 5000);
    return () => clearInterval(watchdog);
  }, [deviceStatus.lastSeen]);

  // Public method for real data injection
  const ingestRealData = useCallback((data: { heartRate: number; temperature: number; tremorFrequency: number; spo2: number }) => {
    if (isDemo) {
      setIsDemo(false);
      setReadings([]);
      if (demoInterval.current) clearInterval(demoInterval.current);
    }
    addReading({
      ...data,
      severity: getSeverity(data.tremorFrequency).label,
      timestamp: new Date().toISOString(),
    });
  }, [isDemo, addReading]);

  // ThingSpeak polling
  useEffect(() => {
    const config = getThingSpeakConfig();
    if (!config) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `https://api.thingspeak.com/channels/${config.channelId}/feeds/last.json?api_key=${config.readApiKey}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.entry_id || data.entry_id === lastEntryId.current) return;
        lastEntryId.current = data.entry_id;

        const heartRate = parseFloat(data.field1);
        const spo2 = parseFloat(data.field2);
        const temperature = parseFloat(data.field3);
        const tremorFrequency = parseFloat(data.field4);

        if (isNaN(heartRate) || isNaN(temperature) || isNaN(tremorFrequency)) return;

        ingestRealData({ heartRate, temperature, tremorFrequency, spo2: isNaN(spo2) ? 97 : spo2 });
      } catch (err) {
        console.error('ThingSpeak poll error:', err);
      }
    };

    poll();
    const interval = setInterval(poll, THINGSPEAK_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [ingestRealData]);

  const latestReading = readings[readings.length - 1] || null;

  return { readings, latestReading, alerts, deviceStatus, isDemo, acknowledgeAlert, ingestRealData };
}
