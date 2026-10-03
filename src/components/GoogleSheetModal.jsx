import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  X, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  ShieldCheck, 
  Filter, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  getGoogleSheetWebhookUrl, 
  saveGoogleSheetWebhookUrl, 
  syncToGoogleSheet, 
  getLastGoogleSheetSyncTime 
} from '../utils/googleSheetSync';

export default function GoogleSheetModal({ 
  isOpen, 
  onClose, 
  renewals = [], 
  upgrades = [],
  onSyncSuccess 
}) {
  const [webhookUrl, setWebhookUrl] = useState(getGoogleSheetWebhookUrl());
  const [maxRenewals, setMaxRenewals] = useState(500);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const lastSync = getLastGoogleSheetSyncTime();

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    saveGoogleSheetWebhookUrl(webhookUrl);
    setStatusMsg('Webhook URL saved successfully!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleSyncNow = async () => {
    if (!webhookUrl.trim()) {
      setStatusMsg('Please enter your Google Apps Script Web App URL first.');
      return;
    }
    saveGoogleSheetWebhookUrl(webhookUrl);
    setIsSyncing(true);
    setStatusMsg('');

    try {
      const res = await syncToGoogleSheet({
        renewals,
        upgrades,
        maxRenewals: Number(maxRenewals)
      });
      setIsSyncing(false);
      setStatusMsg(`Successfully synced ${res.renewalsCount} renewals & ${res.upgradesCount} upgrades to Google Sheet!`);
      if (onSyncSuccess) onSyncSuccess(res);
    } catch (err) {
      setIsSyncing(false);
      setStatusMsg('Sync failed: ' + err.message);
    }
  };

  const handleCopyScriptPath = () => {
    navigator.clipboard.writeText('google_sheets_apps_script.js');
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #10b981, #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                Google Sheet Live Sync & Sales Team Filters
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Push live renewals, upgrades, and manual notes with native filters for your sales team
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Quick Setup Instructions */}
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.08)', 
            border: '1px solid rgba(99, 102, 241, 0.25)', 
            borderRadius: '10px', 
            padding: '14px 16px',
            fontSize: '0.82rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 800, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} /> Quick 2-Minute Google Sheet Setup
              </span>
              <button 
                className="btn btn-sm btn-outline" 
                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                onClick={handleCopyScriptPath}
              >
                {copiedScript ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                <span>{copiedScript ? 'File name copied!' : 'Script: google_sheets_apps_script.js'}</span>
              </button>
            </div>
            <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <li>Open a new Google Sheet at <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>sheets.new <ExternalLink size={10} style={{ display: 'inline' }} /></a></li>
              <li>Click <strong>Extensions &gt; Apps Script</strong> and paste the contents of <code>google_sheets_apps_script.js</code></li>
              <li>Click <strong>Deploy &gt; New deployment &gt; Web app</strong> (Set "Who has access" to <strong>Anyone</strong>)</li>
              <li>Copy the generated Web App URL and paste it below!</li>
            </ol>
          </div>

          {/* Webhook Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Google Apps Script Web App URL
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="url"
                className="search-input"
                style={{ flex: 1, padding: '9px 12px', fontSize: '0.84rem' }}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <button className="btn btn-outline" onClick={handleSaveUrl}>
                Save URL
              </button>
            </div>
          </div>

          {/* Sync Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Batch Size for Renewals
              </label>
              <select 
                className="search-input"
                style={{ width: '100%', padding: '8px 10px', fontSize: '0.82rem' }}
                value={maxRenewals}
                onChange={(e) => setMaxRenewals(e.target.value)}
              >
                <option value={200}>Top 200 Hot Leads & Expired</option>
                <option value={500}>Top 500 High-Priority Leads (Recommended)</option>
                <option value={1000}>Top 1,000 Recent Subscribers</option>
                <option value={3000}>Top 3,000 Subscribers (2026)</option>
              </select>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                All 227 upgrades will always be fully synced.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Sales Team Filter View
              </label>
              <div style={{ 
                background: 'var(--card-bg)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '8px 12px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700 }}>
                  <Filter size={13} /> Native Filters Auto-Enabled
                </div>
                <span>Your sales team can filter by Urgency, City Hub, Assignee, and Order count directly inside Google Sheet.</span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div style={{ 
              padding: '10px 14px', 
              borderRadius: '8px', 
              background: statusMsg.includes('failed') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: statusMsg.includes('failed') ? '#f87171' : '#34d399',
              fontSize: '0.82rem',
              fontWeight: 600
            }}>
              {statusMsg}
            </div>
          )}

          {/* Sync Stats */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '10px 14px',
            background: 'var(--card-bg)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Last Synced to Google Sheet: <strong style={{ color: 'var(--text-primary)' }}>{lastSync}</strong>
            </span>
            <span className="badge badge-emerald">
              {renewals.length.toLocaleString('en-IN')} Available Renewals
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={isSyncing}>
            Close
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSyncNow}
            disabled={isSyncing}
            style={{ 
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={15} className={isSyncing ? 'spin-icon' : ''} />
            <span>{isSyncing ? 'Syncing to Google Sheet...' : 'Sync to Google Sheet Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
