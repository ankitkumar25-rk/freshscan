import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('fs_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('fs_token') || null);

  const [loading, setLoading] = useState(false);

  const saveSession = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('fs_user', JSON.stringify(userData));
    localStorage.setItem('fs_token', jwtToken);
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fs_user');
    localStorage.removeItem('fs_token');
  };

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');
      saveSession(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}! 🎉`);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed.');
      saveSession(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    toast.success('Logged out successfully.');
  }, []);

  const googleLogin = useCallback(async (credential) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google sign-in failed.');
      saveSession(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}! 🎉`);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile.');
      
      // Update local state and storage
      const newUser = { ...user, ...data.user };
      setUser(newUser);
      localStorage.setItem('fs_user', JSON.stringify(newUser));
      
      toast.success('Profile updated successfully!');
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const changePassword = useCallback(async (passwords) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/change-password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwords),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password.');
      toast.success('Password updated successfully!');
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const uploadAvatar = useCallback(async (formData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/upload-avatar`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData, // FormData handles the content-type automatically
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload avatar.');
      
      const newUser = { ...user, avatar: data.avatar };
      setUser(newUser);
      localStorage.setItem('fs_user', JSON.stringify(newUser));
      
      toast.success('Avatar updated successfully!');
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, googleLogin, updateProfile, changePassword, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
