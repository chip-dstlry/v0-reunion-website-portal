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
        <div className="font-serif text-white text-xl mb-2">Thank you for letting us know</div>
        <p className="text-white/50 text-sm">
          The reunion team will handle this with care and update our records.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md mx-auto">
      {/* Classmate search */}
      <label className="flex flex-col gap-1.5 relative">
        <span className="text-xs text-white/50 uppercase tracking-wide">Classmate Name</span>
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
          className="bg-transparent border border-white/20 rounded px-3 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50"
        />
        {showDropdown && search.length > 1 && filtered.length > 0 && (
          <ul className="absolute top-full mt-1 left-0 right-0 bg-[#111] border border-white/20 rounded shadow-xl z-20 max-h-48 overflow-y-auto">
            {filtered.map((c) => (
              <li key={c.name}>
                <button
                  type="button"
                  onMouseDown={() => selectClassmate(c)}
                  className="w-full text-left px-3 py-2 text-white text-sm hover:bg-white/10 transition-colors"
                >
                  {c.name}
                  {c.city || c.state ? (
                    <span className="text-white/40 ml-2 text-xs">
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
        <span className="text-xs text-white/50 uppercase tracking-wide">Date of Passing (optional)</span>
        <input
          type="date"
          value={dateOfPassing}
          onChange={(e) => setDateOfPassing(e.target.value)}
          className="bg-transparent border border-white/20 rounded px-3 py-3 text-white text-sm focus:outline-none focus:border-white/50"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-white/50 uppercase tracking-wide">Source / Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did you hear about this? Obituary link, mutual friend, etc."
          rows={3}
          className="bg-transparent border border-white/20 rounded px-3 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50 resize-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-white/50 uppercase tracking-wide">Your Name (optional)</span>
        <input
          type="text"
          value={submittedBy}
          onChange={(e) => setSubmittedBy(e.target.value)}
          placeholder="So the team can follow up if needed"
          className="bg-transparent border border-white/20 rounded px-3 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50"
        />
      </label>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="py-3 rounded border border-white/30 text-white text-xs uppercase tracking-wider hover:bg-white hover:text-black disabled:opacity-50 transition-colors"
      >
        {loading ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  )
}
