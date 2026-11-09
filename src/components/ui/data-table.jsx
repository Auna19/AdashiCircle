'use client'

import * as React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonTable } from '@/components/ui/loading-skeleton'

export function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  searchKey,
  searchPlaceholder = 'Search records…',
  emptyState = {
    title: 'No records found',
    description: 'There are no items matching your criteria.',
  },
  onExport,
  className,
}) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortColumn, setSortColumn] = React.useState(null)
  const [sortDirection, setSortDirection] = React.useState('asc')
  const [page, setPage] = React.useState(0)
  const pageSize = 10

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  // Filter
  const filteredData = React.useMemo(() => {
    if (!searchTerm || !searchKey) return data
    return data.filter((item) => {
      const val = item[searchKey]
      return val ? String(val).toLowerCase().includes(searchTerm.toLowerCase()) : false
    })
  }, [data, searchTerm, searchKey])

  // Sort
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return filteredData
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]
      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      const res = aVal < bVal ? -1 : 1
      return sortDirection === 'asc' ? res : -res
    })
  }, [filteredData, sortColumn, sortDirection])

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1
  const paginatedData = React.useMemo(() => {
    const start = page * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, page, pageSize])

  if (isLoading) {
    return <SkeletonTable rows={5} cols={columns.length || 4} />
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {searchKey && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(0)
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>
        )}

        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="text-xs h-9 gap-1.5 ml-auto"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        )}
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase font-medium">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    className="p-3.5"
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8">
                    <EmptyState
                      title={emptyState.title}
                      description={emptyState.description}
                    />
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIdx) => (
                  <tr key={row.id || rowIdx} className="hover:bg-muted/30 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={col.key || colIdx} className="p-3.5 text-foreground">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
            <span>
              Page {page + 1} of {totalPages} ({sortedData.length} total)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataTable

