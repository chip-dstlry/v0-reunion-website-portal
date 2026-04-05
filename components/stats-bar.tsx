"use client"

import type { SheetStats } from "@/lib/google-sheets"

interface StatsBarProps {
  stats: SheetStats
}

export function StatsBar({ stats }: StatsBarProps) {
  const { total, found, mostWanted, inMemoriam } = stats
  const foundPercent = total > 0 ? Math.round((found / total) * 100) : 0

  return (
    <section className="bg-navy-card border-y border-gold/20 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <span className="font-serif text-xl text-cream">Outreach Progress</span>
            <span className="text-gold font-semibold text-lg">{foundPercent}% located</span>
          </div>
          <div className="w-full h-3 rounded-full bg-navy overflow-hidden">
            <div
              className="h-full rounded-full bg-gold transition-all duration-700"
              style={{ width: `${foundPercent}%` }}
            />
          </div>
        </div>

        {/* Stat counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Total Classmates" value={total} color="text-cream" />
          <StatCard label="Located" value={found} color="text-emerald-400" />
          <StatCard label="Still Missing" value={mostWanted} color="text-amber-400" />
          <StatCard label="In Memoriam" value={inMemoriam} color="text-blue-300" />
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className={`font-serif text-4xl font-bold ${color}`}>{value}</div>
      <div className="text-muted-cream text-sm mt-1 tracking-wide uppercase">{label}</div>
    </div>
  )
}
