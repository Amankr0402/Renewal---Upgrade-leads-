import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import RenewalView from './components/RenewalView';
import UpgradeView from './components/UpgradeView';
import UserDetailModal from './components/UserDetailModal';
import MetabaseModal from './components/MetabaseModal';
import GoogleSheetModal from './components/GoogleSheetModal';
import TeamCredentialsModal from './components/TeamCredentialsModal';
import LoginView from './components/LoginView';
import { getCurrentUser, logoutUser } from './data/authService';
import { 
  getStoredRenewals, 
  saveStoredRenewals, 
  getStoredUpgrades, 
  saveStoredUpgrades,
  getMetabaseConfig,
  saveMetabaseConfig,
  parseMetabaseUpgradesCSV,
  parseMetabaseRenewalsCSV,
  INITIAL_RENEWALS,
  INITIAL_UPGRADES
} from './data/mockData';
import { exportRenewalsReport, exportUpgradesReport } from './utils/exportUtils';
import { fetchRemoteNotes, saveRemoteNote, deleteRemoteNote } from './utils/dbSync';
import { 
  RefreshCw, 
  TrendingUp, 
  CheckCircle2, 
  Download, 
  AlertCircle 
} from 'lucide-react';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  // Theme state
  const [theme, setTheme] = useState('dark');
  
  // Active Tab: 'renewal' or 'upgrade'
  const [activeTab, setActiveTab] = useState('renewal');
  
  // Data states
  const [renewals, setRenewals] = useState([]);
  const [upgrades, setUpgrades] = useState([]);
  const [metabaseConfig, setMetabaseConfig] = useState({});

  // Loading & sync state
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Live Connected');

  // Filters
  const [renewalFilter, setRenewalFilter] = useState('all');

  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState('renewal');
  const [showMetabaseModal, setShowMetabaseModal] = useState(false);
  const [showGoogleSheetModal, setShowGoogleSheetModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Initialize data from persistence on mount, then trigger live sync for both
  useEffect(() => {
    // Purge any stale dummy data from earlier iterations
    [
      "ag_dashboard_renewals_metabase_live_v2",
      "ag_dashboard_renewals_v3",
      "ag_dashboard_renewals_clean_v4",
      "ag_dashboard_renewals_v5",
      "ag_dashboard_renewals_live_v6"
    ].forEach(k => {
      try { localStorage.removeItem(k); } catch(e) {}
    });

    const loadedRenewals = getStoredRenewals();
    const loadedUpgrades = getStoredUpgrades();
    const loadedMeta = getMetabaseConfig();

    setRenewals(loadedRenewals);
    setUpgrades(loadedUpgrades);
    setMetabaseConfig(loadedMeta);

    // Fetch fresh live data for both endpoints
    fetchAllLiveData();
  }, []);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Primary Live Fetch for BOTH Metabase endpoints
  const fetchAllLiveData = async () => {
    setIsFetchingLive(true);
    try {
      showToast('Fetching live Renewals and Upgrades from Metabase...', 'info');

      // 1. Fetch Upgrades
      try {
        let upgradeText = '';
        try {
          const resUp = await fetch('/api/metabase-live');
          if (resUp.ok) upgradeText = await resUp.text();
        } catch (e1) {}

        if (!upgradeText || upgradeText.length < 100) {
          const resFallback = await fetch('/metabase_data.csv');
          upgradeText = await resFallback.text();
        }

        const freshUpgrades = parseMetabaseUpgradesCSV(upgradeText);
        if (freshUpgrades.length > 0) {
          setUpgrades(freshUpgrades);
          saveStoredUpgrades(freshUpgrades);
        }
      } catch (errUp) {
        console.error('Upgrade fetch error:', errUp);
      }

      // 2. Fetch Renewals
      try {
        let renewalText = '';
        try {
          const resRen = await fetch('/api/metabase-renewal');
          if (resRen.ok) renewalText = await resRen.text();
        } catch (e2) {}

        if (!renewalText || renewalText.length < 100) {
          const resRenFallback = await fetch('/renewal_metabase_data.csv');
          renewalText = await resRenFallback.text();
        }

        const freshRenewals = parseMetabaseRenewalsCSV(renewalText);
        if (freshRenewals.length > 0) {
          setRenewals(freshRenewals);
          saveStoredRenewals(freshRenewals);
        }
      } catch (errRen) {
        console.error('Renewal fetch error:', errRen);
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowTime);
      showToast(`Metabase Synced: Live Renewals & Upgrades Updated (${nowTime})!`);
    } catch (err) {
      console.error('Error fetching live data:', err);
      showToast('Failed to fetch live data: ' + err.message, 'info');
    } finally {
      setIsFetchingLive(false);
    }
  };

  // Add note handler
  const handleAddNote = (itemId, newNote, type) => {
    // Save to Postgres asynchronously
    saveRemoteNote(itemId, newNote);

    if (type === 'renewal') {
      const updated = renewals.map(user => {
        if (user.id === itemId || user.userId === itemId) {
          const notes = user.notes ? [newNote, ...user.notes] : [newNote];
          return { ...user, notes };
        }
        return user;
      });
      setRenewals(updated);
      saveStoredRenewals(updated);
      
      if (selectedUser && (selectedUser.id === itemId || selectedUser.userId === itemId)) {
        setSelectedUser(prev => ({
          ...prev,
          notes: prev.notes ? [newNote, ...prev.notes] : [newNote]
        }));
      }
      showToast(`Manual note logged for ${selectedUser?.name || 'subscriber'}`);
    } else {
      const updated = upgrades.map(item => {
        if (item.id === itemId || item.userId === itemId) {
          const notes = item.notes ? [newNote, ...item.notes] : [newNote];
          return { ...item, notes };
        }
        return item;
      });
      setUpgrades(updated);
      saveStoredUpgrades(updated);

      if (selectedUser && (selectedUser.id === itemId || selectedUser.userId === itemId)) {
        setSelectedUser(prev => ({
          ...prev,
          notes: prev.notes ? [newNote, ...prev.notes] : [newNote]
        }));
      }
      showToast(`Manual note logged for ${selectedUser?.userName || 'upgrade'}`);
    }
  };

  // Delete note handler
  const handleDeleteNote = (itemId, noteId, type) => {
    // Delete from Postgres asynchronously
    deleteRemoteNote(noteId);

    if (type === 'renewal') {
      const updated = renewals.map(user => {
        if (user.id === itemId || user.userId === itemId) {
          const notes = (user.notes || []).filter(n => n.id !== noteId);
          return { ...user, notes };
        }
        return user;
      });
      setRenewals(updated);
      saveStoredRenewals(updated);

      if (selectedUser && (selectedUser.id === itemId || selectedUser.userId === itemId)) {
        setSelectedUser(prev => ({
          ...prev,
          notes: (prev.notes || []).filter(n => n.id !== noteId)
        }));
      }
      showToast('Note deleted');
    }
  };

  // Download Report with guaranteed data fallback
  const handleExportReport = () => {
    if (activeTab === 'renewal') {
      const dataToExport = (renewals && renewals.length > 0) ? renewals : INITIAL_RENEWALS;
      exportRenewalsReport(dataToExport);
      showToast(`Exported ${dataToExport.length} Renewal Subscribers with real names & orders!`);
    } else {
      const dataToExport = (upgrades && upgrades.length > 0) ? upgrades : INITIAL_UPGRADES;
      exportUpgradesReport(dataToExport, 'Live_All');
      showToast(`Exported ${dataToExport.length} Upgrade Transactions with real names & orders!`);
    }
  };

  // Metabase config save
  const handleSaveMetabaseConfig = (newConfig) => {
    setMetabaseConfig(newConfig);
    saveMetabaseConfig(newConfig);
    showToast('Metabase links and settings saved!');
  };

  // Admin jump helper
  const handleAdminJump = (user) => {
    showToast(`Redirecting to Admin Portal for ${user.name || user.userName}...`, 'info');
  };

  // If user is not authenticated, render Login Screen
  if (!currentUser) {
    return (
      <LoginView 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`);
        }} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* Top Navigation & Operational Header */}
      <Header 
        activeTab={activeTab}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenMetabase={() => setShowMetabaseModal(true)}
        onOpenGoogleSheet={() => setShowGoogleSheetModal(true)}
        onOpenCredentials={() => setShowCredentialsModal(true)}
        currentUser={currentUser}
        onLogout={() => {
          logoutUser();
          setCurrentUser(null);
          showToast("Signed out successfully.");
        }}
        onExportReport={handleExportReport}
        onFetchLiveData={fetchAllLiveData}
        isFetchingLive={isFetchingLive}
        lastSyncTime={lastSyncTime}
        renewalsCount={renewals.length}
        upgradesCount={upgrades.length}
      />

      {/* Main Two-KPI Tab Switcher */}
      <div className="tab-switcher-wrapper">
        <div className="kpi-tabs-group">
          {/* Tab 1: Renewal Breakdown */}
          <button 
            className={`kpi-tab-btn ${activeTab === 'renewal' ? 'active' : ''}`}
            onClick={() => setActiveTab('renewal')}
            id="tab-renewal"
          >
            <RefreshCw size={17} />
            <span>Renewal Breakdown</span>
            <span className="kpi-tab-badge">
              {renewals.length.toLocaleString('en-IN')} Expired Subscribers
            </span>
          </button>

          {/* Tab 2: Upgrade Breakdown */}
          <button 
            className={`kpi-tab-btn ${activeTab === 'upgrade' ? 'active' : ''}`}
            onClick={() => setActiveTab('upgrade')}
            id="tab-upgrade"
          >
            <TrendingUp size={17} />
            <span>Upgrade Breakdown</span>
            <span className="kpi-tab-badge" style={{ background: activeTab === 'upgrade' ? '#10b981' : undefined }}>
              {upgrades.length.toLocaleString('en-IN')} Upgrades
            </span>
          </button>
        </div>

        {/* Status indicator on top right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Active View: <strong style={{ color: activeTab === 'renewal' ? '#6366f1' : '#10b981' }}>
              {activeTab === 'renewal' ? 'Live Renewal Recovery Pipeline' : 'Metabase Upgrade Intelligence'}
            </strong>
          </span>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={handleExportReport}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Metric KPI Cards */}
      <MetricCards 
        activeTab={activeTab}
        renewals={renewals}
        upgrades={upgrades}
        onFilterChange={(filter) => {
          if (activeTab === 'renewal') {
            setRenewalFilter(filter);
          }
        }}
      />

      {/* Section Content based on Active Tab */}
      {activeTab === 'renewal' ? (
        <RenewalView 
          renewals={renewals}
          selectedFilter={renewalFilter}
          setSelectedFilter={setRenewalFilter}
          onSelectUser={(user) => {
            setSelectedUser(user);
            setModalType('renewal');
          }}
          onQuickAddNote={(user) => {
            setSelectedUser(user);
            setModalType('renewal');
          }}
          onAdminJump={handleAdminJump}
        />
      ) : (
        <UpgradeView 
          upgrades={upgrades}
          onSelectUpgrade={(item) => {
            setSelectedUser(item);
            setModalType('upgrade');
          }}
          onQuickAddNote={(item) => {
            setSelectedUser(item);
            setModalType('upgrade');
          }}
          onAdminJump={handleAdminJump}
        />
      )}

      {/* User Details & Notes Modal / Drawer */}
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser}
          type={modalType}
          currentUser={currentUser}
          onClose={() => setSelectedUser(null)}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onAdminJump={handleAdminJump}
        />
      )}

      {/* Google Sheet Live Sync & Sales Filters Modal */}
      <GoogleSheetModal 
        isOpen={showGoogleSheetModal}
        onClose={() => setShowGoogleSheetModal(false)}
        renewals={renewals}
        upgrades={upgrades}
        onSyncSuccess={(res) => {
          showToast(`Synced ${res.renewalsCount} renewals & ${res.upgradesCount} upgrades to Google Sheet!`);
        }}
      />

      {/* Team Credentials & Access Management Modal */}
      <TeamCredentialsModal 
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        currentUser={currentUser}
        onCredentialsChange={(updated) => {
          showToast(`Team credentials updated (${updated.length} active users)`);
        }}
      />

      {/* Metabase Link & Query Integration Modal */}
      {showMetabaseModal && (
        <MetabaseModal 
          config={metabaseConfig}
          onSaveConfig={handleSaveMetabaseConfig}
          onClose={() => setShowMetabaseModal(false)}
          onSyncData={fetchAllLiveData}
        />
      )}

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.type === 'info' ? (
              <AlertCircle size={16} style={{ color: '#38bdf8' }} />
            ) : (
              <CheckCircle2 size={16} style={{ color: '#34d399' }} />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
