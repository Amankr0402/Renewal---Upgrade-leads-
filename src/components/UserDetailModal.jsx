import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  PhoneCall, 
  Clock, 
  Calendar, 
  UserCheck, 
  FileText, 
  Send, 
  Building, 
  Mail, 
  Phone,
  Package,
  Tag,
  Play,
  Volume2,
  Trash2
} from 'lucide-react';

const QUICK_TAGS = [
  'Discount Request',
  'Callback Scheduled',
  'Decision Pending',
  'Upgrade Confirmed',
  'Payment Issue',
  'Toy Rotation Inquiry',
  'High Engagement User',
  'No Answer'
];

export default function UserDetailModal({ 
  user, 
  type = 'upgrade', // 'renewal' or 'upgrade'
  currentUser,
  onClose, 
  onAddNote, 
  onDeleteNote, 
  onAdminJump 
}) {
  const [noteText, setNoteText] = useState('');
  const [selectedTag, setSelectedTag] = useState(type === 'upgrade' ? 'Upgrade Confirmed' : 'Discount Request');
  const [authorName, setAuthorName] = useState(currentUser?.name || 'Operations Agent');
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  if (!user) return null;

  const isUpgrade = type === 'upgrade';
  const notes = user.notes || [];

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const formattedTime = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newNote = {
      id: `note-${Date.now()}`,
      author: currentUser?.name || authorName.trim() || 'Operations Agent',
      authorEmail: currentUser?.email || '',
      authorRole: currentUser?.role || 'Agent',
      text: noteText.trim(),
      timestamp: formattedTime,
      tag: selectedTag
    };

    onAddNote(user.id, newNote, type);
    setNoteText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px' }}
      >
        {/* Header with REAL Customer Name */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              className="avatar-badge"
              style={{ 
                width: '46px', 
                height: '46px', 
                fontSize: '1rem',
                background: isUpgrade ? 'linear-gradient(135deg, #10b981, #047857)' : 'linear-gradient(135deg, #6366f1, #4338ca)'
              }}
            >
              {(user.userName || user.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {user.userName || user.name}
                </h2>
                <span className="badge badge-indigo">
                  {user.userNumber || user.userId || user.id}
                </span>
                {user.totalOrders !== undefined && (
                  <span className="badge badge-emerald">
                    {user.totalOrders} Orders
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building size={13} /> {user.libraryCity || user.company}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={13} /> {user.email}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={13} /> {user.phone}
                </span>
              </div>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose} title="Close window">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Quick Jump Action Bar */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              gap: '12px',
              background: 'var(--bg-input)',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border-medium)',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                Direct Jump Gateways
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Immediate one-click redirect to external portals
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* Admin Portal Direct Jump Button */}
              <a 
                href={user.adminUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-admin"
                onClick={() => onAdminJump && onAdminJump(user)}
                title={`Jump directly into Admin Portal for ${user.userName || user.name}`}
              >
                <ShieldCheck size={16} />
                <span>Jump to Admin Portal</span>
                <ExternalLink size={13} />
              </a>

              {/* TeleCRM Lead Portal Link */}
              <a 
                href={`https://crm.telecrm.in/leads/${user.telecrmId || 'TC-lead'}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-telecrm"
                title="Open lead conversation in TeleCRM"
              >
                <PhoneCall size={16} />
                <span>Open in TeleCRM</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Metric Overview with Total Orders Card */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
              gap: '12px' 
            }}
          >
            <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                {isUpgrade ? 'Upgraded Plan' : 'Current Plan'}
              </span>
              <p style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: '3px' }}>
                {user.upgradedPlan || user.plan}
              </p>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                {isUpgrade ? 'Subscription Paid' : 'Renewal Price'}
              </span>
              <p style={{ fontSize: '0.94rem', fontWeight: 800, color: '#10b981', marginTop: '3px' }}>
                ₹{(user.newPrice || user.planPrice || 0).toLocaleString('en-IN')}
              </p>
            </div>

            {user.totalOrders !== undefined && (
              <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Package size={12} style={{ color: '#10b981' }} /> Total Orders
                </span>
                <p style={{ fontSize: '0.98rem', fontWeight: 800, color: '#38bdf8', marginTop: '3px' }}>
                  {user.totalOrders} Orders
                </p>
              </div>
            )}

            {user.coupon && (
              <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Coupon Code
                </span>
                <p style={{ fontSize: '0.92rem', fontWeight: 700, color: user.coupon !== 'None' ? '#fbbf24' : 'var(--text-muted)', marginTop: '3px' }}>
                  {user.coupon}
                </p>
              </div>
            )}
          </div>

          {/* TeleCRM Call Details Section */}
          <div 
            style={{ 
              background: 'var(--bg-secondary)', 
              padding: '16px', 
              borderRadius: '10px', 
              border: '1px solid var(--border-medium)' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={18} style={{ color: '#f97316' }} />
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>TeleCRM Call Intelligence & Assignee</h4>
              </div>
              <span className="badge badge-indigo">
                {user.telecrmDetails?.callStatus || 'Contacted'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>SALES ASSIGNEE</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <UserCheck size={14} style={{ color: '#f97316' }} />
                  {user.salesAssignee || user.telecrmDetails?.lastAssignee || 'Rahul Sharma'}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>LAST CALL DURATION</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <Clock size={14} />
                  {user.telecrmDetails?.duration || '04m 30s'}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>TOUCHPOINT DATE</span>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <Calendar size={14} />
                  {user.upgradeDate || user.telecrmDetails?.lastCallDate || 'Recently'}
                </strong>
              </div>
            </div>
          </div>

          {/* Dedicated Manual Notes Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
                <h4 style={{ fontSize: '0.96rem', fontWeight: 700 }}>
                  Manual Notes & Log ({notes.length})
                </h4>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Saved locally & exportable
              </span>
            </div>

            {/* Note History Timeline */}
            <div className="notes-timeline">
              {notes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No manual notes recorded for this subscriber yet. Use the form below to log notes.
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="note-item">
                    <div className="note-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{note.author}</strong>
                        {note.authorRole && (
                          <span className="badge badge-indigo" style={{ padding: '1px 5px', fontSize: '0.62rem' }}>
                            {note.authorRole}
                          </span>
                        )}
                        {note.authorEmail && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            ({note.authorEmail})
                          </span>
                        )}
                        {note.tag && (
                          <span className="badge badge-cyan" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                            {note.tag}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{note.timestamp}</span>
                        {onDeleteNote && (
                          <button 
                            className="btn-icon" 
                            style={{ width: '20px', height: '20px', border: 'none', background: 'transparent' }}
                            onClick={() => onDeleteNote(user.id, note.id, type)}
                            title="Delete note"
                          >
                            <Trash2 size={12} style={{ color: '#fb7185' }} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="note-text">{note.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            <form className="add-note-form" onSubmit={handleSaveNote}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Add Note Manually
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Agent:</span>
                  <input 
                    type="text" 
                    value={authorName} 
                    onChange={(e) => setAuthorName(e.target.value)} 
                    style={{ 
                      padding: '3px 8px', 
                      background: 'var(--bg-input)', 
                      border: '1px solid var(--border-medium)', 
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontSize: '0.76rem'
                    }} 
                  />
                </div>
              </div>

              {/* Quick Tag Selector */}
              <div className="quick-tags">
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Tag:</span>
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
                    style={selectedTag === tag ? { background: 'var(--accent-primary)', color: '#fff', borderColor: 'var(--accent-primary)' } : {}}
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <textarea 
                className="note-textarea"
                placeholder="Log customer remarks, order discussion, toy preference, or upgrade confirmation..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Send size={13} />
                  <span>Save Note Manually</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
