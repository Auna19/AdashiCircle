'use client'

import { useEffect, useState } from 'react'
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CurrencyDisplay } from '@/components/ui/currency'
import { StatusBadge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'

export default function PayoutsPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState([])
  const [payouts, setPayouts] = useState([])

  useEffect(() => {
    if (!user) return

    async function loadPayoutData() {
      setLoading(true)
      try {
        // Fetch payout schedules for user
        const { data: scheduleData } = await supabase
          .from('payout_schedules')
          .select(`
            id,
            position,
            scheduled_date,
            expected_amount_kobo,
            status,
            savings_groups (
              id,
              name
            )
          `)
          .eq('user_id', user.id)

        setSchedules(scheduleData || [])

        // Fetch actual payouts received
        const { data: payoutData } = await supabase
          .from('payouts')
          .select(`
            id,
            amount_kobo,
            payout_date,
            payment_reference,
            payment_method,
            status,
            savings_groups (
              name
            )
          `)
          .eq('recipient_user_id', user.id)

        setPayouts(payoutData || [])
      } catch (err) {
        console.error('Failed to load payouts:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPayoutData()
  }, [user, supabase])

  const totalReceivedKobo = payouts
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount_kobo || 0), 0)

  return (
    <DashboardLayout pageTitle="Payouts">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payout Management</h2>
          <p className="text-sm text-muted-foreground">
            Track your scheduled rotational payout dates and received disbursements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Total Received Payouts"
            value={<CurrencyDisplay amountKobo={totalReceivedKobo} size="lg" />}
            subtitle="Disbursed from completed rotations"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            variant="success"
          />
          <StatCard
            title="Scheduled Payouts"
            value={schedules.length}
            subtitle="Upcoming assigned rotations"
            icon={<Wallet className="w-5 h-5 text-purple-600" />}
            variant="info"
          />
        </div>

        {/* Scheduled Payouts Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Assigned Payout Schedules</h3>
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="p-3.5">Circle</th>
                  <th className="p-3.5">Position</th>
                  <th className="p-3.5">Expected Amount</th>
                  <th className="p-3.5">Scheduled Date</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Loading schedule…
                    </td>
                  </tr>
                ) : schedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No payout schedules assigned yet.
                    </td>
                  </tr>
                ) : (
                  schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20">
                      <td className="p-3.5 font-medium text-foreground">
                        {s.savings_groups?.name || 'Savings Circle'}
                      </td>
                      <td className="p-3.5 font-bold text-emerald-600">
                        #{s.position}
                      </td>
                      <td className="p-3.5 font-semibold text-foreground">
                        <CurrencyDisplay amountKobo={s.expected_amount_kobo} size="sm" />
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {s.scheduled_date}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

