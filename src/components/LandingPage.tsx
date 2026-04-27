import { useState, useEffect, useRef, useMemo } from 'react'
import { LayoutGrid, Sparkles, Zap } from 'lucide-react'

// ── Quotes & suggestions ───────────────────────────────────────────────────

const QUOTES = [
  "You can't design what you haven't seen",
  'Before you design anything, look at everything',
  'Ego blocks more designs than deadlines ever will',
  'The more you look, the less you guess',
  'Exposure is the only shortcut that works',
]

const PATTERN_CHIPS = [
  'Empty state with CTA',
  'Sidebar navigation',
  'Data table with filters',
  'Command panel',
  'Onboarding stepper',
  'Card grid layout',
  'Split panel with details',
  'Modal overlay',
  'Filter bar with search',
]

const DATA_VIZ_AI_CHIPS = [
  'Sankey chart flow',
  'AI chat',
  'Agent reasoning trace',
  'KPI cards with sparklines',
  'Funnel chart conversion',
  'Heatmap visualization',
  'Donut chart breakdown',
  'AI insights',
]

const JOB_CHIPS = [
  'Review deal pipeline',
  'Configure user permissions',
  'Approve pending requests',
  'Compare pricing tiers',
  'Track campaign performance',
  'Manage team members',
  'Monitor system health',
  'Analyze sales performance',
]

const TYPE_MS = 40
const READ_MS = 6000
const DELETE_MS = 25
const GAP_MS = 400

type Phase = 'typing' | 'reading' | 'deleting' | 'gap'

// ── Typewriter hook ────────────────────────────────────────────────────────

function useTypewriter(quotes: string[], paused: boolean) {
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<Phase>('typing')
  const idxRef = useRef(0)
  const charRef = useRef(0)

  useEffect(() => {
    if (paused) return
    let timer: ReturnType<typeof setTimeout>
    const current = quotes[idxRef.current % quotes.length]

    if (phase === 'typing') {
      if (charRef.current < current.length) {
        timer = setTimeout(() => {
          charRef.current += 1
          setText(current.slice(0, charRef.current))
        }, TYPE_MS)
      } else {
        timer = setTimeout(() => setPhase('reading'), 0)
      }
    } else if (phase === 'reading') {
      timer = setTimeout(() => setPhase('deleting'), READ_MS)
    } else if (phase === 'deleting') {
      if (charRef.current > 0) {
        timer = setTimeout(() => {
          charRef.current -= 1
          setText(current.slice(0, charRef.current))
        }, DELETE_MS)
      } else {
        timer = setTimeout(() => setPhase('gap'), 0)
      }
    } else {
      timer = setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % quotes.length
        charRef.current = 0
        setText('')
        setPhase('typing')
      }, GAP_MS)
    }

    return () => clearTimeout(timer)
  }, [phase, text, paused, quotes])

  return { text, phase }
}

// ── Icons ──────────────────────────────────────────────────────────────────

function CompassIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.25" stroke={color} strokeWidth="1.25" />
      <path d="M10.3 5.7L9 9l-3.3 1.3L7 7l3.3-1.3z" fill={color} />
    </svg>
  )
}

