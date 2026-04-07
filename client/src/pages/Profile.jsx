import { useState } from 'react';
import { User, Mail, ShieldCheck, Key, UserCheck, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, updateProfile, changePassword, uploadAvatar, loading } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await updateProfile(profileData);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    await uploadAvatar(formData);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    const success = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    if (success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const avatarUrl = user?.avatar 
    ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE}/${user.avatar}`) 
    : null;

  return (
    <div className="profile animate-fade-in">
      <header className="profile__header">
        <h1 className="profile__title">My Profile</h1>
        <p className="profile__subtitle">Manage your account information and security settings.</p>
      </header>

      <div className="profile__grid">
        {/* Left: Basic Info */}
        <div className="profile-card">
          <div className="profile-card__title">
            <User size={18} color="var(--primary)" />
            <span>General Information</span>
          </div>

          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.name} className="profile-avatar-img" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            
            <input 
                type="file" 
                id="avatar-upload" 
                hidden 
                accept="image/*"
                onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-upload" className="profile-btn" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', width: 'auto', marginBottom: '1rem', background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
               {loading ? 'Uploading...' : 'Change Photo'}
            </label>

            <div className="sidebar__user-name" style={{fontSize: '1.1rem'}}>{user?.name}</div>
            {user?.googleId && (
                <div className="social-badge">
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsuite_512dp.png" width="12" height="12" />
                    Connected via Google
                </div>
            )}
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', top: '13px', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', top: '13px', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={profileData.email}
                  disabled
                />
              </div>
            </div>

            <button type="submit" className="profile-btn profile-btn--primary" disabled={loading}>
              {loading ? <div className="spinner-sm" /> : <Save size={16} />}
              Save Changes
            </button>
          </form>
        </div>

        {/* Right: Security */}
        <div className="profile-card">
          <div className="profile-card__title">
            <ShieldCheck size={18} color="var(--green-600)" />
            <span>Account Security</span>
          </div>

          {user?.googleId && !user?.hasPassword ? (
            <div className="recent-empty" style={{background: 'var(--background)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem'}}>
              <Key size={24} style={{color: 'var(--text-muted)', marginBottom: '0.5rem'}} />
              <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                You are logged in with Google. To set a standalone password, please use the "Forgot Password" flow on your next login.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="profile-btn profile-btn--primary" disabled={loading}>
                {loading ? <div className="spinner-sm" /> : <Key size={16} />}
                Update Password
              </button>
            </form>
          )}

          <div className="section-divider" style={{margin: '2rem 0'}} />
        </div>
      </div>
    </div>
  );
}
