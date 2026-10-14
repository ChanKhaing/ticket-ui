import { useState, useMemo } from 'react'
import { Search, ShieldAlert, History } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader } from '@/components/shared/PageHeader'
import { MOCK_AUDIT_LOGS, MOCK_ACTIVITY_LOGS } from '@/data/mock'
import { formatDateTime } from '@/lib/utils'

export function AdminLogsPage() {
  const [tab, setTab] = useState<'audit' | 'activity'>('audit')
  const [search, setSearch] = useState('')

  const filteredAudit = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter((l) => {
      return (
        l.actor.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.target.toLowerCase().includes(search.toLowerCase()) ||
        l.ip.includes(search)
      )
    })
  }, [search])

  const filteredActivity = useMemo(() => {
    return MOCK_ACTIVITY_LOGS.filter((l) => {
      return (
        l.user.toLowerCase().includes(search.toLowerCase()) ||
        l.eventType.toLowerCase().includes(search.toLowerCase()) ||
        l.entity.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [search])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit & Activity Logs"
        subtitle="System-level audit trail and user interaction event history"
      />

      <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="audit" className="gap-2">
              <ShieldAlert className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <History className="h-4 w-4" />
              Activity Logs
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Audit Tab */}
        <TabsContent value="audit" className="mt-4">
          <div className="rounded-xl border bg-white shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudit.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {log.actor}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-700">
                      {log.target}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.ip}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4">
          <div className="rounded-xl border bg-white shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivity.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {log.user}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {log.eventType}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-indigo-600">
                      {log.entity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