function CloseIcon({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────

interface LandingPageProps {
  query: string
  onQueryChange: (q: string) => void
  onSearch: (q: string) => void
}

// ── Component ──────────────────────────────────────────────────────────────

export function LandingPage({ query, onQueryChange, onSearch }: LandingPageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const paused = query.trim().length > 0
  const { text, phase } = useTypewriter(QUOTES, paused)
  const showCursor = phase === 'typing' || phase === 'deleting'

  function handleChange(val: string) {
    onQueryChange(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim()) {
      debounceRef.current = setTimeout(() => onSearch(val), 400)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && query.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      onSearch(query)
    }
  }

  const selectedChips = useMemo(() => ({
    pattern: PATTERN_CHIPS[Math.floor(Math.random() * PATTERN_CHIPS.length)],
    dataViz: DATA_VIZ_AI_CHIPS[Math.floor(Math.random() * DATA_VIZ_AI_CHIPS.length)],
    job: JOB_CHIPS[Math.floor(Math.random() * JOB_CHIPS.length)],
  }), [])

  function handleChip(label: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    onQueryChange(label)
    onSearch(label)
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
      }}
    >
      {/* Background image – slow Ken Burns zoom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: "url('/hero-bg.png') center center / cover no-repeat, #2a2340",
          animation: 'mosZoom 28s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(20,16,38,0.45) 0%, rgba(20,16,38,0.15) 22%, rgba(20,16,38,0.1) 50%, rgba(20,12,30,0.55) 80%, rgba(15,8,24,0.88) 100%)',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      {/* Logo */}
      <header
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          padding: '32px 0 0',
        }}
      >
        <img
          src="/mosaic-logo.png"
          alt="Mosaic"
          style={{
            width: 122,
            height: 48,
            objectFit: 'contain',
            opacity: 0.9,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
            display: 'block',
          }}
        />
      </header>

      {/* Center: quote + search */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: '80px 40px 80px',
        }}
      >
        {/* Typewriter quote */}
        <div
          style={{
            width: '100%',
            maxWidth: 896,
            height: 'clamp(120px, 15vw, 210px)',
            flexShrink: 0,
            overflow: 'visible',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 32px',
            boxSizing: 'border-box',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 300,
              fontSize: 'clamp(40px, 5.2vw, 72px)',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              color: 'rgba(255,255,255,0.96)',
              textAlign: 'center',
              wordBreak: 'normal',
              whiteSpace: 'normal',
              width: '100%',
            }}
          >
            <span>{text}</span>
            <span
              aria-hidden
              className={showCursor ? 'mos-cursor-blink' : ''}
              style={{
                display: 'inline-block',
                color: '#fff',
                marginLeft: 4,
                fontWeight: 300,
                opacity: showCursor ? 1 : 0,
              }}
            >
              |
            </span>
          </h1>
        </div>

        {/* Search bar + chips */}
        <div
          style={{
            width: '100%',
            maxWidth: 620,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 22,
          }}
        >
          {/* Glassmorphism pill search bar */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 22px',
              background: 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(14px) saturate(1.1)',
              WebkitBackdropFilter: 'blur(14px) saturate(1.1)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 999,
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.15) inset, 0 20px 50px rgba(0,0,0,0.35), 0 2px 12px rgba(0,0,0,0.2)',
              cursor: 'text',
            }}
            onClick={() => inputRef.current?.focus()}
          >
            <CompassIcon size={18} color="rgba(255,255,255,0.75)" />

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for patterns, flows, inspiration…"
              autoComplete="off"
              spellCheck={false}
              className="mos-input-hero"
              style={{
                flex: 1,
                background: 'transparent',
                border: 0,
                outline: 0,
                color: '#fff',
                fontSize: 16,
                fontWeight: 400,
                letterSpacing: '-0.005em',
                caretColor: '#fff',
                minWidth: 0,
                fontFamily: 'inherit',
              }}
            />

            {query ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onQueryChange('')
                  inputRef.current?.focus()
                }}
                aria-label="Clear"
                style={{
                  background: 'transparent',
                  border: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  cursor: 'pointer',
                  opacity: 0.7,
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <CloseIcon size={14} color="rgba(255,255,255,0.7)" />
              </button>
            ) : (
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)',
                  paddingLeft: 10,
                  borderLeft: '1px solid rgba(255,255,255,0.18)',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                type to search
              </span>
            )}
          </div>

          {/* Suggestion chips */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)',
                fontWeight: 500,
              }}
            >
              Try these
            </span>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              {([
                { label: selectedChips.pattern, Icon: LayoutGrid },
                { label: selectedChips.dataViz,  Icon: Sparkles  },
                { label: selectedChips.job,      Icon: Zap       },
              ] as const).map(({ label, Icon }) => (
                <button
                  key={label}
                  onClick={() => handleChip(label)}
                  className="mos-suggestion-chip"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px 7px 12px',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 999,
                    color: 'rgba(255,255,255,0.92)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit',
                    transition: 'background 140ms, border-color 140ms, transform 140ms',
                  }}
                >
                  <Icon size={14} style={{ opacity: 0.85, flexShrink: 0 }} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer spacer */}
      <footer style={{ position: 'relative', zIndex: 2, paddingBottom: 28 }} />
    </div>
  )
}
