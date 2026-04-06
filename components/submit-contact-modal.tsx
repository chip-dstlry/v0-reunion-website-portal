"use client"

import { useState, useEffect } from "react"
import type { Classmate } from "@/lib/google-sheets"
import { useIsMobile } from "@/lib/use-is-mobile"
import { APPS_SCRIPT_URL } from "@/lib/config"

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
const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 }
const labelTextStyle: React.CSSProperties = { fontSize: "0.7rem", color: C.gray, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }

interface SubmitContactModalProps {
  classmate: Classmate | null
  onClose: () => void
  onSuccess: () => void
}

export function SubmitContactModal({ classmate, onClose, onSuccess }: SubmitContactModalProps) {
  const [submitterName,  setSubmitterName]  = useState("")
  const [submitterEmail, setSubmitterEmail] = useState("")
  const [classmateEmail, setClassmateEmail] = useState("")
  const [classmatePhone, setClassmatePhone] = useState("")
  const [marriedName,    setMarriedName]    = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const mobile = useIsMobile()

  useEffect(() => {
    if (!classmate) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [classmate, onClose])

  if (!classmate) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!submitterName.trim()) { setError("Please enter your name."); return }
    if (!submitterEmail.trim()) { setError("Please enter your email."); return }
    if (!classmateEmail.trim() && !classmatePhone.trim()) { setError("Please enter at least an email or phone number."); return }
    setLoading(true)
    setError("")
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "i_know_them",
          classmateName:  classmate!.name,
          submitterName,
          submitterEmail,
          classmateEmail: classmateEmail.trim(),
          classmatePhone: classmatePhone.trim(),
          marriedName:    marriedName.trim(),
        }),
      })
      // no-cors means we can't read the response — assume success
      // Clear form so the next classmate starts fresh
      setSubmitterName("")
      setSubmitterEmail("")
      setClassmateEmail("")
      setClassmatePhone("")
      setMarriedName("")
      onSuccess()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Submit contact info for ${classmate.name}`}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: mobile ? "flex-end" : "center", justifyContent: "center", padding: mobile ? 0 : 16, backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ backgroundColor: C.white, borderRadius: mobile ? "16px 16px 0 0" : 12, width: "100%", maxWidth: mobile ? "100%" : 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: mobile ? "92vh" : "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <p style={{ fontSize: "0.65rem", color: C.gray, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>I Know Where They Are</p>
            <h2 style={{ fontFamily: "Georgia, serif", color: C.charcoal, fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>{classmate.name}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: C.gray, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", marginRight: -8 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16"/></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ color: C.gray, fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
            Share what you know — the reunion team will verify and reach out.
          </p>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Your Name <span style={{ color: C.maroon }}>*</span></span>
            <input type="text" value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} placeholder="Your full name" style={inputStyle} required />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Your Email <span style={{ color: C.maroon }}>*</span></span>
            <input type="email" value={submitterEmail} onChange={(e) => setSubmitterEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} required />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Their Email</span>
            <input type="email" value={classmateEmail} onChange={(e) => setClassmateEmail(e.target.value)} placeholder="their@email.com" style={inputStyle} />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Their Phone</span>
            <input type="tel" value={classmatePhone} onChange={(e) => setClassmatePhone(e.target.value)} placeholder="(555) 555-5555" style={inputStyle} />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Married Name (optional)</span>
            <input type="text" value={marriedName} onChange={(e) => setMarriedName(e.target.value)} placeholder="Current last name if different" style={inputStyle} />
          </label>

          {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, minHeight: 48, borderRadius: 6, border: `1px solid ${C.border}`, backgroundColor: "transparent", color: C.charcoal, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, minHeight: 48, borderRadius: 6, border: "none", backgroundColor: C.maroon, color: C.white, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
