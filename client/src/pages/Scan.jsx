import { useState } from 'react';
import toast from 'react-hot-toast';
import { ScanSearch, Loader2, Leaf, Info } from 'lucide-react';
import Scanner from '../components/Scanner';
import ResultCard from '../components/ResultCard';
import SensorPanel from '../components/SensorPanel';
import api from '../api/axiosConfig';
import './Scan.css';

export default function Scan() {
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!imageFile) { toast.error('Please select an image first.'); return; }
    const formData = new FormData();
    formData.append('image', imageFile);
    setLoading(true);
    try {
      const { data } = await api.post('/api/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      toast.success(`✅ ${data.category} — ${data.produceType}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setResult(null); setImageFile(null); };

  return (
    <div className="scan-page animate-fade-in">
      {/* Header */}
      <div className="scan-page__header">
        <h1 className="scan-page__title">Produce Scanner</h1>
        <p className="scan-page__sub">Upload or take a picture of your fruit to instantly check its freshness.</p>
      </div>

      <div className="scan-layout">
        {/* Left column */}
        <div className="scan-left">
          {/* Upload card */}
          <div className="card scan-upload-card">
            <div className="scan-upload-card__header">
              <Leaf size={16} style={{ color: 'var(--green-700)' }} />
              <span>Select Produce Image</span>
            </div>
            <Scanner onImageSelected={setImageFile} />
            {!result && (
              <button
                id="analyze-btn"
                className="btn btn-primary scan-analyze-btn"
                onClick={handleAnalyze}
                disabled={!imageFile || loading}
              >
                {loading
                  ? <><Loader2 size={17} className="animate-spin" /> Checking freshness…</>
                  : <><ScanSearch size={17} /> Check Freshness</>
                }
              </button>
            )}
          </div>

          {/* Info tip */}
          <div className="scan-tip">
            <Info size={14} />
            <span>For best results, place the produce against a neutral background with good lighting.</span>
          </div>

          {/* Sensor panel */}
          <SensorPanel compact />
        </div>

        {/* Right column */}
        <div className="scan-right">
          {result ? (
            <ResultCard result={result} onReset={handleReset} />
          ) : (
            <div className="scan-placeholder card">
              <div className="scan-placeholder__icon">
                <ScanSearch size={36} />
              </div>
              <h3>Awaiting Scan</h3>
              <p>Select an image and click <strong>Check Freshness</strong></p>
              <div className="scan-steps">
                {['Select or capture image', 'Click Check Freshness', 'Get freshness results and tips'].map((s, i) => (
                  <div className="scan-step" key={s}>
                    <span className="scan-step__num">{i + 1}</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
