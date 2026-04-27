import { useState, useRef } from 'react'
import useSearch from './hooks/useSearch'
import { LandingPage } from './components/LandingPage'
import { ResultsGrid } from './components/ResultsGrid'
import { DetailPanel } from './components/DetailPanel'
import type { Inspiration } from './types/index'

// ── Sparkle icon (matches design) ─────────────────────────────────────────

function SparkleIcon({ size = 12, color = '#4f46e5' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5l1.3 4.2 4.2 1.3-4.2 1.3L8 12.5l-1.3-4.2L2.5 7l4.2-1.3L8 1.5z"
        fill={color}
      />
      <path
        d="M13 10.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z"
        fill={color}
        opacity="0.7"
      />
    </svg>
  )
}

// ── Nav search bar (white, compact) ───────────────────────────────────────

function NavSearchBar({
  value,
  onChange,
  onSearch,
}: {
  value: string
  onChange: (v: string) => void
  onSearch: (v: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    onChange(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (v.trim()) debounceRef.current = setTimeout(() => onSearch(v), 400)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && value.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      onSearch(value)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        cursor: 'text',
        width: '100%',
        transition: 'border-color 150ms, box-shadow 150ms',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Magnifying glass */}
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="7.25" stroke="#6b7280" strokeWidth="1.5" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search for patterns, flows, inspiration…"
        autoComplete="off"
        className="mos-input-nav"
        style={{
          flex: 1,
          background: 'transparent',
          border: 0,
          outline: 0,
          color: '#111827',
          fontSize: 14,
          fontFamily: 'inherit',
          minWidth: 0,
        }}
      />

      {value && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onChange('')
            inputRef.current?.focus()
          }}
          style={{
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            opacity: 0.5,
            flexShrink: 0,
          }}
          aria-label="Clear"
        >
          <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────

function App() {
  const [mode, setMode] = useState<'hero' | 'results'>('hero')
  const { results, loading, error, query, setQuery, search, loadMore, hasMore } = useSearch()
  const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null)

  function handleSearch(q: string) {
    setQuery(q)
    if (mode !== 'results') setMode('results')
    search(q)
  }

  function handleBack() {
    setMode('hero')
    setQuery('')
    setSelectedInspiration(null)
  }

  console.log('results', results)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#0a0604' }}>

      {/* ── Hero stage ─────────────────────────────────────────────────── */}
      <div className={`mos-stage mos-stage--hero ${mode === 'hero' ? 'is-in' : 'is-out'}`}>
        <LandingPage
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
        />
      </div>

      {/* ── Results stage ──────────────────────────────────────────────── */}
      <div className={`mos-stage mos-stage--results ${mode === 'results' ? 'is-in' : 'is-out'}`}>
        <div
          className="mos-results-scroll"
          style={{
            position: 'absolute',
            inset: 0,
            background: '#fafafa',
            color: '#111827',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {/* Sticky nav */}
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 5,
              display: 'grid',
              gridTemplateColumns: '160px 1fr 160px',
              alignItems: 'center',
              gap: 24,
              padding: '14px 32px',
              background: 'rgba(250,250,250,0.92)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <button
              onClick={handleBack}
              style={{
                background: 'none',
                border: 0,
                padding: 0,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifySelf: 'start',
              }}
              aria-label="Back to home"
            >
              <img
                src="/mosaic-logo.png"
                alt="Mosaic"
                style={{
                  height: 32,
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'invert(1) brightness(0.2)',
                  opacity: 0.88,
                  display: 'block',
                  transition: 'opacity 120ms',
                }}
              />
            </button>

            <div style={{ maxWidth: 560, width: '100%', justifySelf: 'center' }}>
              <NavSearchBar value={query} onChange={setQuery} onSearch={handleSearch} />
            </div>

            <div style={{ justifySelf: 'end' }} />
          </header>

          {/* Result count */}
          {(results.length > 0 || loading) && (
            <div
              style={{
                maxWidth: 1200,
                width: '100%',
                margin: '0 auto',
                padding: '28px 32px 16px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: '#6b7280',
                }}
              >
                <SparkleIcon size={12} />
                <span>
                  <strong style={{ color: '#111827', fontWeight: 600 }}>
                    {results.length}
                  </strong>
                  {' results for '}
                  <em style={{ fontStyle: 'normal', color: '#374151' }}>"{query}"</em>
                </span>
              </div>
            </div>
          )}

          {error && (
            <p style={{ margin: '16px 32px 0', fontSize: 13, color: '#ef4444' }}>{error}</p>
          )}

          {/* Grid */}
          <div
            style={{
              maxWidth: 1200,
              width: '100%',
              margin: '0 auto',
              padding: '0 32px 64px',
            }}
          >
            <ResultsGrid
              results={results}
              loading={loading}
              hasMore={hasMore}
              loadMore={loadMore}
              onCardClick={setSelectedInspiration}
            />
          </div>
        </div>

        {/* Detail panel lives inside results stage */}
        <DetailPanel
          inspiration={selectedInspiration}
          onClose={() => setSelectedInspiration(null)}
        />
      </div>
    </div>
  )
}

export default App
