"use client"

import React, { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table"

export interface DataTableColumn<T> {
  /** Unique key for the column */
  key: string
  /** Header text to display */
  header: string
  /** Function to render the cell content */
  cell: (item: T) => React.ReactNode
  /** Optional width class (e.g., "w-12", "w-16") */
  width?: string
  /** Optional alignment ("left" | "center" | "right") */
  align?: "left" | "center" | "right"
}

export interface DataTableProps<T> {
  /** Array of data items to display */
  data: T[]
  /** Column definitions */
  columns: DataTableColumn<T>[]
  /** Function to get unique key for each row */
  getRowKey: (item: T) => string
  /** Number of items per page (default: 10) */
  pageSize?: number
  /** Fields to search within (uses item[field].toString().toLowerCase()) */
  searchKeys?: (keyof T)[]
  /** Placeholder text for search input */
  searchPlaceholder?: string
  /** Message to show when no data is found */
  emptyMessage?: string
  /** Message to show when search yields no results */
  noResultsMessage?: string
  /** Optional actions to render in the header (e.g., Add button) */
  headerActions?: React.ReactNode
  /** Optional title for the table section */
  title?: string
  /** Optional description for the table section */
  description?: string
  /** Loading state */
  isLoading?: boolean
  /** Loading skeleton component */
  loadingSkeleton?: React.ReactNode
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  pageSize = 10,
  searchKeys = [],
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  noResultsMessage = "No items found matching your search.",
  headerActions,
  title,
  description,
  isLoading,
  loadingSkeleton,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || searchKeys.length === 0) return data

    const query = searchQuery.toLowerCase()
    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(query)
      })
    )
  }, [data, searchQuery, searchKeys])

  // Handle search change - reset to page 1
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredData.length)
  const paginatedData = filteredData.slice(startIndex, endIndex)

  if (isLoading && loadingSkeleton) {
    return <>{loadingSkeleton}</>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      {(title || description) && (
        <div>
          {title && <h1 className="text-3xl font-bold">{title}</h1>}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {searchKeys.length > 0 && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
        {headerActions}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`${column.width || ""} ${
                    column.align === "right" ? "text-right" : ""
                  } ${column.align === "center" ? "text-center" : ""}`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  {searchQuery ? noResultsMessage : emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={getRowKey(item)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={`${
                        column.align === "right" ? "text-right" : ""
                      } ${column.align === "center" ? "text-center" : ""}`}
                    >
                      {column.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {endIndex} of {filteredData.length}{" "}
              items
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
