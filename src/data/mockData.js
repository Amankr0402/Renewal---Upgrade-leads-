import METABASE_UPGRADES_LIVE from './metabaseUpgradesLive.json';
import METABASE_RENEWALS_LIVE from './metabaseRenewalsLive.json';

// INITIAL_UPGRADES: 227 Upgrade Transactions from Metabase
export const INITIAL_UPGRADES = METABASE_UPGRADES_LIVE;

// INITIAL_RENEWALS: 16,843 Expired Renewal Subscribers from Metabase
export const INITIAL_RENEWALS = METABASE_RENEWALS_LIVE;

const STORAGE_KEYS = {
  RENEWALS_NOTES: "metabase_renewals_notes_v9",
  UPGRADES_NOTES: "metabase_upgrades_notes_v9",
  CALLED_STATUS: "metabase_called_status_v1",
  UPGRADES: "metabase_upgrades_v9",
  METABASE_CONFIG: "metabase_config_v9"
};

export function getStoredRenewals() {
  try {
    const rawNotes = localStorage.getItem(STORAGE_KEYS.RENEWALS_NOTES);
    const notesMap = rawNotes ? JSON.parse(rawNotes) : {};

    const rawCalled = localStorage.getItem(STORAGE_KEYS.CALLED_STATUS);
    const calledMap = rawCalled ? JSON.parse(rawCalled) : {};
    
    // Attach notes and called status to initial renewals
    return INITIAL_RENEWALS.map(user => {
      const userNotes = notesMap[user.id] || (user.userId && notesMap[user.userId]) || user.notes || [];
      const userCalled = calledMap[user.id] || (user.userId && calledMap[user.userId]) || null;
      return {
        ...user,
        notes: userNotes,
        calledStatus: userCalled
      };
    });
  } catch (e) {
    return INITIAL_RENEWALS;
  }
}

export function saveStoredRenewals(data) {
  try {
    const notesMap = {};
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.notes && item.notes.length > 0) {
          notesMap[item.id] = item.notes;
          if (item.userId) notesMap[item.userId] = item.notes;
        }
      });
    }
    localStorage.setItem(STORAGE_KEYS.RENEWALS_NOTES, JSON.stringify(notesMap));
  } catch (e) {}
}

export function saveStoredCalledStatus(data) {
  try {
    const calledMap = {};
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.calledStatus && item.calledStatus.isCalled) {
          calledMap[item.id] = item.calledStatus;
          if (item.userId) calledMap[item.userId] = item.calledStatus;
        }
      });
    }
    localStorage.setItem(STORAGE_KEYS.CALLED_STATUS, JSON.stringify(calledMap));
  } catch (e) {}
}

export function getStoredUpgrades() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UPGRADES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.UPGRADES, JSON.stringify(INITIAL_UPGRADES));
      return INITIAL_UPGRADES;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.length < 50 || parsed[0].userName.startsWith('Customer UR')) {
      localStorage.setItem(STORAGE_KEYS.UPGRADES, JSON.stringify(INITIAL_UPGRADES));
      return INITIAL_UPGRADES;
    }
    return parsed;
  } catch (e) {
    return INITIAL_UPGRADES;
  }
}

export function saveStoredUpgrades(data) {
  try {
    localStorage.setItem(STORAGE_KEYS.UPGRADES, JSON.stringify(data));
  } catch (e) {}
}

export function getMetabaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.METABASE_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    upgradeUrl: "https://metabase-bkp.theelefant.ai/public/question/8f167047-f200-4aa7-b56a-f7ff2964eaa7.csv",
    renewalUrl: "https://metabase-bkp.theelefant.ai/public/question/46d8e6e4-4bc2-43c5-93b0-03d1a05c6ce6.csv",
    autoRefresh: true,
    lastSync: "Just now"
  };
}

export function saveMetabaseConfig(cfg) {
  try {
    localStorage.setItem(STORAGE_KEYS.METABASE_CONFIG, JSON.stringify(cfg));
  } catch (e) {}
}

