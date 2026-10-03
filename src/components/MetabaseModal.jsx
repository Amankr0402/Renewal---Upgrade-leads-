import React, { useState } from 'react';
import { 
  X, 
  Database, 
  ExternalLink, 
  Save, 
  CheckCircle, 
  RefreshCw, 
  Layers, 
  Maximize2
} from 'lucide-react';

export default function MetabaseModal({ 
  config, 
  onSaveConfig, 
  onClose,
  onSyncData 
}) {
  const [renewalUrl, setRenewalUrl] = useState(config.renewalUrl || 'https://metabase-bkp.theelefant.ai/public/question/46d8e6e4-4bc2-43c5-93b0-03d1a05c6ce6.csv');
  const [upgradeUrl, setUpgradeUrl] = useState(config.upgradeUrl || 'https://metabase-bkp.theelefant.ai/public/question/8f167047-f200-4aa7-b56a-f7ff2964eaa7.csv');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveConfig({ ...config, renewalUrl, upgradeUrl });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #5061ff, #3842c7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Metabase Question Endpoints & Data Sync</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Configure live CSV links for both Renewals and Upgrades
              </p>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Metabase URLs Form */}
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Renewal URL */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#818cf8' }}>
                1. Renewal Subscribers Question Link:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={renewalUrl}
                  onChange={(e) => setRenewalUrl(e.target.value)}
                  placeholder="https://metabase-bkp.theelefant.ai/public/question/46d8e6e4-4bc2-43c5-93b0-03d1a05c6ce6.csv"
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem'
                  }}
                />
                <a 
                  href={renewalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  <ExternalLink size={14} />
                  <span>Open</span>
                </a>
              </div>
            </div>

            {/* Upgrade URL */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#34d399' }}>
                2. Upgrade Breakdown Question Link:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={upgradeUrl}
                  onChange={(e) => setUpgradeUrl(e.target.value)}
                  placeholder="https://metabase-bkp.theelefant.ai/public/question/8f167047-f200-4aa7-b56a-f7ff2964eaa7.csv"
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem'
                  }}
                />
                <a 
                  href={upgradeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  <ExternalLink size={14} />
                  <span>Open</span>
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={15} />
                <span>Save Configured Links</span>
              </button>
            </div>

            {savedSuccess && (
              <div style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={15} />
                <span>Metabase links updated successfully!</span>
              </div>
            )}
          </form>

          {/* Quick Actions Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <button 
              className="btn btn-success"
              onClick={() => {
                if (onSyncData) onSyncData();
              }}
            >
              <RefreshCw size={15} />
              <span>Sync All Live Metabase Feeds Now</span>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
