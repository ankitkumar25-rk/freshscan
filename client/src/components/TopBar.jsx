import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, Wifi, Sun, Moon, WifiOff, BellOff, Menu, X, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSensor } from '../hooks/useSensor';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './TopBar.css';

const titles = {
  '/':        { main: 'FreshScan App', sub: 'Dashboard' },
  '/scan':    { main: 'FreshScan App', sub: 'Scanner' },
  '/history': { main: 'FreshScan App', sub: 'Results' },
};

const MOCK_NOTIFS = [
  { id: 1, type: 'alert', title: 'Action Needed', message: 'Apple Batch #4420 is nearing expiration.', time: '2m ago' },
  { id: 2, type: 'info', title: 'System Sensor', message: 'Kitchen Humidity detected at 65% (High).', time: '15m ago' },
  { id: 3, type: 'success', title: 'Scan Complete', message: 'Banana analysis finished successfully.', time: '1h ago' },
];

export default function TopBar({ onToggleSidebar }) {
  const { pathname } = useLocation();
  const titleInfo = titles[pathname] || { main: 'FreshScan App', sub: 'Dashboard' };
  const sensor = useSensor();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const avatarUrl = user?.avatar 
    ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE}/${user.avatar}`) 
    : null;

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      {/* Left: breadcrumb */}
      <div className="topbar__left">
        <button 
          className="topbar__icon-btn topbar__hamburger mobile-only" 
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <span className="topbar__main hidden-on-mobile">{titleInfo.main}</span>
        <span className="topbar__divider hidden-on-mobile">›</span>
        <span className="topbar__sub">{titleInfo.sub}</span>

        {/* Network / Arduino Status */}
        <div className="topbar__status">
          {!sensor.arduinoEnabled ? (
            <>
              <span className="topbar__dot" style={{ background: 'var(--text-muted)' }} />
              <span className="topbar__status-text">Arduino: Disconnected (Disabled)</span>
            </>
          ) : sensor.arduinoConnected ? (
            <>
              <span className="topbar__dot topbar__dot--green" />
              <span className="topbar__status-text">Arduino: Connected</span>
            </>
          ) : (
            <>
              <div className="spinner-xs" style={{ marginRight: '8px' }} />
              <span className="topbar__status-text" style={{ color: 'var(--primary)' }}>Arduino: Searching...</span>
            </>
          )}
        </div>
      </div>

      {/* Right: icons */}
      <div className="topbar__right">
        <button 
          className="topbar__icon-btn" 
          title={sensor.socketConnected ? "Network Online" : "Network Offline"} 
          id="topbar-network-btn"
          style={{ color: sensor.socketConnected ? 'var(--text-primary)' : '#dc2626' }}
        >
          {sensor.socketConnected ? <Wifi size={18} /> : <WifiOff size={18} />}
        </button>

        {/* Notification Wrapper */}
        <div className="topbar__notif-wrapper" ref={notifRef}>
          <button 
            className={`topbar__icon-btn ${isNotifOpen ? 'topbar__icon-btn--active' : ''}`}
            title={sensor.socketConnected ? "Notifications" : "Notifications Offline"} 
            id="topbar-notif-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{ color: sensor.socketConnected ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {sensor.socketConnected ? <Bell size={18} /> : <BellOff size={18} />}
            {sensor.socketConnected && <span className="topbar__notif-dot" />}
          </button>

          {isNotifOpen && (
            <div className="notif-dropdown card animate-fade-up">
              <div className="notif-dropdown__header">
                <h3>Notifications</h3>
                <button className="notif-dropdown__close" onClick={() => setIsNotifOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="notif-dropdown__list">
                {MOCK_NOTIFS.map(notif => (
                  <div key={notif.id} className="notif-item">
                    <div className={`notif-item__icon notif-item__icon--${notif.type}`}>
                      {notif.type === 'alert' && <AlertTriangle size={14} />}
                      {notif.type === 'success' && <CheckCircle size={14} />}
                      {notif.type === 'info' && <Clock size={14} />}
                    </div>
                    <div className="notif-item__content">
                      <div className="notif-item__title">{notif.title}</div>
                      <div className="notif-item__msg">{notif.message}</div>
                      <div className="notif-item__time">{notif.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                to="/notifications" 
                className="notif-dropdown__footer"
                onClick={() => setIsNotifOpen(false)}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        <button
          className="topbar__icon-btn topbar__theme-btn"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          id="topbar-theme-btn"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <Link to="/settings" className="topbar__icon-btn" title="Settings" id="topbar-settings-btn">
          <Settings size={18} />
        </Link>
        <Link to="/profile" className="topbar__avatar" title="Profile" id="topbar-profile-btn" style={{ textDecoration: 'none', overflow: 'hidden' }}>
           {avatarUrl ? (
             <img src={avatarUrl} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           ) : (
             initials
           )}
        </Link>
      </div>
    </header>
  );
}
