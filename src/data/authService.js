// Authentication and Credentials Management for Renewal & Upgrade Intelligence Portal

const CREDENTIALS_KEY = "ag_portal_credentials_v1";
const SESSION_KEY = "ag_portal_session_v1";

// Pre-configured team credentials
const DEFAULT_CREDENTIALS = [
  {
    id: "usr-admin-1",
    name: "Operations Admin",
    email: "admin@theelefant.ai",
    password: "Admin@2026!",
    role: "Super Admin",
    team: "Management"
  },
  {
    id: "usr-sales-lead",
    name: "Sales Team Lead",
    email: "sales@theelefant.ai",
    password: "Sales@2026!",
    role: "Sales Lead",
    team: "Sales"
  },
  {
    id: "usr-crm-lead",
    name: "TeleCRM Supervisor",
    email: "telecrm@theelefant.ai",
    password: "Crm@2026!",
    role: "CRM Manager",
    team: "TeleCRM"
  },
  {
    id: "usr-rahul",
    name: "Rahul Sharma",
    email: "rahul@theelefant.ai",
    password: "Rahul@2026!",
    role: "Sales Executive",
    team: "Renewal Sales"
  },
  {
    id: "usr-sneha",
    name: "Sneha Rao",
    email: "sneha@theelefant.ai",
    password: "Sneha@2026!",
    role: "Sales Executive",
    team: "Renewal Sales"
  }
];

export function getStoredCredentials() {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
      return DEFAULT_CREDENTIALS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
      return DEFAULT_CREDENTIALS;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_CREDENTIALS;
  }
}

export function saveStoredCredentials(creds) {
  try {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
  } catch (e) {}
}

export function addCredential({ name, email, password, role = "Sales Executive", team = "Sales" }) {
  const current = getStoredCredentials();
  const normalizedEmail = email.trim().toLowerCase();
  
  // Check if email already exists
  const existingIdx = current.findIndex(c => c.email.toLowerCase() === normalizedEmail);
  const newEntry = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password: password.trim(),
    role,
    team
  };

  if (existingIdx >= 0) {
    current[existingIdx] = { ...current[existingIdx], ...newEntry };
  } else {
    current.push(newEntry);
  }

  saveStoredCredentials(current);
  return newEntry;
}

export function removeCredential(email) {
  const current = getStoredCredentials();
  const updated = current.filter(c => c.email.toLowerCase() !== email.toLowerCase());
  saveStoredCredentials(updated);
  return updated;
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

export function loginUser(email, password) {
  const creds = getStoredCredentials();
  const normalizedEmail = email.trim().toLowerCase();
  const matched = creds.find(
    c => c.email.toLowerCase() === normalizedEmail && c.password === password
  );

  if (!matched) {
    return { success: false, message: "Invalid email or password. Please verify your credentials." };
  }

  const sessionUser = {
    id: matched.id,
    name: matched.name,
    email: matched.email,
    role: matched.role,
    team: matched.team,
    loginAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  } catch (e) {}

  return { success: true, user: sessionUser };
}

export function logoutUser() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {}
}
