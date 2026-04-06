"use client"

import { useState, useMemo } from "react"
import type { Classmate, SheetStats } from "@/lib/google-sheets"
import { ClassmateCard } from "@/components/classmate-card"
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
    <div className="min-h-screen bg-cream font-sans">
      {/* ── Hero (matches mhs1991.com) ── */}
      <header className="bg-cream pt-8 pb-12 px-4 text-center">
        {/* School Sign Image */}
        <div className="max-w-md mx-auto mb-8">
          <img 
            src="https://static.wixstatic.com/media/b87f5b_da1ad9a4ec5542f9a423c88fe49fba61~mv2.png"
            alt="Memorial High School Mustangs sign"
            className="w-full rounded-2xl shadow-lg"
          />
        </div>
        
        {/* Title Stack - matching mhs1991.com exactly */}
        <h1 className="font-serif text-charcoal text-4xl md:text-5xl font-bold leading-tight mb-2">
          MEMORIAL HIGH SCHOOL
        </h1>
        <p className="font-serif text-charcoal text-2xl md:text-3xl mb-4">
          Class of 1991
        </p>
        <p className="font-serif text-charcoal text-xl md:text-2xl tracking-wide">
          35TH REUNION
        </p>
        
        {/* Subheading */}
        <div className="mt-8 max-w-lg mx-auto">
          <p className="text-gray text-base leading-relaxed">
            Help us find every classmate before November 14, 2026
          </p>
        </div>
      </header>

      {/* ── Stats Section ── */}
      <section className="bg-cream-dark py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-serif text-maroon text-4xl md:text-5xl font-bold">{stats.found}</p>
              <p className="text-gray text-sm uppercase tracking-wider mt-1">Found</p>
            </div>
            <div>
              <p className="font-serif text-maroon text-4xl md:text-5xl font-bold">{stats.mostWanted}</p>
              <p className="text-gray text-sm uppercase tracking-wider mt-1">Missing</p>
            </div>
            <div>
              <p className="font-serif text-charcoal text-4xl md:text-5xl font-bold">{stats.inMemoriam}</p>
              <p className="text-gray text-sm uppercase tracking-wider mt-1">In Memoriam</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Success toast ── */}
      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-800 text-white px-6 py-3 rounded-full text-sm shadow-xl">
          Thanks! The reunion team will review and update the list.
        </div>
      )}

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-charcoal/10 mb-8">
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
              <p className="text-gray text-sm">
                These classmates have no email or phone on record.
              </p>
              <div className="relative w-full sm:w-72 flex-shrink-0">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray"
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
                  className="w-full bg-white border border-charcoal/10 rounded-lg pl-9 pr-3 py-3 text-charcoal placeholder:text-gray text-base focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                />
              </div>
            </div>

            {filteredWanted.length === 0 ? (
              <div className="text-center py-20">
                {mostWanted.length === 0 ? (
                  <>
                    <p className="font-serif text-charcoal text-2xl mb-2">All classmates located!</p>
                    <p className="text-gray text-sm">
                      Add your Google Sheets credentials to see live data.
                    </p>
                  </>
                ) : (
                  <p className="text-gray">No classmates match your search.</p>
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
              <p className="text-center text-gray py-20">
                No memorial records found.
              </p>
            ) : (
              <ul className="divide-y divide-charcoal/10">
                {inMemoriam.map((c) => (
                  <li key={c.name} className="py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-cream-dark border border-charcoal/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-serif text-charcoal text-sm">
                        {(c.firstName?.[0] ?? "") + (c.lastName?.[0] ?? "")}
                      </span>
                    </div>
                    <div>
                      <p className="font-serif text-charcoal font-semibold">{c.name}</p>
                      {(c.city || c.state) && (
                        <p className="text-gray text-xs">
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
      </main>

      {/* ── Maroon CTA Section (like mhs1991.com) ── */}
      <section className="bg-maroon py-16 px-4 text-center">
        <h2 className="font-serif text-white text-3xl md:text-4xl font-bold mb-4">
          Reconnect with the Class of 1991
        </h2>
        <p className="text-white/90 text-base max-w-xl mx-auto mb-8 leading-relaxed">
          A night of nostalgia and celebration awaits. Join your fellow Memorial High 
          alumni at the Houston Racquet Club to mark our 35th reunion milestone.
        </p>
        <a
          href="https://www.mhs1991.com"
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-white text-maroon font-semibold text-sm uppercase tracking-wider px-8 py-4 rounded hover:bg-cream transition-colors min-h-[48px]"
        >
          Secure Your Tickets
        </a>
      </section>

      {/* ── Report a Passing Section ── */}
      <section className="bg-cream py-16 px-4" aria-label="Report a passing">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-charcoal text-3xl font-bold mb-3">
              Report a Passing
            </h2>
            <p className="text-gray text-base max-w-md mx-auto leading-relaxed">
              If you know of a classmate who has passed, please let us know so we can honor
              their memory at the reunion.
            </p>
          </div>
          <ReportPassingForm classmates={classmates} onSuccess={handleSuccess} />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-cream border-t border-charcoal/10 py-10 px-4 text-center">
        <p className="font-serif text-charcoal text-lg mb-1">Memorial High School Class of 1991</p>
        <p className="text-gray text-sm">
          Questions?{" "}
          <a href="https://www.mhs1991.com" className="text-maroon hover:underline" target="_blank" rel="noreferrer">
            Visit mhs1991.com
          </a>
        </p>
      </footer>

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
      className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors min-h-[48px] ${
        active
          ? "border-maroon text-maroon"
          : "border-transparent text-gray hover:text-charcoal"
      }`}
    >
      {label}
      {badge > 0 && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            active ? "bg-maroon/10 text-maroon" : "bg-charcoal/5 text-gray"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
