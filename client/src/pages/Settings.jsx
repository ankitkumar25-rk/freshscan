import { useState, useEffect } from 'react';
import { Bell, Shield, Radio, Moon, Sun, Monitor, Globe, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import './Settings.css';

const DEFAULT_SETTINGS = {
    emailNotifications: true,
    pushNotifications: true,
    scanAlerts: true,
    autoSave: true
};

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  
  // Notification States (stored in localStorage for now as per plan)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('fs_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('fs_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePurgeCache = () => {
    if (window.confirm("Clean up your local app cache? This will reset your notifications and preferences to default.")) {
        localStorage.removeItem('fs_settings');
        setSettings(DEFAULT_SETTINGS);
        toast.success("App cache cleared successfully!");
    }
  };

  return (
    <div className="settings animate-fade-in">
      <header className="settings__header">
        <h1 className="settings__title">System Settings</h1>
        <p className="settings__subtitle">Configure your application preferences and monitor connectivity.</p>
      </header>

      <div className="settings-grid">
        
        {/* Appearance Section */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div className="settings-card__title">
              <Monitor size={18} color="var(--primary)" />
              <span>Appearance</span>
            </div>
          </div>
          
          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Interface Theme</span>
              <span className="settings-row__desc">Choose between light and dark visual modes.</span>
            </div>
            <button 
                className="theme-toggle" 
                onClick={toggleTheme}
                style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                }}
            >
                {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div className="settings-card__title">
              <Bell size={18} color="#f59e0b" />
              <span>Notifications</span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Push Notifications</span>
              <span className="settings-row__desc">Receive real-time alerts on your device.</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.pushNotifications} 
                onChange={() => handleToggle('pushNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Scan Completion Alerts</span>
              <span className="settings-row__desc">Notify when a multi-spectral scan finishes.</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.scanAlerts} 
                onChange={() => handleToggle('scanAlerts')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Email Reports</span>
              <span className="settings-row__desc">Weekly summary of scan results and insights.</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.emailNotifications} 
                onChange={() => handleToggle('emailNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* Connectivity Section */}
        <section className="settings-card">
          <div className="settings-card__header" style={{border: 'none', marginBottom: '0.5rem'}}>
            <div className="settings-card__title">
              <Radio size={18} color="#3b82f6" />
              <span>Connectivity & Status</span>
            </div>
          </div>

          <div className="network-status">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <div style={{fontSize: '0.9rem', fontWeight: 600}}>Browser Network Status</div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem'}}>
                        {isOnline ? 'Connected to the internet' : 'Internet connection lost'}
                    </div>
                </div>
                <div className={`status-badge ${isOnline ? 'status-badge--online' : 'status-badge--offline'}`}>
                    <span className={`status-badge__dot ${isOnline ? 'status-badge__dot--online' : 'status-badge__dot--offline'}`} />
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                    {isOnline ? <Wifi size={14} style={{marginLeft: 4}} /> : <WifiOff size={14} style={{marginLeft: 4}} />}
                </div>
            </div>

            <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)'}}>
                 <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                    <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Server Core</span>
                    <span style={{fontSize: '0.8rem', color: '#16a34a', fontWeight: 600}}>Healthy (v1.2.4)</span>
                 </div>
                 <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Database</span>
                    <span style={{fontSize: '0.8rem', color: '#16a34a', fontWeight: 600}}>Connected</span>
                 </div>
            </div>
          </div>
        </section>

        {/* Permission & Privacy */}
        <section className="settings-card">
          <div className="settings-card__header">
            <div className="settings-card__title">
              <Shield size={18} color="#ef4444" />
              <span>Data & Privacy</span>
            </div>
          </div>
          
          <div className="settings-row">
            <div className="settings-row__info">
              <span className="settings-row__label">Auto-save Scans</span>
              <span className="settings-row__desc">Automatically store scan results to history.</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.autoSave} 
                onChange={() => handleToggle('autoSave')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <button 
            className="profile-btn" 
            style={{marginTop: '1rem', color: '#dc2626', background: 'transparent', border: '1px solid #fecaca'}}
            onClick={handlePurgeCache}
          >
            Purge Local Cache
          </button>
        </section>

      </div>
    </div>
  );
}
