import { google } from "googleapis"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const MASTER_TAB = "Master List"
const PENDING_TAB = "Pending Submissions"

function getAuth() {
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  }
  return new google.auth.JWT(credentials.client_email, undefined, credentials.private_key, [
    "https://www.googleapis.com/auth/spreadsheets",
  ])
}

export type Classmate = {
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  state: string
  deceased: boolean
  isMostWanted: boolean
}

export type Submission = {
  submittedBy: string
  classmateName: string
  type: "contact_info" | "deceased_report"
  email: string
  phone: string
  notes: string
}

/**
 * Reads the master list from the Google Sheet.
 * Columns expected (0-indexed):
 *   0 = Last Name, 1 = First Name, 2 = Email, 3 = Phone,
 *   4 = City, 5 = State, 6 = Deceased (Y / yes / true / x)
 *
 * Adjust column indices below if your sheet differs.
 */
// Mock data for preview when env vars aren't set
const MOCK_CLASSMATES: Classmate[] = [
  { name: "Jennifer Martinez", firstName: "Jennifer", lastName: "Martinez", email: "", phone: "", city: "Austin", state: "TX", deceased: false, isMostWanted: true },
  { name: "Michael Chen", firstName: "Michael", lastName: "Chen", email: "", phone: "", city: "San Francisco", state: "CA", deceased: false, isMostWanted: true },
  { name: "Sarah Johnson", firstName: "Sarah", lastName: "Johnson", email: "", phone: "", city: "Denver", state: "CO", deceased: false, isMostWanted: true },
  { name: "David Williams", firstName: "David", lastName: "Williams", email: "", phone: "", city: "Houston", state: "TX", deceased: false, isMostWanted: true },
  { name: "Lisa Thompson", firstName: "Lisa", lastName: "Thompson", email: "", phone: "", city: "Seattle", state: "WA", deceased: false, isMostWanted: true },
  { name: "Robert Garcia", firstName: "Robert", lastName: "Garcia", email: "", phone: "", city: "Phoenix", state: "AZ", deceased: false, isMostWanted: true },
  { name: "Amanda Brown", firstName: "Amanda", lastName: "Brown", email: "", phone: "", city: "Dallas", state: "TX", deceased: false, isMostWanted: true },
  { name: "Christopher Lee", firstName: "Christopher", lastName: "Lee", email: "", phone: "", city: "Portland", state: "OR", deceased: false, isMostWanted: true },
  { name: "Emily Davis", firstName: "Emily", lastName: "Davis", email: "", phone: "", city: "Nashville", state: "TN", deceased: false, isMostWanted: true },
  { name: "James Wilson", firstName: "James", lastName: "Wilson", email: "james@email.com", phone: "555-1234", city: "Houston", state: "TX", deceased: false, isMostWanted: false },
  { name: "Michelle Anderson", firstName: "Michelle", lastName: "Anderson", email: "michelle@email.com", phone: "", city: "Houston", state: "TX", deceased: false, isMostWanted: false },
  { name: "Daniel Taylor", firstName: "Daniel", lastName: "Taylor", email: "", phone: "", city: "Houston", state: "TX", deceased: true, isMostWanted: false },
  { name: "Rachel Moore", firstName: "Rachel", lastName: "Moore", email: "", phone: "", city: "Houston", state: "TX", deceased: true, isMostWanted: false },
]

export async function getClassmates(): Promise<Classmate[]> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    // Return mock data in dev when env vars are not yet set
    return MOCK_CLASSMATES
  }

  try {
    const auth = getAuth()
    const sheets = google.sheets({ version: "v4", auth })

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MASTER_TAB}!A2:Z`,
    })

    const rows = res.data.values ?? []

    return rows
      .filter((row) => row.length > 0 && (row[0] || row[1]))
      .map((row): Classmate => {
        const lastName = String(row[0] ?? "").trim()
        const firstName = String(row[1] ?? "").trim()
        const email = String(row[2] ?? "").trim()
        const phone = String(row[3] ?? "").trim()
        const city = String(row[4] ?? "").trim()
        const state = String(row[5] ?? "").trim()
        const deceasedRaw = String(row[6] ?? "").trim().toLowerCase()
        const deceased = ["y", "yes", "true", "x", "1", "deceased"].includes(deceasedRaw)

        return {
          name: `${firstName} ${lastName}`.trim(),
          firstName,
          lastName,
          email,
          phone,
          city,
          state,
          deceased,
          isMostWanted: !email && !phone && !deceased,
        }
      })
  } catch (err) {
    console.error("[google-sheets] Error reading master list:", err)
    return []
  }
}

export type SheetStats = {
  total: number
  found: number
  mostWanted: number
  inMemoriam: number
}

export function computeStats(classmates: Classmate[]): SheetStats {
  const total = classmates.length
  const inMemoriam = classmates.filter((c) => c.deceased).length
  const mostWanted = classmates.filter((c) => c.isMostWanted).length
  const found = total - mostWanted - inMemoriam
  return { total, found, mostWanted, inMemoriam }
}

/**
 * Appends a submission row to the Pending Submissions tab.
 * Creates the header row if the sheet is empty.
 */
export async function appendSubmission(submission: Submission): Promise<void> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.warn("[google-sheets] Env vars not set — submission not saved.")
    return
  }

  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  // Ensure the pending tab exists
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
  const tabExists = meta.data.sheets?.some((s) => s.properties?.title === PENDING_TAB)

  if (!tabExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: PENDING_TAB } } }],
      },
    })
    // Add header row
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${PENDING_TAB}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["Timestamp", "Submitted By", "Classmate Name", "Type", "Email", "Phone", "Notes", "Status"]],
      },
    })
  }

  const timestamp = new Date().toISOString()
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${PENDING_TAB}!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          timestamp,
          submission.submittedBy || "Anonymous",
          submission.classmateName,
          submission.type,
          submission.email || "",
          submission.phone || "",
          submission.notes || "",
          "pending",
        ],
      ],
    },
  })
}
