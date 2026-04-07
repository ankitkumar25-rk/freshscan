import { useRef, useState, useCallback } from 'react';
import { Upload, Camera, X, RefreshCw, Image } from 'lucide-react';
import './Scanner.css';

export default function Scanner({ onImageSelected }) {
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState('upload'); // 'upload' | 'camera'
  const [cameraActive, setCameraActive] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const setImage = useCallback(
    (file) => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      onImageSelected(file);
    },
    [onImageSelected]
  );

  // ── File Upload ──────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) setImage(file);
  };

  // ── Camera ───────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: 1280, height: 720 },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Camera permission denied. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    stopCamera();
    canvas.toBlob((blob) => {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setImage(file);
    }, 'image/jpeg', 0.92);
  };

  // ── Reset ────────────────────────────────────────────────────────────────────
  const reset = () => {
    setPreview(null);
    stopCamera();
    onImageSelected(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="scanner">
      {/* Mode toggle */}
      {!preview && (
        <div className="scanner__mode-toggle">
          <button
            className={`scanner__mode-btn ${mode === 'upload' ? 'active' : ''}`}
            onClick={() => { setMode('upload'); stopCamera(); }}
          >
            <Upload size={15} /> Upload
          </button>
          <button
            className={`scanner__mode-btn ${mode === 'camera' ? 'active' : ''}`}
            onClick={() => { setMode('camera'); startCamera(); }}
          >
            <Camera size={15} /> Camera
          </button>
        </div>
      )}

      {/* Preview */}
      {preview ? (
        <div className="scanner__preview">
          <img src={preview} alt="Selected produce" className="scanner__preview-img" />
          <button className="scanner__reset-btn" onClick={reset} title="Remove image">
            <X size={18} />
          </button>
        </div>
      ) : mode === 'upload' ? (
        /* Drop Zone */
        <div
          className={`scanner__dropzone ${dragOver ? 'scanner__dropzone--drag' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="scanner__dropzone-icon">
            <Image size={40} />
          </div>
          <p className="scanner__dropzone-title">Drop image here or click to browse</p>
          <p className="scanner__dropzone-sub">JPEG, PNG, WebP · max 10 MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            id="file-upload-input"
          />
        </div>
      ) : (
        /* Live Camera */
        <div className="scanner__camera">
          <video ref={videoRef} className="scanner__video" playsInline muted />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {cameraActive && (
            <div className="scanner__camera-controls">
              <button className="scanner__capture-btn" onClick={capturePhoto} id="capture-photo-btn">
                <Camera size={22} />
              </button>
              <button className="btn btn-secondary" onClick={stopCamera}>
                <X size={16} /> Cancel
              </button>
            </div>
          )}
          {!cameraActive && (
            <button className="btn btn-secondary scanner__retry" onClick={startCamera}>
              <RefreshCw size={16} /> Retry Camera
            </button>
          )}
        </div>
      )}
    </div>
  );
}
