"use client"

import { useState } from "react"
import type { Classmate } from "@/lib/google-sheets"

const C = {
  cream:    "#f5f0e6",
  white:    "#ffffff",
  maroon:   "#8b1a1a",
  charcoal: "#2d2d2d",
  gray:     "#888888",
  border:   "rgba(0,0,0,0.1)",
}

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

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
}

const labelTextStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  color: C.gray,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 600,
}

interface SubmitContactModalProps {
  classmate: Classmate | null
  onClose: () => void
  onSuccess: () => void
}

export function SubmitContactModal({ classmate, onClose, onSuccess }: SubmitContactModalProps) {
  const [submittedBy, setSubmittedBy] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!classmate) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email && !phone) {
      setError("Please provide at least an email or phone number.")
      return
    }
    setLoading(true)
    setError("")
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submittedBy, classmateName: classmate!.name, type: "contact_info", email, phone, notes }),
    })
    setLoading(false)
    if (res.ok) onSuccess()
    else setError("Something went wrong. Please try again.")
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ backgroundColor: C.white, borderRadius: 12, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <p style={{ fontSize: "0.65rem", color: C.gray, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Submit Contact Info</p>
            <h2 style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
              {classmate.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", color: C.gray, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", marginRight: -8 }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l12 12M16 4L4 16" /></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ color: C.gray, fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
            Share what you know — the reunion team will verify and update the list.
          </p>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Their Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="classmate@example.com" style={inputStyle} />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Their Phone</span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(713) 555-0100" style={inputStyle} />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Notes (optional)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any other helpful context..." rows={3} style={{ ...inputStyle, resize: "none" }} />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Your Name (optional)</span>
            <input type="text" value={submittedBy} onChange={(e) => setSubmittedBy(e.target.value)} placeholder="So the team knows who to follow up with" style={inputStyle} />
          </label>

          {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, minHeight: 48, borderRadius: 6, border: `1px solid ${C.border}`, backgroundColor: "transparent", color: C.charcoal, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, minHeight: 48, borderRadius: 6, border: "none", backgroundColor: C.maroon, color: C.white, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
