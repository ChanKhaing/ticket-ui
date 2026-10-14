import { useState } from 'react'
import { ShieldCheck, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { MOCK_ROLES } from '@/data/mock'
import type { Role } from '@/types'
import { toast } from 'sonner'

const ALL_PERMISSIONS: Record<string, string[]> = {
  User: ['user:read', 'user:create', 'user:update', 'user:delete', 'user:manage-role'],
  Ticket: [
    'ticket:read',
    'ticket:create',
    'ticket:update',
    'ticket:delete',
    'ticket:manage',
    'ticket:view-my',
    'ticket:redeem',
  ],
  Order: ['order:read', 'order:create', 'order:cancel'],
  Payment: ['payment:read', 'payment:create', 'payment:manage', 'payment:refund'],
  Support: ['support:read', 'support:create', 'support:reply', 'support:resolve'],
  Notification: ['notification:read', 'notification:manage'],
  Admin: ['admin:read', 'admin:manage'],
}

export function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role)
    setSelectedPerms(role.permissions.includes('*') ? Object.values(ALL_PERMISSIONS).flat() : role.permissions)
    setDialogOpen(true)
  }

  const togglePermission = (perm: string) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  const handleSavePermissions = () => {
    if (!editingRole) return
    setRoles((prev) =>
      prev.map((r) =>
        r._id === editingRole._id ? { ...r, permissions: selectedPerms } : r
      )
    )
    setDialogOpen(false)
    toast.success(`Permissions updated for role ${editingRole.name}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Roles & Permissions"
          subtitle="Define authorization levels and granular resource access privileges"
        />
        <Button
          onClick={() => toast.info('Create role dialog')}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="rounded-xl border bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>System Role?</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => {
              const isSystem = role.name === 'admin' || role.name === 'customer'
              const permCount = role.permissions.includes('*')
                ? 'All (*)'
                : `${role.permissions.length} perms`

              return (
                <TableRow key={role._id}>
                  <TableCell className="font-semibold text-gray-900 capitalize">
                    {role.name}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {permCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    {isSystem ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        System Role
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Custom</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEdit(role)}
                        className="gap-1"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isSystem}
                        className="text-red-500 hover:text-red-700 disabled:opacity-40"
                        title={isSystem ? 'System roles cannot be deleted' : 'Delete role'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Permissions Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Permissions: {editingRole?.name}</DialogTitle>
            <DialogDescription>
              Check the permissions granted to this role across resources
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {Object.entries(ALL_PERMISSIONS).map(([resource, perms]) => (
              <div key={resource} className="rounded-lg border p-4 bg-gray-50/50">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">{resource}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {perms.map((p) => {
                    const checked = selectedPerms.includes(p)
                    return (
                      <label
                        key={p}
                        className="flex items-center gap-2 text-xs font-mono bg-white p-2 rounded border cursor-pointer hover:bg-indigo-50/50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(p)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span>{p}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSavePermissions}
            >
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