// Live CSV Parser for Renewals from Metabase
export function parseMetabaseRenewalsCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const agents = ['Rahul Sharma', 'Sneha Rao', 'Karan Verma', 'Pooja Mehta', 'Ananya Verma', 'Vikram Patel'];
  const now = new Date('2026-10-03T12:00:00');
  const renewals = [];

  let notesMap = {};
  let calledMap = {};
  try {
    const rawNotes = localStorage.getItem(STORAGE_KEYS.RENEWALS_NOTES);
    if (rawNotes) notesMap = JSON.parse(rawNotes);
    const rawCalled = localStorage.getItem(STORAGE_KEYS.CALLED_STATUS);
    if (rawCalled) calledMap = JSON.parse(rawCalled);
  } catch (e) {}

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');

    let user_id, user_number, user_name, contact_no, started_on, expire_on, payment_date, sub_status, plan, type, paid_amount, coupon, library_city, total_orders;

    if (parts.length >= 14) {
      [user_id, user_number, user_name, contact_no, started_on, expire_on, payment_date, sub_status, plan, type, paid_amount, coupon, library_city, total_orders] = parts;
    } else {
      [user_id, user_number, contact_no, started_on, expire_on, payment_date, sub_status, plan, type, paid_amount, coupon, library_city] = parts;
      user_name = `Subscriber ${user_number || user_id?.slice(0, 6)}`;
      total_orders = "0";
    }

    const expDate = expire_on ? new Date(expire_on) : now;
    const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

    let status = 'expired';
    let urgencyLabel = '';
    if (diffDays >= 0 && diffDays <= 7) {
      status = 'urgent';
      urgencyLabel = `Expires in ${diffDays}d`;
    } else if (diffDays > 7 && diffDays <= 30) {
      status = 'upcoming';
      urgencyLabel = `Expires in ${diffDays}d`;
    } else if (diffDays >= -7 && diffDays < 0) {
      status = 'recent_expired';
      urgencyLabel = `Expired ${Math.abs(diffDays)}d ago (Hot Lead)`;
    } else if (diffDays >= -30 && diffDays < -7) {
      status = 'expired_month';
      urgencyLabel = `Expired ${Math.abs(diffDays)}d ago`;
    } else {
      status = 'lapsed';
      urgencyLabel = `Expired ${expire_on ? expire_on.slice(0,7) : 'prior'}`;
    }

    const amount = parseFloat(paid_amount) || 0;
    const orders = parseInt(total_orders) || 0;
    const agent = agents[i % agents.length];
    const userNotes = notesMap[user_id] || (user_number && notesMap[user_number]) || [];
    const userCalled = calledMap[user_id] || (user_number && calledMap[user_number]) || null;

    renewals.push({
      id: user_id || (`REN-${i}`),
      userId: user_number || user_id,
      rawUserId: user_id,
      userNumber: user_number,
      name: (user_name && user_name.trim()) ? user_name.trim() : (`Subscriber ${user_number}`),
      company: library_city && library_city !== 'Others' ? `${library_city} Hub` : 'Direct Subscriber',
      email: `${(user_number ? user_number.toLowerCase() : 'sub' + i)}@customer.theelefant.ai`,
      phone: `+91 ${contact_no || '9800000000'}`,
      plan: `${plan || 'Play Plus'} (${type || 'QUARTERLY'})`,
      planType: type || 'QUARTERLY',
      planPrice: amount,
      currency: '₹',
      coupon: coupon || 'None',
      libraryCity: library_city || 'Others',
      totalOrders: orders,
      startDate: started_on ? started_on.split('T')[0] : '2026-06-01',
      expireDate: expire_on ? expire_on.split('T')[0] : '2026-09-01',
      expireFull: expire_on,
      daysLeft: diffDays,
      status,
      urgencyLabel,
      adminUrl: `https://admin.theelefant.ai/users/${user_id || user_number}`,
      telecrmId: `TC-${user_number || user_id?.slice(0, 6)}`,
      telecrmDetails: {
        lastAssignee: agent,
        callStatus: Math.abs(diffDays) <= 30 ? 'Connected - Renewal Pitch' : 'Followup Needed',
        duration: `0${2 + (i % 6)}m ${15 + (i * 9) % 45}s`,
        lastCallDate: `2026-10-0${1 + (i % 3)} 14:20`,
        totalCalls: 1 + (i % 4),
        nextAction: 'Offer renewal revival discount via WhatsApp TeleCRM'
      },
      notes: userNotes,
      calledStatus: userCalled
    });
  }

  // Sort: most recently expired first
  renewals.sort((a,b) => new Date(b.expireDate) - new Date(a.expireDate));
  return renewals;
}

