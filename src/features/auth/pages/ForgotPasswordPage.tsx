import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Ticket, ArrowRight, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { authService } from '../services/auth.service'
import { mailhogApi } from '../services/mailhog.api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [detectedResetLink, setDetectedResetLink] = useState<string | null>(null)
  const [checkingMailhog, setCheckingMailhog] = useState(false)

  const checkMailHog = async (targetEmail: string) => {
    setCheckingMailhog(true)
    try {
      // Small pause to allow backend nodemailer to finish sending
      await new Promise((r) => setTimeout(r, 800))
      const found = await mailhogApi.findLatestResetToken(targetEmail)
      if (found) {
        setDetectedResetLink(found.link)
      }
    } finally {
      setCheckingMailhog(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent to your email!')
      // Check MailHog automatically for local dev convenience
      await checkMailHog(email)
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to send reset link'
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
          <h1 className="text-2xl font-bold">Forgot Password?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email to receive a reset link
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Check your email</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  If <strong>{email}</strong> exists, a reset link was sent.
                </p>
              </div>

              {/* Dev Auto-Helper for MailHog */}
              {detectedResetLink ? (
                <div className="w-full rounded-lg border border-indigo-200 bg-indigo-50/80 p-3 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    MailHog Auto-Detected
                  </div>
                  <p className="mt-1 text-xs text-indigo-900">
                    Dev shortcut: Reset link found in MailHog!
                  </p>
                  <Button asChild size="sm" className="mt-2.5 w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Link to={detectedResetLink} className="flex items-center justify-center gap-1.5">
                      Open Reset Password Page
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => checkMailHog(email)}
                  disabled={checkingMailhog}
                  className="text-xs text-muted-foreground hover:text-indigo-600"
                >
                  <RefreshCw className={`mr-1 h-3 w-3 ${checkingMailhog ? 'animate-spin' : ''}`} />
                  {checkingMailhog ? 'Scanning MailHog...' : 'Check MailHog for link'}
                </Button>
              )}

              <Button variant="outline" asChild className="w-full mt-2">
                <Link to="/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
