import { Clock, Leaf, Wind, Thermometer, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import './ResultCard.css';

const cfg = {
  Fresh:    { color: '#16a34a', bg: '#dcfce7', icon: CheckCircle,   label: 'Fresh' },
  Moderate: { color: '#d97706', bg: '#fef9c3', icon: AlertTriangle, label: 'Moderate' },
  Spoiled:  { color: '#dc2626', bg: '#fee2e2', icon: XCircle,       label: 'Spoiled' },
};

function CircleGauge({ score, color }) {
  const r = 58;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={r} fill="none"
        stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <text x="70" y="65" textAnchor="middle" fill={color} fontSize="28" fontWeight="800" fontFamily="Outfit,sans-serif">{score}</text>
      <text x="70" y="84" textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="Inter,sans-serif">Freshness</text>
    </svg>
  );
}

export default function ResultCard({ result, onReset, actionText }) {
  const { freshScore, category, produceType, shelfLifeDays, geminiAnalysis, sensorSnapshot, recommendations } = result;
  const c = cfg[category] || cfg.Moderate;
  const Icon = c.icon;

  return (
    <div className="result-card card animate-fade-up">

      {/* Header strip */}
      <div className="result-card__strip" style={{ background: c.bg, borderBottom: `1px solid ${c.color}20` }}>
        <div className="result-card__produce">
          <Leaf size={14} style={{ color: c.color }} />
          <span>{produceType}</span>
        </div>
        <span className={`badge badge-${category.toLowerCase()}`}>
          <Icon size={11} /> {c.label}
        </span>
      </div>

      <div className="result-card__body">

        {/* Score row */}
        <div className="result-card__score-row">
          <CircleGauge score={freshScore} color={c.color} />
          <div className="result-card__score-meta">
            <div className="result-meta-item">
              <Clock size={14} style={{ color: c.color }} />
              <div>
                <div className="result-meta-label">Shelf Life</div>
                <div className="result-meta-value" style={{ color: c.color }}>{shelfLifeDays} day{shelfLifeDays !== 1 ? 's' : ''}</div>
              </div>
            </div>
            {geminiAnalysis && (
              <div className="mini-bars">
                <MiniBar label="Color"   val={geminiAnalysis.colorScore}         color={c.color} />
                <MiniBar label="Texture" val={geminiAnalysis.textureScore}       color={c.color} />
                <MiniBar label="Visual"  val={geminiAnalysis.overallVisualScore} color={c.color} />
              </div>
            )}
            {sensorSnapshot && (
              <div className="sensor-snap">
                <div className="snap-chip"><Wind size={11} />{sensorSnapshot.mq2Ppm?.toFixed(1)} ppm</div>
                <div className="snap-chip"><Thermometer size={11} />{sensorSnapshot.temperature?.toFixed(1)}°C</div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {geminiAnalysis?.freshnessSummary && (
          <div className="result-summary">{geminiAnalysis.freshnessSummary}</div>
        )}

        {/* Defects */}
        {geminiAnalysis?.defectsDetected?.length > 0 && (
          <div className="result-section">
            <div className="result-section__label">⚠️ Defects Detected</div>
            <div className="defect-tags">
              {geminiAnalysis.defectsDetected.map((d, i) => (
                <span key={i} className="defect-tag">{d}</span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations?.length > 0 && (
          <div className="result-section">
            <div className="result-section__label">💡 Storage Recommendations</div>
            <ul className="rec-list">
              {recommendations.map((r, i) => (
                <li key={i} className="rec-item">
                  <span className="rec-dot" style={{ background: c.color }} />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button className="btn btn-secondary result-reset-btn" onClick={onReset}>
          {actionText === 'Close' ? <XCircle size={15} /> : <RefreshCw size={15} />}
          {actionText || 'Check Another'}
        </button>
      </div>
    </div>
  );
}

function MiniBar({ label, val = 0, color }) {
  return (
    <div className="mini-bar">
      <span className="mini-bar__label">{label}</span>
      <div className="mini-bar__track">
        <div className="mini-bar__fill" style={{ width: `${val}%`, background: color }} />
      </div>
      <span className="mini-bar__val" style={{ color }}>{val}</span>
    </div>
  );
}
