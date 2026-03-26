import { SensorReading, getSeverity } from './types';

let counter = 0;

export const generateDemoReading = (): Omit<SensorReading, 'id'> => {
  counter++;
  const t = counter * 0.3;
  
  const heartRate = Math.round(72 + Math.sin(t * 0.5) * 8 + (Math.random() - 0.5) * 6);
  const temperature = parseFloat((36.2 + Math.sin(t * 0.2) * 0.4 + (Math.random() - 0.5) * 0.2).toFixed(1));
  const spo2 = Math.round(96 + Math.sin(t * 0.3) * 2 + (Math.random() - 0.5) * 2);
  
  // Create varied tremor patterns including occasional spikes
  let tremorFrequency: number;
  if (Math.random() < 0.05) {
    tremorFrequency = parseFloat((6.5 + Math.random() * 2).toFixed(1)); // severe spike
  } else if (Math.random() < 0.2) {
    tremorFrequency = parseFloat((3.5 + Math.random() * 2.5).toFixed(1)); // moderate
  } else {
    tremorFrequency = parseFloat((1.5 + Math.random() * 1.5).toFixed(1)); // mild
  }

  const severity = getSeverity(tremorFrequency).label;

  return {
    heartRate,
    temperature,
    tremorFrequency,
    spo2: Math.min(100, Math.max(88, spo2)),
    severity,
    timestamp: new Date().toISOString(),
  };
};

export const generateHistoricalData = (count: number = 100): SensorReading[] => {
  const data: SensorReading[] = [];
  const now = Date.now();
  
  for (let i = count; i >= 0; i--) {
    const t = i * 0.5;
    const heartRate = Math.round(72 + Math.sin(t * 0.3) * 10 + (Math.random() - 0.5) * 8);
    const temperature = parseFloat((36.3 + Math.sin(t * 0.15) * 0.3 + (Math.random() - 0.5) * 0.2).toFixed(1));
    const spo2 = Math.min(100, Math.max(88, Math.round(96 + Math.sin(t * 0.25) * 2 + (Math.random() - 0.5) * 2)));
    let tremorFrequency: number;
    if (Math.random() < 0.08) {
      tremorFrequency = parseFloat((6.2 + Math.random() * 2.5).toFixed(1));
    } else if (Math.random() < 0.25) {
      tremorFrequency = parseFloat((3 + Math.random() * 3).toFixed(1));
    } else {
      tremorFrequency = parseFloat((1 + Math.random() * 2).toFixed(1));
    }
    
    data.push({
      id: `hist-${i}`,
      heartRate,
      temperature,
      tremorFrequency,
      spo2,
      severity: getSeverity(tremorFrequency).label,
      timestamp: new Date(now - i * 60000).toISOString(),
    });
  }
  
  return data;
};
