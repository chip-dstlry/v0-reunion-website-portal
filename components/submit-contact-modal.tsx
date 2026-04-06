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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-charcoal/10 flex items-start justify-between gap-4">
          <div>
            <p className="text-gray text-xs uppercase tracking-widest mb-1">Submit Contact Info</p>
            <h2 className="font-serif text-charcoal text-xl leading-snug font-semibold">
              {classmate.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray hover:text-charcoal transition-colors mt-0.5 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <p className="text-gray text-sm leading-relaxed">
            Share what you know — the reunion team will verify and update the list.
          </p>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray uppercase tracking-wide font-medium">Their Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="classmate@example.com"
              className="bg-cream border border-charcoal/15 rounded px-4 py-3 text-charcoal placeholder:text-gray text-base focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray uppercase tracking-wide font-medium">Their Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(713) 555-0100"
              className="bg-cream border border-charcoal/15 rounded px-4 py-3 text-charcoal placeholder:text-gray text-base focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray uppercase tracking-wide font-medium">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other helpful context..."
              rows={3}
              className="bg-cream border border-charcoal/15 rounded px-4 py-3 text-charcoal placeholder:text-gray text-base focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon resize-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-gray uppercase tracking-wide font-medium">Your Name (optional)</span>
            <input
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="So the team knows who to follow up with"
              className="bg-cream border border-charcoal/15 rounded px-4 py-3 text-charcoal placeholder:text-gray text-base focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
            />
          </label>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 min-h-[48px] rounded border border-charcoal/20 text-charcoal text-sm uppercase tracking-wider font-medium hover:bg-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 min-h-[48px] rounded bg-maroon text-white text-sm uppercase tracking-wider font-semibold hover:bg-maroon-dark disabled:opacity-50 transition-colors"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
