import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ExternalLink, 
  PhoneCall, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  Filter, 
  Plus, 
  ChevronRight,
  UserCheck,
  Package,
  Flame,
  Tag,
  MapPin,
  ArrowUpRight,
  ChevronLeft,
  Check,
  MessageSquare
} from 'lucide-react';

export default function RenewalView({ 
  renewals, 
  selectedFilter, 
  setSelectedFilter, 
  onSelectUser, 
  onQuickAddNote,
  onAdminJump,
  currentUser,
  onToggleCall
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Filter logic across all renewal records
  const filteredRenewals = useMemo(() => {
    return renewals.filter(user => {
      // Called status filter
      if (selectedFilter === 'called' && (!user.calledStatus || !user.calledStatus.isCalled)) return false;
      if (selectedFilter === 'not_called' && user.calledStatus && user.calledStatus.isCalled) return false;

      // Month / Urgency filter
      if (selectedFilter === 'oct_hot' && !user.expireDate?.startsWith('2026-10')) return false;
      if (selectedFilter === 'sep_expired' && !user.expireDate?.startsWith('2026-09')) return false;
      if (selectedFilter === 'aug_expired' && !user.expireDate?.startsWith('2026-08')) return false;
      if (selectedFilter === 'jul_expired' && !user.expireDate?.startsWith('2026-07')) return false;

      // Expiry Date Range Filter
      if (dateFrom && user.expireDate < dateFrom) return false;
      if (dateTo && user.expireDate > dateTo) return false;

      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = user.name?.toLowerCase().includes(query);
        const matchesUserNum = user.userNumber?.toLowerCase().includes(query);
        const matchesPhone = user.phone?.includes(query);
        const matchesCompany = user.company?.toLowerCase().includes(query);
        const matchesPlan = user.plan?.toLowerCase().includes(query);
        const matchesAssignee = user.telecrmDetails?.lastAssignee?.toLowerCase().includes(query);
        const matchesCaller = user.calledStatus?.calledBy?.toLowerCase().includes(query);
        if (!matchesName && !matchesUserNum && !matchesPhone && !matchesCompany && !matchesPlan && !matchesAssignee && !matchesCaller) {
          return false;
        }
      }

      return true;
    });
  }, [renewals, selectedFilter, searchTerm, dateFrom, dateTo]);

  // Reset to page 1 when filter or search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchTerm, dateFrom, dateTo]);

  // Paginated slice
  const totalPages = Math.ceil(filteredRenewals.length / pageSize) || 1;
  const paginatedRenewals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRenewals.slice(start, start + pageSize);
  }, [filteredRenewals, currentPage, pageSize]);

  // Avatar color generator
  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #6366f1, #4338ca)',
      'linear-gradient(135deg, #ec4899, #be185d)',
      'linear-gradient(135deg, #0ea5e9, #0284c7)',
      'linear-gradient(135deg, #10b981, #047857)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getUrgencyBadge = (days, expireDate) => {
    if (expireDate && expireDate.startsWith('2026-10')) {
      return (
        <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Flame size={11} /> Hot Lead ({expireDate})
        </span>
      );
    }
    if (expireDate && expireDate.startsWith('2026-09')) {
      return <span className="badge badge-amber">Expired Sep 2026</span>;
    }
    if (expireDate && expireDate.startsWith('2026-08')) {
      return <span className="badge badge-indigo">Expired Aug 2026</span>;
    }
    return <span className="badge badge-cyan">{expireDate || 'Expired'}</span>;
  };

  // Month & Call counts for quick pills
  const octCount = useMemo(() => renewals.filter(r => r.expireDate?.startsWith('2026-10')).length, [renewals]);
  const sepCount = useMemo(() => renewals.filter(r => r.expireDate?.startsWith('2026-09')).length, [renewals]);
  const augCount = useMemo(() => renewals.filter(r => r.expireDate?.startsWith('2026-08')).length, [renewals]);
  const julCount = useMemo(() => renewals.filter(r => r.expireDate?.startsWith('2026-07')).length, [renewals]);
  const calledCount = useMemo(() => renewals.filter(r => r.calledStatus && r.calledStatus.isCalled).length, [renewals]);
  const notCalledCount = useMemo(() => renewals.filter(r => !r.calledStatus || !r.calledStatus.isCalled).length, [renewals]);

  return (
    <div className="renewal-view-container">
      {/* Control Bar: Renewal filter pills, Date range picker, Search */}
      <div className="control-bar">
        {/* Search */}
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text"
            className="search-input"
            placeholder="Search across all 16,843 renewal subscribers by name (Aryan, Neha, Ridhima...), UR ID, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Days Left Urgency Filter Pills */}
        <div className="filter-pills">
          <button 
            className={`filter-pill ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            All Renewals ({renewals.length.toLocaleString('en-IN')})
          </button>
          <button 
            className={`filter-pill ${selectedFilter === 'called' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('called')}
          >
            <Check size={13} style={{ color: '#34d399' }} />
            <span>Called ({calledCount})</span>
          </button>
          <button 
            className={`filter-pill ${selectedFilter === 'not_called' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('not_called')}
          >
            <PhoneCall size={13} style={{ color: '#fbbf24' }} />
            <span>Pending Calls ({notCalledCount})</span>
          </button>
          <button 
            className={`filter-pill ${selectedFilter === 'oct_hot' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('oct_hot')}
          >
            <Flame size={13} style={{ color: '#fb7185' }} />
            <span>Oct Hot Leads ({octCount})</span>
          </button>
          <button 
            className={`filter-pill ${selectedFilter === 'sep_expired' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('sep_expired')}
          >
            Sep Expired ({sepCount})
          </button>
          <button 
            className={`filter-pill ${selectedFilter === 'aug_expired' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('aug_expired')}
          >
            Aug Expired ({augCount})
          </button>
          <button 
            className={`filter-pill ${selectedFilter === 'jul_expired' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('jul_expired')}
          >
            Jul Expired ({julCount})
          </button>
        </div>

        {/* Expiry Date Range Panel */}
        <div className="range-panel" title="Filter by Expiry Date Range">
          <Calendar size={15} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Expires:</span>
          <input 
            type="date" 
            className="range-input" 
            value={dateFrom} 
            onChange={(e) => setDateFrom(e.target.value)} 
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>to</span>
          <input 
            type="date" 
            className="range-input" 
            value={dateTo} 
            onChange={(e) => setDateTo(e.target.value)} 
          />
          {(dateFrom || dateTo) && (
            <button 
              className="btn-sm btn-secondary" 
              style={{ padding: '2px 6px', fontSize: '0.7rem' }}
              onClick={() => { setDateFrom(''); setDateTo(''); }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="table-container desktop-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subscriber Name & Admin Jump</th>
              <th>Total Orders</th>
              <th>Subscription Plan & Value</th>
              <th>Expiration Date & Status</th>
              <th>Location & Coupon</th>
              <th>TeleCRM Assignee</th>
              <th>Manual Notes</th>
              <th>Calling &amp; Phone Dialer</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRenewals.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                  <Filter size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No renewal subscribers match the current filter</p>
                  <p style={{ fontSize: '0.8rem' }}>Try clearing your search query or selecting 'All Renewals'.</p>
                </td>
              </tr>
            ) : (
              paginatedRenewals.map((user, idx) => {
                const latestNote = user.notes && user.notes.length > 0 
                  ? user.notes[user.notes.length - 1] 
                  : null;

                return (
                  <tr key={`${user.id}-${user.userNumber || idx}-${idx}`}>
                    {/* User Real Name & Admin Link */}
                    <td>
                      <div className="user-cell">
                        <div 
                          className="avatar-badge" 
                          style={{ background: getAvatarColor(user.name) }}
                        >
                          {(user.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="user-meta">
                          {/* REAL Customer Name from Sheet */}
                          <div 
                            className="user-name-link"
                            onClick={() => onSelectUser(user)}
                            title="Click to view full details or jump to Admin Portal"
                            style={{ fontSize: '0.92rem', fontWeight: 800 }}
                          >
                            <span>{user.name}</span>
                            <ArrowUpRight size={13} style={{ color: '#10b981' }} />
                          </div>

                          {/* UR ID badge and Phone with Direct Calling */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                            <span className="badge badge-indigo" style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                              {user.userNumber || user.id}
                            </span>
                            {user.phone ? (
                              <a 
                                href={`tel:${user.phone}`}
                                className="phone-call-badge"
                                title="Click to dial on phone"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <PhoneCall size={10} />
                                <span>{user.phone}</span>
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                                {user.phone}
                              </span>
                            )}
                          </div>

                          {/* Direct Admin Jump Link */}
                          <div style={{ marginTop: '5px' }}>
                            <a 
                              href={user.adminUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-admin"
                              style={{ display: 'inline-flex', padding: '2px 8px', fontSize: '0.7rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onAdminJump) onAdminJump(user);
                              }}
                              title={`Jump into Admin Portal for ${user.name}`}
                            >
                              <ShieldCheck size={12} />
                              <span>Admin Portal Jump</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Total Orders Count */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span 
                          className="badge" 
                          style={{ 
                            background: user.totalOrders > 5 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                            color: user.totalOrders > 5 ? '#34d399' : '#818cf8',
                            border: '1px solid currentColor',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            width: 'fit-content'
                          }}
                        >
                          <Package size={12} />
                          <span>{user.totalOrders} Orders</span>
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Lifetime orders
                        </span>
                      </div>
                    </td>

                    {/* Plan & Value */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>{user.plan}</span>
                        <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.86rem' }}>
                          ₹{user.planPrice.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Started: {user.startDate}
                        </span>
                      </div>
                    </td>

                    {/* Expiry Date & Urgency Countdown */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} style={{ color: 'var(--text-secondary)' }} />
                          <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{user.expireDate}</span>
                        </div>
                        <div>
                          {getUrgencyBadge(user.daysLeft, user.expireDate)}
                        </div>
                      </div>
                    </td>

                    {/* Location & Coupon */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem' }}>
                          <MapPin size={12} />
                          <span style={{ fontWeight: 600 }}>{user.libraryCity}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Tag size={12} style={{ color: '#fbbf24' }} />
                          <span style={{ fontSize: '0.74rem', color: user.coupon !== 'None' ? '#fbbf24' : 'var(--text-muted)' }}>
                            {user.coupon}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* TeleCRM Assignee & Quick Lead Jump */}
                    <td>
                      <div className="telecrm-cell">
                        <div className="telecrm-assignee">
                          <UserCheck size={14} style={{ color: '#f97316' }} />
                          <span>{user.telecrmDetails?.lastAssignee || 'Rahul Sharma'}</span>
                        </div>
                        <div style={{ marginTop: '3px' }}>
                          <span className="badge badge-amber" style={{ padding: '2px 6px', fontSize: '0.68rem' }}>
                            {user.telecrmDetails?.callStatus}
                          </span>
                        </div>
                        <div style={{ marginTop: '5px' }}>
                          <a 
                            href={`https://crm.telecrm.in/leads/${user.telecrmId || user.userNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-telecrm"
                            style={{ display: 'inline-flex', padding: '2px 8px', fontSize: '0.7rem' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <PhoneCall size={11} />
                            <span>TeleCRM Lead</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Manual Notes Section */}
                    <td>
                      <div style={{ maxWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span 
                            className="notes-indicator"
                            onClick={() => onSelectUser(user)}
                            title="Click to view all notes"
                          >
                            <FileText size={12} />
                            <span>{user.notes ? user.notes.length : 0} Notes</span>
                          </span>
                          <button 
                            className="btn-icon"
                            style={{ width: '22px', height: '22px' }}
                            onClick={() => onQuickAddNote(user)}
                            title="Add note manually for this subscriber"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        {latestNote ? (
                          <div 
                            style={{ 
                              fontSize: '0.72rem', 
                              color: 'var(--text-secondary)',
                              background: 'var(--bg-input)',
                              padding: '4px 6px',
                              borderRadius: '4px',
                              borderLeft: '2px solid var(--accent-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <strong>{latestNote.author.split(' ')[0]}:</strong> {latestNote.text}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            No notes logged
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Calling & Phone Dialer Column */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {/* Direct One-Click Phone Dialer */}
                        {user.phone ? (
                          <a
                            href={`tel:${user.phone.replace(/[^0-9+]/g, '')}`}
                            className="btn btn-sm"
                            onClick={() => {
                              if (!user.calledStatus || !user.calledStatus.isCalled) {
                                onToggleCall && onToggleCall(user);
                              }
                            }}
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              textDecoration: 'none',
                              borderRadius: '6px',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: '#ffffff',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                              width: 'fit-content'
                            }}
                            title={`Click to open phone dialer for ${user.phone} and mark as called`}
                          >
                            <PhoneCall size={12} />
                            <span>Dial {user.phone}</span>
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No Phone</span>
                        )}

                        {/* Called Status Toggle & Salesperson Attribution */}
                        {user.calledStatus && user.calledStatus.isCalled ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button
                              className="btn btn-sm"
                              style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                padding: '1px 7px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                width: 'fit-content',
                                cursor: 'pointer'
                              }}
                              onClick={() => onToggleCall && onToggleCall(user)}
                              title={`Marked called by ${user.calledStatus.calledBy}. Click to toggle or clear.`}
                            >
                              <Check size={11} />
                              <span>Called ✓</span>
                            </button>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                              By: {user.calledStatus.calledBy || 'Sales Agent'}
                            </div>
                            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                              {user.calledStatus.calledAt}
                            </div>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline"
                            style={{
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              width: 'fit-content'
                            }}
                            onClick={() => onToggleCall && onToggleCall(user)}
                            title={`Click to mark as called by ${currentUser?.name || 'Aman Soni'}`}
                          >
                            <UserCheck size={11} style={{ color: '#818cf8' }} />
                            <span>Mark Called</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => onSelectUser(user)}
                        title="Open Full Subscriber Detail Drawer & Notes"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile-Optimized Caller Cards View (Dedicated for phone outreach) */}
      <div className="mobile-leads-container">
        {paginatedRenewals.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <Filter size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No renewal subscribers match filter</p>
            <p style={{ fontSize: '0.78rem' }}>Try clearing filters or search query.</p>
          </div>
        ) : (
          paginatedRenewals.map((user, idx) => {
            const isCalled = user.calledStatus && user.calledStatus.isCalled;
            const latestNote = user.notes && user.notes.length > 0 ? user.notes[user.notes.length - 1] : null;

            return (
              <div 
                key={`mob-${user.id}-${user.userNumber || idx}`} 
                className={`mobile-lead-card glass-panel ${isCalled ? 'card-called' : ''}`}
              >
                {/* Header: Name, Avatar, Expiry & Orders */}
                <div className="mobile-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      className="avatar-badge" 
                      style={{ background: getAvatarColor(user.name), width: '38px', height: '38px', fontSize: '0.85rem' }}
                    >
                      {(user.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div 
                        className="user-name-link"
                        onClick={() => onSelectUser(user)}
                        style={{ fontSize: '0.98rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>{user.name}</span>
                        <ArrowUpRight size={13} style={{ color: '#10b981' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span className="badge badge-indigo" style={{ fontSize: '0.66rem', padding: '1px 5px' }}>
                          {user.userNumber || user.id}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {user.plan || 'Subscription'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span 
                      className={`badge ${user.daysLeft <= 0 ? 'badge-rose' : 'badge-amber'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {user.daysLeft <= 0 ? `Expired ${Math.abs(user.daysLeft)}d ago` : `${user.daysLeft}d left`}
                    </span>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981', marginTop: '3px' }}>
                      ₹{(user.paidAmount || 1899).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Primary Action Row: Direct Phone Call & Mark Called */}
                <div className="mobile-card-actions">
                  {user.phone ? (
                    <a 
                      href={`tel:${user.phone.replace(/[^0-9+]/g, '')}`} 
                      className="btn-mobile-call"
                      onClick={() => {
                        if (!isCalled) {
                          onToggleCall && onToggleCall(user);
                        }
                      }}
                      title="Tap to open phone dialer and mark called"
                    >
                      <PhoneCall size={16} />
                      <span>Dial {user.phone}</span>
                    </a>
                  ) : (
                    <button className="btn-mobile-call disabled" disabled>
                      <PhoneCall size={16} />
                      <span>No Phone</span>
                    </button>
                  )}

                  {isCalled ? (
                    <button 
                      className="btn-mobile-called active"
                      onClick={() => onToggleCall && onToggleCall(user)}
                      title="Click to toggle status"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} />
                        <span>Called ✓</span>
                      </div>
                      <span className="mobile-called-author">By {user.calledStatus.calledBy || 'Sales'}</span>
                    </button>
                  ) : (
                    <button 
                      className="btn-mobile-called"
                      onClick={() => onToggleCall && onToggleCall(user)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PhoneCall size={14} />
                        <span>Mark Called</span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Secondary Meta: Expiry Date, City & TeleCRM */}
                <div className="mobile-card-meta">
                  <div className="meta-item">
                    <span className="meta-label">Expiry</span>
                    <span className="meta-val">{user.expireDate || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Orders</span>
                    <span className="meta-val">{user.totalOrders || 0}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">City</span>
                    <span className="meta-val">{user.libraryCity || user.company || 'Delhi'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">TeleCRM</span>
                    <span className="meta-val">{user.telecrmDetails?.lastAssignee || 'Unassigned'}</span>
                  </div>
                </div>

                {/* Notes Drawer Link & Latest Note Preview */}
                <div className="mobile-card-footer">
                  <button 
                    className="btn btn-sm btn-outline mobile-notes-btn"
                    onClick={() => onSelectUser(user)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <MessageSquare size={13} style={{ color: '#818cf8' }} />
                    <span>Notes ({user.notes?.length || 0})</span>
                  </button>

                  <a 
                    href={user.adminUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-admin"
                    style={{ padding: '6px 12px', fontSize: '0.74rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAdminJump) onAdminJump(user);
                    }}
                  >
                    <ShieldCheck size={13} />
                    <span>Admin</span>
                  </a>
                </div>

                {latestNote && (
                  <div className="mobile-latest-note">
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Note ({latestNote.author || 'Agent'}):</span> {latestNote.text}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      {filteredRenewals.length > 0 && (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px 20px', 
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            borderBottomLeftRadius: 'var(--radius-lg)',
            borderBottomRightRadius: 'var(--radius-lg)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{((currentPage - 1) * pageSize) + 1}</strong> - <strong>{Math.min(currentPage * pageSize, filteredRenewals.length).toLocaleString('en-IN')}</strong> of <strong>{filteredRenewals.length.toLocaleString('en-IN')}</strong> Renewal Subscribers
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn-sm btn-secondary"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ opacity: currentPage <= 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0 8px' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button 
              className="btn btn-sm btn-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ opacity: currentPage >= totalPages ? 0.5 : 1 }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
