import { useState, useRef } from 'react'
import type { Inspiration } from '../types/index'
import { getEmbedding } from '../lib/embeddings'
import supabase from '../lib/supabase'
import { parseQuery } from '../lib/queryParser'

export default function useSearch() {
  const [allResults, setAllResults] = useState<Inspiration[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // Store embedding and filters so loadMore can reuse them
  const embeddingRef = useRef<number[]>([])
  const filtersRef = useRef<ReturnType<typeof parseQuery>['filters']>({})

  async function search(q: string) {
    setLoading(true)
    setError(null)
    setPage(0)
    setAllResults([])
    setHasMore(true)
    try {
      const { cleanQuery, filters } = parseQuery(q)
      filtersRef.current = filters
      const embedding = await getEmbedding(cleanQuery)
      embeddingRef.current = embedding
      const { data, error: rpcError } = await supabase.rpc('search_inspirations', {
        query_embedding: embedding,
        similarity_threshold: 0.35,
        match_count: 20,
        offset_count: 0,
        filter_visual_mode: filters.visual_mode ?? null,
        filter_screen_pattern: filters.screen_pattern ?? null,
        filter_industry_vertical: filters.industry_vertical ?? null,
        filter_has_data_viz: filters.has_data_viz ?? null,
        filter_has_ai_elements: filters.has_ai_elements ?? null,
        filter_density: filters.density ?? null,
        filter_platform: filters.platform ?? null,
        filter_layout_pattern: filters.layout_pattern ?? null,
      })
      if (rpcError) throw rpcError
      const rows: Inspiration[] = data ?? []
      setAllResults(rows)
      if (rows.length < 20) setHasMore(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setAllResults([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  async function loadMore() {
    if (loading || !hasMore) return
    setLoading(true)
    setError(null)
    const nextPage = page + 1
    try {
      const filters = filtersRef.current
      const { data, error: rpcError } = await supabase.rpc('search_inspirations', {
        query_embedding: embeddingRef.current,
        similarity_threshold: 0.35,
        match_count: 20,
        offset_count: nextPage * 20,
        filter_visual_mode: filters.visual_mode ?? null,
        filter_screen_pattern: filters.screen_pattern ?? null,
        filter_industry_vertical: filters.industry_vertical ?? null,
        filter_has_data_viz: filters.has_data_viz ?? null,
        filter_has_ai_elements: filters.has_ai_elements ?? null,
        filter_density: filters.density ?? null,
        filter_platform: filters.platform ?? null,
        filter_layout_pattern: filters.layout_pattern ?? null,
      })
      if (rpcError) throw rpcError
      const rows: Inspiration[] = data ?? []
      setAllResults((prev) => [...prev, ...rows])
      setPage(nextPage)
      if (rows.length < 20) setHasMore(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more')
    } finally {
      setLoading(false)
    }
  }

  return { results: allResults, loading, error, query, setQuery, search, loadMore, hasMore }
}
