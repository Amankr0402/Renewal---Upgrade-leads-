import React from 'react';
import { 
  RefreshCw, 
  ExternalLink, 
  Download, 
  Sun, 
  Moon, 
  Database, 
  ShieldCheck, 
  Radio,
  FileSpreadsheet,
  Users,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  theme, 
  toggleTheme, 
  onOpenMetabase, 
  onOpenGoogleSheet,
  onOpenCredentials,
  currentUser,
  onLogout,
  onExportReport,
  onFetchLiveData,
  isFetchingLive,
  lastSyncTime,
  renewalsCount,
  upgradesCount
}) {
  return (
    <header className="header-wrapper">
      <div className="brand-section">
        <div className="brand-icon-box">
          <RefreshCw size={24} className={isFetchingLive ? "spin-fast" : "spin-slow"} />
        </div>
        <div className="brand-titles">
          <h1>Renewal &amp; Upgrade Command Center</h1>
          <p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
              <Radio size={12} className="pulse-dot" />
              Live Metabase Synced
            </span>
            <span>•</span>
            <span>TeleCRM Integrated</span>
            <span>•</span>
            <span>Admin Portal Connected</span>
          </p>
        </div>
      </div>

      <div className="header-actions">
        {/* Primary Live Fetch Button */}
        <button 
          className="btn btn-success"
          onClick={onFetchLiveData}
          disabled={isFetchingLive}
          title="Click to query Metabase endpoint and reload live subscribers immediately"
          id="btn-fetch-live-data"
        >
          <RefreshCw size={16} className={isFetchingLive ? "spin-fast" : ""} />
          <span>{isFetchingLive ? "Fetching Live Data..." : "Fetch Live Data"}</span>
        </button>

        {/* Google Sheet Sync Button */}
        <button 
          className="btn"
          style={{ 
            background: 'linear-gradient(135deg, #10b981, #059669)', 
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' 
          }}
          onClick={onOpenGoogleSheet}
          title="Push live data to Google Sheet with Sales Team Filters"
        >
          <FileSpreadsheet size={16} />
          <span>Google Sheet Sync</span>
        </button>

        {/* Metabase Live Link Button */}
        <button 
          className="btn btn-metabase"
          onClick={onOpenMetabase}
          title="Configure Metabase Link & View Live Query"
        >
          <Database size={16} />
          <span>Metabase Link</span>
        </button>

        {/* Download Report Button */}
        <button 
          className="btn btn-secondary"
          onClick={onExportReport}
          title={`Download ${activeTab === 'renewal' ? 'Renewal Subscribers' : 'Upgrade Pipeline'} CSV Report`}
        >
          <Download size={16} />
          <span>Download Report</span>
        </button>

        {/* Quick Admin Portal Direct Jump */}
        <a 
          href="https://admin.theelefant.ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-admin"
          title="Direct Jump to Central Admin Portal"
        >
          <ShieldCheck size={16} />
          <span>Admin Portal</span>
          <ExternalLink size={13} />
        </a>

        {/* Manage Team Credentials */}
        <button 
          className="btn btn-outline"
          onClick={onOpenCredentials}
          title="Manage Authorized Team Members & Logins"
          style={{ padding: '6px 10px' }}
        >
          <Users size={16} />
          <span>Team Access</span>
        </button>

        {/* Current Logged-in User Badge */}
        {currentUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.8rem'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.7rem'
            }}>
              {(currentUser.name || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>{currentUser.name}</span>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{currentUser.role}</span>
            </div>
            <button 
              className="btn-icon"
              style={{ width: '24px', height: '24px', marginLeft: '2px', color: '#ef4444' }}
              onClick={onLogout}
              title="Sign Out of Dashboard"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}

        {/* Theme Toggle */}
        <button 
          className="btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
