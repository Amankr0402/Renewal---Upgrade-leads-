import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck, 
  Tag, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { fetchRemoteNotes } from '../utils/dbSync';

export default function DatabaseViewerModal({ isOpen, onClose }) {
  const [dbState, setDbState] = useState({
    loading: true,
    dbConnected: false,
    storage: '',
    count: 0,
    notes: []
  });
  const [copied, setCopied] = useState(false);

  const loadNotes = async () => {
    setDbState(prev => ({ ...prev, loading: true }));
    try {
      const data = await fetchRemoteNotes();
      setDbState({
        loading: false,
        dbConnected: data.dbConnected || false,
        storage: data.storage || (data.dbConnected ? 'Vercel Postgres (Live)' : 'Local Database & Browser Storage'),
        count: data.notes ? data.notes.length : 0,
        notes: data.notes || []
      });
    } catch (e) {
      setDbState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: dbState.dbConnected 
                ? 'linear-gradient(135deg, #10b981, #047857)' 
                : 'linear-gradient(135deg, #6366f1, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Database Records &amp; Storage Verification</span>
                <span className={`badge ${dbState.dbConnected ? 'badge-emerald' : 'badge-indigo'}`} style={{ fontSize: '0.72rem' }}>
                  {dbState.dbConnected ? 'Vercel Postgres Connected' : 'Local Persistence Active'}
                </span>
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Verify all manual notes, who authored them, and where they are stored
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Storage Status Box */}
          <div style={{
            background: dbState.dbConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
            border: `1px solid ${dbState.dbConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
            borderRadius: '10px',
            padding: '14px 16px',
            fontSize: '0.84rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ color: dbState.dbConnected ? '#34d399' : '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {dbState.dbConnected ? <CheckCircle2 size={16} /> : <Database size={16} />}
                Storage Engine: {dbState.storage}
              </strong>
              <button 
                className="btn btn-sm btn-outline"
                style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                onClick={loadNotes}
                disabled={dbState.loading}
              >
                <RefreshCw size={12} className={dbState.loading ? 'spin-icon' : ''} />
                <span>Refresh Data</span>
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {dbState.dbConnected ? (
                <span>All notes are streaming live into your cloud <strong>Vercel Postgres (Neon)</strong> database table <code>subscriber_notes</code>.</span>
              ) : (
                <span>
                  Notes are stored on your local disk in <code>notes_db.json</code> and in your browser's persistence layer. When this project is deployed to Vercel and connected to Vercel Postgres, all notes stream directly to Postgres.
                </span>
              )}
            </p>
          </div>

          {/* Notes Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 800 }}>
                Logged Notes ({dbState.count})
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Showing all notes with author email and role
              </span>
            </div>

            {dbState.notes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '36px 20px',
                background: 'var(--card-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '0.84rem'
              }}>
                <Database size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No manual notes found in database yet</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.76rem' }}>
                  Click "Details" on any subscriber in the dashboard and add a note to see it recorded here.
                </p>
              </div>
            ) : (
              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dbState.notes.map((n, i) => (
                  <div 
                    key={n.id || i}
                    style={{
                      padding: '12px 14px',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-indigo" style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                          Lead ID: {n.subscriberId || n.subscriber_id}
                        </span>
                        <strong style={{ color: 'var(--text-primary)' }}>{n.author}</strong>
                        {n.authorEmail && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ({n.authorEmail})
                          </span>
                        )}
                        {n.authorRole && (
                          <span className="badge badge-cyan" style={{ padding: '1px 5px', fontSize: '0.62rem' }}>
                            {n.authorRole}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {n.timestamp}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                      {n.text}
                    </p>
                    {n.tag && (
                      <div style={{ marginTop: '6px' }}>
                        <span className="badge badge-amber" style={{ padding: '1px 6px', fontSize: '0.64rem' }}>
                          Tag: {n.tag}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
