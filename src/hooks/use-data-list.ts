"use client"

import { useState, useEffect, useMemo, useCallback } from "react"

export interface UseDataListOptions<T> {
  /** Number of items per page (default: 10) */
  pageSize?: number
  /** Keys to search within each item */
  searchKeys?: (keyof T)[]
  /** Initial search query */
  initialSearch?: string
  /** Whether to fetch on mount (default: true) */
  fetchOnMount?: boolean
  /** Query params appended to request URL (e.g., year/status filters) */
  queryParams?: Record<string, string | number | boolean | null | undefined>
}

export interface UseDataListReturn<T> {
  /** All fetched items */
  items: T[]
  /** Set items manually */
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  /** Loading state */
  isLoading: boolean
  /** Current search query */
  searchQuery: string
  /** Update search query */
  setSearchQuery: (query: string) => void
  /** Filtered items based on search */
  filteredItems: T[]
  /** Paginated items for current page */
  paginatedItems: T[]
  /** Current page number (1-indexed) */
  currentPage: number
  /** Set current page */
  setCurrentPage: (page: number) => void
  /** Total number of pages */
  totalPages: number
  /** Start index of current page (0-indexed) */
  startIndex: number
  /** End index of current page (exclusive) */
  endIndex: number
  /** Refetch data */
  refetch: () => Promise<void>
  /** Error state */
  error: string | null
  /** Active query params used for server fetch */
  queryParams: Record<string, string | number | boolean | null | undefined>
  /** Set all query params */
  setQueryParams: React.Dispatch<
    React.SetStateAction<Record<string, string | number | boolean | null | undefined>>
  >
  /** Update a single query param */
  setQueryParam: (
    key: string,
    value: string | number | boolean | null | undefined
  ) => void
}

/**
 * Hook for managing data lists with search, filtering, and pagination.
 * 
 * @param fetchUrl - URL to fetch data from (expects { items: T[] } or array response)
 * @param options - Configuration options
 * @returns Data list management utilities
 * 
 * @example
 * const { items, paginatedItems, searchQuery, setSearchQuery, isLoading } = useDataList<User>(
 *   "/api/admin/users",
 *   { pageSize: 10, searchKeys: ["name", "email"] }
 * )
 */
export function useDataList<T>(
  fetchUrl: string,
  options: UseDataListOptions<T> = {}
): UseDataListReturn<T> {
  const {
    pageSize = 10,
    searchKeys = [],
    initialSearch = "",
    fetchOnMount = true,
    queryParams: initialQueryParams = {},
  } = options

  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(fetchOnMount)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [currentPage, setCurrentPage] = useState(1)
  const [queryParams, setQueryParams] = useState<
    Record<string, string | number | boolean | null | undefined>
  >(initialQueryParams)

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const requestUrl = new URL(fetchUrl, window.location.origin)
      for (const [key, value] of Object.entries(queryParams)) {
        if (value === undefined || value === null || value === "") {
          requestUrl.searchParams.delete(key)
        } else {
          requestUrl.searchParams.set(key, String(value))
        }
      }

      const response = await fetch(requestUrl.toString())
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`)
      }
      const data = await response.json()
      // Support both { items: T[] } and direct array responses
      const fetchedItems = Array.isArray(data) ? data : (data.items || data.users || data.programs || data.events || [])
      setItems(fetchedItems)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch data"
      setError(message)
      console.error("Error fetching data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchUrl, queryParams])

  // Fetch on mount
  useEffect(() => {
    if (fetchOnMount) {
      fetchData()
    }
  }, [fetchData, fetchOnMount])

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim() || searchKeys.length === 0) return items

    const query = searchQuery.toLowerCase()
    return items.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(query)
      })
    )
  }, [items, searchQuery, searchKeys])

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, queryParams])

  const setQueryParam = (
    key: string,
    value: string | number | boolean | null | undefined
  ) => {
    setQueryParams((current) => ({
      ...current,
      [key]: value,
    }))
  }

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredItems.length)
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  // Clamp current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return {
    items,
    setItems,
    isLoading,
    searchQuery,
    setSearchQuery,
    filteredItems,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    endIndex,
    refetch: fetchData,
    error,
    queryParams,
    setQueryParams,
    setQueryParam,
  }
}
