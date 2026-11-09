'use client'

import * as React from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { AuthGuard } from '@/components/auth/auth-guard'
import { cn } from '@/lib/utils/cn'

export function DashboardLayout({
  children,
  pageTitle,
  isAdmin = false,
  className,
}) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  return (
    <AuthGuard requireSuperAdmin={isAdmin}>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        {/* Sidebar */}
        <Sidebar isAdmin={isAdmin} />

        {/* Mobile sidebar overlay */}
        {mobileNavOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            pageTitle={pageTitle}
            onMenuToggle={() => setMobileNavOpen((v) => !v)}
          />

          <main className={cn('flex-1 overflow-y-auto p-4 md:p-6', className)}>
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}

export default DashboardLayout

