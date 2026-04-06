import Papa from "papaparse"

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1SuTA0dBUb_hcxxuTiLQNS6XlHdFSuXT0PSsp_Vbbg9k/export?format=csv&gid=1868777450"

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzuUiFdsk2hWQh0C9oF2CTRD7Iwike432tyRh5ayEmrjhiImmu2KKBmQmZB3MH-zlgvqA/exec"

export type Classmate = {
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  state: string
  jobTitle: string
  employer: string
  deceased: boolean
  isMostWanted: boolean
}

export type SheetStats = {
  total: number
  found: number
  mostWanted: number
  inMemoriam: number
}

// Simple 5-minute in-memory cache (works per-server-instance)
let _cache: { data: Classmate[]; ts: number } | null = null
const CACHE_TTL = 5 * 60 * 1000

export async function getClassmates(): Promise<Classmate[]> {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
    return _cache.data
  }

  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 300 } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()

    const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true })
    const rows = parsed.data as string[][]

    // Rows 0–9 are color-key metadata, row 10 is the header, data starts at row 11
    const dataRows = rows.slice(11)

    const classmates: Classmate[] = dataRows
      .filter((row) => row.length > 1 && (row[1] ?? "").trim() !== "")
      .map((row): Classmate => {
        const officialName = String(row[1] ?? "").trim()   // "LASTNAME, FIRSTNAME MIDDLE"
        const commonFirst  = String(row[2] ?? "").trim()   // Common first name
        const maidenLast   = String(row[3] ?? "").trim()   // Last Name (Maiden)
        const currentLast  = String(row[4] ?? "").trim()   // Current Last Name
        const email        = String(row[5] ?? "").trim()
        const phone        = String(row[7] ?? "").trim()
        const deceased     = String(row[15] ?? "").trim().toLowerCase() === "yes"
        const city         = String(row[19] ?? "").trim()
        const state        = String(row[20] ?? "").trim()
        const jobTitle     = String(row[21] ?? "").trim()
        const employer     = String(row[22] ?? "").trim()

        // Build display name: CommonFirst + (CurrentLast or MaidenLast)
        const displayLast  = currentLast || maidenLast
        const displayFirst = commonFirst || officialName.split(",")[1]?.trim().split(" ")[0] || ""
        const name         = [displayFirst, displayLast].filter(Boolean).join(" ")

        return {
          name,
          firstName: displayFirst,
          lastName:  maidenLast || currentLast,
          email,
          phone,
          city,
          state,
          jobTitle,
          employer,
          deceased,
          isMostWanted: !email && !phone && !deceased,
        }
      })
      .sort((a, b) => a.lastName.localeCompare(b.lastName))

    _cache = { data: classmates, ts: Date.now() }
    return classmates
  } catch (err) {
    console.error("[google-sheets] CSV fetch failed:", err)
    return _cache?.data ?? []
  }
}

export function computeStats(classmates: Classmate[]): SheetStats {
  const inMemoriam  = classmates.filter((c) => c.deceased).length
  const mostWanted  = classmates.filter((c) => c.isMostWanted).length
  const found       = classmates.filter((c) => (c.email || c.phone) && !c.deceased).length
  return { total: classmates.length, found, mostWanted, inMemoriam }
}

export { APPS_SCRIPT_URL }
