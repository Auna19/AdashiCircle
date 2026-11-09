'use client'

import { Bell, CheckCheck, Clock } from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatRelativeDate } from '@/lib/utils/dates'

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications()

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Stay updated on deadlines, contribution confirmations, and payouts.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="gap-1.5 text-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading notifications…
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground space-y-2">
              <Bell className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <p className="font-semibold text-foreground">No notifications yet</p>
              <p className="text-xs">
                You will receive alerts here when payments are due or when organizers confirm your contributions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={`transition-colors cursor-pointer ${
                  !n.is_read ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                }`}
                onClick={() => !n.is_read && markAsRead(n.id)}
              >
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {n.title}
                      </span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground block pt-1">
                      {formatRelativeDate(n.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

