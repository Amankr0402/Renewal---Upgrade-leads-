// Industrial-strength CSV generator compatible with Microsoft Excel, Google Sheets, and Numbers

export function downloadCSV(filename, rows) {
  if (!rows || !rows.length) {
    console.warn("downloadCSV called with empty rows");
    return;
  }

  const separator = ",";
  const keys = Object.keys(rows[0]);
  
  // Format each cell with quotes and escape internal quotes
  const lines = [
    // Header line
    keys.map(k => `"${String(k).replace(/"/g, '""')}"`).join(separator),
    // Data rows
    ...rows.map(row =>
      keys
        .map(k => {
          let cell = row[k];
          if (cell === null || cell === undefined) {
            cell = "";
          } else {
            cell = String(cell).replace(/"/g, '""');
          }
          return `"${cell}"`;
        })
        .join(separator)
    )
  ];

  // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows recognizes UTF-8 characters and formatting properly
  const csvContent = "\uFEFF" + lines.join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Cross-browser download trigger
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, filename);
    return;
  }

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
}

export function exportRenewalsReport(renewals) {
  if (!renewals || renewals.length === 0) return;

  const formattedRows = renewals.map(item => {
    const priceNum = typeof item.planPrice === 'number' 
      ? item.planPrice 
      : (parseFloat(item.planPrice) || 0);

    const latestNote = (item.notes && item.notes.length > 0) ? item.notes[0] : null;

    const notesSummary = (item.notes || [])
      .map(n => `[${n.timestamp || ''}] ${n.author || 'Agent'} (${n.authorEmail || n.authorRole || 'Agent'} - ${n.tag || 'Note'}): ${n.text || ''}`)
      .join(" | ");

    return {
      "Customer Name": item.name || `Subscriber ${item.userNumber || item.id}`,
      "User Number": item.userNumber || item.id || "",
      "Total Orders": item.totalOrders !== undefined ? item.totalOrders : 0,
      "Contact Phone": item.phone || "",
      "Email Address": item.email || "",
      "Subscription Plan": item.plan || "Play Plus",
      "Plan Price (INR)": priceNum,
      "Start Date": item.startDate || "",
      "Expiry Date": item.expireDate || "",
      "Days Left / Overdue": item.daysLeft !== undefined ? item.daysLeft : 0,
      "Status Urgency": item.urgencyLabel || (item.status ? item.status.toUpperCase() : "EXPIRED"),
      "City Hub": item.libraryCity || "Others",
      "Coupon Code": item.coupon || "None",
      "TeleCRM Assignee": item.telecrmDetails?.lastAssignee || "Rahul Sharma",
      "TeleCRM Call Status": item.telecrmDetails?.callStatus || "Followup Needed",
      "Call Duration": item.telecrmDetails?.duration || "04m 30s",
      "Last Touchpoint": item.telecrmDetails?.lastCallDate || "",
      "Latest Note Text": latestNote ? latestNote.text : "",
      "Note Added By": latestNote ? `${latestNote.author} (${latestNote.authorEmail || latestNote.authorRole || 'Agent'})` : "",
      "Note Timestamp": latestNote ? (latestNote.timestamp || "") : "",
      "Admin Portal Jump URL": item.adminUrl || `https://admin.theelefant.ai/users/${item.id}`,
      "Manual Notes Count": item.notes?.length || 0,
      "Manual Notes History": notesSummary
    };
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadCSV(`Renewal_Subscribers_Report_${timestamp}.csv`, formattedRows);
}

export function exportUpgradesReport(upgrades, filterLabel = "All") {
  if (!upgrades || upgrades.length === 0) return;

  const formattedRows = upgrades.map(item => {
    const amountNum = typeof item.newPrice === 'number'
      ? item.newPrice
      : (parseFloat(item.newPrice) || parseFloat(item.paid_amount) || 0);

    const notesSummary = (item.notes || [])
      .map(n => `[${n.timestamp || ''}] ${n.author || 'Agent'}: ${n.text || ''}`)
      .join(" | ");

    return {
      "Customer Name": item.userName || `Customer ${item.userNumber || item.userId}`,
      "User Number": item.userNumber || item.userId || "",
      "Total Orders": item.totalOrders !== undefined ? item.totalOrders : 0,
      "Contact Phone": item.phone || "",
      "Email Address": item.email || "",
      "Plan Transformed": item.upgradedPlan || item.plan || "",
      "Previous Plan": item.previousPlan || "Play Standard (MONTHLY)",
      "Upgrade / Payment Date": item.upgradeDate || item.dateOnly || "",
      "Amount Paid (INR)": amountNum,
      "Coupon Code": item.coupon || "None",
      "Library City / Hub": item.libraryCity || "Others",
      "TeleCRM Assignee": item.salesAssignee || "Rahul Sharma",
      "TeleCRM Lead URL": `https://crm.telecrm.in/leads/${item.telecrmId || item.userNumber || 'lead'}`,
      "Admin Portal URL": item.adminUrl || `https://admin.theelefant.ai/users/${item.userId}`,
      "Manual Notes Count": item.notes?.length || 0,
      "Manual Notes History": notesSummary
    };
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadCSV(`Metabase_Upgrade_Report_${filterLabel}_${timestamp}.csv`, formattedRows);
}
