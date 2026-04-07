import { useState } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Trash2, CheckSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import './Notifications.css';

const INITIAL_NOTIFS = [
  { id: 1, type: 'alert', title: 'Action Needed', message: 'Apple Batch #4420 is nearing expiration.', time: '2m ago', read: false },
  { id: 2, type: 'info', title: 'System Sensor', message: 'Kitchen Humidity detected at 65% (High).', time: '15m ago', read: false },
  { id: 3, type: 'success', title: 'Scan Complete', message: 'Banana analysis finished successfully.', time: '1h ago', read: true },
  { id: 4, type: 'info', title: 'Device Update', message: 'Arduino firmware v2.1.0 is available.', time: '3h ago', read: false },
  { id: 5, type: 'alert', title: 'Connection Lost', message: 'Sensor Unit B-12 disconnected temporarily.', time: '5h ago', read: true },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFS);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  const clearAll = () => {
    if (window.confirm('Clear all notification history?')) {
      setNotifications([]);
      toast.success('Notification history cleared.');
    }
  };

  const deleteOne = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="notifications-page animate-fade-in">
      <header className="notifications-header">
        <div>
          <h1 className="notifications-title">System Notifications</h1>
          <p className="notifications-sub">Stay updated with your produce scans and sensor alerts.</p>
        </div>
        <div className="notifications-actions">
          <button className="btn btn-secondary" onClick={markAllRead}>
            <CheckSquare size={16} /> Mark all read
          </button>
          <button className="btn btn-outline-danger" onClick={clearAll}>
            <Trash2 size={16} /> Clear all
          </button>
        </div>
      </header>

      <div className="notifications-grid">
        <section className="notifications-card">
          {notifications.length === 0 ? (
            <div className="notifications-empty">
              <Bell size={48} color="var(--text-muted)" />
              <h3>All clear!</h3>
              <p>You have no new notifications.</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map(notif => (
                <div key={notif.id} className={`notif-full-item ${!notif.read ? 'notif-full-item--unread' : ''}`}>
                  <div className={`notif-full-icon notif-full-icon--${notif.type}`}>
                    {notif.type === 'alert' && <AlertTriangle size={18} />}
                    {notif.type === 'success' && <CheckCircle size={18} />}
                    {notif.type === 'info' && <Info size={18} />}
                  </div>
                  
                  <div className="notif-full-content">
                    <div className="notif-full-top">
                      <div className="notif-full-title">
                        {notif.title}
                        {!notif.read && <span className="notif-unread-dot" />}
                      </div>
                      <div className="notif-full-time">
                        <Clock size={12} />
                        {notif.time}
                      </div>
                    </div>
                    <div className="notif-full-msg">{notif.message}</div>
                  </div>

                  <button className="notif-full-delete" onClick={() => deleteOne(notif.id)} title="Delete Notification">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar info card (Matching settings-like layout) */}
        <aside className="notifications-info">
          <div className="info-card">
            <h4>Notification Tips</h4>
            <ul>
              <li>Critical alerts are highlighted in red.</li>
              <li>Toggle "Push Notifications" in Settings to receive real-time updates.</li>
              <li>Cleared notifications are permanently removed from local history.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
