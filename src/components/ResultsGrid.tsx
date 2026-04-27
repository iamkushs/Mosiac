import { useEffect, useRef, useState } from 'react'
import type { Inspiration } from '../types/index'

// ── Icons ─────────────────────────────────────────────────────────────────────

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

interface ResultsGridProps {
  results: Inspiration[]
  loading: boolean
  hasMore: boolean
  loadMore: () => void
  onCardClick: (inspiration: Inspiration) => void
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

function getCategoryLine(r: Inspiration): string | null {
  const parts: string[] = []
  if (r.screen_pattern) parts.push(capitalize(r.screen_pattern))
  if (r.industry_vertical) parts.push(capitalize(r.industry_vertical))
  return parts.length > 0 ? parts.join(' · ') : null
}

/** Serve a compressed thumbnail from Supabase Storage image transforms */
function getThumbnailUrl(url: string): string {
  if (!url) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}width=600&quality=75&format=webp`
}

async function copyImageToClipboard(url: string): Promise<void> {
  const res = await fetch(url)
  const blob = await res.blob()
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
}

// ── Card ──────────────────────────────────────────────────────────────────────

function Card({ result, onClick }: { result: Inspiration; onClick: () => void }) {
  const [copied, setCopied] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      // Always copy full-resolution image, not the thumbnail
      await copyImageToClipboard(result.image_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silently fail
    }
  }

  const categoryLine = getCategoryLine(result)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 200ms cubic-bezier(0.4,0,0.2,1), box-shadow 200ms cubic-bezier(0.4,0,0.2,1), border-color 200ms',
        transform: hovering ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovering
          ? '0 10px 30px rgba(17,24,39,0.08)'
          : '0 1px 3px rgba(17,24,39,0.04)',
        borderColor: hovering ? '#d1d5db' : '#e5e7eb',
      }}
    >
      {/* Image + skeleton placeholder */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', borderBottom: '1px solid #e5e7eb' }}>
        {/* Skeleton shown until image loads */}
        {!imgLoaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, #f3f4f6 25%, #e9eaed 50%, #f3f4f6 75%)',
              backgroundSize: '200% 100%',
              animation: 'mosSkelShimmer 1.4s infinite',
            }}
          />
        )}
        <img
          src={getThumbnailUrl(result.image_url)}
          alt={result.description.slice(0, 60)}
          onLoad={() => setImgLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
            display: 'block',
            opacity: imgLoaded ? 1 : 0,
            transition: 'opacity 200ms',
          }}
        />

        {/* Copy button — fades in on card hover */}
        <button
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy image'}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
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
            opacity: hovering ? 1 : 0,
            transform: hovering ? 'translateY(0)' : 'translateY(-4px)',
            transition: 'opacity 180ms, transform 180ms',
            padding: 0,
            flexShrink: 0,
          }}
        >
          <CopyIcon size={14} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* Title row — title left, similarity chip right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: '#111827',
              flex: 1,
              minWidth: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {getHeadline(result)}
          </p>

          {result.similarity !== undefined && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                background: '#f5f3ff',
                border: '1px solid #ede9fe',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                color: '#4338ca',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              <SparkleIcon size={11} color="#4338ca" />
              {Math.round(result.similarity * 100)}%
            </span>
          )}
        </div>

        {/* Category line */}
        {categoryLine && (
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#6b7280',
            }}
          >
            {categoryLine}
          </p>
        )}

        {/* Description */}
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: '#374151',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {result.description}
        </p>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          aspectRatio: '16/9',
          background: 'linear-gradient(90deg, #f3f4f6 25%, #e9eaed 50%, #f3f4f6 75%)',
          backgroundSize: '200% 100%',
          animation: 'mosSkelShimmer 1.4s infinite',
        }}
      />
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 12, background: '#f3f4f6', borderRadius: 6, width: '60%' }} />
        <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, width: '40%' }} />
        <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, width: '90%' }} />
        <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, width: '75%' }} />
      </div>
    </div>
  )
}

// ── Grid ──────────────────────────────────────────────────────────────────────

export function ResultsGrid({ results, loading, hasMore, loadMore, onCardClick }: ResultsGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  if (results.length === 0 && !loading) return null

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[28px]">
        {results.map((result) => (
          <Card key={result.id} result={result} onClick={() => onCardClick(result)} />
        ))}
        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)}
      </div>
      <div ref={sentinelRef} style={{ height: 1 }} />
    </>
  )
}
