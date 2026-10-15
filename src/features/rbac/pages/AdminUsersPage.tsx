import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Search,
  UserPlus,
  MoreVertical,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDate } from '@/lib/utils'
import type { User, UserStatus } from '@/types'
import { toast } from 'sonner'
import { usersApi } from '@/features/users/services/users.api'
import { rbacApi, type NormalizedRole } from '@/features/rbac/services/rbac.api'

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<NormalizedRole[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Action Dialogs
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState('')

  // Create User Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createFullName, setCreateFullName] = useState('')
  const [createPhone, setCreatePhone] = useState('')
  const [createRoleId, setCreateRoleId] = useState('')
  const [creating, setCreating] = useState(false)

  // Fetch Users & Roles
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes] = await Promise.all([
        usersApi.getUsers({ limit: 100 }),
        rbacApi.getRoles(),
      ])
      setUsers(usersRes.users)
      setRoles(rolesRes)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role.name === roleFilter
      const matchStatus = statusFilter === 'all' || u.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [users, search, roleFilter, statusFilter])

  // Change Status (active / banned / inactive)
  const handleChangeStatus = async (userId: string, newStatus: UserStatus) => {
    try {
      const updated = await usersApi.updateUserStatus(userId, newStatus)
      setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)))
      toast.success(`User status changed to ${newStatus}`)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update status')
    }
  }

  // Assign Role
  const handleOpenRoleDialog = (user: User) => {
    setSelectedUser(user)
    setSelectedRoleId(user.role._id)
    setRoleDialogOpen(true)
  }

  const handleSaveRole = async () => {
    if (!selectedUser || !selectedRoleId) return
    try {
      const updated = await usersApi.assignRole(selectedUser._id, selectedRoleId)
      setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? updated : u)))
      toast.success(`Role updated for ${selectedUser.fullName}`)
      setRoleDialogOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to assign role')
    }
  }

  // Delete User
  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      await usersApi.deleteUser(selectedUser._id)
      setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id))
      toast.success(`User ${selectedUser.fullName} has been removed`)
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete user')
    } finally {
      setDeleteOpen(false)
    }
  }

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createEmail || !createPassword || !createFullName) {
      toast.error('Please fill in all required fields')
      return
    }
    setCreating(true)
    try {
      const newUser = await usersApi.createUser({
        email: createEmail,
        password: createPassword,
        fullName: createFullName,
        phone: createPhone || undefined,
        roleId: createRoleId || undefined,
      })
      setUsers((prev) => [newUser, ...prev])
      toast.success(`User ${newUser.fullName} created successfully`)
      setCreateDialogOpen(false)
      // Reset form
      setCreateEmail('')
      setCreatePassword('')
      setCreateFullName('')
      setCreatePhone('')
      setCreateRoleId('')
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="User Management"
          subtitle="View accounts, assign roles, and moderate platform members"
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
            <UserPlus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4 shadow-xs">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r._id} value={r.name}>
                {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading accounts from database...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                    No users match your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => {
                  const initials = (user.fullName || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900">{user.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 capitalize">
                          {user.role?.name || 'customer'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeStatus(
                                  user._id,
                                  user.status === 'banned' ? 'active' : 'banned'
                                )
                              }
                            >
                              {user.status === 'banned' ? (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                                  Unban User
                                </>
                              ) : (
                                <>
                                  <UserX className="mr-2 h-4 w-4 text-orange-500" />
                                  Ban User
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenRoleDialog(user)}>
                              <Shield className="mr-2 h-4 w-4 text-indigo-500" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setDeleteOpen(true)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Assign a new RBAC role to {selectedUser?.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <label className="text-xs font-medium">Select Role</label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r._id} value={r._id}>
                    {r.name.charAt(0).toUpperCase() + r.name.slice(1)} — {r.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Save Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User Account</DialogTitle>
            <DialogDescription>
              Add a new member to the platform with customized role access.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Full Name *</label>
              <Input
                placeholder="Mg Mg"
                value={createFullName}
                onChange={(e) => setCreateFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Email Address *</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Password *</label>
              <Input
                type="password"
                placeholder="At least 8 characters"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Phone (Optional)</label>
              <Input
                placeholder="0912345678"
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Role</label>
              <Select value={createRoleId} onValueChange={setCreateRoleId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Default (Customer)" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.name.charAt(0).toUpperCase() + r.name.slice(1)} ({r.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {creating ? 'Creating...' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${selectedUser?.fullName}? This user will no longer be able to sign in.`}
        confirmLabel="Delete User"
        danger
        onConfirm={handleDelete}
      />
    </div>
  )
}
