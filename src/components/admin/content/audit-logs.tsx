"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { SearchIcon, HistoryIcon, UserIcon, ActivityIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface AuditLogEntry {
  id: string
  userId: string | null
  userName: string | null
  action: string
  entity: string
  entityId: string | null
  details: Record<string, any> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export default function AuditLogs() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [search, setSearch] = useState("")

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/audit")
      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to fetch audit logs")
      }
      setLogs(payload.data.logs)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch audit logs")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchLogs()
  }, [fetchLogs])

  const filteredLogs = logs.filter((log) => {
    const searchLower = search.toLowerCase()
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.entity.toLowerCase().includes(searchLower) ||
      log.userName?.toLowerCase().includes(searchLower) ||
      log.details?.message?.toLowerCase().includes(searchLower)
    )
  })

  const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    if (action === "CREATE") return "default"
    if (action === "UPDATE") return "secondary"
    if (action === "DELETE") return "destructive"
    return "outline"
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track administrative actions and system changes for transparency and security.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Action History</CardTitle>
              <CardDescription>Comprehensive log of all administrative operations.</CardDescription>
            </div>
            <div className="relative w-full md:max-w-xs">
              <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search action, user, or entity..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Spinner className="size-8" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading system audit trail...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <HistoryIcon className="size-12 text-muted-foreground/50" />
              <p className="font-semibold text-lg">No audit records found</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                No administrative actions have been logged yet or match your search criteria.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserIcon className="size-4 text-muted-foreground" />
                        <span className="font-medium">{log.userName || "System"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionVariant(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ActivityIcon className="size-4 text-muted-foreground" />
                        <span>{log.entity}</span>
                        {log.entityId && (
                          <span className="text-xs font-mono text-muted-foreground">({log.entityId.slice(-6)})</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm" title={log.details?.message}>
                        {log.details?.message || "No message provided"}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {log.ipAddress || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
