'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Filter,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CurrencyDisplay } from '@/components/ui/currency'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'

export default function ContributionsPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [contributions, setContributions] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) return

    async function loadContributions() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('contributions')
          .select(`
            id,
            amount_paid_kobo,
            expected_amount_kobo,
            payment_date,
            payment_method,
            status,
            transaction_reference,
            created_at,
            savings_groups (
              id,
              name
            ),
            contribution_periods (
              period_number,
              due_date
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching contributions:', error)
        }

        setContributions(data || [])
      } catch (err) {
        console.error('Failed to load contributions:', err)
      } finally {
        setLoading(false)
      }
    }

    loadContributions()
  }, [user, supabase])

  const filtered = contributions.filter((c) => {
    if (filter === 'all') return true
    return c.status === filter
  })

  const totalPaidKobo = contributions
    .filter((c) => c.status === 'confirmed')
    .reduce((sum, c) => sum + Number(c.amount_paid_kobo || 0), 0)

  const totalPendingKobo = contributions
    .filter((c) => c.status === 'pending' || c.status === 'overdue')
    .reduce((sum, c) => sum + (Number(c.expected_amount_kobo || 0) - Number(c.amount_paid_kobo || 0)), 0)

  return (
    <DashboardLayout pageTitle="Contributions">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Contribution Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Review all your scheduled, paid, and verified rotational contributions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Confirmed"
            value={<CurrencyDisplay amountKobo={totalPaidKobo} size="lg" />}
            subtitle="Verified payments"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            variant="success"
          />
          <StatCard
            title="Pending & Due"
            value={<CurrencyDisplay amountKobo={totalPendingKobo} size="lg" />}
            subtitle="Awaiting payment or confirmation"
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            variant="warning"
          />
          <StatCard
            title="Total Records"
            value={contributions.length}
            subtitle="Individual payment cycles"
            icon={<FileText className="w-5 h-5 text-blue-600" />}
            variant="info"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 text-xs">
          {['all', 'confirmed', 'pending', 'overdue', 'rejected'].map((st) => (
            <Button
              key={st}
              variant={filter === st ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(st)}
              className="capitalize"
            >
              {st}
            </Button>
          ))}
        </div>

        {/* Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase">
              <tr>
                <th className="p-3.5">Circle</th>
                <th className="p-3.5">Period</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment Date</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Loading contributions…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No contributions found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className="p-3.5 font-medium text-foreground">
                      {c.savings_groups?.name || 'Savings Circle'}
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      Period #{c.contribution_periods?.period_number || 1}
                    </td>
                    <td className="p-3.5 font-semibold text-foreground">
                      <CurrencyDisplay amountKobo={c.amount_paid_kobo || c.expected_amount_kobo} size="sm" />
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {c.payment_date || '-'}
                    </td>
                    <td className="p-3.5 capitalize text-muted-foreground">
                      {c.payment_method?.replace('_', ' ') || '-'}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

