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
    <div className="border border-white/15 rounded p-6 text-center hover:border-white/30 transition-colors">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-4">
        <span className="font-serif text-white/70 text-xl">{initials || "?"}</span>
      </div>
      
      {/* Name */}
      <p className="font-serif text-white text-lg mb-1">
        {classmate.name || "Unknown"}
      </p>
      
      {/* Location */}
      <p className="text-white/40 text-sm mb-6">{location}</p>

      {/* CTA - styled like mhs1991.com buttons */}
      <button
        onClick={() => onKnowWhere(classmate)}
        className="w-full py-3 rounded border border-white/30 text-white/80 text-xs tracking-wider uppercase hover:bg-white hover:text-black transition-colors"
      >
        I Know Them
      </button>
    </div>
  )
}
