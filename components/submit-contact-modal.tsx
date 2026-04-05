"use client"

import { useState } from "react"
import type { Classmate } from "@/lib/google-sheets"

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
      body: JSON.stringify({
        submittedBy,
        classmateName: classmate!.name,
        type: "contact_info",
        email,
        phone,
        notes,
      }),
    })

    setLoading(false)
    if (res.ok) {
      onSuccess()
    } else {
      setError("Something went wrong. Please try again.")
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-navy-card border border-gold/30 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gold/20 flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-cream text-xs uppercase tracking-widest mb-1">Submit Contact Info</p>
            <h2 className="font-serif text-cream text-xl font-semibold leading-snug">
              {classmate.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-cream hover:text-cream transition-colors mt-0.5"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <p className="text-muted-cream text-sm leading-relaxed">
            Know how to reach this classmate? Share what you know — the reunion team will verify and update the list.
          </p>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-cream uppercase tracking-wide">Their Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="classmate@example.com"
              className="bg-navy border border-gold/20 rounded px-3 py-2 text-cream placeholder:text-muted-cream/50 text-sm focus:outline-none focus:border-gold/60"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-cream uppercase tracking-wide">Their Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(713) 555-0100"
              className="bg-navy border border-gold/20 rounded px-3 py-2 text-cream placeholder:text-muted-cream/50 text-sm focus:outline-none focus:border-gold/60"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-cream uppercase tracking-wide">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Where did you find this info? Any other context..."
              rows={3}
              className="bg-navy border border-gold/20 rounded px-3 py-2 text-cream placeholder:text-muted-cream/50 text-sm focus:outline-none focus:border-gold/60 resize-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-cream uppercase tracking-wide">Your Name (optional)</span>
            <input
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="So the team knows who to follow up with"
              className="bg-navy border border-gold/20 rounded px-3 py-2 text-cream placeholder:text-muted-cream/50 text-sm focus:outline-none focus:border-gold/60"
            />
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded border border-gold/30 text-muted-cream text-sm hover:border-gold/60 hover:text-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded bg-gold text-navy text-sm font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Submitting..." : "Submit Info"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
