import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanSearch, ArrowRight, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { useSensor } from '../hooks/useSensor';
import api from '../api/axiosConfig';
import './Home.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const categoryColor = {
  Fresh:    { color: '#16a34a', bg: '#dcfce7', bar: '#16a34a' },
  Moderate: { color: '#d97706', bg: '#fef9c3', bar: '#f59e0b' },
  Spoiled:  { color: '#dc2626', bg: '#fee2e2', bar: '#ef4444' },
};

export default function Home() {
  const sensor = useSensor();
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/scans?page=1&limit=4')
      .then(({ data }) => setRecentScans(data.scans || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const mq2Level = sensor.mq2Ppm < 20 ? { label: 'LOW', badge: 'Optimal', cls: 'badge-optimal' }
                : sensor.mq2Ppm < 50 ? { label: 'MED', badge: 'Moderate', cls: 'badge-warning' }
                : { label: 'HIGH', badge: 'Alert', cls: 'badge-spoiled' };

  return (
    <div className="home animate-fade-in">

      {/* ── Hero Banner ───────────────────────────────────────────────── */}
      <section className="hero-banner">
        <div className="hero-banner__content">
          <h1 className="hero-banner__title">
            Analyze Fruit Freshness<br />in Seconds.
          </h1>
          <p className="hero-banner__sub">
            Track fruit quality and catch hidden spoilage instantly using smart sensors and imaging.
          </p>
          <Link to="/scan" className="hero-banner__btn" id="hero-scan-btn">
            <ScanSearch size={18} />
            Start Scanning
          </Link>
        </div>
        <div className="hero-banner__leaves" aria-hidden="true">
          <div className="leaf leaf-1" />
          <div className="leaf leaf-2" />
          <div className="leaf leaf-3" />
        </div>
      </section>

      {/* ── Below hero: two columns ───────────────────────────────────── */}
      <div className="dashboard-grid">

        {/* LEFT: Real-time Environment */}
        <section>
          <div className="section-title">
            <span>Real-time Environment</span>
            <span className="sensor-live-badge">
              <span 
                className="topbar__dot" 
                style={{
                  width:7, height:7, borderRadius:'50%', 
                  background: (sensor.arduinoConnected && sensor.arduinoEnabled) ? '#22c55e' : (sensor.arduinoEnabled ? 'transparent' : '#9ca3af'), 
                  display:'inline-block', marginRight:4
                }} 
              >
                {sensor.arduinoEnabled && !sensor.arduinoConnected && <div className="spinner-xs" style={{ width: 8, height: 8 }} />}
              </span>
              {sensor.arduinoConnected && sensor.arduinoEnabled ? 'Live' : (sensor.arduinoEnabled ? 'Searching...' : 'Offline')}
            </span>
          </div>

          <div className="env-cards">
            {/* Temperature */}
            <div className="env-card env-card--orange">
              <div className="env-card__info">
                <div className="env-card__label">Temperature</div>
                <div className="env-card__value">{sensor.temperature.toFixed(1)}°C</div>
              </div>
              <div className="env-card__icon" style={{ background: '#fff7ed', color: '#f97316' }}>
                🌡️
              </div>
            </div>

            {/* Humidity */}
            <div className="env-card env-card--blue">
              <div className="env-card__info">
                <div className="env-card__label">Humidity</div>
                <div className="env-card__value">{sensor.humidity.toFixed(0)}%</div>
              </div>
              <div className="env-card__icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                💧
              </div>
            </div>

            {/* Gas / Ethylene */}
            <div className="env-card env-card--green">
              <div className="env-card__info">
                <div className="env-card__label">Gas (MQ-2)</div>
                <div className="env-card__value env-card__value--large">
                  {mq2Level.label}
                  <span className={`badge ${mq2Level.cls}`} style={{ marginLeft: 8, fontSize: '0.65rem' }}>
                    {mq2Level.badge}
                  </span>
                </div>
              </div>
              <div className="env-card__icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                💨
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Recent Scans */}
        <section>
          <div className="section-title">
            <span>Recent Scans</span>
            <Link to="/history" className="section-link">View All History <ArrowRight size={12} /></Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <div className="spinner" />
            </div>
          ) : recentScans.length === 0 ? (
            <div className="recent-empty">
              <ScanSearch size={32} style={{ color: 'var(--text-muted)' }} />
              <p>No scans yet — start your first scan!</p>
            </div>
          ) : (
            <div className="recent-grid">
              {recentScans.map((scan, i) => {
                const cfg = categoryColor[scan.category] || categoryColor.Moderate;
                return (
                  <div className="recent-card card" key={scan._id}>
                    <img
                      src={`${API_BASE}/${scan.imagePath}`}
                      alt={scan.produceType}
                      className="recent-card__img"
                      onError={(e) => { e.target.src = 'https://placehold.co/80x80/f0fdf4/16a34a?text=🥬'; }}
                    />
                    <div className="recent-card__info">
                      <div className="recent-card__batch">BATCH #{String(1000 + i + 1).padStart(4, '0')}</div>
                      <div className="recent-card__name">{scan.produceType}</div>
                      <div className="recent-card__score" style={{ color: cfg.color }}>
                        {scan.freshScore}%{' '}
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.72rem' }}>FRESHNESS</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── AI Insight Banner ─────────────────────────────────────────── */}
      <div className="ai-insight card">
        <div className="ai-insight__icon">
          <Sparkles size={20} />
        </div>
        <div className="ai-insight__text">
          <div className="ai-insight__title">System Ready</div>
          <div className="ai-insight__sub">
            Everything is connected. Upload a picture of your fruit to check its freshness.
          </div>
        </div>
        <Link to="/scan" className="btn btn-secondary ai-insight__action">
          Scan Now
        </Link>
      </div>

    </div>
  );
}
