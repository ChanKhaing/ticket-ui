import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Ticket, ArrowLeft, KeyRound, CheckCircle, Sparkles, RefreshCw, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { authService } from '../services/auth.service'
import { mailhogApi } from '../services/mailhog.api'

type Step = 'email' | 'otp' | 'password' | 'done'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState(false)

  // Dev MailHog auto-detection
  const [detectedOtp, setDetectedOtp] = useState<string | null>(null)
  const [scanningMailHog, setScanningMailHog] = useState(false)

  const scanMailHog = async (targetEmail: string) => {
    if (!targetEmail) return
    setScanningMailHog(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      const found = await mailhogApi.findLatestOtp(targetEmail)
      if (found) {
        setDetectedOtp(found.code)
      }
    } finally {
      setScanningMailHog(false)
    }
  }

  // Auto scan when moving to OTP step
  useEffect(() => {
    if (step === 'otp' && email) {
      scanMailHog(email)
    }
  }, [step, email])

  // Step 1: Submit Email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setUnverifiedEmail(false)
    try {
      await authService.forgotPassword(email)
      toast.success('Verification code sent to your email!')
      setStep('otp')
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to process request'
      if (err.response?.data?.error?.code === 'EMAIL_NOT_VERIFIED' || msg.toLowerCase().includes('not verified')) {
        setUnverifiedEmail(true)
      }
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Submit OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code')
      return
    }
    setLoading(true)
    try {
      const res = await authService.verifyResetOtp(email, otpCode)
      setResetToken(res.resetToken)
      toast.success('Code verified! Enter your new password.')
      setStep('password')
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Invalid or expired OTP code'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Submit New Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword(resetToken, newPassword)
      toast.success('Password reset successfully!')
      setStep('done')
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
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'email' && 'Reset Password'}
            {step === 'otp' && 'Enter Security Code'}
            {step === 'password' && 'Create New Password'}
            {step === 'done' && 'Password Changed!'}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {step === 'email' && 'Enter your email to verify account & receive code'}
            {step === 'otp' && `Code sent to ${email}`}
            {step === 'password' && 'Enter and confirm your new secure password'}
            {step === 'done' && 'Your account has been secured with the new password'}
          </p>

          {/* Stepper Indicator */}
          {step !== 'done' && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className={`h-1.5 w-8 rounded-full transition-colors ${step === 'email' ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
              <span className={`h-1.5 w-8 rounded-full transition-colors ${step === 'otp' ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
              <span className={`h-1.5 w-8 rounded-full transition-colors ${step === 'password' ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
            </div>
          )}
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          {/* STEP 1: EMAIL */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {unverifiedEmail && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                    Email Not Verified
                  </div>
                  <p className="mt-1">
                    This account exists but is not verified yet. You must verify your email before resetting your password.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full text-xs font-medium border-amber-300 text-amber-900 hover:bg-amber-100"
                    onClick={() => navigate('/verify-otp', { state: { email } })}
                  >
                    Go to Verify Email Page
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setUnverifiedEmail(false)
                  }}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? 'Checking Account...' : 'Continue'}
              </Button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              {/* MailHog Dev Helper */}
              {detectedOtp && (
                <div className="rounded-lg border border-indigo-200 bg-indigo-50/80 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-700">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      MailHog Detected OTP:
                    </span>
                    <span className="font-mono text-base font-bold tracking-widest text-indigo-950">
                      {detectedOtp}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="mt-2 w-full text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                    onClick={() => {
                      setOtpCode(detectedOtp)
                      toast.success(`Auto-filled code: ${detectedOtp}`)
                    }}
                  >
                    Auto-Fill Code ({detectedOtp})
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">6-Digit Security Code</label>
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
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center font-mono text-lg tracking-widest"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading || otpCode.length !== 6}
              >
                {loading ? 'Verifying Code...' : 'Verify & Continue'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-center text-xs text-muted-foreground hover:text-gray-900"
              >
                Use a different email
              </button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50/70 px-3 py-2 text-xs text-indigo-700 font-medium">
                <KeyRound className="h-3.5 w-3.5 shrink-0" />
                <span>Identity verified for {email}</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </Button>
            </form>
          )}

          {/* STEP 4: DONE */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 py-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Password Changed!</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  You can now log in to your account with your new password.
                </p>
              </div>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => navigate('/login')}
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/login" className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
