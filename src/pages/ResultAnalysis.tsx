import { useSensorData } from '@/hooks/use-sensor-data';
import { getSeverity } from '@/lib/types';
import { Heart, Thermometer, Activity, Droplets } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AnalysisResult {
  parameter: string;
  icon: React.ReactNode;
  currentValue: string;
  normalRange: string;
  status: 'normal' | 'abnormal';
  remark: string;
  percentage: number;
}

interface OverallStatusProps {
  totalParams: number;
  abnormalCount: number;
}

const computePercentage = (value: number, min: number, max: number) => {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
};

const ParameterCard = ({ parameter, icon, currentValue, normalRange, status, remark, percentage }: AnalysisResult) => {
  const isAbnormal = status === 'abnormal';

  return (
    <Card className={isAbnormal ? 'border-destructive/40 bg-destructive/5 transition-all' : 'border-border/50 transition-all'}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-foreground">
            <span className="text-primary">{icon}</span>
            <span className="text-sm font-semibold">{parameter}</span>
          </div>
          <Badge variant={isAbnormal ? 'destructive' : 'secondary'} className="text-xs">
            {isAbnormal ? 'Abnormal' : 'Normal'}
          </Badge>
        </div>

        <div className="text-2xl font-bold text-foreground">{currentValue}</div>
        <Progress value={percentage} className="h-2" />
        <div className="text-xs text-muted-foreground">Range: {normalRange}</div>
        <p className={isAbnormal ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>{remark}</p>
      </CardContent>
    </Card>
  );
};

const OverallStatus = ({ totalParams, abnormalCount }: OverallStatusProps) => {
  const normalCount = totalParams - abnormalCount;
  const score = totalParams === 0 ? 0 : Math.round((normalCount / totalParams) * 100);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor = score >= 75 ? 'hsl(var(--primary))' : score >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
  const label = score >= 75 ? 'Good' : score >= 50 ? 'Fair' : 'Poor';

  return (
    <Card className="border-border/50">
      <CardContent className="flex items-center gap-6 p-6">
        <div className="relative h-24 w-24 flex-shrink-0">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={strokeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-foreground">{score}%</span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Overall Health: <span style={{ color: strokeColor }}>{label}</span></h2>
          <p className="text-sm text-muted-foreground">{normalCount} of {totalParams} parameters within normal range</p>
          {abnormalCount > 0 ? (
            <p className="text-xs text-destructive">{abnormalCount} parameter(s) require attention</p>
          ) : (
            <p className="text-xs text-primary">All parameters are within normal range</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const analyzeReadings = (reading: { heartRate: number; temperature: number; tremorFrequency: number; spo2: number } | null): AnalysisResult[] => {
  if (!reading) {
    return [
      { parameter: 'Wrist Temperature', icon: <Thermometer className="h-5 w-5" />, currentValue: '--', normalRange: '≥ 32.8 °C', status: 'normal', remark: 'No data', percentage: 0 },
      { parameter: 'Heart Rate', icon: <Heart className="h-5 w-5" />, currentValue: '--', normalRange: '60 – 100 BPM', status: 'normal', remark: 'No data', percentage: 0 },
      { parameter: 'SpO₂', icon: <Droplets className="h-5 w-5" />, currentValue: '--', normalRange: '≥ 94%', status: 'normal', remark: 'No data', percentage: 0 },
      { parameter: 'Tremor Frequency', icon: <Activity className="h-5 w-5" />, currentValue: '--', normalRange: '0 – 3 Hz (Normal)', status: 'normal', remark: 'No data', percentage: 0 },
    ];
  }

  const tempAbnormal = reading.temperature < 32.8;
  const hrAbnormal = reading.heartRate < 60 || reading.heartRate > 100;
  const spo2Abnormal = reading.spo2 <= 93;
  const tremorSeverity = getSeverity(reading.tremorFrequency);
  const tremorAbnormal = reading.tremorFrequency >= 4;

  return [
    {
      parameter: 'Wrist Temperature',
      icon: <Thermometer className="h-5 w-5" />,
      currentValue: `${reading.temperature} °C`,
      normalRange: '≥ 32.8 °C',
      status: tempAbnormal ? 'abnormal' : 'normal',
      remark: tempAbnormal ? 'Below 32.8 °C — Abnormal' : 'Within normal range',
      percentage: computePercentage(reading.temperature, 28, 42),
    },
    {
      parameter: 'Heart Rate',
      icon: <Heart className="h-5 w-5" />,
      currentValue: `${reading.heartRate} BPM`,
      normalRange: '60 – 100 BPM',
      status: hrAbnormal ? 'abnormal' : 'normal',
      remark: hrAbnormal ? (reading.heartRate < 60 ? 'Below 60 BPM — Bradycardia' : 'Above 100 BPM — Tachycardia') : 'Within normal range',
      percentage: computePercentage(reading.heartRate, 40, 140),
    },
    {
      parameter: 'SpO₂',
      icon: <Droplets className="h-5 w-5" />,
      currentValue: `${reading.spo2}%`,
      normalRange: '≥ 94%',
      status: spo2Abnormal ? 'abnormal' : 'normal',
      remark: spo2Abnormal ? `${reading.spo2}% — Low oxygen saturation` : 'Within normal range',
      percentage: computePercentage(reading.spo2, 85, 100),
    },
    {
      parameter: 'Tremor Frequency',
      icon: <Activity className="h-5 w-5" />,
      currentValue: `${reading.tremorFrequency} Hz`,
      normalRange: '0 – 3 Hz (Normal), 4 – 6 Hz (Parkinson\'s)',
      status: tremorAbnormal ? 'abnormal' : 'normal',
      remark: tremorAbnormal ? `${reading.tremorFrequency} Hz — ${tremorSeverity.label} (Parkinson's Tremor range)` : `${reading.tremorFrequency} Hz — Normal tremor`,
      percentage: computePercentage(reading.tremorFrequency, 0, 8),
    },
  ];
};

const ResultAnalysis = () => {
  const { latestReading, isDemo } = useSensorData();
  const results = analyzeReadings(latestReading);
  const abnormalCount = results.filter((result) => result.status === 'abnormal').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-card via-card to-primary/5 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Result Analysis</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isDemo ? 'Analyzing demo readings' : 'Analyzing live sensor readings'}
          </p>
        </div>
        {latestReading ? (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {new Date(latestReading.timestamp).toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        <OverallStatus totalParams={results.length} abnormalCount={abnormalCount} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {results.map((result) => (
            <ParameterCard key={result.parameter} {...result} />
          ))}
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Clinical Reference Ranges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider">Parameter</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Range Tested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Wrist Temperature</TableCell>
                  <TableCell className="text-muted-foreground">Below 32.8 °C — Abnormal</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Heart Rate</TableCell>
                  <TableCell className="text-muted-foreground">60 – 100 BPM (normal), &gt;100 or &lt;60 (abnormal)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SpO₂</TableCell>
                  <TableCell className="text-muted-foreground">≤ 93% abnormal</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tremor (Normal)</TableCell>
                  <TableCell className="text-muted-foreground">0 – 3 Hz</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tremor (Parkinson's)</TableCell>
                  <TableCell className="text-muted-foreground">4 – 6 Hz</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultAnalysis;