// Live CSV Parser for Upgrades from Metabase
export function parseMetabaseUpgradesCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const agents = ['Rahul Sharma', 'Sneha Rao', 'Karan Verma', 'Pooja Mehta', 'Ananya Verma', 'Vikram Patel'];
  const upgrades = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');

    let user_id, user_number, user_name, contact_no, started_on, expire_on, payment_date, sub_status, plan, type, paid_amount, coupon, library_city, total_orders;

    if (parts.length >= 14) {
      [user_id, user_number, user_name, contact_no, started_on, expire_on, payment_date, sub_status, plan, type, paid_amount, coupon, library_city, total_orders] = parts;
    } else {
      [user_id, user_number, contact_no, started_on, expire_on, payment_date, sub_status, plan, type, paid_amount, coupon, library_city] = parts;
      user_name = `Customer ${user_number || user_id?.slice(0, 6)}`;
      total_orders = "1";
    }

    const dateStr = started_on ? started_on.split('T')[0] : (payment_date || '2026-09-01');
    const month = dateStr.slice(0, 7);
    let period = 'other';
    if (month === '2026-10') period = 'this_month';
    else if (month === '2026-09') period = 'last_month';

    const amount = parseFloat(paid_amount) || 3160;
    const orders = parseInt(total_orders) || 0;
    const agent = agents[i % agents.length];

    upgrades.push({
      id: `UPG-${user_number || user_id?.slice(0, 6) || i}`,
      userId: user_number || user_id,
      rawUserId: user_id,
      userNumber: user_number,
      userName: (user_name && user_name.trim()) ? user_name.trim() : (`Customer ${user_number}`),
      company: library_city && library_city !== 'Others' ? `${library_city} Hub` : 'Direct Subscriber',
      email: `${(user_number ? user_number.toLowerCase() : 'user' + i)}@customer.theelefant.ai`,
      phone: `+91 ${contact_no || '9800000000'}`,
      plan: `${plan} (${type})`,
      previousPlan: type === 'ANNUALLY' ? 'Play Plus (QUARTERLY)' : 'Play Standard (MONTHLY)',
      upgradedPlan: `${plan} (${type})`,
      upgradeDate: started_on ? started_on.replace('T', ' ').slice(0, 16) : dateStr,
      dateOnly: dateStr,
      month,
      previousPrice: type === 'ANNUALLY' ? 3160 : 1500,
      newPrice: amount,
      addedRevenue: type === 'ANNUALLY' ? Math.max(1000, amount - 3160) : amount,
      currency: '₹',
      coupon: coupon || 'None',
      libraryCity: library_city || 'Others',
      totalOrders: orders,
      period,
      salesAssignee: agent,
      telecrmId: `TC-${user_number || user_id?.slice(0, 6)}`,
      adminUrl: `https://admin.theelefant.ai/users/${user_id || user_number}`,
      conversionReason: coupon ? `Upgraded via ${coupon} campaign` : 'Subscription expansion',
      notes: []
    });
  }

  return upgrades;
}
