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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111] border border-white/15 rounded w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Submit Contact Info</p>
            <h2 className="font-serif text-white text-xl leading-snug">
              {classmate.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/40 hover:text-white transition-colors mt-0.5"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <p className="text-white/50 text-sm leading-relaxed">
            Share what you know — the reunion team will verify and update the list.
          </p>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50 uppercase tracking-wide">Their Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="classmate@example.com"
              className="bg-transparent border border-white/20 rounded px-3 py-2.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50 uppercase tracking-wide">Their Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(713) 555-0100"
              className="bg-transparent border border-white/20 rounded px-3 py-2.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50 uppercase tracking-wide">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other helpful context..."
              rows={3}
              className="bg-transparent border border-white/20 rounded px-3 py-2.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50 resize-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50 uppercase tracking-wide">Your Name (optional)</span>
            <input
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="So the team knows who to follow up with"
              className="bg-transparent border border-white/20 rounded px-3 py-2.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50"
            />
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded border border-white/20 text-white/60 text-sm uppercase tracking-wider hover:border-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded bg-white text-black text-sm uppercase tracking-wider font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
