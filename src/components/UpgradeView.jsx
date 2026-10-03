import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  Calendar, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  Plus,
  ArrowUpRight,
  Sparkles,
  Tag,
  MapPin,
  PhoneCall,
  Package,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';

export default function UpgradeView({ 
  upgrades, 
  onSelectUpgrade, 
  onQuickAddNote,
  onAdminJump 
}) {
  const [selectedRange, setSelectedRange] = useState('all'); // 'all', 'this_month', 'last_month', '2026-08', '2026-07', 'custom'
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate figures
  const thisMonthUpgrades = upgrades.filter(u => u.period === 'this_month' || u.month === '2026-10');
  const lastMonthUpgrades = upgrades.filter(u => u.period === 'last_month' || u.month === '2026-09');

  const thisMonthCount = thisMonthUpgrades.length;
  const lastMonthCount = lastMonthUpgrades.length;

  const thisMonthRevenue = thisMonthUpgrades.reduce((sum, u) => sum + (u.newPrice || u.addedRevenue || 0), 0);
  const lastMonthRevenue = lastMonthUpgrades.reduce((sum, u) => sum + (u.newPrice || u.addedRevenue || 0), 0);

  const totalOrdersCount = upgrades.reduce((sum, u) => sum + (u.totalOrders || 0), 0);

  // Filter based on range selection and search term
  const filteredUpgrades = useMemo(() => {
    return upgrades.filter(item => {
      // Range filter
      if (selectedRange === 'this_month' && item.month !== '2026-10') return false;
      if (selectedRange === 'last_month' && item.month !== '2026-09') return false;
      if (selectedRange === '2026-08' && item.month !== '2026-08') return false;
      if (selectedRange === '2026-07' && item.month !== '2026-07') return false;
      if (selectedRange === 'custom') {
        const itemDate = item.dateOnly || (item.upgradeDate ? item.upgradeDate.split(' ')[0] : '');
        if (customFrom && itemDate < customFrom) return false;
        if (customTo && itemDate > customTo) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesUser = item.userName?.toLowerCase().includes(q);
        const matchesUserId = item.userId?.toLowerCase().includes(q);
        const matchesPhone = item.phone?.includes(q);
        const matchesCity = item.libraryCity?.toLowerCase().includes(q);
        const matchesCoupon = item.coupon?.toLowerCase().includes(q);
        const matchesPlan = item.upgradedPlan?.toLowerCase().includes(q);
        const matchesAssignee = item.salesAssignee?.toLowerCase().includes(q);
        if (!matchesUser && !matchesUserId && !matchesPhone && !matchesCity && !matchesCoupon && !matchesPlan && !matchesAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [upgrades, selectedRange, customFrom, customTo, searchTerm]);

  return (
    <div className="upgrade-view-container">
      {/* Month-over-Month & Total Orders Spotlight Bar */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '20px 24px', 
          marginBottom: '24px', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(14, 165, 233, 0.08))',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Metabase Live Upgrade Report</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Real Customer Names, Total Orders ({totalOrdersCount.toLocaleString('en-IN')}) & Monthly Breakdown
            </p>
          </div>
        </div>

        {/* Quick Month Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* This Month (October 2026) */}
          <div 
            style={{ 
              background: selectedRange === 'this_month' ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-card-solid)', 
              padding: '12px 18px', 
              borderRadius: '10px', 
              border: selectedRange === 'this_month' ? '1px solid var(--accent-primary)' : '1px solid var(--border-medium)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => setSelectedRange('this_month')}
          >
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
              This Month (October 2026)
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {thisMonthCount} Upgrades
              </span>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#34d399' }}>
                ₹{thisMonthRevenue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Last Month (September 2026) */}
          <div 
            style={{ 
              background: selectedRange === 'last_month' ? 'rgba(14, 165, 233, 0.25)' : 'var(--bg-card-solid)', 
              padding: '12px 18px', 
              borderRadius: '10px', 
              border: selectedRange === 'last_month' ? '1px solid var(--accent-sky)' : '1px solid var(--border-medium)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => setSelectedRange('last_month')}
          >
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Last Month (September 2026)
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {lastMonthCount} Upgrades
              </span>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#38bdf8' }}>
                ₹{lastMonthRevenue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Range Section & Control Bar */}
      <div className="control-bar">
        {/* Search */}
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text"
            className="search-input"
            placeholder="Search by customer name (Deepali, lerin, Rutuja...), UR number, phone, coupon or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Range Section Selector Buttons */}
        <div className="filter-pills">
          <button 
            className={`filter-pill ${selectedRange === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedRange('all')}
          >
            All Upgrades ({upgrades.length})
          </button>
          <button 
            className={`filter-pill ${selectedRange === 'this_month' ? 'active' : ''}`}
            onClick={() => setSelectedRange('this_month')}
          >
            This Month (Oct: {thisMonthCount})
          </button>
          <button 
            className={`filter-pill ${selectedRange === 'last_month' ? 'active' : ''}`}
            onClick={() => setSelectedRange('last_month')}
          >
            Last Month (Sep: {lastMonthCount})
          </button>
          <button 
            className={`filter-pill ${selectedRange === '2026-08' ? 'active' : ''}`}
            onClick={() => setSelectedRange('2026-08')}
          >
            August (34)
          </button>
          <button 
            className={`filter-pill ${selectedRange === '2026-07' ? 'active' : ''}`}
            onClick={() => setSelectedRange('2026-07')}
          >
            July (28)
          </button>
          <button 
            className={`filter-pill ${selectedRange === 'custom' ? 'active' : ''}`}
            onClick={() => setSelectedRange('custom')}
          >
            <Calendar size={13} />
            <span>Custom Date Range</span>
          </button>
        </div>

        {/* Custom Range Picker Inputs */}
        {selectedRange === 'custom' && (
          <div className="range-panel">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>From:</span>
            <input 
              type="date" 
              className="range-input" 
              value={customFrom} 
              onChange={(e) => setCustomFrom(e.target.value)} 
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>to:</span>
            <input 
              type="date" 
              className="range-input" 
              value={customTo} 
              onChange={(e) => setCustomTo(e.target.value)} 
            />
            {(customFrom || customTo) && (
              <button 
                className="btn-sm btn-secondary" 
                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                onClick={() => { setCustomFrom(''); setCustomTo(''); }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upgrades Breakdown Table with REAL Customer Name and Total Orders */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name & Admin Jump</th>
              <th>Total Orders</th>
              <th>Plan Transformation (Previous ➔ Upgraded)</th>
              <th>Payment & Upgrade Date</th>
              <th>Amount Paid</th>
              <th>Coupon & Location</th>
              <th>TeleCRM Assignee</th>
              <th>Manual Notes</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUpgrades.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                  <TrendingUp size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No upgrade records match this filter</p>
                  <p style={{ fontSize: '0.8rem' }}>Switch to 'All Upgrades' or clear the search input.</p>
                </td>
              </tr>
            ) : (
              filteredUpgrades.map((item) => {
                const isThisMonth = item.month === '2026-10';
                const isLastMonth = item.month === '2026-09';

                return (
                  <tr key={item.id}>
                    {/* Customer Real Name & Admin Jump Link */}
                    <td>
                      <div className="user-cell">
                        <div 
                          className="avatar-badge"
                          style={{ 
                            background: isThisMonth 
                              ? 'linear-gradient(135deg, #10b981, #047857)' 
                              : isLastMonth 
                                ? 'linear-gradient(135deg, #6366f1, #4338ca)'
                                : 'linear-gradient(135deg, #0ea5e9, #0369a1)' 
                          }}
                        >
                          {item.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="user-meta">
                          {/* REAL Customer Name */}
                          <div 
                            className="user-name-link"
                            onClick={() => onSelectUpgrade(item)}
                            title="Click to view upgrade details or jump to Admin"
                            style={{ fontSize: '0.92rem', fontWeight: 800 }}
                          >
                            <span>{item.userName}</span>
                            <ArrowUpRight size={13} style={{ color: '#10b981' }} />
                          </div>
                          
                          {/* User Number and Phone */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span className="badge badge-indigo" style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                              {item.userNumber || item.userId}
                            </span>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                              {item.phone}
                            </span>
                          </div>

                          {/* Direct Admin Jump Link */}
                          <div style={{ marginTop: '5px' }}>
                            <a 
                              href={item.adminUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-admin"
                              style={{ display: 'inline-flex', padding: '2px 8px', fontSize: '0.7rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onAdminJump) onAdminJump(item);
                              }}
                              title={`Jump into Admin Portal for ${item.userName}`}
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
                            background: item.totalOrders > 5 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                            color: item.totalOrders > 5 ? '#34d399' : '#818cf8',
                            border: '1px solid currentColor',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            width: 'fit-content'
                          }}
                        >
                          <Package size={12} />
                          <span>{item.totalOrders} Orders</span>
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Lifetime orders
                        </span>
                      </div>
                    </td>

                    {/* Plan Transformation */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem', textDecoration: 'line-through' }}>
                            {item.previousPlan}
                          </span>
                          <ArrowRight size={12} style={{ color: '#10b981' }} />
                          <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#818cf8' }}>
                            {item.upgradedPlan}
                          </span>
                        </div>
                        <div>
                          <span className="badge badge-emerald" style={{ padding: '2px 6px', fontSize: '0.68rem' }}>
                            {item.upgradedPlan.includes('ANNUALLY') ? 'Annual Upgrade' : 'Quarterly'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Upgrade Date & Period */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                          <Calendar size={13} style={{ color: 'var(--text-secondary)' }} />
                          <span>{item.dateOnly}</span>
                        </div>
                        <div>
                          {isThisMonth ? (
                            <span className="badge badge-emerald">This Month (Oct 2026)</span>
                          ) : isLastMonth ? (
                            <span className="badge badge-indigo">Last Month (Sep 2026)</span>
                          ) : (
                            <span className="badge badge-cyan">{item.month}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Paid Amount / Expansion Value */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399' }}>
                          ₹{item.newPrice.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Subscription Paid
                        </span>
                      </div>
                    </td>

                    {/* Coupon & Location */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Tag size={12} style={{ color: '#fbbf24' }} />
                          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: item.coupon !== 'None' ? '#fbbf24' : 'var(--text-muted)' }}>
                            {item.coupon}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          <MapPin size={12} />
                          <span>{item.libraryCity}</span>
                        </div>
                      </div>
                    </td>

                    {/* Closed By / Sales Assignee */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.82rem' }}>
                          <UserCheck size={14} style={{ color: '#f97316' }} />
                          <span>{item.salesAssignee}</span>
                        </div>
                        <a 
                          href={`https://crm.telecrm.in/leads/${item.telecrmId || 'lead-upgrade'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-telecrm"
                          style={{ display: 'inline-flex', padding: '2px 8px', fontSize: '0.7rem', width: 'fit-content' }}
                        >
                          <PhoneCall size={11} />
                          <span>TeleCRM</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </td>

                    {/* Notes Section: Clean Msg Logo with Red Indicator */}
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className={`notes-msg-btn ${item.notes && item.notes.length > 0 ? 'has-notes' : 'empty-notes'}`}
                        onClick={() => onSelectUpgrade(item)}
                        title={item.notes && item.notes.length > 0 
                          ? `${item.notes.length} Note${item.notes.length > 1 ? 's' : ''} logged. Click to view notes.`
                          : 'No notes logged yet. Click to write a manual note.'}
                      >
                        <MessageSquare size={19} />
                        {item.notes && item.notes.length > 0 && (
                          <span 
                            className="notes-red-dot" 
                            title={`${item.notes.length} Note${item.notes.length > 1 ? 's' : ''}`}
                          />
                        )}
                      </button>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => onSelectUpgrade(item)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
