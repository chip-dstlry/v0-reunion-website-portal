"use client"

import { useState, useEffect } from "react"
import { PortalClient } from "@/components/portal-client"
import type { Classmate, SheetStats } from "@/lib/google-sheets"
import { CSV_URL } from "@/lib/config"

const C = { cream: "#f5f0e6", creamDark: "#e8e0d4", charcoal: "#2d2d2d", gray: "#888888", maroon: "#8b1a1a", white: "#ffffff" }

function parseCSV(text: string): { classmates: Classmate[]; stats: SheetStats } {
  const lines = text.split("\n").map((l) => {
    // Basic CSV parse — handles quoted fields
    const row: string[] = []
    let inQuote = false
    let cur = ""
    for (let i = 0; i < l.length; i++) {
      const ch = l[i]
      if (ch === '"') { inQuote = !inQuote }
      else if (ch === "," && !inQuote) { row.push(cur.trim()); cur = "" }
      else cur += ch
    }
    row.push(cur.trim())
    return row
  })

  const dataRows = lines.slice(11).filter((r) => r.length > 1 && (r[1] ?? "").trim() !== "")

  const classmates: Classmate[] = dataRows.map((row) => {
    const officialName = (row[1] ?? "").trim()
    const commonFirst  = (row[2] ?? "").trim()
    const maidenLast   = (row[3] ?? "").trim()
    const currentLast  = (row[4] ?? "").trim()
    const email        = (row[5] ?? "").trim()
    const phone        = (row[7] ?? "").trim()
    const deceased     = (row[15] ?? "").trim().toLowerCase() === "yes"
    const city         = (row[17] ?? "").trim()
    const state        = (row[18] ?? "").trim()
    // Column T (index 19) is "Job Title" for living classmates,
    // but holds the date(s) of passing for deceased classmates.
    const colT         = (row[19] ?? "").trim()
    const jobTitle     = deceased ? "" : colT
    const deceasedDate = deceased ? colT : ""
    const employer     = (row[20] ?? "").trim()
    const obituaryUrl  = (row[24] ?? "").trim()

    const displayLast  = currentLast || maidenLast
    const displayFirst = commonFirst || officialName.split(",")[1]?.trim().split(" ")[0] || ""
    const nameParts    = [displayFirst, displayLast].filter(Boolean).join(" ")
    const name         = (currentLast && maidenLast && currentLast !== maidenLast)
      ? `${nameParts} (${maidenLast})`
      : nameParts

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
      deceasedDate,
      obituaryUrl,
      isMostWanted: !email && !phone && !deceased,
    }
  }).sort((a, b) => a.lastName.localeCompare(b.lastName))

  const inMemoriam = classmates.filter((c) => c.deceased).length
  const mostWanted = classmates.filter((c) => c.isMostWanted).length
  const found      = classmates.filter((c) => (c.email || c.phone) && !c.deceased).length
  const stats: SheetStats = { total: classmates.length, found, mostWanted, inMemoriam }

  return { classmates, stats }
}

// Skeleton card — responsive to viewport
function Skeleton() {
  return (
    <div style={{ backgroundColor: C.cream, minHeight: "100vh" }}>
      {/* Hero skeleton */}
      <div style={{ backgroundColor: C.cream, textAlign: "center", padding: "2rem 1rem 3rem" }}>
        <div style={{ maxWidth: 480, width: "85%", margin: "0 auto 2rem", backgroundColor: C.creamDark, borderRadius: 16, height: 220, animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 40, width: "min(320px, 80%)", backgroundColor: C.creamDark, borderRadius: 8, margin: "0 auto 12px" }} />
        <div style={{ height: 28, width: "min(200px, 60%)", backgroundColor: C.creamDark, borderRadius: 8, margin: "0 auto 12px" }} />
        <div style={{ height: 22, width: "min(260px, 70%)", backgroundColor: C.creamDark, borderRadius: 8, margin: "0 auto" }} />
      </div>
      {/* Stats skeleton */}
      <div style={{ backgroundColor: C.creamDark, padding: "2.5rem 1rem" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ height: 48, width: 80, backgroundColor: "#d4c8b8", borderRadius: 8, margin: "0 auto 8px" }} />
              <div style={{ height: 14, width: 60, backgroundColor: "#d4c8b8", borderRadius: 4, margin: "0 auto" }} />
            </div>
          ))}
        </div>
      </div>
      {/* Cards skeleton */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: "1.25rem" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: C.white, borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: C.creamDark, margin: "0 auto 16px" }} />
              <div style={{ height: 20, width: "70%", backgroundColor: C.creamDark, borderRadius: 6, margin: "0 auto 8px" }} />
              <div style={{ height: 14, width: "50%", backgroundColor: C.creamDark, borderRadius: 6, margin: "0 auto 20px" }} />
              <div style={{ height: 44, backgroundColor: C.maroon, borderRadius: 6, opacity: 0.15 }} />
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}

export default function Page() {
  const [data, setData]       = useState<{ classmates: Classmate[]; stats: SheetStats } | null>(null)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    let cancelled = false

    // Show cached data immediately for snappy first paint, then refetch in background.
    const cached = sessionStorage.getItem("mhs91_data")
    if (cached) {
      try { setData(JSON.parse(cached)) } catch { /* ignore */ }
    }

    // Cache-bust both the browser cache and any Google CDN cache by appending a
    // timestamp, and force a fresh request with cache: "no-store".
    const url = `${CSV_URL}&_=${Date.now()}`
    fetch(url, { cache: "no-store" })
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return
        const parsed = parseCSV(text)
        sessionStorage.setItem("mhs91_data", JSON.stringify(parsed))
        setData(parsed)
      })
      .catch(() => {
        if (!cancelled && !cached) setFetchError(true)
      })

    return () => { cancelled = true }
  }, [])

  if (fetchError) {
    return (
      <div style={{ backgroundColor: C.cream, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
        <p style={{ fontFamily: "serif", color: C.charcoal, fontSize: "1.5rem", marginBottom: 12 }}>Could not load classmate data</p>
        <p style={{ color: C.gray, fontSize: "0.95rem", maxWidth: 380 }}>
          Unable to reach the Google Sheet. Please check your connection and try refreshing.
        </p>
        <button onClick={() => { setFetchError(false); window.location.reload() }} style={{ marginTop: 24, padding: "12px 28px", backgroundColor: C.maroon, color: C.white, border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.875rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Retry
        </button>
      </div>
    )
  }

  if (!data) return <Skeleton />

  return <PortalClient classmates={data.classmates} stats={data.stats} />
}
