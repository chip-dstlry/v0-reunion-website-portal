/**
 * Google Apps Script for Memorial High School Class of 1991 Reunion Website
 * Deployed as a web app to accept form submissions and append them to a Google Sheet
 *
 * To deploy:
 * 1. Open https://script.google.com and paste this code
 * 2. Deploy > New deployment > Web app
 * 3. Execute as: Me | Who has access: Anyone
 * 4. Copy the deployment URL into the website code
 */

// Configuration
const SHEET_ID = '1SuTA0dBUb_hcxxuTiLQNS6XlHdFSuXT0PSsp_Vbbg9k';
const SUBMISSIONS_SHEET_NAME = 'Website Submissions';

/**
 * Handle GET requests (health check)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "MHS '91 submission endpoint is live" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Main entry point for POST requests
 */
function doPost(e) {
  try {
    // Parse the JSON body
    let requestData = {};
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (err) {
      return buildResponse({ error: 'Invalid JSON in request body' });
    }

    // Validate required fields
    if (!requestData.type) {
      return buildResponse({ error: 'Missing submission type' });
    }

    // Route to appropriate handler
    if (requestData.type === 'i_know_them') {
      return handleIKnowThem(requestData);
    } else if (requestData.type === 'report_passing') {
      return handleReportPassing(requestData);
    } else {
      return buildResponse({ error: 'Unknown submission type' });
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return buildResponse({ error: 'Internal server error: ' + error.toString() });
  }
}

/**
 * Handle "I Know Them" submissions
 */
function handleIKnowThem(data) {
  try {
    if (!data.classmateName) {
      return buildResponse({ error: 'Missing classmate name' });
    }
    if (!data.submitterName) {
      return buildResponse({ error: 'Missing submitter name' });
    }
    if (!data.submitterEmail) {
      return buildResponse({ error: 'Missing submitter email' });
    }

    appendSubmissionToSheet({
      timestamp: new Date(),
      type: 'I Know Them',
      classmateName: data.classmateName,
      submitterName: data.submitterName,
      submitterEmail: data.submitterEmail,
      classmateEmail: data.classmateEmail || '',
      classmatePhone: data.classmatePhone || '',
      marriedName: data.marriedName || '',
      notes: '',
    });

    return buildResponse({ success: true, message: 'Submission received successfully' });
  } catch (error) {
    console.error('Error in handleIKnowThem:', error);
    return buildResponse({ error: 'Failed to process submission: ' + error.toString() });
  }
}

/**
 * Handle "Report a Passing" submissions
 */
function handleReportPassing(data) {
  try {
    if (!data.classmateName) {
      return buildResponse({ error: 'Missing classmate name' });
    }

    let notes = '';
    if (data.dateOfPassing) {
      notes += 'Date of Passing: ' + data.dateOfPassing + '\n';
    }
    if (data.sourceNotes) {
      notes += 'Source/Notes: ' + data.sourceNotes;
    }

    appendSubmissionToSheet({
      timestamp: new Date(),
      type: 'Report Passing',
      classmateName: data.classmateName,
      submitterName: data.submitterName || '(Not provided)',
      submitterEmail: '(Not provided)',
      classmateEmail: '',
      classmatePhone: '',
      marriedName: '',
      notes: notes,
    });

    return buildResponse({ success: true, message: 'Report received successfully' });
  } catch (error) {
    console.error('Error in handleReportPassing:', error);
    return buildResponse({ error: 'Failed to process report: ' + error.toString() });
  }
}

/**
 * Append a submission to the "Website Submissions" sheet
 */
function appendSubmissionToSheet(submission) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);

  let sheet = spreadsheet.getSheetByName(SUBMISSIONS_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SUBMISSIONS_SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Type', 'Classmate Name', 'Submitter Name', 'Submitter Email', 'Email', 'Phone', 'Married Name', 'Notes']);
  }

  sheet.appendRow([
    submission.timestamp,
    submission.type,
    submission.classmateName,
    submission.submitterName,
    submission.submitterEmail,
    submission.classmateEmail,
    submission.classmatePhone,
    submission.marriedName,
    submission.notes,
  ]);

  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1).setNumberFormat('MM/dd/yyyy HH:mm:ss');
}

/**
 * Build a JSON response
 * Note: Google Apps Script handles CORS automatically for deployed web apps.
 * ContentService does NOT support setHeader() — do not add custom headers.
 */
function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
