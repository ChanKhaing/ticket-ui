import { useState } from 'react'
import { CheckCircle2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAuth } from '@/features/auth/context/AuthContext'
import { toast } from 'sonner'
import { usersApi } from '../services/users.api'

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await usersApi.updateProfile({ fullName, phone })
      updateUser(updated)
      toast.success('Profile details updated successfully')
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to update profile'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setChangingPassword(true)
    try {
      await usersApi.changePassword({ currentPassword, newPassword })
      setShowPasswordForm(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password changed successfully')
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to change password'
      toast.error(msg)
    } finally {
      setChangingPassword(false)
    }
  }

  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal details and account settings"
      />

      {/* Main Profile Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-indigo-100">
            <AvatarFallback className="bg-indigo-600 text-white text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
              {user?.emailVerified && (
                <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="inline-block mt-1 text-xs font-semibold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Role: {user?.role.name}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Email Address (Read-only)</label>
            <Input value={user?.email || ''} disabled className="bg-gray-50 text-gray-500" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Full Name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09-xxxxxxxxx"
            />
          </div>

          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </form>

        <div className="border-t pt-6">
          {!showPasswordForm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Security & Password</p>
                <p className="text-sm text-muted-foreground">Keep your account safe with a strong password</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordForm(true)}
                className="gap-2"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h3 className="font-semibold text-gray-900">Change Password</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
