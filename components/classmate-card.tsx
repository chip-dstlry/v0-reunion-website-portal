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
    <div className="bg-white border border-charcoal/10 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-cream border border-charcoal/10 flex items-center justify-center mx-auto mb-4">
        <span className="font-serif text-charcoal text-xl">{initials || "?"}</span>
      </div>
      
      {/* Name */}
      <p className="font-serif text-charcoal text-lg font-semibold mb-1">
        {classmate.name || "Unknown"}
      </p>
      
      {/* Location */}
      <p className="text-gray text-sm mb-6">{location}</p>

      {/* CTA - maroon button like mhs1991.com, min 48px for touch */}
      <button
        onClick={() => onKnowWhere(classmate)}
        className="w-full py-3 min-h-[48px] rounded bg-maroon text-white text-sm font-semibold uppercase tracking-wider hover:bg-maroon-dark transition-colors"
      >
        I Know Them
      </button>
    </div>
  )
}
