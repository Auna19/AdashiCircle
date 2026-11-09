import Link from 'next/link'
import { CircleDollarSign, Shield, Users, TrendingUp, Bell, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Group Management',
    description: 'Create and manage savings groups with ease.',
  },
  {
    icon: Shield,
    title: 'Secure & Transparent',
    description: 'Every transaction is recorded and visible to members.',
  },
  {
    icon: TrendingUp,
    title: 'Automated Tracking',
    description: 'Never miss a payment with smart reminders.',
  },
  {
    icon: CircleDollarSign,
    title: 'Flexible Payouts',
    description: 'Rotating or fixed payout schedules that suit your group.',
  },
  {
    icon: Bell,
    title: 'Real-time Alerts',
    description: 'Instant notifications for payments and group activity.',
  },
  {
    icon: BarChart3,
    title: 'Financial Insights',
    description: 'Track your savings journey with detailed analytics.',
  },
]

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative flex-col justify-between p-10 bg-emerald-800 text-white overflow-hidden">
        <div>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <CircleDollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AdashiCircle</span>
          </Link>

          <div className="mt-10">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Save Together.
              <br />
              <span className="text-emerald-200">Grow Together.</span>
            </h1>
            <p className="mt-4 text-lg text-emerald-100 leading-relaxed max-w-sm">
              The trusted digital platform for cooperative savings groups in Nigeria.
              Transparent, automated, and community-driven.
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="space-y-4 my-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{feature.title}</p>
                  <p className="text-emerald-200 text-xs mt-0.5">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Social Proof */}
        <div className="border-t border-white/20 pt-6">
          <p className="text-emerald-200 text-sm">
            Modernising Adashi, Ajo & Esusu with digital precision.
          </p>
        </div>
      </div>

      {/* Right form area */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="lg:hidden px-6 pt-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-emerald-700">AdashiCircle</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <div className="p-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} AdashiCircle. Save Together. Grow Together.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
