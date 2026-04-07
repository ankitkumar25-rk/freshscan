import { useEffect, useState, useCallback } from 'react';
import { History as HistoryIcon, RefreshCw, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import ResultCard from '../components/ResultCard';
import api from '../api/axiosConfig';
import './History.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const catCfg = {
  Fresh:    { color: '#16a34a', bg: '#dcfce7', badge: 'badge-fresh' },
  Moderate: { color: '#d97706', bg: '#fef9c3', badge: 'badge-moderate' },
  Spoiled:  { color: '#dc2626', bg: '#fee2e2', badge: 'badge-spoiled' },
};

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchScans = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/scans?page=${p}&limit=12`);
      setScans(data.scans); setTotalPages(data.pages); setTotal(data.total);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchScans(page); }, [page, fetchScans]);

  return (
    <div className="history-page animate-fade-in">
      {/* Header */}
      <div className="history-header">
        <div>
          <h1 className="history-title">Scan Results</h1>
          <p className="history-sub">{total} total scans recorded</p>
        </div>
        <button className="btn btn-secondary" onClick={() => fetchScans(page)} id="refresh-history-btn">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="history-loading"><div className="spinner" /><p>Loading results…</p></div>
      ) : scans.length === 0 ? (
        <div className="history-empty card">
          <HistoryIcon size={40} style={{ color: 'var(--text-muted)' }} />
          <h3>No scans yet</h3>
          <p>Start scanning produce to see results here.</p>
        </div>
      ) : (
        <>
          {/* Table-style list */}
          <div className="history-table card">
            {/* Table head */}
            <div className="history-table__head">
              <span>Produce</span>
              <span>Category</span>
              <span>Freshness</span>
              <span>Shelf Life</span>
              <span>Date</span>
            </div>
            <div className="divider" />

            {scans.map((scan, i) => {
              const c = catCfg[scan.category] || catCfg.Moderate;
              const date = new Date(scan.createdAt);
              const batchNum = `#${String(4420 - i).padStart(4,'0')}`;
              
              // Dynamic Decay: Calculate remaining shelf life based on expiresAt
              let remainingDays = scan.shelfLifeDays;
              if (scan.expiresAt) {
                const msLeft = new Date(scan.expiresAt).getTime() - Date.now();
                remainingDays = Math.max(0, Math.ceil(msLeft / 86400000));
              }

              return (
                <div key={scan._id} className="history-row" onClick={() => setSelectedScan({ ...scan, shelfLifeDays: remainingDays })}>
                  {/* Produce */}
                  <div className="history-row__produce">
                    <img
                      src={`${API_BASE}/${scan.imagePath}`}
                      alt={scan.produceType}
                      className="history-row__img"
                      onError={(e)=>{e.target.src='https://placehold.co/48x48/f0fdf4/16a34a?text=🥬';}}
                    />
                    <div>
                      <div className="history-row__batch">{batchNum}</div>
                      <div className="history-row__name">{scan.produceType}</div>
                    </div>
                  </div>
                  {/* Category */}
                  <span className={`badge ${c.badge}`}>{scan.category}</span>
                  {/* Score */}
                  <div className="history-row__score-cell">
                    <span className="history-row__score" style={{ color: c.color }}>{scan.freshScore}%</span>
                    <div className="history-row__score-bar-track">
                      <div className="history-row__score-bar" style={{ width: `${scan.freshScore}%`, background: c.color }} />
                    </div>
                  </div>
                  {/* Shelf life */}
                  <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.85rem', color: remainingDays > 0 ? 'var(--text-secondary)' : '#dc2626' }}>
                    <Clock size={13} />{remainingDays}d
                  </div>
                  {/* Date */}
                  <div className="history-row__date">
                    {date.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}<br />
                    <span>{date.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="history-pagination">
              <button className="btn btn-secondary" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} id="history-prev-btn">
                <ChevronLeft size={15} /> Prev
              </button>
              <span className="history-page-info">Page {page} of {totalPages}</span>
              <button className="btn btn-secondary" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} id="history-next-btn">
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal Overlay */}
      {selectedScan && (
        <div className="history-modal-overlay" onClick={() => setSelectedScan(null)}>
          <div className="history-modal-content" onClick={e => e.stopPropagation()}>
            <button className="history-modal-close" onClick={() => setSelectedScan(null)}>
              <X size={20} />
            </button>
            <div className="history-modal-layout">
              <div className="history-modal-image-col">
                <img 
                   src={`${API_BASE}/${selectedScan.imagePath}`} 
                   alt={selectedScan.produceType} 
                   className="history-modal-image"
                   onError={(e)=>{e.target.src='https://placehold.co/400x400/f0fdf4/16a34a?text=Preview+Unavailable';}}
                />
              </div>
              <div className="history-modal-result-col">
                <ResultCard 
                   result={selectedScan} 
                   onReset={() => setSelectedScan(null)} 
                   actionText="Close" 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
