"use client"

import { useState, useMemo } from "react"
import type { Classmate, SheetStats } from "@/lib/google-sheets"
import { ClassmateCard } from "@/components/classmate-card"
import { StatsBar } from "@/components/stats-bar"
import { SubmitContactModal } from "@/components/submit-contact-modal"
import { ReportPassingForm } from "@/components/report-passing-form"

interface PortalClientProps {
  classmates: Classmate[]
  stats: SheetStats
}

export function PortalClient({ classmates, stats }: PortalClientProps) {
  const [search, setSearch] = useState("")
  const [selectedClassmate, setSelectedClassmate] = useState<Classmate | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<"wanted" | "memoriam">("wanted")

  const mostWanted = useMemo(
    () => classmates.filter((c) => c.isMostWanted),
    [classmates]
  )

  const inMemoriam = useMemo(
    () => classmates.filter((c) => c.deceased),
    [classmates]
  )

  const filteredWanted = useMemo(() => {
    if (!search.trim()) return mostWanted
    const q = search.toLowerCase()
    return mostWanted.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
    )
  }, [mostWanted, search])

  function handleSuccess() {
    setSelectedClassmate(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
  }

  return (
    <div className="min-h-screen bg-navy font-sans">
      {/* ── Hero ── */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/mhs-bg.jpg')] bg-cover bg-center opacity-10" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-14 text-center">
          {/* Eyebrow */}
          <p className="text-gold text-xs uppercase tracking-[0.25em] mb-4 font-sans">
            Memorial High School &nbsp;·&nbsp; Class of 1991 &nbsp;·&nbsp; 35th Reunion
          </p>
          {/* Headline */}
          <h1 className="font-serif text-cream text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance mb-5">
            MHS &apos;91 Most Wanted
          </h1>
          <p className="text-muted-cream text-lg leading-relaxed max-w-2xl mx-auto text-pretty">
            We&apos;re hunting down every one of our{" "}
            <span className="text-gold font-semibold">{stats.total} classmates</span> before
            our 35th reunion on{" "}
            <span className="text-cream font-semibold">November 14, 2026</span>. Help us reach
            the ones who are still off the radar.
          </p>

          {/* Thin gold rule */}
          <div className="mt-10 h-px w-24 bg-gold mx-auto" />
        </div>
      </header>

      {/* ── Stats Bar ── */}
      <StatsBar stats={stats} />

      {/* ── Success toast ── */}
      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 border border-emerald-400/40 text-emerald-300 px-6 py-3 rounded-full text-sm shadow-xl">
          Thanks! The reunion team will review and update the list.
        </div>
      )}

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gold/20 mb-8">
          <TabButton
            active={activeTab === "wanted"}
            onClick={() => setActiveTab("wanted")}
            label="Most Wanted"
            badge={stats.mostWanted}
          />
          <TabButton
            active={activeTab === "memoriam"}
            onClick={() => setActiveTab("memoriam")}
            label="In Memoriam"
            badge={stats.inMemoriam}
          />
        </div>

        {/* ── MOST WANTED TAB ── */}
        {activeTab === "wanted" && (
          <section aria-label="Most wanted classmates">
            {/* Search */}
            <div className="mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <p className="text-muted-cream text-sm">
                These classmates have no email or phone on record — do you know how to reach them?
              </p>
              <div className="relative w-full sm:w-72 flex-shrink-0">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-cream"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or city..."
                  className="w-full bg-navy-card border border-gold/20 rounded-lg pl-9 pr-3 py-2 text-cream placeholder:text-muted-cream/50 text-sm focus:outline-none focus:border-gold/50"
                />
              </div>
            </div>

            {filteredWanted.length === 0 ? (
              <div className="text-center py-20">
                {mostWanted.length === 0 ? (
                  <>
                    <p className="font-serif text-cream text-2xl mb-2">All classmates located!</p>
                    <p className="text-muted-cream text-sm">
                      Add your Google Sheets credentials to see live data.
                    </p>
                  </>
                ) : (
                  <p className="text-muted-cream">No classmates match your search.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredWanted.map((c) => (
                  <ClassmateCard
                    key={c.name}
                    classmate={c}
                    onKnowWhere={setSelectedClassmate}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── IN MEMORIAM TAB ── */}
        {activeTab === "memoriam" && (
          <section aria-label="In memoriam">
            {inMemoriam.length === 0 ? (
              <p className="text-center text-muted-cream py-20">
                No memorial records found — add credentials to see live data.
              </p>
            ) : (
              <ul className="divide-y divide-gold/10">
                {inMemoriam.map((c) => (
                  <li key={c.name} className="py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-navy border border-blue-300/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-serif text-blue-300 text-sm">
                        {(c.firstName?.[0] ?? "") + (c.lastName?.[0] ?? "")}
                      </span>
                    </div>
                    <div>
                      <p className="font-serif text-cream font-semibold">{c.name}</p>
                      {(c.city || c.state) && (
                        <p className="text-muted-cream text-xs">
                          {[c.city, c.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* ── Report a Passing ── */}
        <section
          className="mt-20 pt-12 border-t border-gold/20"
          aria-label="Report a passing"
        >
          <div className="text-center mb-10">
            <p className="text-muted-cream text-xs uppercase tracking-widest mb-2">Remembrance</p>
            <h2 className="font-serif text-cream text-3xl font-semibold mb-3">
              Report a Passing
            </h2>
            <p className="text-muted-cream text-sm max-w-md mx-auto leading-relaxed">
              If you know of a classmate who has passed, please let us know so we can honor
              their memory at the reunion. Your submission will be reviewed before any updates
              are made.
            </p>
          </div>
          <ReportPassingForm classmates={classmates} onSuccess={handleSuccess} />
        </section>

        {/* ── Footer ── */}
        <footer className="mt-20 pt-8 border-t border-gold/10 text-center">
          <p className="font-serif text-gold text-lg mb-1">Memorial High School &apos;91</p>
          <p className="text-muted-cream text-xs">
            All submissions are reviewed by the reunion committee before the master list is
            updated. Questions?{" "}
            <a href="https://www.mhs1991.com" className="text-gold hover:underline" target="_blank" rel="noreferrer">
              Visit mhs1991.com
            </a>
          </p>
        </footer>
      </main>

      {/* ── Modal ── */}
      <SubmitContactModal
        classmate={selectedClassmate}
        onClose={() => setSelectedClassmate(null)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  label: string
  badge: number
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
        active
          ? "border-gold text-gold"
          : "border-transparent text-muted-cream hover:text-cream"
      }`}
    >
      {label}
      {badge > 0 && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ${
            active ? "bg-gold/20 text-gold" : "bg-gold/10 text-muted-cream"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
