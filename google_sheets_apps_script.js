/**
 * Google Apps Script for "Renewal & Upgrade Intelligence Portal"
 * 
 * INSTRUCTIONS TO SET UP:
 * 1. Open your Google Sheet (or create a new one: https://sheets.new).
 * 2. In Google Sheets menu, click: Extensions > Apps Script.
 * 3. Delete any code in the editor, and PASTE this entire script.
 * 4. Click the "Save" (disk icon) button.
 * 5. Click the blue "Deploy" button (top right) > "New deployment".
 * 6. Under "Select type", choose "Web app".
 * 7. Configure:
 *    - Description: "Renewal & Upgrade Live Portal Sync"
 *    - Execute as: "Me (your google account)"
 *    - Who has access: "Anyone"  <-- CRITICAL so your web app can push data!
 * 8. Click "Deploy". Grant the requested Google permissions.
 * 9. Copy the "Web app URL" (it will look like: https://script.google.com/macros/s/AKfycb.../exec).
 * 10. Paste this URL into the "Google Sheet Sync" modal on your dashboard!
 */

function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000); // 30 sec lock to avoid race conditions

    const contents = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    let renewalsCount = 0;
    let upgradesCount = 0;

    // 1. Process Renewals Leads
    if (contents.renewals && contents.renewals.length > 0) {
      renewalsCount = syncRenewalsSheet(ss, contents.renewals);
    }

    // 2. Process Upgrades Leads
    if (contents.upgrades && contents.upgrades.length > 0) {
      upgradesCount = syncUpgradesSheet(ss, contents.upgrades);
    }

    lock.releaseLock();

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        renewalsSynced: renewalsCount,
        upgradesSynced: upgradesCount,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "online",
      service: "Renewal & Upgrade Portal Google Sheets Webhook",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sync Renewals Leads with Formatting, Formulas, and Native Filters for Sales Team
 */
function syncRenewalsSheet(ss, renewals) {
  let sheet = ss.getSheetByName("Renewal Leads");
  if (!sheet) {
    sheet = ss.insertSheet("Renewal Leads");
  } else {
    // Remove existing filter if any before rewriting
    if (sheet.getFilter()) {
      sheet.getFilter().remove();
    }
    sheet.clear();
  }

  const headers = [
    "Customer Name",
    "User ID / UR No.",
    "Total Orders",
    "Phone Number",
    "City Hub",
    "Subscription Plan",
    "Plan Price (INR)",
    "Expiry Date",
    "Days Left / Overdue",
    "Lead Urgency",
    "TeleCRM Assignee",
    "Call Status",
    "Last Call Date",
    "Latest Note Text",
    "Note Added By (Sales/Agent)",
    "Note Timestamp",
    "Admin Portal Jump Link"
  ];

  const rows = [headers];

  for (let i = 0; i < renewals.length; i++) {
    const item = renewals[i];
    const latestNote = (item.notes && item.notes.length > 0) ? item.notes[0] : null;

    rows.push([
      item.name || ("Subscriber " + (item.userNumber || item.id)),
      item.userNumber || item.id || "",
      item.totalOrders !== undefined ? Number(item.totalOrders) : 0,
      item.phone || "",
      item.libraryCity || "Others",
      item.plan || "Play Plus",
      item.planPrice !== undefined ? Number(item.planPrice) : 0,
      item.expireDate || "",
      item.daysLeft !== undefined ? Number(item.daysLeft) : 0,
      item.urgencyLabel || item.status || "EXPIRED",
      item.telecrmDetails?.lastAssignee || "Unassigned",
      item.telecrmDetails?.callStatus || "Followup Needed",
      item.telecrmDetails?.lastCallDate || "",
      latestNote ? latestNote.text : "",
      latestNote ? (latestNote.author + " (" + (latestNote.authorEmail || latestNote.authorRole || "") + ")") : "",
      latestNote ? latestNote.timestamp : "",
      item.adminUrl ? `=HYPERLINK("${item.adminUrl}", "Open Admin")` : ""
    ]);
  }

  // Write all rows in batch
  const range = sheet.getRange(1, 1, rows.length, headers.length);
  range.setValues(rows);

  // Styling & Formatting
  sheet.setFrozenRows(1);

  // Header styling: Dark Indigo, White Bold Text, 11pt
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange
    .setBackground("#1e1b4b")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center");

  // Currency formatting for Plan Price (Col 7)
  if (rows.length > 1) {
    sheet.getRange(2, 7, rows.length - 1, 1).setNumberFormat("₹#,##0");
  }

  // Left align names & notes, center dates & badges
  if (rows.length > 1) {
    sheet.getRange(2, 3, rows.length - 1, 1).setHorizontalAlignment("center"); // Total Orders
    sheet.getRange(2, 8, rows.length - 1, 3).setHorizontalAlignment("center"); // Expiry, Days, Urgency
    sheet.getRange(2, 17, rows.length - 1, 1).setHorizontalAlignment("center"); // Admin Link
  }

  // Create Native Google Sheets Filter so Sales Team can immediately filter by:
  // - Urgency (e.g. Hot Leads, Sep Expired)
  // - City (e.g. Mumbai, Bengaluru)
  // - TeleCRM Assignee
  // - Total Orders
  range.createFilter();

  // Auto-fit column widths
  for (let c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }

  return rows.length - 1;
}

/**
 * Sync Upgrades Leads with Formatting and Native Filters
 */
function syncUpgradesSheet(ss, upgrades) {
  let sheet = ss.getSheetByName("Upgrade Leads");
  if (!sheet) {
    sheet = ss.insertSheet("Upgrade Leads");
  } else {
    if (sheet.getFilter()) {
      sheet.getFilter().remove();
    }
    sheet.clear();
  }

  const headers = [
    "Customer Name",
    "User ID / UR No.",
    "Total Orders",
    "Upgrade Period",
    "Upgrade Date",
    "Previous Plan",
    "Upgraded Plan",
    "Added Revenue (INR)",
    "City Hub",
    "Assigned Agent",
    "Latest Note",
    "Note Added By",
    "Admin Portal Jump Link"
  ];

  const rows = [headers];

  for (let i = 0; i < upgrades.length; i++) {
    const item = upgrades[i];
    const latestNote = (item.notes && item.notes.length > 0) ? item.notes[0] : null;

    rows.push([
      item.userName || ("Upgrade " + (item.userId || item.id)),
      item.userNumber || item.userId || "",
      item.totalOrders !== undefined ? Number(item.totalOrders) : 0,
      item.period === "this_month" ? "This Month (Oct 2026)" : "Last Month (Sep 2026)",
      item.date || "",
      item.previousPlan || "Play Plus",
      item.newPlan || "Play Max",
      item.newPrice !== undefined ? Number(item.newPrice) : (item.addedRevenue || 0),
      item.libraryCity || "Others",
      item.telecrmDetails?.lastAssignee || "Unassigned",
      latestNote ? latestNote.text : "",
      latestNote ? (latestNote.author + " (" + (latestNote.authorEmail || "") + ")") : "",
      item.adminUrl ? `=HYPERLINK("${item.adminUrl}", "Open Admin")` : ""
    ]);
  }

  const range = sheet.getRange(1, 1, rows.length, headers.length);
  range.setValues(rows);

  sheet.setFrozenRows(1);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange
    .setBackground("#064e3b") // Emerald Green Header
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center");

  // Currency format on Added Revenue (Col 8)
  if (rows.length > 1) {
    sheet.getRange(2, 8, rows.length - 1, 1).setNumberFormat("₹#,##0");
  }

  range.createFilter();

  for (let c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }

  return rows.length - 1;
}
