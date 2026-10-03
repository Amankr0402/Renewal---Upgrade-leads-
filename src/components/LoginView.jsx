import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  UserCheck, 
  Sparkles,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { loginUser, getStoredCredentials } from '../data/authService';

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your work email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const result = loginUser(email, password);
      setIsLoading(false);

      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.message);
      }
    }, 400);
  };

  // Helper for 1-click test login
  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    const result = loginUser(demoEmail, demoPassword);
    if (result.success) {
      onLoginSuccess(result.user);
    }
  };

  const authorizedList = getStoredCredentials();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
      padding: '20px',
      color: '#ffffff'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(30, 41, 59, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
            marginBottom: '14px'
          }}>
            <ShieldCheck size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Renewal &amp; Upgrade Intelligence
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
            Authorized Access Portal for TeleCRM &amp; Sales Operations
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.82rem',
            marginBottom: '18px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#cbd5e1' }}>
              Work Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input 
                type="email"
                required
                className="search-input"
                style={{ 
                  width: '100%', 
                  paddingLeft: '38px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  fontSize: '0.88rem'
                }}
                placeholder="name@theelefant.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#cbd5e1' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                className="search-input"
                style={{ 
                  width: '100%', 
                  paddingLeft: '38px', 
                  paddingRight: '38px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  fontSize: '0.88rem'
                }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '11px',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '11px',
              fontSize: '0.92rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.5)'
            }}
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Credentials for Fast Testing */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick 1-Click Authorized Logins
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              type="button"
              className="btn btn-outline" 
              style={{ justifyContent: 'space-between', padding: '6px 10px', fontSize: '0.76rem', borderColor: 'rgba(255,255,255,0.08)' }}
              onClick={() => handleQuickLogin('admin@theelefant.ai', 'Admin@2026!')}
            >
              <span style={{ fontWeight: 600 }}>👑 Operations Admin</span>
              <span style={{ color: '#94a3b8' }}>admin@theelefant.ai</span>
            </button>
            <button 
              type="button"
              className="btn btn-outline" 
              style={{ justifyContent: 'space-between', padding: '6px 10px', fontSize: '0.76rem', borderColor: 'rgba(255,255,255,0.08)' }}
              onClick={() => handleQuickLogin('sales@theelefant.ai', 'Sales@2026!')}
            >
              <span style={{ fontWeight: 600 }}>💼 Sales Team Lead</span>
              <span style={{ color: '#94a3b8' }}>sales@theelefant.ai</span>
            </button>
            <button 
              type="button"
              className="btn btn-outline" 
              style={{ justifyContent: 'space-between', padding: '6px 10px', fontSize: '0.76rem', borderColor: 'rgba(255,255,255,0.08)' }}
              onClick={() => handleQuickLogin('telecrm@theelefant.ai', 'Crm@2026!')}
            >
              <span style={{ fontWeight: 600 }}>📞 TeleCRM Supervisor</span>
              <span style={{ color: '#94a3b8' }}>telecrm@theelefant.ai</span>
            </button>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: '0.7rem', color: '#64748b', textAlign: 'center' }}>
            New credentials can be added and managed by the Admin inside settings anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
