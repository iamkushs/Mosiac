import { useRef, useEffect } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  loading: boolean
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ onSearch, loading, value, onChange }: SearchBarProps) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (val.trim()) {
      debounceTimer.current = setTimeout(() => onSearch(val), 400)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && value.trim()) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      onSearch(value)
    }
  }

  return (
    <div className="relative w-full">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search for UI patterns, flows, or product areas..."
        className="w-full bg-white rounded-full pl-12 pr-12 py-4 shadow-lg border border-gray-100 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
      />
      {loading && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
