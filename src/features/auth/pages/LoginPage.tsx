import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Ticket } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/features/auth/context/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  // Redirect if already logged in
  if (user) {
    if (user.role.name === 'admin') navigate('/admin/dashboard', { replace: true })
    else navigate('/user/orders', { replace: true })
  }

  const onSubmit = async (values: LoginForm) => {
    setLoading(true)
    try {
      await login(values.email, values.password)
      toast.success('Welcome back!')
      const stored = localStorage.getItem('pja_user')
      if (stored) {
        const u = JSON.parse(stored)
        if (u.role?.name === 'admin') navigate('/admin/dashboard')
        else navigate('/user/orders')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your PJ-A account</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-900"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>

          {/* Quick Demo Credentials */}
          <div className="mt-4 rounded-md border border-indigo-100 bg-indigo-50/70 p-3 text-xs text-indigo-700">
            <p className="font-semibold text-indigo-900 mb-1.5">Quick Demo Accounts (1-Click Fill):</p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  form.setValue('email', 'admin@pja.com')
                  form.setValue('password', 'password123')
                }}
                className="flex items-center justify-between rounded bg-white px-2 py-1 text-left font-medium shadow-xs hover:bg-indigo-50 transition"
              >
                <span>🛡️ Admin: <code className="text-indigo-600">admin@pja.com</code></span>
                <span className="text-[11px] text-muted-foreground">Fill</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  form.setValue('email', 'demo@example.com')
                  form.setValue('password', 'password123')
                }}
                className="flex items-center justify-between rounded bg-white px-2 py-1 text-left font-medium shadow-xs hover:bg-indigo-50 transition"
              >
                <span>👤 Customer: <code className="text-indigo-600">demo@example.com</code></span>
                <span className="text-[11px] text-muted-foreground">Fill</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}