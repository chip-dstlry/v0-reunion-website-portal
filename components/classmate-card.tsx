"use client"

import type { Classmate } from "@/lib/google-sheets"

interface ClassmateCardProps {
  classmate: Classmate
  onKnowWhere: (classmate: Classmate) => void
}

export function ClassmateCard({ classmate, onKnowWhere }: ClassmateCardProps) {
  const initials =
    (classmate.firstName?.[0] ?? "") + (classmate.lastName?.[0] ?? "")

  const location =
    [classmate.city, classmate.state].filter(Boolean).join(", ") || "Location unknown"

  return (
    <div className="bg-navy-card border border-gold/20 rounded-lg p-5 flex flex-col gap-4 hover:border-gold/50 transition-colors">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-navy border border-gold/30 flex items-center justify-center flex-shrink-0">
          <span className="font-serif text-gold text-lg font-semibold">{initials || "?"}</span>
        </div>
        <div className="min-w-0">
          <p className="font-serif text-cream font-semibold text-base leading-snug truncate">
            {classmate.name || "Unknown"}
          </p>
          <p className="text-muted-cream text-xs mt-0.5">{location}</p>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full border border-amber-400/40 text-amber-400 bg-amber-400/10">
          No email
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full border border-amber-400/40 text-amber-400 bg-amber-400/10">
          No phone
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={() => onKnowWhere(classmate)}
        className="mt-auto w-full py-2 rounded border border-gold text-gold text-sm font-semibold tracking-wide hover:bg-gold hover:text-navy transition-colors"
      >
        Know where they are?
      </button>
    </div>
  )
}
