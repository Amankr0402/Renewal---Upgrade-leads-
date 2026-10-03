import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  PhoneCall, 
  FileText, 
  Tag, 
  Clock, 
  Filter,
  Check,
  Copy,
  Layers,
  Sparkles
} from 'lucide-react';
import { fetchRemoteNotes } from '../utils/dbSync';
import { getStoredNotesMap } from '../data/mockData';
import { downloadCSV } from '../utils/exportUtils';

export default function DatabaseView({ currentUser, renewals = [], onSelectUser }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [storageEngine, setStorageEngine] = useState('Detecting storage...');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [copiedSql, setCopiedSql] = useState(false);

  // Load all records from remote Postgres and local fallback
  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await fetchRemoteNotes();
      let allNotes = (data && data.notes && Array.isArray(data.notes)) ? [...data.notes] : [];

      // Also merge browser notes from getStoredNotesMap so nothing is ever lost
      const localMap = getStoredNotesMap();
      Object.entries(localMap).forEach(([subId, notesArr]) => {
        if (Array.isArray(notesArr)) {
          notesArr.forEach(n => {
            const exists = allNotes.some(
              existing => (existing.id && existing.id === n.id) || 
                          (existing.text === n.text && existing.timestamp === n.timestamp)
            );
            if (!exists) {
              allNotes.push({
                ...n,
                subscriberId: n.subscriberId || subId,
                storage: 'Local Browser Storage'
              });
            }
          });
        }
      });

      setDbConnected(Boolean(data?.dbConnected));
      setStorageEngine(data?.dbConnected 
        ? 'Vercel Postgres (Neon Cloud Database)' 
        : 'Local Database Engine (notes_db.json & Local Persistence)'
      );
      setNotes(allNotes);
    } catch (err) {
      console.error('Error loading database records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      // Type/Tag filter
      if (selectedFilter === 'calls' && n.tag !== 'Call Log') return false;
      if (selectedFilter === 'manual' && n.tag === 'Call Log') return false;
      if (selectedFilter === 'aman' && !n.author?.toLowerCase().includes('aman')) return false;
      if (selectedFilter === 'vikash' && !n.author?.toLowerCase().includes('vikash')) return false;

      // Text search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchSubId = (n.subscriberId || n.subscriber_id || '').toLowerCase().includes(q);
        const matchText = (n.text || '').toLowerCase().includes(q);
        const matchAuthor = (n.author || '').toLowerCase().includes(q);
        const matchEmail = (n.authorEmail || '').toLowerCase().includes(q);
        const matchTag = (n.tag || '').toLowerCase().includes(q);
        if (!matchSubId && !matchText && !matchAuthor && !matchEmail && !matchTag) {
          return false;
        }
      }
      return true;
    });
  }, [notes, selectedFilter, searchTerm]);

  // Metric counts
  const totalCount = notes.length;
  const callLogsCount = notes.filter(n => n.tag === 'Call Log').length;
  const manualNotesCount = notes.filter(n => n.tag !== 'Call Log').length;
  const uniqueAuthors = Array.from(new Set(notes.map(n => n.author).filter(Boolean)));

  // Export full notes database to CSV
  const handleExportDatabase = () => {
    if (notes.length === 0) {
      alert('No database records to export.');
      return;
    }
    const formatted = notes.map((n, i) => ({
      "Record ID": n.id || `REC-${i + 1}`,
      "Subscriber / Lead ID": n.subscriberId || n.subscriber_id || 'N/A',
      "Note / Log Text": n.text || '',
      "Tag": n.tag || 'General Note',
      "Author": n.author || 'Operations Agent',
      "Author Email": n.authorEmail || '',
      "Author Role": n.authorRole || 'Agent',
      "Timestamp": n.timestamp || n.created_at_text || '',
      "Storage Engine": n.storage || (dbConnected ? 'Vercel Postgres' : 'Local Database')
    }));

    downloadCSV(`Database_Notes_Full_Export_${Date.now()}.csv`, formatted);
  };

  const sqlSchema = `CREATE TABLE subscriber_notes (
  id VARCHAR(255) PRIMARY KEY,
  subscriber_id VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  author_role VARCHAR(100),
  tag VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at_text VARCHAR(100)
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="tab-pane active" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Control Bar */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: dbConnected 
                ? 'linear-gradient(135deg, #10b981, #047857)' 
                : 'linear-gradient(135deg, #6366f1, #4338ca)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#ffffff',
              boxShadow: dbConnected ? '0 4px 14px rgba(16, 185, 129, 0.3)' : '0 4px 14px rgba(99, 102, 241, 0.3)'
            }}>
              <Database size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>Notes &amp; Call Logs Database Console</h2>
                <span className={`badge ${dbConnected ? 'badge-emerald' : 'badge-indigo'}`}>
                  {dbConnected ? 'Vercel Postgres Connected' : 'Local Persistence Active'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Inspect, search, and verify all subscriber notes and caller outreach logs stored in the database.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-outline" 
              onClick={loadRecords}
              disabled={loading}
              title="Refresh database records"
            >
              <RefreshCw size={15} className={loading ? 'spin-fast' : ''} />
              <span>{loading ? 'Refreshing...' : 'Refresh Records'}</span>
            </button>

            <button 
              className="btn btn-secondary"
              onClick={handleExportDatabase}
              title="Export all database notes to CSV spreadsheet"
            >
              <Download size={15} />
              <span>Export Database CSV</span>
            </button>

            {/* Direct Link to Vercel Postgres Dashboard */}
            <a 
              href="https://vercel.com/dashboard/stores" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #000000, #1e293b)', border: '1px solid var(--border-medium)' }}
              title="Open Vercel Postgres Storage Dashboard in new tab"
            >
              <ExternalLink size={15} />
              <span>Open Vercel Postgres Dashboard</span>
            </a>
          </div>
        </div>

        {/* Storage Engine Status Banner */}
        <div style={{
          background: dbConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.08)',
          border: `1px solid ${dbConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {dbConnected ? <CheckCircle2 size={18} style={{ color: '#34d399' }} /> : <Database size={18} style={{ color: '#818cf8' }} />}
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              Active Storage: <strong style={{ color: dbConnected ? '#34d399' : '#818cf8' }}>{storageEngine}</strong>
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {dbConnected 
              ? 'Data streams continuously to cloud PostgreSQL table "subscriber_notes"'
              : 'Stored in local "notes_db.json" + browser storage. Connect Vercel Postgres for multi-device sync.'}
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Database Records</span>
            <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Layers size={18} />
            </div>
          </div>
          <div className="stat-val-row">
            <span className="stat-val" style={{ color: '#818cf8' }}>{totalCount}</span>
            <span className="badge badge-indigo">Total Logs</span>
          </div>
          <p className="stat-subtext">All notes and caller outreach events</p>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-title">Sales Outreach Calls</span>
            <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <PhoneCall size={18} />
            </div>
          </div>
          <div className="stat-val-row">
            <span className="stat-val" style={{ color: '#34d399' }}>{callLogsCount}</span>
            <span className="badge badge-emerald">Calls Marked</span>
          </div>
          <p className="stat-subtext">Logged by Aman Soni &amp; Vikash</p>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-title">Manual Customer Notes</span>
            <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="stat-val-row">
            <span className="stat-val" style={{ color: '#fbbf24' }}>{manualNotesCount}</span>
            <span className="badge badge-amber">Detailed Notes</span>
          </div>
          <p className="stat-subtext">Custom notes with specific lead tags</p>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Database Authors</span>
            <div className="stat-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
              <UserCheck size={18} />
            </div>
          </div>
          <div className="stat-val-row">
            <span className="stat-val" style={{ color: '#f472b6' }}>{uniqueAuthors.length}</span>
            <span className="badge badge-rose">Team Contributors</span>
          </div>
          <p className="stat-subtext">{uniqueAuthors.join(', ') || 'Team Members'}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar glass-panel" style={{ padding: '14px 18px' }}>
        <div className="search-box-wrap" style={{ minWidth: '320px' }}>
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            className="search-input"
            placeholder="Search by Lead ID, Author, Note text, or Tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <button 
            className={`filter-pill ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            All Records ({totalCount})
          </button>
          <button 
            className={`filter-pill ${selectedFilter === 'calls' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('calls')}
          >
            Call Logs ({callLogsCount})
          </button>
          <button 
            className={`filter-pill ${selectedFilter === 'manual' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('manual')}
          >
            Manual Notes ({manualNotesCount})
          </button>
          <button 
            className={`filter-pill ${selectedFilter === 'aman' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('aman')}
          >
            Aman Soni ({notes.filter(n => n.author?.toLowerCase().includes('aman')).length})
          </button>
          <button 
            className={`filter-pill ${selectedFilter === 'vikash' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('vikash')}
          >
            Vikash ({notes.filter(n => n.author?.toLowerCase().includes('vikash')).length})
          </button>
        </div>
      </div>

      {/* Database Records Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>#</th>
              <th>Lead / Subscriber ID</th>
              <th>Note &amp; Log Content</th>
              <th>Tag</th>
              <th>Author (Who Wrote It)</th>
              <th>Role &amp; Email</th>
              <th>Timestamp</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                  <Database size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No database records match your filter</p>
                  <p style={{ fontSize: '0.8rem' }}>Write notes on any subscriber in the Renewal or Upgrade tabs to see them here.</p>
                </td>
              </tr>
            ) : (
              filteredNotes.map((note, idx) => {
                const subId = note.subscriberId || note.subscriber_id || 'N/A';
                const isCallLog = note.tag === 'Call Log';
                const matchedUser = renewals.find(r => r.id === subId || r.userId === subId || r.userNumber === subId);

                return (
                  <tr key={note.id || idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{idx + 1}</td>
                    
                    {/* Subscriber ID */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span className="badge badge-indigo" style={{ width: 'fit-content', fontSize: '0.74rem' }}>
                          {subId}
                        </span>
                        {matchedUser && (
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                            {matchedUser.name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Note Content */}
                    <td style={{ maxWidth: '340px' }}>
                      <div style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)',
                        lineHeight: '1.45',
                        background: isCallLog ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${isCallLog ? '#10b981' : '#6366f1'}`
                      }}>
                        {note.text}
                      </div>
                    </td>

                    {/* Tag */}
                    <td>
                      <span className={`badge ${isCallLog ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                        {isCallLog ? <PhoneCall size={10} /> : <Tag size={10} />}
                        <span>{note.tag || 'General'}</span>
                      </span>
                    </td>

                    {/* Author */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div 
                          className="avatar-badge" 
                          style={{ 
                            width: '26px', 
                            height: '26px', 
                            fontSize: '0.7rem',
                            background: note.author?.toLowerCase().includes('vikash') ? '#10b981' : '#6366f1'
                          }}
                        >
                          {(note.author || 'U').slice(0, 1).toUpperCase()}
                        </div>
                        <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                          {note.author || 'Sales Agent'}
                        </strong>
                      </div>
                    </td>

                    {/* Role & Email */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="badge badge-cyan" style={{ width: 'fit-content', fontSize: '0.64rem' }}>
                          {note.authorRole || 'Team Member'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {note.authorEmail || 'Internal'}
                        </span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{note.timestamp || note.created_at_text || 'Recent'}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'right' }}>
                      {matchedUser && onSelectUser ? (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => onSelectUser(matchedUser)}
                          title="Open Subscriber Details"
                        >
                          View Lead
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Saved</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cloud Setup & Architecture Guide Card */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} style={{ color: '#10b981' }} />
              <span>Vercel Postgres SQL Table Architecture</span>
            </h4>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              How notes are structured and how to inspect them directly in Vercel Cloud Console.
            </p>
          </div>

          <button 
            className="btn btn-sm btn-outline"
            onClick={copySql}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedSql ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
            <span>{copiedSql ? 'SQL Copied!' : 'Copy Schema SQL'}</span>
          </button>
        </div>

        <pre style={{
          background: 'var(--bg-input)',
          padding: '14px',
          borderRadius: '8px',
          fontSize: '0.76rem',
          color: '#38bdf8',
          fontFamily: 'var(--font-mono)',
          overflowX: 'auto',
          border: '1px solid var(--border-subtle)',
          margin: 0
        }}>
          {sqlSchema}
        </pre>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <div>
            <strong>1. In Vercel:</strong> Go to Project &gt; <strong>Storage</strong> &gt; Connect <strong>Postgres</strong>.
          </div>
          <div>
            <strong>2. View Tables:</strong> Click <strong>Data</strong> tab to see all rows in <code>subscriber_notes</code>.
          </div>
          <div>
            <strong>3. Live Sync:</strong> All notes authored by Aman Soni or Vikash are automatically stored.
          </div>
        </div>
      </div>
    </div>
  );
}
