// Google Sheet Synchronization Utility

const GOOGLE_SHEET_KEY = "ag_google_sheet_webhook_url_v1";
const LAST_SYNC_KEY = "ag_google_sheet_last_sync_v1";

export function getGoogleSheetWebhookUrl() {
  try {
    return localStorage.getItem(GOOGLE_SHEET_KEY) || "";
  } catch (e) {
    return "";
  }
}

export function saveGoogleSheetWebhookUrl(url) {
  try {
    localStorage.setItem(GOOGLE_SHEET_KEY, (url || "").trim());
  } catch (e) {}
}

export function getLastGoogleSheetSyncTime() {
  try {
    return localStorage.getItem(LAST_SYNC_KEY) || "Never";
  } catch (e) {
    return "Never";
  }
}

/**
 * Sync formatted records to Google Sheet via Google Apps Script Webhook
 */
export async function syncToGoogleSheet({ renewals = [], upgrades = [], maxRenewals = 500 }) {
  const webhookUrl = getGoogleSheetWebhookUrl();
  if (!webhookUrl) {
    throw new Error("Please configure your Google Apps Script Webhook URL first.");
  }

  // To ensure lightning-fast Google Sheets performance and stay within Google Apps Script execution time limits,
  // we prioritize the most recent/active renewals (or full filtered set if small)
  const prioritizedRenewals = renewals.slice(0, maxRenewals);

  const payload = {
    action: "sync_all",
    timestamp: new Date().toISOString(),
    renewals: prioritizedRenewals,
    upgrades: upgrades
  };

  try {
    // Note: Google Apps Script returns 302 redirect. Using mode 'no-cors' allows writing to Google Sheet reliably from any browser
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload),
      mode: "no-cors"
    });

    const nowFormatted = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
    
    try {
      localStorage.setItem(LAST_SYNC_KEY, nowFormatted);
    } catch (e) {}

    return {
      success: true,
      renewalsCount: prioritizedRenewals.length,
      upgradesCount: upgrades.length,
      syncTime: nowFormatted
    };
  } catch (err) {
    console.error("Google Sheet sync error:", err);
    throw new Error("Failed to push data to Google Sheet: " + err.message);
  }
}
