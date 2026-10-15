import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Edit, Trash2, RefreshCw, KeyRound, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from 'sonner'
import { rbacApi, type NormalizedRole, type BackendPermission } from '../services/rbac.api'

export function AdminRolesPage() {
  const [roles, setRoles] = useState<NormalizedRole[]>([])
  const [permissions, setPermissions] = useState<BackendPermission[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Permissions Dialog
  const [editingRole, setEditingRole] = useState<NormalizedRole | null>(null)
  const [selectedPermCodes, setSelectedPermCodes] = useState<string[]>([])
  const [permDialogOpen, setPermDialogOpen] = useState(false)
  const [savingPerms, setSavingPerms] = useState(false)

  // Create Role Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')
  const [creatingRole, setCreatingRole] = useState(false)

  // Delete Role Dialog
  const [deletingRole, setDeletingRole] = useState<NormalizedRole | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Fetch roles and all permissions from backend
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [rolesRes, permsRes] = await Promise.all([
        rbacApi.getRoles(),
        rbacApi.getPermissions(),
      ])
      setRoles(rolesRes)
      setPermissions(permsRes)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to load roles and permissions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Group permissions by resource for clean UI checkboxes
  const permissionsByResource = useMemo(() => {
    const grouped: Record<string, BackendPermission[]> = {}
    permissions.forEach((p) => {
      const res = p.resource ? p.resource.toUpperCase() : 'OTHER'
      if (!grouped[res]) grouped[res] = []
      grouped[res].push(p)
    })
    return grouped
  }, [permissions])

  // Open Edit Permissions
  const handleOpenEdit = (role: NormalizedRole) => {
    setEditingRole(role)
    const isAll = role.permissions.includes('*')
    setSelectedPermCodes(isAll ? permissions.map((p) => p.code) : role.permissions)
    setPermDialogOpen(true)
  }

  // Toggle single permission
  const togglePermission = (code: string) => {
    setSelectedPermCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  // Toggle whole resource group
  const toggleResourceGroup = (resourcePerms: BackendPermission[]) => {
    const codes = resourcePerms.map((p) => p.code)
    const allSelected = codes.every((c) => selectedPermCodes.includes(c))
    if (allSelected) {
      setSelectedPermCodes((prev) => prev.filter((c) => !codes.includes(c)))
    } else {
      setSelectedPermCodes((prev) => Array.from(new Set([...prev, ...codes])))
    }
  }

  // Save permissions to backend
  const handleSavePermissions = async () => {
    if (!editingRole) return
    setSavingPerms(true)
    try {
      // Map selected codes to Permission ObjectIds
      const permIds = permissions
        .filter((p) => selectedPermCodes.includes(p.code))
        .map((p) => p._id)

      const updated = await rbacApi.assignPermissions(editingRole._id, permIds)
      setRoles((prev) => prev.map((r) => (r._id === editingRole._id ? updated : r)))
      toast.success(`Permissions updated for role: ${editingRole.name}`)
      setPermDialogOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update permissions')
    } finally {
      setSavingPerms(false)
    }
  }

  // Create Role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleName.trim()) {
      toast.error('Please enter a role name')
      return
    }
    setCreatingRole(true)
    try {
      const created = await rbacApi.createRole({
        name: newRoleName.trim().toLowerCase(),
        description: newRoleDesc.trim() || `${newRoleName} role`,
      })
      setRoles((prev) => [...prev, created])
      toast.success(`Role "${created.name}" created successfully`)
      setCreateDialogOpen(false)
      setNewRoleName('')
      setNewRoleDesc('')
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to create role')
    } finally {
      setCreatingRole(false)
    }
  }

  // Delete Role
  const handleDeleteRole = async () => {
    if (!deletingRole) return
    try {
      await rbacApi.deleteRole(deletingRole._id)
      setRoles((prev) => prev.filter((r) => r._id !== deletingRole._id))
      toast.success(`Role "${deletingRole.name}" deleted`)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete role')
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Roles & Permissions"
          subtitle="Define authorization levels and granular resource access privileges"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2 text-white"
          >
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading roles and permissions...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>System Role?</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => {
                const isSystem = role.isSystem || role.name === 'admin' || role.name === 'customer'
                const permCount = role.permissions.includes('*')
                  ? 'All Permissions (*)'
                  : `${role.permissions.length} perms`

                return (
                  <TableRow key={role._id}>
                    <TableCell className="font-semibold text-gray-900 capitalize">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-indigo-600" />
                        {role.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {role.description || '—'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                        {permCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isSystem ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                          <ShieldAlert className="h-3 w-3" />
                          System
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Custom</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(role)}
                          className="h-8 gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit Perms
                        </Button>
                        {!isSystem && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingRole(role)
                              setDeleteDialogOpen(true)
                            }}
                            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Permissions Dialog */}
      <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="capitalize">
              Configure Permissions — {editingRole?.name}
            </DialogTitle>
            <DialogDescription>
              Select the granular permissions granted to this role across resources.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-2">
            {Object.entries(permissionsByResource).map(([resource, perms]) => {
              const allChecked = perms.every((p) => selectedPermCodes.includes(p.code))
              return (
                <div key={resource} className="rounded-lg border p-3 bg-gray-50/50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b">
                    <span className="text-xs font-bold text-gray-700 tracking-wider">
                      {resource}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleResourceGroup(perms)}
                      className="text-[11px] font-medium text-indigo-600 hover:underline"
                    >
                      {allChecked ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((p) => {
                      const checked = selectedPermCodes.includes(p.code)
                      return (
                        <label
                          key={p._id}
                          className={`flex items-start gap-2 p-2 rounded border text-xs cursor-pointer transition-colors ${
                            checked
                              ? 'border-indigo-300 bg-indigo-50/60 text-indigo-950 font-medium'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(p.code)}
                            className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px]">{p.code}</span>
                            <span className="text-[10px] text-muted-foreground">{p.description}</span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <DialogFooter className="border-t pt-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-muted-foreground">
                Selected: {selectedPermCodes.length} permissions
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setPermDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePermissions}
                  disabled={savingPerms}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {savingPerms ? 'Saving...' : 'Save Permissions'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new authorization role to assign permissions and users.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRole} className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Role Identifier *</label>
              <Input
                placeholder="e.g. supervisor or accountant"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Will be converted to lowercase alphanumeric slug.
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Description</label>
              <Input
                placeholder="Handles refunds and account audits"
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creatingRole} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {creatingRole ? 'Creating...' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${deletingRole?.name}"? Users with this role may lose access.`}
        confirmLabel="Delete Role"
        danger
        onConfirm={handleDeleteRole}
      />
    </div>
  )
}
