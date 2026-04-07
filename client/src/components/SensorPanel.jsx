import { useSensor } from '../hooks/useSensor';
import { Wifi, WifiOff } from 'lucide-react';
import './SensorPanel.css';

export default function SensorPanel({ compact = false }) {
  const { mq2Ppm, temperature, humidity, connected, timestamp } = useSensor();

  const mq2Color  = mq2Ppm < 20 ? '#16a34a' : mq2Ppm < 50 ? '#d97706' : '#dc2626';
  const tempColor = temperature < 15 ? '#3b82f6' : temperature < 30 ? '#16a34a' : '#dc2626';
  const humidColor = humidity < 40 ? '#d97706' : humidity < 75 ? '#16a34a' : '#3b82f6';

  const lastUpdate = timestamp
    ? new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  return (
    <div className="sensor-panel card">
      <div className="sensor-panel__header">
        <span className="sensor-panel__title">Live Sensor Data</span>
        <div className={`sensor-status ${connected ? 'sensor-status--live' : 'sensor-status--off'}`}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? 'Live' : 'Offline'}
        </div>
      </div>

      <div className="sensor-panel__rows">
        <SensorRow label="Gas (MQ-2)" value={`${mq2Ppm.toFixed(1)} ppm`} pct={Math.min((mq2Ppm/200)*100,100)} color={mq2Color} emoji="💨" />
        <SensorRow label="Temperature" value={`${temperature.toFixed(1)} °C`} pct={Math.min((temperature/50)*100,100)} color={tempColor} emoji="🌡️" />
        <SensorRow label="Humidity"    value={`${humidity.toFixed(0)} %`}    pct={humidity}                            color={humidColor} emoji="💧" />
      </div>

      <p className="sensor-panel__ts">Last update: {lastUpdate}</p>
    </div>
  );
}

function SensorRow({ label, value, pct, color, emoji }) {
  return (
    <div className="sensor-row">
      <div className="sensor-row__left">
        <span className="sensor-row__emoji">{emoji}</span>
        <div>
          <div className="sensor-row__label">{label}</div>
          <div className="sensor-row__value" style={{ color }}>{value}</div>
        </div>
      </div>
      <div className="sensor-row__bar-wrap">
        <div className="sensor-row__bar-track">
          <div className="sensor-row__bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="sensor-row__pct" style={{ color }}>{Math.round(pct)}%</span>
      </div>
    </div>
  );
}
