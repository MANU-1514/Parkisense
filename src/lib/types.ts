export interface SensorReading {
  id: string;
  heartRate: number;
  temperature: number;
  tremorFrequency: number;
  spo2: number;
  severity: 'Mild' | 'Moderate' | 'Severe';
  timestamp: string;
}

export interface DeviceStatus {
  connected: boolean;
  lastSeen: string | null;
}

export interface Alert {
  id: string;
  type: 'tremor' | 'heartRate';
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
}

export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe';

export const getSeverity = (hz: number): { label: SeverityLevel; color: string; bg: string; ringColor: string } => {
  if (hz < 3) return { label: 'Mild', color: 'text-success', bg: 'bg-success/10', ringColor: 'ring-success/30' };
  if (hz <= 6) return { label: 'Moderate', color: 'text-warning', bg: 'bg-warning/10', ringColor: 'ring-warning/30' };
  return { label: 'Severe', color: 'text-destructive', bg: 'bg-destructive/10', ringColor: 'ring-destructive/30' };
};

export const getHeartRateStatus = (bpm: number) => {
  if (bpm < 50 || bpm > 120) return 'critical';
  if (bpm < 60 || bpm > 100) return 'warning';
  return 'normal';
};
