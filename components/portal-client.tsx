"use client"

import { useState, useMemo } from "react"
import type { Classmate, SheetStats } from "@/lib/google-sheets"
import { ClassmateCard } from "@/components/classmate-card"
import { SubmitContactModal } from "@/components/submit-contact-modal"
import { ReportPassingForm } from "@/components/report-passing-form"

// Hardcoded palette — never rely on CSS variable resolution
const C = {
  cream:      "#f5f0e6",
  creamDark:  "#e8e0d4",
  white:      "#ffffff",
  maroon:     "#8b1a1a",
  maroonDark: "#6b1515",
  charcoal:   "#2d2d2d",
  gray:       "#888888",
}

interface PortalClientProps {
  classmates: Classmate[]
  stats: SheetStats
}

export function PortalClient({ classmates, stats }: PortalClientProps) {
  const [search, setSearch] = useState("")
  const [selectedClassmate, setSelectedClassmate] = useState<Classmate | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<"wanted" | "memoriam">("wanted")

  const mostWanted = useMemo(() => classmates.filter((c) => c.isMostWanted), [classmates])
  const inMemoriam = useMemo(() => classmates.filter((c) => c.deceased), [classmates])

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
    <div style={{ backgroundColor: C.cream, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── HERO ── */}
      <header style={{ backgroundColor: C.cream, textAlign: "center", padding: "2rem 1rem 3rem" }}>
        {/* Logo / school sign image */}
        <div style={{ maxWidth: 480, margin: "0 auto 2rem" }}>
          <img
            src="/memorial-sign.jpg"
            alt="Memorial High School Mustangs"
            style={{ width: "100%", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
          />
        </div>

        <h1 style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: "clamp(1.75rem, 5vw, 3rem)", fontWeight: 700, lineHeight: 1.15, margin: "0 0 0.5rem" }}>
          MEMORIAL HIGH SCHOOL
        </h1>
        <p style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: "clamp(1.25rem, 3vw, 1.75rem)", margin: "0 0 0.25rem" }}>
          Class of 1991
        </p>
        <p style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: "clamp(1rem, 2.5vw, 1.4rem)", letterSpacing: "0.08em", margin: "0 0 1.5rem" }}>
          35TH REUNION
        </p>
        <p style={{ color: C.gray, fontSize: "0.95rem", maxWidth: 420, margin: "0 auto" }}>
          Help us find every classmate before November 14, 2026
        </p>
      </header>

      {/* ── STATS ── */}
      <section style={{ backgroundColor: C.creamDark, padding: "2.5rem 1rem" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", textAlign: "center" }}>
          {[
            { value: stats.found,      label: "Found" },
            { value: stats.mostWanted, label: "Missing" },
            { value: stats.inMemoriam, label: "In Memoriam" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontFamily: "var(--font-playfair, serif)", color: C.maroon, fontSize: "clamp(2rem, 6vw, 3rem)", fontWeight: 700, margin: 0, lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ color: C.gray, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SUCCESS TOAST ── */}
      {showSuccess && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", backgroundColor: "#166534", color: "#fff", padding: "12px 24px", borderRadius: 999, fontSize: "0.875rem", zIndex: 50, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          Thanks! The reunion team will review and update the list.
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1rem" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "1.5rem", borderBottom: `2px solid ${C.creamDark}`, marginBottom: "2rem" }}>
          {[
            { id: "wanted",   label: "Most Wanted",  count: stats.mostWanted },
            { id: "memoriam", label: "In Memoriam",  count: stats.inMemoriam },
          ].map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "wanted" | "memoriam")}
                style={{
                  paddingBottom: 12,
                  paddingTop: 8,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  background: "none",
                  border: "none",
                  borderBottom: active ? `2px solid ${C.maroon}` : "2px solid transparent",
                  color: active ? C.maroon : C.gray,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  minHeight: 48,
                  marginBottom: -2,
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{ fontSize: "0.7rem", padding: "2px 7px", borderRadius: 999, backgroundColor: active ? `${C.maroon}18` : C.creamDark, color: active ? C.maroon : C.gray }}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── MOST WANTED ── */}
        {activeTab === "wanted" && (
          <section>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <p style={{ color: C.gray, fontSize: "0.875rem", margin: 0 }}>
                These classmates have no email or phone on record.
              </p>
              <div style={{ position: "relative", width: "100%", maxWidth: 280 }}>
                <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.gray }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or city..."
                  style={{ width: "100%", boxSizing: "border-box", backgroundColor: C.white, border: `1px solid rgba(0,0,0,0.1)`, borderRadius: 8, paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, color: C.charcoal, fontSize: 16, outline: "none" }}
                />
              </div>
            </div>

            {filteredWanted.length === 0 ? (
              <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
                <p style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: "1.5rem", marginBottom: 8 }}>
                  {mostWanted.length === 0 ? "All classmates located!" : "No classmates match your search."}
                </p>
                {mostWanted.length === 0 && (
                  <p style={{ color: C.gray, fontSize: "0.875rem" }}>Add your Google Sheets credentials to see live data.</p>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
                {filteredWanted.map((c) => (
                  <ClassmateCard key={c.name} classmate={c} onKnowWhere={setSelectedClassmate} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── IN MEMORIAM ── */}
        {activeTab === "memoriam" && (
          <section>
            {inMemoriam.length === 0 ? (
              <p style={{ textAlign: "center", color: C.gray, padding: "5rem 1rem" }}>No memorial records found.</p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {inMemoriam.map((c) => (
                  <li key={c.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: `1px solid ${C.creamDark}` }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: C.creamDark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: "0.875rem" }}>
                        {(c.firstName?.[0] ?? "") + (c.lastName?.[0] ?? "")}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontWeight: 600, margin: 0 }}>{c.name}</p>
                      {(c.city || c.state) && (
                        <p style={{ color: C.gray, fontSize: "0.75rem", margin: "2px 0 0" }}>{[c.city, c.state].filter(Boolean).join(", ")}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      {/* ── MAROON CTA ── */}
      <section style={{ backgroundColor: C.maroon, padding: "4rem 1rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-playfair, serif)", color: C.white, fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 700, margin: "0 0 1rem" }}>
          Reconnect with the Class of 1991
        </h2>
        <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "1rem", maxWidth: 480, margin: "0 auto 2rem", lineHeight: 1.6 }}>
          A night of nostalgia and celebration awaits. Join your fellow Memorial High alumni at the Houston Racquet Club on November 14, 2026.
        </p>
        <a
          href="https://www.mhs1991.com"
          target="_blank"
          rel="noreferrer"
          style={{ display: "inline-block", backgroundColor: C.white, color: C.maroon, fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", padding: "14px 32px", borderRadius: 4, minHeight: 48 }}
        >
          Secure Your Tickets
        </a>
      </section>

      {/* ── REPORT A PASSING ── */}
      <section style={{ backgroundColor: C.cream, padding: "4rem 1rem" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, margin: "0 0 0.75rem" }}>
              Report a Passing
            </h2>
            <p style={{ color: C.gray, fontSize: "0.95rem", maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
              If you know of a classmate who has passed, please let us know so we can honor their memory at the reunion.
            </p>
          </div>
          <ReportPassingForm classmates={classmates} onSuccess={handleSuccess} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: C.creamDark, borderTop: `1px solid rgba(0,0,0,0.08)`, padding: "2.5rem 1rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: "1rem", margin: "0 0 0.5rem" }}>
          Memorial High School — Class of 1991
        </p>
        <p style={{ color: C.gray, fontSize: "0.875rem", margin: 0 }}>
          Questions?{" "}
          <a href="https://www.mhs1991.com" target="_blank" rel="noreferrer" style={{ color: C.maroon }}>
            Visit mhs1991.com
          </a>
        </p>
      </footer>

      {/* ── MODAL ── */}
      <SubmitContactModal
        classmate={selectedClassmate}
        onClose={() => setSelectedClassmate(null)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
