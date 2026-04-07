import { useState, useEffect } from 'react';
import { Cpu, Wifi, WifiOff, RefreshCcw, ShieldCheck, Activity } from 'lucide-react';
import { useSensor } from '../hooks/useSensor';
import toast from 'react-hot-toast';
import './DeviceManager.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function DeviceManager() {
   const sensor = useSensor();
   const [isToggling, setIsToggling] = useState(false);

   const handleToggle = async () => {
      setIsToggling(true);
      try {
         const res = await fetch(`${API_BASE}/api/sensor/toggle`, {
            method: 'POST',
         });
         const data = await res.json();
         if (data.success) {
            toast.success(`Arduino ${data.isArduinoEnabled ? 'Connected' : 'Disconnected'} Successfully`);
         }
      } catch (err) {
         toast.error('Failed to toggle device connection');
      } finally {
         setIsToggling(false);
      }
   };

   return (
      <div className="device-manager animate-fade-in">
         <header className="device-manager__header">
            <h1 className="device-manager__title">Device Management</h1>
            <p className="device-manager__subtitle">Control and monitor your sensing hardware array.</p>
         </header>

         <div className="device-grid">
            {/* Main Control Card */}
            <div className="device-card device-card--main">
               <div className="device-card__body">
                  <div className="device-info">
                     <div className="device-icon">
                        <Cpu size={24} />
                     </div>
                     <div className="device-details">
                        <h2 className="device-name">Arduino Controller (v1.0.4)</h2>
                        <p className="device-meta">ESP8266 Module • Primary Sensor Bridge</p>
                     </div>
                     <div className={`device-status-badge ${sensor.arduinoEnabled && sensor.arduinoConnected ? 'active' : 'standby'}`}>
                        {!sensor.arduinoEnabled ? 'DISABLED' : sensor.arduinoConnected ? 'ACTIVE' : (
                           <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div className="spinner-xs" style={{ borderLeftColor: '#92400e' }} />
                              SEARCHING
                           </span>
                        )}
                     </div>
                  </div>

                  <div className="device-control">
                     <div className="control-text">
                        <div className="control-label">Sensor Transmission</div>
                        <div className="control-desc">
                           {!sensor.arduinoEnabled
                              ? 'System is currently ignoring incoming signals from this device.'
                              : (sensor.arduinoConnected ? 'Server is actively accepting and processing data from this device.' : 'Waiting for device to send initial data packet...')}
                        </div>
                     </div>
                     <button
                        className={`toggle-switch ${sensor.arduinoEnabled ? 'toggle-switch--on' : ''}`}
                        onClick={handleToggle}
                        disabled={isToggling}
                     >
                        <div className="toggle-slider"></div>
                     </button>
                  </div>
               </div>

               <div className="device-card__footer">
                  <div className="footer-item">
                     <Activity size={14} />
                     <span>Last Signal: {sensor.timestamp ? new Date(sensor.timestamp).toLocaleTimeString() : 'Never'}</span>
                  </div>
                  <div className="footer-item">
                     <RefreshCcw size={14} className={isToggling ? 'spinning' : ''} />
                     <span>Auto-polling every 5s</span>
                  </div>
               </div>
            </div>

            {/* Status Breakdown Card */}
            <div className="device-card">
               <div className="device-card__title">
                  <ShieldCheck size={18} color="var(--primary)" />
                  <span>Connectivity Logs</span>
               </div>

               <div className="status-list">
                  <div className="status-item">
                     <div className="status-item__label">Socket.io Tunnel</div>
                     <div className={`status-item__value ${sensor.socketConnected ? 'text-success' : 'text-danger'}`}>
                        {sensor.socketConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                        {sensor.socketConnected ? 'Operational' : 'Lost'}
                     </div>
                  </div>
                  <div className="status-item">
                     <div className="status-item__label">Arduino Heartbeat</div>
                     <div className={`status-item__value ${sensor.arduinoEnabled && sensor.arduinoConnected ? 'text-success' : 'text-danger'}`}>
                        {sensor.arduinoEnabled && sensor.arduinoConnected ? 'Receiving' : 'Not Detected'}
                     </div>
                  </div>
                  <div className="status-item">
                     <div className="status-item__label">API Endpoint</div>
                     <div className="status-item__value text-success">Healthy</div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
