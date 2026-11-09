'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Bell, Shield, User, Smartphone, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [inAppAlerts, setInAppAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    toast.success('Preferences saved!')
  }

  return (
    <DashboardLayout pageTitle="Settings">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Account & Notification Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure how and when you receive reminders for contributions and payouts.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                Notification Channels
              </CardTitle>
              <CardDescription className="text-xs">
                Select the channels you want AdashiCircle to notify you on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">In-App Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive real-time alerts inside the dashboard</p>
                </div>
                <input
                  type="checkbox"
                  checked={inAppAlerts}
                  onChange={(e) => setInAppAlerts(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Send payment deadlines & confirmation receipts to {user?.email}</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">SMS Notifications</p>
                  <p className="text-xs text-muted-foreground">Send payment reminder SMS to your Nigerian phone number</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
            Save Changes
          </Button>
        </form>
      </div>
    </DashboardLayout>
  )
}

