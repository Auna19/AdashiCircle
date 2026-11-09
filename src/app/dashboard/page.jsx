'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  Wallet,
  TrendingUp,
  Clock,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatCard } from '@/components/ui/stat-card'
import { CurrencyDisplay } from '@/components/ui/currency'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalContributedKobo: 0,
    activeGroupsCount: 0,
    nextPayoutKobo: 0,
    outstandingBalanceKobo: 0,
  })
  const [userGroups, setUserGroups] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])

  useEffect(() => {
    if (!user) return

    async function loadDashboardData() {
      setLoading(true)
      try {
        // 1. Fetch user's group memberships
        const { data: memberRecords, error: memberErr } = await supabase
          .from('group_members')
          .select(`
            id,
            role,
            status,
            payout_position,
            group_id,
            savings_groups (
              id,
              name,
              slug,
              group_type,
              status,
              contribution_amount_kobo,
              frequency,
              current_members,
              max_members,
              start_date
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')

        if (memberErr) {
          console.error('Error fetching member records:', memberErr)
        }

        const groups = (memberRecords || [])
          .map((m) => ({
            ...m.savings_groups,
            memberRole: m.role,
            payoutPosition: m.payout_position,
          }))
          .filter(Boolean)

        setUserGroups(groups)

        // 2. Fetch confirmed contributions
        const { data: contributions, error: contribErr } = await supabase
          .from('contributions')
          .select('amount_paid_kobo, expected_amount_kobo, status')
          .eq('user_id', user.id)

        let totalPaid = 0
        let totalOutstanding = 0

        if (contributions) {
          contributions.forEach((c) => {
            if (c.status === 'confirmed') {
              totalPaid += Number(c.amount_paid_kobo || 0)
            } else if (c.status === 'pending' || c.status === 'overdue') {
              totalOutstanding += Math.max(
                0,
                Number(c.expected_amount_kobo || 0) - Number(c.amount_paid_kobo || 0)
              )
            }
          })
        }

        // 3. Fetch recent transactions
        const { data: txs } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setRecentTransactions(txs || [])

        setStats({
          totalContributedKobo: totalPaid,
          activeGroupsCount: groups.length,
          nextPayoutKobo: groups.length > 0 ? (groups[0]?.contribution_amount_kobo || 0) * (groups[0]?.current_members || 1) : 0,
          outstandingBalanceKobo: totalOutstanding,
        })
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user, supabase])

  const displayName = profile?.first_name || user?.email?.split('@')[0] || 'Member'

  return (
    <DashboardLayout pageTitle="Member Dashboard">
      {/* Welcome Banner */}
      <div className="bg-emerald-800 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-700/60 text-emerald-200 mb-3 border border-emerald-600/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            Cooperative Savings Platform
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {displayName}!
          </h2>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base leading-relaxed">
            Keep track of your monthly contributions, group rotations, and scheduled payouts with digital transparency.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard/groups/new">
              <Button className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold shadow">
                <PlusCircle className="w-4 h-4 mr-2 text-emerald-700" />
                Create a Savings Group
              </Button>
            </Link>
            <Link href="/dashboard/groups/join">
              <Button variant="outline" className="text-white border-white/30 hover:bg-emerald-700/50">
                Join with Invitation Code
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Contributions"
          value={<CurrencyDisplay amountKobo={stats.totalContributedKobo} size="lg" />}
          subtitle="All confirmed savings"
          icon={<Wallet className="w-6 h-6 text-emerald-600" />}
          variant="success"
          isLoading={loading}
        />
        <StatCard
          title="Active Circles"
          value={stats.activeGroupsCount}
          subtitle="Savings groups joined"
          icon={<Users className="w-6 h-6 text-blue-600" />}
          variant="info"
          isLoading={loading}
        />
        <StatCard
          title="Next Expected Payout"
          value={<CurrencyDisplay amountKobo={stats.nextPayoutKobo} size="lg" />}
          subtitle="Estimated rotational pool"
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          variant="default"
          isLoading={loading}
        />
        <StatCard
          title="Outstanding Balance"
          value={<CurrencyDisplay amountKobo={stats.outstandingBalanceKobo} size="lg" />}
          subtitle="Pending contributions"
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          variant="warning"
          isLoading={loading}
        />
      </div>

      {/* Main Grid: My Groups & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Groups list (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">My Savings Circles</h3>
            <Link
              href="/dashboard/groups"
              className="text-sm font-medium text-emerald-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading your savings groups…
              </CardContent>
            </Card>
          ) : userGroups.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-foreground">No savings circle yet</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                  You are not yet a member of any cooperative group. Start one or join an existing circle with an invitation link.
                </p>
                <Link href="/dashboard/groups/new">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Your First Circle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-foreground">
                          {group.name}
                        </CardTitle>
                        <CardDescription className="text-xs capitalize mt-0.5">
                          {group.group_type} · {group.frequency}
                        </CardDescription>
                      </div>
                      <StatusBadge status={group.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <div className="mt-2 space-y-2 text-xs text-muted-foreground border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span>Contribution:</span>
                        <span className="font-semibold text-foreground">
                          <CurrencyDisplay amountKobo={group.contribution_amount_kobo} size="sm" />
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Members:</span>
                        <span className="font-medium text-foreground">
                          {group.current_members} / {group.max_members}
                        </span>
                      </div>
                      {group.payoutPosition && (
                        <div className="flex justify-between">
                          <span>Your Payout Position:</span>
                          <span className="font-semibold text-emerald-600">
                            #{group.payoutPosition}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-2">
                      <Link href={`/dashboard/groups/${group.id}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          View Group Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity / Quick Actions (1 col) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <Card>
            <CardContent className="p-4">
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <CreditCard className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  No transactions recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground capitalize">
                            {tx.type}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-foreground">
                        <CurrencyDisplay amountKobo={tx.amount_kobo} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Adashi Rules & Guidance Card */}
          <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <AlertCircle className="w-4 h-4" />
                Cooperative Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs text-muted-foreground space-y-1.5 leading-relaxed">
              <p>• Only verified contributions count towards total group payout pools.</p>
              <p>• All payouts follow the rotational positions agreed upon before cycle start.</p>
              <p>• You can download contribution statements anytime from your group dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

