"use client"

import type { Classmate } from "@/lib/google-sheets"

interface ClassmateCardProps {
  classmate: Classmate
  onKnowWhere: (classmate: Classmate) => void
}

export function ClassmateCard({ classmate, onKnowWhere }: ClassmateCardProps) {
  const initials =
    (classmate.firstName?.[0] ?? "") + (classmate.lastName?.[0] ?? "")

  const location = "Contact Info Unknown"

  return (
    <div style={{ backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.08)" }} className="rounded-xl p-5 sm:p-6 text-center hover:shadow-md transition-shadow flex flex-col">
      {/* Avatar */}
      <div
        style={{ backgroundColor: "#e8e0d4" }}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 flex-shrink-0"
      >
        <span style={{ color: "#8b1a1a" }} className="font-serif text-base sm:text-lg font-bold">
          {initials || "?"}
        </span>
      </div>

      {/* Name */}
      <p style={{ color: "#2d2d2d" }} className="font-serif text-base sm:text-lg font-semibold mb-1 leading-snug">
        {classmate.name || "Unknown"}
      </p>

      {/* Location */}
      <p style={{ color: "#888888" }} className="text-xs sm:text-sm mb-4 sm:mb-5">
        {location}
      </p>

      {/* CTA button */}
      <button
        onClick={() => onKnowWhere(classmate)}
        style={{ backgroundColor: "#8b1a1a", color: "#ffffff" }}
        className="mt-auto w-full py-3 rounded text-sm font-semibold uppercase tracking-wider hover:opacity-90 active:opacity-80 transition-opacity min-h-[48px]"
      >
        I Know Them
      </button>
    </div>
  )
}
