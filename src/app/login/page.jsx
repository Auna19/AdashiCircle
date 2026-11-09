'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const errorParam = searchParams.get('error')

  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState(errorParam || null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  async function onSubmit(data) {
    setServerError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (
          error.message.includes('Invalid login credentials') ||
          error.message.includes('invalid_grant')
        ) {
          setServerError('Incorrect email or password. Please try again.')
        } else if (error.message.includes('Email not confirmed')) {
          setServerError(
            'Please verify your email address before logging in. Check your inbox for the confirmation link.'
          )
        } else if (error.message.toLowerCase().includes('fetch')) {
          setServerError(
            'Unable to connect to Supabase: The API keys in .env.local are currently placeholders. Please connect your real Supabase project URL & Anon key, or click "Explore in Instant Demo Mode" below to test the platform immediately.'
          )
        } else {
          setServerError(error.message)
        }
        return
      }

      toast.success('Welcome back!')
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setServerError(
        'Unable to connect to Supabase: The API keys in .env.local are currently placeholders. Please connect your real Supabase project URL & Anon key, or click "Explore in Instant Demo Mode" below to test the platform immediately.'
      )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-emerald-600 hover:text-emerald-700 font-medium underline-offset-2 hover:underline"
          >
            Sign up for free
          </Link>
        </p>
      </div>

      {serverError && (
        <Alert variant="destructive" className="space-y-2">
          <AlertDescription>{serverError}</AlertDescription>
          <div className="pt-1">
            <a
              href="/api/auth/demo"
              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              ⚡ Explore in Instant Demo Mode
            </a>
          </div>
        </Alert>
      )}

      {/* Demo Quick Access Helper */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-emerald-900 dark:text-emerald-200">Testing Locally?</span>
          <p className="text-emerald-800 dark:text-emerald-300 text-[11px]">Bypass signup and explore full app with mock data.</p>
        </div>
        <a
          href="/api/auth/demo"
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1.5 rounded-lg text-xs transition-colors"
        >
          Instant Demo →
        </a>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-emerald-600 hover:text-emerald-700 underline-offset-2 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              aria-invalid={!!errors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
          />
          <Label
            htmlFor="rememberMe"
            className="text-sm font-normal text-muted-foreground cursor-pointer"
          >
            Remember me
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading sign in…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
