'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CircleDollarSign,
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowRightLeft,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Bell,
  Wallet,
  HelpCircle,
  Building2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/use-auth'

const memberNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Groups', href: '/dashboard/groups', icon: Users },
  { label: 'Contributions', href: '/dashboard/contributions', icon: CreditCard },
  { label: 'Payouts', href: '/dashboard/payouts', icon: Wallet },
  { label: 'Transactions', href: '/dashboard/transactions', icon: ArrowRightLeft },
  { label: 'Disputes', href: '/dashboard/disputes', icon: AlertTriangle },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const adminNav = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'All Groups', href: '/admin/groups', icon: Building2 },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Contributions', href: '/admin/contributions', icon: CreditCard },
  { label: 'Payouts', href: '/admin/payouts', icon: Wallet },
  { label: 'Transactions', href: '/admin/transactions', icon: ArrowRightLeft },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function Sidebar({ isAdmin = false, className }) {
  const pathname = usePathname()
  const { user, profile, isSuperAdmin, signOut } = useAuth()
  const [collapsed, setCollapsed] = React.useState(false)

  const navItems = isAdmin ? adminNav : memberNav

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const fullName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'User'

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col bg-card border-r border-border transition-all duration-300 relative select-none',
          collapsed ? 'w-16' : 'w-64',
          className
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link
            href={isAdmin ? '/admin' : '/dashboard'}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <CircleDollarSign className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-foreground truncate">
                  AdashiCircle
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                    Super Admin
                  </span>
                )}
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 overflow-y-auto px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' &&
                item.href !== '/admin' &&
                pathname.startsWith(item.href))

            const linkNode = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-emerald-600')} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkNode}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return linkNode
          })}
        </div>

        {/* User profile & logout */}
        <div className="p-3 border-t border-border mt-auto">
          <div
            className={cn(
              'flex items-center gap-3',
              collapsed ? 'justify-center' : 'justify-between'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {fullName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}

export default Sidebar

