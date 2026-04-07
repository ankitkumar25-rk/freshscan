import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SensorProvider } from './context/SensorContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Home from './pages/Home';
import Scan from './pages/Scan';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import DeviceManager from './pages/DeviceManager';
import Auth from './pages/Auth';
import './index.css';

// Toaster adapts to the current theme
function ThemedToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
        },
      }}
    />
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <ThemedToaster />
      <Routes>
        {/* Public: login/register page */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Auth />}
        />

        {/* Protected: requires auth, renders the app shell + child pages */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="scan" element={<Scan />} />
            <Route path="history" element={<History />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="devices" element={<DeviceManager />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SensorProvider>
            <AppRoutes />
          </SensorProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
