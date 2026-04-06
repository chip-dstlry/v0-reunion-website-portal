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
        <div className="font-serif text-charcoal text-xl font-semibold mb-2">Thank you for letting us know</div>
        <p className="text-gray text-sm">
          The reunion team will handle this with care and update our records.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-charcoal/10 p-6 flex flex-col gap-5 max-w-md mx-auto">
      {/* Classmate search */}
      <label className="flex flex-col gap-1.5 relative">
        <span className="text-xs text-gray uppercase tracking-wide font-medium">Classmate Name</span>
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
          className="bg-cream border border-charcoal/15 rounded px-4 py-3 text-charcoal placeholder:text-gray text-base focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
        />
        {showDropdown && search.length > 1 && filtered.length > 0 && (
          <ul className="absolute top-full mt-1 left-0 right-0 bg-white border border-charcoal/15 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
            {filtered.map((c) => (
              <li key={c.name}>
                <button
                  type="button"
                  onMouseDown={() => selectClassmate(c)}
                  className="w-full text-left px-4 py-3 text-charcoal text-base hover:bg-cream transition-colors min-h-[48px]"
                >
                  {c.name}
                  {c.city || c.state ? (
                    <span className="text-gray ml-2 text-sm">
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
        <span className="text-xs text-gray uppercase tracking-wide font-medium">Date of Passing (optional)</span>
        <input
          type="date"
          value={dateOfPassing}
          onChange={(e) => setDateOfPassing(e.target.value)}
          className="bg-cream border border-charcoal/15 rounded px-4 py-3 text-charcoal text-base focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-gray uppercase tracking-wide font-medium">Source / Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did you hear about this? Obituary link, mutual friend, etc."
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
          placeholder="So the team can follow up if needed"
          className="bg-cream border border-charcoal/15 rounded px-4 py-3 text-charcoal placeholder:text-gray text-base focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
        />
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="py-3 min-h-[48px] rounded bg-maroon text-white text-sm uppercase tracking-wider font-semibold hover:bg-maroon-dark disabled:opacity-50 transition-colors"
      >
        {loading ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  )
}
