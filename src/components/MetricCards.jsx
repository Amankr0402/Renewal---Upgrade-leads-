import React from 'react';
import { 
  AlertCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  CreditCard, 
  CalendarCheck,
  Package,
  Layers,
  Sparkles,
  Flame
} from 'lucide-react';

export default function MetricCards({ 
  activeTab, 
  renewals, 
  upgrades, 
  onFilterChange 
}) {
  if (activeTab === 'renewal') {
    const totalRenewals = renewals.length;
    // Categorize renewal subscribers
    const hotLeads = renewals.filter(r => Math.abs(r.daysLeft) <= 7);
    const sepExpired = renewals.filter(r => r.expireDate && r.expireDate.startsWith('2026-09'));
    const totalRenewalOrders = renewals.reduce((acc, curr) => acc + (curr.totalOrders || 0), 0);
    const totalPipelineValue = renewals.reduce((acc, curr) => acc + (curr.planPrice || 0), 0);

    return (
      <div className="stats-grid">
        {/* Card 1: Total Number of Renewal Subscribers */}
        <div 
          className="glass-panel stat-card indigo"
          onClick={() => onFilterChange && onFilterChange('all')}
          style={{ cursor: 'pointer' }}
          title="Total Number of Renewal Subscribers from Metabase"
        >
          <div className="stat-header">
            <span className="stat-title">Total Number (Renewals)</span>
            <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-val-row">
            <span className="stat-val" style={{ color: '#818cf8' }}>{totalRenewals.toLocaleString('en-IN')}</span>
            <span className="badge badge-indigo">Renewal Pool</span>
          </div>
          <p className="stat-subtext">
            <span>Metabase Expired Subscribers</span>
          </p>
        </div>

        {/* Card 2: Hot Leads (0-7 Days Window) */}
        <div 
          className="glass-panel stat-card urgent"
          onClick={() => onFilterChange && onFilterChange('recent_expired')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-header">
            <span className="stat-title">Hot Renewal Leads (0 - 7d)</span>
            <div className="stat-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <Flame size={20} />
            </div>
          </div>
          <div className="stat-val-row">
            <span className="stat-val" style={{ color: '#fb7185' }}>{hotLeads.length}</span>
            <span className="badge badge-rose">Urgent Recovery</span>
          </div>
          <p className="stat-subtext">
            <span>Critical outreach priority</span>
          </p>
        </div>

        {/* Card 3: September Expired (Last Month) */}
        <div 
          className="glass-panel stat-card warning"
          onClick={() => onFilterChange && onFilterChange('sep_expired')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-header">
            <span className="stat-title">Expired Last Month (Sep)</span>
            <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-val-row">
            <span className="stat-val" style={{ color: '#fbbf24' }}>{sepExpired.length}</span>
            <span className="badge badge-amber">Sep 2026</span>
          </div>
          <p className="stat-subtext">
            <span>TeleCRM revival active</span>
          </p>
        </div>

        {/* Card 4: Total Orders (Renewals) */}
        <div 
          className="glass-panel stat-card success"
          onClick={() => onFilterChange && onFilterChange('orders')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-header">
            <span className="stat-title">Total Orders (Renewals)</span>
            <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Package size={20} />
            </div>
          </div>
          <div className="stat-val-row">
            <span className="stat-val" style={{ color: '#34d399' }}>{totalRenewalOrders.toLocaleString('en-IN')}</span>
            <span className="badge badge-emerald">Orders Count</span>
          </div>
          <p className="stat-subtext">
            <span>Lifetime orders across renewal base</span>
          </p>
        </div>

        {/* Card 5: Total Renewal Recovery Value */}
        <div className="glass-panel stat-card indigo">
          <div className="stat-header">
            <span className="stat-title">Total Renewal Value</span>
            <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div className="stat-val-row">
            <span className="stat-val">₹{totalPipelineValue.toLocaleString('en-IN')}</span>
            <span className="badge badge-indigo">Target Recovery</span>
          </div>
          <p className="stat-subtext">
            <span>Avg: ₹{Math.round(totalPipelineValue / (totalRenewals || 1)).toLocaleString('en-IN')} / subscriber</span>
          </p>
        </div>
      </div>
    );
  }

  // Active Tab is 'upgrade'
  const totalUpgradesCount = upgrades.length;
  const thisMonthUpgrades = upgrades.filter(u => u.period === 'this_month' || u.month === '2026-10');
  const lastMonthUpgrades = upgrades.filter(u => u.period === 'last_month' || u.month === '2026-09');

  const thisMonthCount = thisMonthUpgrades.length;
  const lastMonthCount = lastMonthUpgrades.length;

  const thisMonthRev = thisMonthUpgrades.reduce((a, c) => a + (c.newPrice || c.addedRevenue || 0), 0);
  const lastMonthRev = lastMonthUpgrades.reduce((a, c) => a + (c.newPrice || c.addedRevenue || 0), 0);

  const totalOrdersCount = upgrades.reduce((sum, u) => sum + (u.totalOrders || 0), 0);
  const thisMonthOrders = thisMonthUpgrades.reduce((sum, u) => sum + (u.totalOrders || 0), 0);
  const lastMonthOrders = lastMonthUpgrades.reduce((sum, u) => sum + (u.totalOrders || 0), 0);

  const totalUpgradeValue = upgrades.reduce((sum, u) => sum + (u.newPrice || 0), 0);

  return (
    <div className="stats-grid">
      {/* NEW KPI Card: TOTAL NUMBER (All Upgrades Count) */}
      <div 
        className="glass-panel stat-card indigo"
        onClick={() => onFilterChange && onFilterChange('all')}
        title="Total Number of Upgraded Subscribers across all months"
        style={{ cursor: 'pointer' }}
      >
        <div className="stat-header">
          <span className="stat-title">Total Number (Upgrades)</span>
          <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Users size={20} />
          </div>
        </div>
        <div className="stat-val-row">
          <span className="stat-val" style={{ color: '#818cf8' }}>{totalUpgradesCount}</span>
          <span className="badge badge-indigo">Total Upgrades</span>
        </div>
        <p className="stat-subtext">
          <span>Active upgraded customer accounts</span>
        </p>
      </div>

      {/* Card 2: This Month Total Upgrades */}
      <div className="glass-panel stat-card success">
        <div className="stat-header">
          <span className="stat-title">This Month Total Upgrades</span>
          <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="stat-val-row">
          <span className="stat-val">{thisMonthCount}</span>
          <span className="badge badge-emerald">Oct 2026</span>
        </div>
        <p className="stat-subtext">
          <span style={{ color: '#34d399', fontWeight: 700 }}>₹{thisMonthRev.toLocaleString('en-IN')}</span>
          <span>•</span>
          <span>{thisMonthOrders} Orders</span>
        </p>
      </div>

      {/* Card 3: Last Month Total Upgrades */}
      <div className="glass-panel stat-card info">
        <div className="stat-header">
          <span className="stat-title">Last Month Total Upgrades</span>
          <div className="stat-icon-wrap" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
            <Clock size={20} />
          </div>
        </div>
        <div className="stat-val-row">
          <span className="stat-val">{lastMonthCount}</span>
          <span className="badge badge-cyan">Sep 2026</span>
        </div>
        <p className="stat-subtext">
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>₹{lastMonthRev.toLocaleString('en-IN')}</span>
          <span>•</span>
          <span>{lastMonthOrders} Orders</span>
        </p>
      </div>

      {/* Card 4: Total Orders Count in KPI */}
      <div className="glass-panel stat-card warning">
        <div className="stat-header">
          <span className="stat-title">Total Orders Count</span>
          <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Package size={20} />
          </div>
        </div>
        <div className="stat-val-row">
          <span className="stat-val" style={{ color: '#fbbf24' }}>
            {totalOrdersCount.toLocaleString('en-IN')}
          </span>
          <span className="badge badge-amber">Orders Count</span>
        </div>
        <p className="stat-subtext">
          <span>Avg: {Math.round(totalOrdersCount / (upgrades.length || 1))} orders / subscriber</span>
        </p>
      </div>

      {/* Card 5: Total Revenue / Value */}
      <div className="glass-panel stat-card indigo">
        <div className="stat-header">
          <span className="stat-title">Total Upgrade Revenue</span>
          <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <CreditCard size={20} />
          </div>
        </div>
        <div className="stat-val-row">
          <span className="stat-val">
            ₹{totalUpgradeValue.toLocaleString('en-IN')}
          </span>
          <span className="badge badge-indigo">All Payments</span>
        </div>
        <p className="stat-subtext">
          <span>Avg Ticket: ₹{Math.round(totalUpgradeValue / (upgrades.length || 1)).toLocaleString('en-IN')}</span>
        </p>
      </div>
    </div>
  );
}
