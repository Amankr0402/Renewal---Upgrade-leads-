// Authentication and Credentials Management for Renewal & Upgrade Intelligence Portal

const CREDENTIALS_KEY = "ag_portal_credentials_v2";
const SESSION_KEY = "ag_portal_session_v2";

// Authorized team credentials
const DEFAULT_CREDENTIALS = [
  {
    id: "usr-aman",
    name: "Aman Soni",
    email: "aman.soni@theelefant.ai",
    password: "aman@1234",
    role: "Super Admin",
    team: "Management"
  },
  {
    id: "usr-vikash",
    name: "Vikash",
    email: "vikash@theelefant.ai",
    password: "Vikash@1234",
    role: "Caller",
    team: "Sales"
  }
];

export function getStoredCredentials() {
  try {
    // Purge old test session and credentials
    localStorage.removeItem("ag_portal_credentials_v1");
    localStorage.removeItem("ag_portal_session_v1");

    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
      return DEFAULT_CREDENTIALS;
    }
    let parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some(c => c.email === 'admin@theelefant.ai')) {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
      return DEFAULT_CREDENTIALS;
    }

    // Ensure all default users exist and passwords match
    let changed = false;
    for (const def of DEFAULT_CREDENTIALS) {
      const idx = parsed.findIndex(c => c.email.toLowerCase() === def.email.toLowerCase());
      if (idx === -1) {
        parsed.push(def);
        changed = true;
      } else if (parsed[idx].password !== def.password || parsed[idx].role !== def.role || parsed[idx].name !== def.name) {
        parsed[idx] = { ...parsed[idx], password: def.password, role: def.role, name: def.name };
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(parsed));
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
