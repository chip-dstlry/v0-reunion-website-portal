"use client"

import { useState } from "react"
import type { Classmate } from "@/lib/google-sheets"

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzuUiFdsk2hWQh0C9oF2CTRD7Iwike432tyRh5ayEmrjhiImmu2KKBmQmZB3MH-zlgvqA/exec"

const C = { cream: "#f5f0e6", white: "#ffffff", maroon: "#8b1a1a", charcoal: "#2d2d2d", gray: "#888888", border: "rgba(0,0,0,0.1)" }

const inputStyle: React.CSSProperties = {
  backgroundColor: C.cream,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: "12px 16px",
  color: C.charcoal,
  fontSize: 16,
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
}
const labelTextStyle: React.CSSProperties = { fontSize: "0.7rem", color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }

interface ReportPassingFormProps {
  classmates: Classmate[]
  onSuccess: () => void
}

export function ReportPassingForm({ classmates, onSuccess }: ReportPassingFormProps) {
  const [search,        setSearch]        = useState("")
  const [selectedName,  setSelectedName]  = useState("")
  const [showDropdown,  setShowDropdown]  = useState(false)
  const [dateOfPassing, setDateOfPassing] = useState("")
  const [sourceNotes,   setSourceNotes]   = useState("")
  const [submitterName, setSubmitterName] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [submitted, setSubmitted] = useState(false)

  const filtered = classmates
    .filter((c) => !c.deceased && c.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 8)

  function selectClassmate(c: Classmate) {
    setSelectedName(c.name)
    setSearch(c.name)
    setShowDropdown(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = selectedName || search.trim()
    if (!name) { setError("Please enter a classmate name."); return }
    setLoading(true)
    setError("")
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "report_passing",
          classmateName: name,
          dateOfPassing: dateOfPassing || "",
          sourceNotes:   sourceNotes   || "",
          submitterName: submitterName || "",
        }),
      })
      setSubmitted(true)
      onSuccess()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
        <p style={{ fontFamily: "Georgia, serif", color: C.charcoal, fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>Thank you for letting us know</p>
        <p style={{ color: C.gray, fontSize: "0.875rem", lineHeight: 1.6 }}>The reunion team will handle this with care and update our records.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, display: "flex", flexDirection: "column", gap: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      {/* Classmate autocomplete */}
      <label style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
        <span style={labelTextStyle}>Classmate Name</span>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedName(""); setShowDropdown(true) }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="Start typing a name..."
          style={inputStyle}
        />
        {showDropdown && search.length > 1 && filtered.length > 0 && (
          <ul style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 20, maxHeight: 200, overflowY: "auto", listStyle: "none", margin: "4px 0 0", padding: 0 }}>
            {filtered.map((c) => (
              <li key={c.name}>
                <button type="button" onMouseDown={() => selectClassmate(c)} style={{ width: "100%", textAlign: "left", padding: "12px 16px", background: "none", border: "none", color: C.charcoal, fontSize: 15, cursor: "pointer", minHeight: 48 }}>
                  {c.name}
                  {(c.city || c.state) && <span style={{ color: C.gray, marginLeft: 8, fontSize: 13 }}>{[c.city, c.state].filter(Boolean).join(", ")}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={labelTextStyle}>Date of Passing (optional)</span>
        <input type="date" value={dateOfPassing} onChange={(e) => setDateOfPassing(e.target.value)} style={inputStyle} />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={labelTextStyle}>Source / Notes (optional)</span>
        <textarea value={sourceNotes} onChange={(e) => setSourceNotes(e.target.value)} placeholder="Obituary link, mutual friend, etc." rows={3} style={{ ...inputStyle, resize: "none" }} />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={labelTextStyle}>Your Name (optional)</span>
        <input type="text" value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} placeholder="So the team can follow up if needed" style={inputStyle} />
      </label>

      {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: 0 }}>{error}</p>}

      <button type="submit" disabled={loading} style={{ minHeight: 48, borderRadius: 6, border: "none", backgroundColor: C.maroon, color: C.white, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
        {loading ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  )
}
