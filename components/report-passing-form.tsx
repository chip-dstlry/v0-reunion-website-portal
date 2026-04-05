"use client"

import { useState } from "react"
import type { Classmate } from "@/lib/google-sheets"

interface ReportPassingFormProps {
  classmates: Classmate[]
  onSuccess: () => void
}

export function ReportPassingForm({ classmates, onSuccess }: ReportPassingFormProps) {
  const [search, setSearch] = useState("")
  const [selectedName, setSelectedName] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [dateOfPassing, setDateOfPassing] = useState("")
  const [notes, setNotes] = useState("")
  const [submittedBy, setSubmittedBy] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
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
    const name = selectedName || search
    if (!name.trim()) {
      setError("Please enter a classmate name.")
      return
    }
    setLoading(true)
    setError("")

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submittedBy,
        classmateName: name,
        type: "deceased_report",
        email: "",
        phone: "",
        notes: [dateOfPassing ? `Date of passing: ${dateOfPassing}` : "", notes].filter(Boolean).join(" | "),
      }),
    })

    setLoading(false)
    if (res.ok) {
      setSubmitted(true)
      onSuccess()
    } else {
      setError("Something went wrong. Please try again.")
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="font-serif text-cream text-xl mb-2">Thank you for letting us know</div>
        <p className="text-muted-cream text-sm">
          The reunion team will handle this with care and update our records.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl mx-auto">
      {/* Classmate search */}
      <label className="flex flex-col gap-1.5 relative">
        <span className="text-xs text-muted-cream uppercase tracking-wide">Classmate Name</span>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setSelectedName("")
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="Start typing a name..."
          className="bg-navy border border-gold/20 rounded px-3 py-2.5 text-cream placeholder:text-muted-cream/50 text-sm focus:outline-none focus:border-gold/60"
        />
        {showDropdown && search.length > 1 && filtered.length > 0 && (
          <ul className="absolute top-full mt-1 left-0 right-0 bg-navy-card border border-gold/30 rounded shadow-xl z-20 max-h-48 overflow-y-auto">
            {filtered.map((c) => (
              <li key={c.name}>
                <button
                  type="button"
                  onMouseDown={() => selectClassmate(c)}
                  className="w-full text-left px-3 py-2 text-cream text-sm hover:bg-gold/10 transition-colors"
                >
                  {c.name}
                  {c.city || c.state ? (
                    <span className="text-muted-cream ml-2 text-xs">
                      {[c.city, c.state].filter(Boolean).join(", ")}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-cream uppercase tracking-wide">Date of Passing (optional)</span>
        <input
          type="date"
          value={dateOfPassing}
          onChange={(e) => setDateOfPassing(e.target.value)}
          className="bg-navy border border-gold/20 rounded px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-gold/60"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-cream uppercase tracking-wide">Source / Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did you hear about this? Obituary link, mutual friend, etc."
          rows={3}
          className="bg-navy border border-gold/20 rounded px-3 py-2.5 text-cream placeholder:text-muted-cream/50 text-sm focus:outline-none focus:border-gold/60 resize-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-cream uppercase tracking-wide">Your Name (optional)</span>
        <input
          type="text"
          value={submittedBy}
          onChange={(e) => setSubmittedBy(e.target.value)}
          placeholder="So the team can follow up if needed"
          className="bg-navy border border-gold/20 rounded px-3 py-2.5 text-cream placeholder:text-muted-cream/50 text-sm focus:outline-none focus:border-gold/60"
        />
      </label>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="py-3 rounded border border-gold/40 text-cream text-sm font-semibold hover:border-gold hover:text-gold disabled:opacity-50 transition-colors"
      >
        {loading ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  )
}
