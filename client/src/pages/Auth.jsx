import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Leaf, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo2.jpeg';
import './Auth.css';

const features = [
  {
    icon: '🌿',
    text: 'Multi-Spectral Analysis',
    sub: 'Detect ripeness before it\'s visible',
  },
  {
    icon: '⚡',
    text: 'Real-Time Sensor Data',
    sub: 'Live temperature, humidity & ethylene',
  },
  {
    icon: '🤖',
    text: 'AI-Powered Insights',
    sub: 'Gemini AI analysis on every scan',
  },
];

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, loading, googleLogin } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPw, setShowPw] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let ok = false;
    if (mode === 'login') {
      ok = await login({ email: form.email, password: form.password });
    } else {
      ok = await register({ name: form.name, email: form.email, password: form.password });
    }
    if (ok) navigate('/');
  };

  const switchMode = (m) => {
    setMode(m);
    setForm({ name: '', email: '', password: '' });
    setShowPw(false);
  };

  return (
    <div className="auth-page">
      {/* ── Left Branded Panel ───────────────────────────── */}
      <aside className="auth-panel">
        {/* Brand */}
        <div className="auth-panel__brand">
          <div className="auth-panel__logo">
            <img src={Logo} alt="FreshScan Logo" className="auth-panel__logo-img" />
          </div>
          <div>
            <div className="auth-panel__brand-name">FreshScan</div>
            <div className="auth-panel__brand-sub">PRECISION SCANNING</div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="auth-panel__hero">
          <h1 className="auth-panel__tagline">
            Analyze Fruit Freshness <span>in Seconds.</span>
          </h1>
          <p className="auth-panel__desc">
            Utilize our multi-spectral sensor array to detect ripeness and spoilage before
            it's visible to the human eye.
          </p>
        </div>

        {/* Feature chips */}
        <div className="auth-panel__features">
          {features.map((f) => (
            <div className="auth-panel__feat" key={f.text}>
              <div className="auth-panel__feat-icon">{f.icon}</div>
              <div>
                <div className="auth-panel__feat-text">{f.text}</div>
                <div className="auth-panel__feat-sub">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Right Form Panel ─────────────────────────────── */}
      <section className="auth-form-panel">
        <div className="auth-card">
          {/* Tab toggle */}
          <div className="auth-tabs" role="tablist">
            <button
              id="tab-login"
              role="tab"
              className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button
              id="tab-signup"
              role="tab"
              className={`auth-tab ${mode === 'signup' ? 'auth-tab--active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <h2 className="auth-heading">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="auth-subheading">
            {mode === 'login'
              ? 'Enter your credentials to access the dashboard.'
              : 'Start monitoring crop vitality with AI precision.'}
          </p>

          {/* Google Sign-In */}
          <div className="auth-google-wrap">
            <GoogleLogin
              onSuccess={async (res) => {
                const ok = await googleLogin(res.credential);
                if (ok) navigate('/');
              }}
              onError={() => {
                // toast handled inside googleLogin
              }}
              useOneTap={false}
              theme="outline"
              shape="rectangular"
              size="large"
              text={mode === 'login' ? 'signin_with' : 'signup_with'}
              width="348"
            />
          </div>

          {/* Divider */}
          <div className="auth-divider">
            <span className="auth-divider__line" />
            <span className="auth-divider__text">or continue with email</span>
            <span className="auth-divider__line" />
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Name (signup only) */}
            {mode === 'signup' && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-name">Full Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><User size={16} /></span>
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    className="auth-input"
                    placeholder="Dr. Aris Thorne"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Mail size={16} /></span>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="you@freshscan.io"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Lock size={16} /></span>
                <input
                  id="auth-password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  className="auth-input"
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  title={showPw ? 'Hide password' : 'Show password'}
                  id="auth-pw-toggle"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="auth-submit"
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Footer switcher */}
          <div className="auth-footer">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button id="auth-switch-signup" onClick={() => switchMode('signup')}>
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button id="auth-switch-login" onClick={() => switchMode('login')}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
