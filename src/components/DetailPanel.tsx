import { useState, useEffect } from 'react'
import type { Inspiration } from '../types/index'

// ── Icons ─────────────────────────────────────────────────────────────────────

function CloseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function SparkleIcon({ size = 12, color = '#4338ca' }: { size?: number; color?: string }) {
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

function CopyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 -960 960 960" fill="currentColor" aria-hidden>
      <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface DetailPanelProps {
  inspiration: Inspiration | null
  onClose: () => void
}

function capitalize(s: string): string {
  return s
    .split(/[-_ ]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function getHeadline(r: Inspiration): string {
  if (r.source_product && r.source_product !== 'unknown') return r.source_product
  if (r.screen_pattern && r.industry_vertical)
    return `${capitalize(r.screen_pattern)} · ${capitalize(r.industry_vertical)}`
  if (r.product_area) return capitalize(r.product_area)
  return 'Inspiration'
}

function getEyebrow(r: Inspiration): string {
  const parts: string[] = []
  if (r.screen_pattern) parts.push(capitalize(r.screen_pattern))
  if (r.industry_vertical) parts.push(capitalize(r.industry_vertical))
  return parts.join(' · ')
}

async function copyImageToClipboard(url: string): Promise<void> {
  const res = await fetch(url)
  const blob = await res.blob()
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
}

// ── Tag chip variants ─────────────────────────────────────────────────────────

function SolidChip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '4px 10px',
        background: '#f3f4f6',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        color: '#374151',
        whiteSpace: 'nowrap',
      }}
    >
      {capitalize(label)}
    </span>
  )
}

function OutlineChip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '4px 10px',
        background: 'transparent',
        border: '1px solid #e5e7eb',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        color: '#6b7280',
        whiteSpace: 'nowrap',
      }}
    >
      {capitalize(label)}
    </span>
  )
}

function GhostChip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '4px 8px',
        fontSize: 12,
        color: '#6b7280',
        whiteSpace: 'nowrap',
      }}
    >
      #{label}
    </span>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        paddingTop: 20,
        borderTop: '1px solid #e5e7eb',
      }}
    >
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: '0 0 10px',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#9ca3af',
      }}
    >
      {children}
    </p>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DetailPanel({ inspiration, onClose }: DetailPanelProps) {
  const [copied, setCopied] = useState(false)
  const [panelHovering, setPanelHovering] = useState(false)
  const visible = inspiration !== null

  // ESC to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && visible) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [visible, onClose])

  async function handleCopy() {
    if (!inspiration) return
    try {
      await copyImageToClipboard(inspiration.image_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silently fail
    }
  }

  // Collect tag groups
  const visualStyleTags = inspiration?.visual_style ?? []
  const uiElementTags = inspiration?.ui_elements ?? []
  const interactionTags = inspiration?.interaction_types ?? []
  const keywordList = inspiration?.keywords
    ? inspiration.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : []

  // Solid attribute chips (structured metadata)
  const solidAttributes: string[] = []
  if (inspiration?.visual_mode) solidAttributes.push(capitalize(inspiration.visual_mode))
  if (inspiration?.density) solidAttributes.push(capitalize(inspiration.density))
  if (inspiration?.platform) solidAttributes.push(capitalize(inspiration.platform))
  if (inspiration?.layout_pattern) solidAttributes.push(capitalize(inspiration.layout_pattern))
  if (inspiration?.color_scheme) solidAttributes.push(capitalize(inspiration.color_scheme))
  if (inspiration?.has_data_viz) solidAttributes.push('Data Viz')
  if (inspiration?.has_ai_elements) solidAttributes.push('AI Elements')
  if (inspiration?.has_illustrations) solidAttributes.push('Illustrations')
  if (inspiration?.has_onboarding_elements) solidAttributes.push('Onboarding')
  if (inspiration?.has_empty_state) solidAttributes.push('Empty State')

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(17,24,39,0.35)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 10,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'opacity 360ms cubic-bezier(0.4,0,0.2,1)',
        }}
      />

      {/* Panel */}
      <div
        onMouseEnter={() => setPanelHovering(true)}
        onMouseLeave={() => setPanelHovering(false)}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: 420,
          background: '#fff',
          borderLeft: '1px solid #e5e7eb',
          boxShadow: '-20px 0 60px rgba(17,24,39,0.12)',
          zIndex: 11,
          display: 'flex',
          flexDirection: 'column',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 360ms cubic-bezier(0.4,0,0.2,1)',
          overflowY: 'auto',
        }}
      >
        {inspiration && (
          <>
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close panel"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 30,
                height: 30,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6b7280',
                zIndex: 2,
                padding: 0,
                opacity: panelHovering ? 1 : 0,
                transition: 'opacity 180ms',
              }}
            >
              <CloseIcon size={14} />
            </button>

            {/* Full-width 16/9 image */}
            <div
              style={{
                flexShrink: 0,
                aspectRatio: '16/9',
                overflow: 'hidden',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <img
                src={inspiration.image_url}
                alt={inspiration.description.slice(0, 60)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
              />
            </div>

            {/* Content */}
            <div
              style={{
                padding: '24px 28px 40px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {/* Eyebrow + Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {getEyebrow(inspiration) && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#6b7280',
                    }}
                  >
                    {getEyebrow(inspiration)}
                  </p>
                )}
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 300,
                    fontSize: 40,
                    lineHeight: 1.1,
                    color: '#111827',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {getHeadline(inspiration)}
                </h2>
              </div>

              {/* Similarity chip + Copy button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {inspiration.similarity !== undefined && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      background: '#f5f3ff',
                      border: '1px solid #ede9fe',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#4338ca',
                    }}
                  >
                    <SparkleIcon size={12} color="#4338ca" />
                    {Math.round(inspiration.similarity * 100)}% match
                  </span>
                )}
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    background: '#111827',
                    border: 0,
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 150ms',
                  }}
                >
                  <CopyIcon size={13} />
                  {copied ? 'Copied!' : 'Copy reference'}
                </button>
              </div>

              {/* Description */}
              {inspiration.description && (
                <Section>
                  <SectionLabel>Description</SectionLabel>
                  <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                    {inspiration.description}
                  </p>
                </Section>
              )}

              {/* Attributes (solid chips) */}
              {solidAttributes.length > 0 && (
                <Section>
                  <SectionLabel>Attributes</SectionLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {solidAttributes.map((a) => (
                      <SolidChip key={a} label={a} />
                    ))}
                  </div>
                </Section>
              )}

              {/* Visual style */}
              {visualStyleTags.length > 0 && (
                <Section>
                  <SectionLabel>Visual Style</SectionLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {visualStyleTags.map((t) => (
                      <SolidChip key={t} label={t} />
                    ))}
                  </div>
                </Section>
              )}

              {/* UI Elements (outline) */}
              {uiElementTags.length > 0 && (
                <Section>
                  <SectionLabel>UI Elements</SectionLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {uiElementTags.map((el) => (
                      <OutlineChip key={el} label={el} />
                    ))}
                  </div>
                </Section>
              )}

              {/* Interaction types (outline) */}
              {interactionTags.length > 0 && (
                <Section>
                  <SectionLabel>Interactions</SectionLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {interactionTags.map((t) => (
                      <OutlineChip key={t} label={t} />
                    ))}
                  </div>
                </Section>
              )}

              {/* Keywords (ghost) */}
              {keywordList.length > 0 && (
                <Section>
                  <SectionLabel>Keywords</SectionLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {keywordList.map((k) => (
                      <GhostChip key={k} label={k} />
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
