import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Ticket, AlertCircle, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { authService } from '../services/auth.service'
import { mailhogApi } from '../services/mailhog.api'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [scanningMailHog, setScanningMailHog] = useState(false)

  // Auto-scan MailHog if token is missing
  useEffect(() => {
    if (!token) {
      setScanningMailHog(true)
      mailhogApi.findLatestResetToken()
        .then((found) => {
          if (found) {
            setToken(found.token)
            toast.info(`Auto-detected reset token from MailHog for ${found.sentTo}`)
          }
        })
        .finally(() => setScanningMailHog(false))
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast.error('Reset token is missing. Please click the reset link in your email.')
      return
    }
    if (password !== confirm) {
      toast.error("Passwords don't match")
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
      toast.success('Password reset successfully! Please sign in with your new password.')
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Password reset failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your new password below</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Password Reset!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You can now sign in with your new password.
                </p>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!token && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <div className="flex items-center gap-1.5 font-medium">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Reset Token Required
                  </div>
                  <p className="mt-1">
                    {scanningMailHog ? 'Scanning MailHog for latest token...' : 'No token found in URL. Enter below or request a new reset link.'}
                  </p>
                  <div className="mt-2">
                    <Input
                      placeholder="Paste reset token here"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {token && (
                <div className="flex items-center gap-2 rounded-lg bg-indigo-50/70 px-3 py-2 text-xs text-indigo-700 font-medium">
                  <KeyRound className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Token attached: {token.slice(0, 12)}...</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}
