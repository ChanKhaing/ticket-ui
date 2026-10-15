import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Ticket, Sparkles, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { authService } from '../services/auth.service'
import { mailhogApi } from '../services/mailhog.api'
import { useAuth } from '../context/AuthContext'

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, updateUser } = useAuth()

  const defaultEmail = (location.state as { email?: string })?.email || user?.email || ''
  const [email, setEmail] = useState(defaultEmail)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [verified, setVerified] = useState(false)
  const [detectedOtp, setDetectedOtp] = useState<{ code: string; time: string } | null>(null)
  const [scanningMailHog, setScanningMailHog] = useState(false)

  // Scan MailHog for latest OTP
  const scanMailHog = async (targetEmail: string) => {
    if (!targetEmail) return
    setScanningMailHog(true)
    try {
      const found = await mailhogApi.findLatestOtp(targetEmail)
      if (found) {
        setDetectedOtp({ code: found.code, time: found.time })
      }
    } finally {
      setScanningMailHog(false)
    }
  }

  useEffect(() => {
    if (email) {
      scanMailHog(email)
    }
  }, [email])

  const handleRequestOtp = async () => {
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    setRequesting(true)
    try {
      await authService.requestOtp(email)
      toast.success('Verification code sent to your email!')
      // Wait a moment and scan MailHog
      setTimeout(() => scanMailHog(email), 1000)
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to request OTP'
      toast.error(msg)
    } finally {
      setRequesting(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !code) {
      toast.error('Please enter email and 6-digit OTP code')
      return
    }
    if (code.length !== 6) {
      toast.error('OTP code must be 6 digits')
      return
    }
    setLoading(true)
    try {
      await authService.verifyOtp(email, code)
      setVerified(true)
      updateUser({ emailVerified: true })
      toast.success('Email verified successfully!')
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Invalid or expired OTP'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoFill = () => {
    if (detectedOtp) {
      setCode(detectedOtp.code)
      toast.success(`Auto-filled OTP: ${detectedOtp.code}`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Verify Your Email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the 6-digit verification code sent to your email
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          {verified ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email Verified!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your email has been successfully verified.
                </p>
              </div>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => navigate(user ? '/user/orders' : '/login')}
              >
                Continue to Dashboard
              </Button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRequestOtp}
                    disabled={requesting || !email}
                    className="shrink-0 text-xs"
                  >
                    {requesting ? 'Sending...' : 'Send OTP'}
                  </Button>
                </div>
              </div>

              {/* Dev MailHog Auto-Fill Banner */}
              {detectedOtp && (
                <div className="rounded-lg border border-indigo-200 bg-indigo-50/80 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-700">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      MailHog Detected OTP:
                    </span>
                    <span className="font-mono text-base tracking-widest text-indigo-950 font-bold">
                      {detectedOtp.code}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="mt-2 w-full text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                    onClick={handleAutoFill}
                  >
                    Auto-Fill Code ({detectedOtp.code})
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">6-Digit Code</label>
                  <button
                    type="button"
                    onClick={() => scanMailHog(email)}
                    disabled={scanningMailHog}
                    className="flex items-center text-xs text-muted-foreground hover:text-indigo-600"
                  >
                    <RefreshCw className={`mr-1 h-3 w-3 ${scanningMailHog ? 'animate-spin' : ''}`} />
                    Refresh MailHog
                  </button>
                </div>
                <Input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center font-mono text-lg tracking-widest"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/login" className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}
