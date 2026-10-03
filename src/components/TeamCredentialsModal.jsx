import React, { useState } from 'react';
import { 
  Users, 
  X, 
  Plus, 
  Trash2, 
  Key, 
  UserCheck, 
  ShieldCheck, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { 
  getStoredCredentials, 
  addCredential, 
  removeCredential 
} from '../data/authService';

export default function TeamCredentialsModal({ isOpen, onClose, currentUser, onCredentialsChange }) {
  const [credentialsList, setCredentialsList] = useState(getStoredCredentials());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sales Executive');
  const [team, setTeam] = useState('Sales');
  const [msg, setMsg] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setMsg('Please fill in Name, Email, and Password.');
      return;
    }

    addCredential({ name, email, password, role, team });
    const updated = getStoredCredentials();
    setCredentialsList(updated);
    setName('');
    setEmail('');
    setPassword('');
    setMsg(`Access granted for ${email}`);
    setTimeout(() => setMsg(''), 3000);
    if (onCredentialsChange) onCredentialsChange(updated);
  };

  const handleRemove = (targetEmail) => {
    if (targetEmail === currentUser?.email) {
      alert("You cannot remove your own active login credentials.");
      return;
    }
    const updated = removeCredential(targetEmail);
    setCredentialsList(updated);
    setMsg(`Removed access for ${targetEmail}`);
    setTimeout(() => setMsg(''), 3000);
    if (onCredentialsChange) onCredentialsChange(updated);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #6366f1, #4338ca)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Users size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                Authorized Team Credentials
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Only authorized emails and passwords can log in to view data and add notes
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Add New Credential Form */}
          <form onSubmit={handleAdd} style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={15} /> Grant Access to New Team Member
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Vikram Patel"
                  className="search-input"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Work Email</label>
                <input 
                  type="email"
                  required
                  placeholder="vikram@theelefant.ai"
                  className="search-input"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Password</label>
                <input 
                  type="text"
                  required
                  placeholder="Vikram@2026!"
                  className="search-input"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Role</label>
                <select 
                  className="search-input"
                  style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Sales Lead">Sales Lead</option>
                  <option value="TeleCRM Agent">TeleCRM Agent</option>
                  <option value="CRM Manager">CRM Manager</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-end', padding: '6px 14px', fontSize: '0.8rem', marginTop: '4px' }}
            >
              Add Authorized Member
            </button>
          </form>

          {/* Feedback message */}
          {msg && (
            <div style={{ 
              padding: '8px 12px', 
              borderRadius: '8px', 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#34d399', 
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              {msg}
            </div>
          )}

          {/* Existing Authorized Members List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                Active Authorized Users ({credentialsList.length})
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                These accounts can log in and author notes
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {credentialsList.map(c => (
                <div 
                  key={c.id || c.email}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.78rem'
                    }}>
                      {c.name ? c.name.slice(0, 2).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700 }}>{c.name}</span>
                        <span className="badge badge-indigo" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                          {c.role}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {c.email} &bull; Password: <code>{c.password}</code>
                      </span>
                    </div>
                  </div>

                  {c.email !== currentUser?.email && (
                    <button 
                      className="btn-icon" 
                      style={{ color: '#ef4444' }} 
                      title={`Remove access for ${c.email}`}
                      onClick={() => handleRemove(c.email)}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
