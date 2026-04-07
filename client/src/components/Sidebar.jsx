import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ScanSearch, BarChart2, Cpu, Plus, Leaf, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogoDesktop from '../assets/Logo.jpeg';
import LogoMobile from '../assets/logo2.jpeg';
import './Sidebar.css';

const navItems = [
  { to: '/',        label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scan',    label: 'Scanner',   icon: ScanSearch },
  { to: '/history', label: 'Results',   icon: BarChart2 },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/devices', label: 'Devices',   icon: Cpu },
];

export default function Sidebar({ isOpen, onClose }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (onClose) onClose();
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

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

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const avatarUrl = user?.avatar 
    ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE}/${user.avatar}`) 
    : null;

  return (
    <>
      <div 
        className={`sidebar-backdrop ${isOpen ? 'sidebar-backdrop--open' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <img src={LogoMobile} alt="FreshScan" className="sidebar__logo-img" />
          </div>
          <div>
            <div className="sidebar__brand-name">FreshScan</div>
            <div className="sidebar__brand-sub">FRUIT TRACKER</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar__nav">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== '/' && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`sidebar__link ${active ? 'sidebar__link--active' : ''}`}
                id={`nav-${label.toLowerCase()}`}
              >
                {active && <span className="sidebar__active-bar" />}
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <Link to="/scan" className="sidebar__scan-btn" id="sidebar-scan-btn">
            <Plus size={16} />
            Start New Scan
          </Link>

          {/* Network Status Badge */}
          <div className={`sidebar__status ${isOnline ? 'sidebar__status--online' : 'sidebar__status--offline'}`}>
              <span className={`sidebar__status-dot ${isOnline ? 'sidebar__status-dot--online' : 'sidebar__status-dot--offline'}`} />
              {isOnline ? 'Network Online' : 'Network Offline'}
          </div>

          {/* User */}
          <div className="sidebar__user">
            <div className="sidebar__avatar" style={{ overflow: 'hidden' }}>
              {avatarUrl ? (
                  <img src={avatarUrl} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                  initials
              )}
            </div>
            <div>
              <div className="sidebar__user-name">{user?.name || 'User'}</div>
            </div>
            <button
              className="sidebar__logout-btn"
              onClick={handleLogout}
              title="Logout"
              id="sidebar-logout-btn"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
