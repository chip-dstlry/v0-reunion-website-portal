"use client"

import { useState, useMemo, useEffect } from "react"
import type { Classmate, SheetStats } from "@/lib/google-sheets"
import { useIsMobile } from "@/lib/use-is-mobile"
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
  const [activeGroup, setActiveGroup] = useState<string[] | null>(null)
  const [visibleCount, setVisibleCount] = useState(24)
  const mobile = useIsMobile()

  const mostWanted = useMemo(() => classmates.filter((c) => c.isMostWanted), [classmates])
  const inMemoriam = useMemo(() => classmates.filter((c) => c.deceased), [classmates])

  const LETTER_GROUPS = [
    ["A","B","C","D"],
    ["E","F","G","H"],
    ["I","J","K","L"],
    ["M","N","O","P"],
    ["Q","R","S","T"],
    ["U","V","W","X","Y","Z"],
  ]

  // Letters that have at least one most-wanted classmate
  const availableLetters = useMemo(() => {
    const letters = new Set(mostWanted.map((c) => (c.lastName?.[0] ?? "").toUpperCase()).filter(Boolean))
    return letters
  }, [mostWanted])

  const filteredWanted = useMemo(() => {
    let list = mostWanted
    if (activeGroup) {
      list = list.filter((c) => activeGroup.includes((c.lastName?.[0] ?? "").toUpperCase()))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q)
      )
    }
    return list
  }, [mostWanted, search, activeGroup])

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(24)
  }, [search, activeGroup])

  function handleSuccess() {
    setSelectedClassmate(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
  }

  return (
    <div style={{ backgroundColor: C.cream, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── TOP NAV ── */}
      <nav style={{ position: "relative", backgroundColor: C.cream, borderBottom: `1px solid rgba(0,0,0,0.06)`, padding: mobile ? "12px 16px" : "16px 32px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: mobile ? 64 : 80 }}>
        <a href="https://www.mhs1991.com" target="_blank" rel="noreferrer" aria-label="MHS 1991" style={{ position: "absolute", left: mobile ? 16 : 32, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/mustang-m.svg`}
            alt="MHS Mustangs"
            style={{ height: mobile ? 40 : 52, width: "auto", display: "block" }}
          />
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: mobile ? 14 : 36 }}>
          {[
            { label: "Buy Tickets",   href: "https://www.mhs1991.com/home-1" },
            { label: "Upload Photos", href: "https://www.mhs1991.com/blank" },
            { label: "Photo Album",   href: "https://photos.google.com/share/AF1QipPCMfX6_Pz_QMgrp8YJ-DJFYvQ4LonZ11HmzQVPMSRo-u5VWcdjY-21cd85qmbx8A?key=cjlFY09TLVp1TXVnOXF6dHpTNVdJWXN2T1FRSmtB" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{
                color: C.charcoal,
                fontSize: mobile ? "0.75rem" : "0.95rem",
                fontWeight: 500,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── HERO ── */}
      <header style={{ backgroundColor: C.cream, textAlign: "center", padding: mobile ? "1.25rem 1rem 2rem" : "2rem 1rem 3rem" }}>
        {/* Logo / school sign image */}
        <div style={{ maxWidth: mobile ? 320 : 480, margin: mobile ? "0 auto 1.25rem" : "0 auto 2rem" }}>
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/memorial-sign.jpg`}
            alt="Memorial High School Mustangs"
            style={{ width: "100%", borderRadius: mobile ? 12 : 16, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
          />
        </div>

        <h1 style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: mobile ? "1.6rem" : "clamp(1.75rem, 5vw, 3rem)", fontWeight: 700, lineHeight: 1.15, margin: "0 0 0.35rem" }}>
          MEMORIAL HIGH SCHOOL<br />MOST WANTED
        </h1>
        <p style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: mobile ? "1.1rem" : "clamp(1.25rem, 3vw, 1.75rem)", margin: "0 0 0.2rem" }}>
          Class of 1991
        </p>
        <p style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: mobile ? "0.9rem" : "clamp(1rem, 2.5vw, 1.4rem)", letterSpacing: "0.08em", margin: mobile ? "0 0 1rem" : "0 0 1.5rem" }}>
          35TH REUNION
        </p>
        <p style={{ color: C.gray, fontSize: mobile ? "0.85rem" : "0.95rem", maxWidth: 420, margin: "0 auto" }}>
          Help us find every classmate before November 14, 2026
        </p>
      </header>

      {/* ── STATS ── */}
      <section style={{ backgroundColor: C.creamDark, padding: mobile ? "1.5rem 0.75rem" : "2.5rem 1rem" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: mobile ? "0.5rem" : "1rem", textAlign: "center" }}>
          {[
            { value: stats.found,      label: "Found",       tab: null },
            { value: stats.mostWanted, label: "Missing",     tab: "wanted" as const },
            { value: stats.inMemoriam, label: "In Memoriam", tab: "memoriam" as const },
          ].map(({ value, label, tab }) => (
            <div
              key={label}
              onClick={tab ? () => { setActiveTab(tab); document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" }) } : undefined}
              style={{ cursor: tab ? "pointer" : "default" }}
            >
              <p style={{ fontFamily: "var(--font-playfair, serif)", color: C.maroon, fontSize: mobile ? "1.75rem" : "clamp(2rem, 6vw, 3rem)", fontWeight: 700, margin: 0, lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ color: C.gray, fontSize: mobile ? "0.6rem" : "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>
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
      <main id="main-content" style={{ maxWidth: 960, margin: "0 auto", padding: mobile ? "1.5rem 0.75rem" : "3rem 1rem" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: mobile ? "1rem" : "1.5rem", borderBottom: `2px solid ${C.creamDark}`, marginBottom: mobile ? "1.25rem" : "2rem" }}>
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
            {/* Search bar */}
            <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", flexWrap: "wrap", gap: mobile ? 8 : 12, alignItems: mobile ? "stretch" : "center", justifyContent: "space-between", marginBottom: mobile ? "0.75rem" : "1rem" }}>
              <p style={{ color: C.gray, fontSize: mobile ? "0.8rem" : "0.875rem", margin: 0 }}>
                These classmates have no email or phone on record.
              </p>
              <div style={{ position: "relative", width: "100%", maxWidth: mobile ? "100%" : 280 }}>
                <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.gray }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name..."
                  style={{ width: "100%", boxSizing: "border-box", backgroundColor: C.white, border: `1px solid rgba(0,0,0,0.1)`, borderRadius: 8, paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, color: C.charcoal, fontSize: 16, outline: "none" }}
                />
              </div>
            </div>

            {/* Alphabet filter */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: mobile ? 6 : 8, marginBottom: mobile ? "1rem" : "1.5rem", justifyContent: "center" }}>
              <button
                onClick={() => setActiveGroup(null)}
                style={{
                  padding: mobile ? "6px 12px" : "8px 14px",
                  fontSize: mobile ? "0.7rem" : "0.8rem",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  backgroundColor: activeGroup === null ? C.maroon : C.creamDark,
                  color: activeGroup === null ? C.white : C.charcoal,
                  minHeight: mobile ? 36 : 40,
                  letterSpacing: "0.05em",
                }}
              >
                ALL
              </button>
              {LETTER_GROUPS.map((group) => {
                const has = group.some((l) => availableLetters.has(l))
                const active = activeGroup !== null && group[0] === activeGroup[0]
                const label = `${group[0]}\u2013${group[group.length - 1]}`
                return (
                  <button
                    key={label}
                    onClick={() => has && setActiveGroup(active ? null : group)}
                    disabled={!has}
                    style={{
                      padding: mobile ? "6px 10px" : "8px 14px",
                      fontSize: mobile ? "0.7rem" : "0.8rem",
                      fontWeight: 600,
                      border: "none",
                      borderRadius: 6,
                      cursor: has ? "pointer" : "default",
                      backgroundColor: active ? C.maroon : C.creamDark,
                      color: active ? C.white : has ? C.charcoal : "#bbb",
                      minHeight: mobile ? 36 : 40,
                      opacity: has ? 1 : 0.4,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Results count */}
            {(search || activeGroup) && (
              <p style={{ color: C.gray, fontSize: "0.8rem", margin: "0 0 1rem", textAlign: "center" }}>
                Showing {filteredWanted.length} of {mostWanted.length} missing classmates
              </p>
            )}

            {filteredWanted.length === 0 ? (
              <div style={{ textAlign: "center", padding: mobile ? "3rem 1rem" : "5rem 1rem" }}>
                <p style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: mobile ? "1.2rem" : "1.5rem", marginBottom: 8 }}>
                  {mostWanted.length === 0 ? "All classmates located!" : "No classmates match your search."}
                </p>
                {mostWanted.length === 0 && (
                  <p style={{ color: C.gray, fontSize: "0.875rem" }}>Every classmate has been found.</p>
                )}
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: mobile ? "1rem" : "1.25rem" }}>
                  {filteredWanted.slice(0, visibleCount).map((c) => (
                    <ClassmateCard key={c.name} classmate={c} onKnowWhere={setSelectedClassmate} />
                  ))}
                </div>

                {/* Show More */}
                {visibleCount < filteredWanted.length && (
                  <div style={{ textAlign: "center", marginTop: mobile ? "1.5rem" : "2rem" }}>
                    <button
                      onClick={() => setVisibleCount((v) => v + 24)}
                      style={{
                        backgroundColor: C.white,
                        color: C.maroon,
                        border: `1px solid ${C.maroon}`,
                        borderRadius: 6,
                        padding: "12px 32px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        minHeight: 48,
                      }}
                    >
                      Show More ({filteredWanted.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
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
                      {c.deceasedDate && (
                        <p style={{ color: C.gray, fontSize: "0.75rem", margin: "2px 0 0", fontStyle: "italic" }}>{c.deceasedDate}</p>
                      )}
                      {c.obituaryUrl && (
                        <a
                          href={c.obituaryUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: C.maroon, fontSize: "0.7rem", textDecoration: "underline", letterSpacing: "0.02em", marginTop: 2, display: "inline-block" }}
                        >
                          Obituary
                        </a>
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
      <section style={{ backgroundColor: C.maroon, padding: mobile ? "2.5rem 1rem" : "4rem 1rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-playfair, serif)", color: C.white, fontSize: mobile ? "1.4rem" : "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 700, margin: "0 0 0.75rem" }}>
          Reconnect with the Class of 1991
        </h2>
        <p style={{ color: "rgba(255,255,255,0.88)", fontSize: mobile ? "0.9rem" : "1rem", maxWidth: 480, margin: mobile ? "0 auto 1.5rem" : "0 auto 2rem", lineHeight: 1.6 }}>
          A night of nostalgia and celebration awaits. Join your fellow Memorial High alumni at the Houston Racquet Club on November 14, 2026.
        </p>
        <a
          href="https://www.mhs1991.com/home-1"
          target="_blank"
          rel="noreferrer"
          style={{ display: mobile ? "block" : "inline-block", backgroundColor: C.white, color: C.maroon, fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", padding: "14px 32px", borderRadius: 4, minHeight: 48, lineHeight: "48px", maxWidth: mobile ? 280 : "none", margin: mobile ? "0 auto" : undefined }}
        >
          Purchase Tickets
        </a>
      </section>

      {/* ── REPORT A PASSING ── */}
      <section style={{ backgroundColor: C.cream, padding: mobile ? "2.5rem 0.75rem" : "4rem 1rem" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: mobile ? "1.5rem" : "2.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: mobile ? "1.4rem" : "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, margin: "0 0 0.75rem" }}>
              Report a Passing
            </h2>
            <p style={{ color: C.gray, fontSize: mobile ? "0.85rem" : "0.95rem", maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
              If you know of a classmate who has passed, please let us know so we can honor their memory at the reunion.
            </p>
          </div>
          <ReportPassingForm classmates={classmates} onSuccess={handleSuccess} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: C.creamDark, borderTop: `1px solid rgba(0,0,0,0.08)`, padding: mobile ? "1.5rem 0.75rem" : "2.5rem 1rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-playfair, serif)", color: C.charcoal, fontSize: mobile ? "0.9rem" : "1rem", margin: "0 0 0.5rem" }}>
          Memorial High School — Class of 1991
        </p>
        <p style={{ color: C.gray, fontSize: mobile ? "0.8rem" : "0.875rem", margin: 0 }}>
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
