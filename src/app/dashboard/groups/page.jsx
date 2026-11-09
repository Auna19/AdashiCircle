'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  PlusCircle,
  KeyRound,
  Calendar,
  DollarSign,
  ArrowRight,
  Shield,
  Search,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CurrencyDisplay } from '@/components/ui/currency'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function GroupsPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return

    async function fetchGroups() {
      setLoading(true)
      try {
        const { data: memberRecords, error } = await supabase
          .from('group_members')
          .select(`
            id,
            role,
            payout_position,
            status,
            savings_groups (
              id,
              name,
              slug,
              description,
              category,
              group_type,
              status,
              contribution_amount_kobo,
              frequency,
              current_members,
              max_members,
              invitation_code,
              start_date
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')

        if (error) {
          console.error('Error fetching groups:', error)
        }

        const items = (memberRecords || [])
          .map((m) => ({
            ...m.savings_groups,
            memberRole: m.role,
            payoutPosition: m.payout_position,
          }))
          .filter(Boolean)

        setGroups(items)
      } catch (err) {
        console.error('Failed to load groups:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [user, supabase])

  const filteredGroups = groups.filter((g) =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout pageTitle="Savings Circles">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Savings Circles</h2>
            <p className="text-sm text-muted-foreground">
              Manage your group memberships, contribution schedules, and invitations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/groups/join">
              <Button variant="outline" size="sm" className="gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                Join with Code
              </Button>
            </Link>
            <Link href="/dashboard/groups/new">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                <PlusCircle className="w-4 h-4" />
                New Circle
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your circles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-48" />
              </Card>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {search ? 'No matching savings circles' : 'No circles found'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
                {search
                  ? 'Try searching with a different name or category keyword.'
                  : 'Get started by creating your own savings circle or joining one with an invite code.'}
              </p>
              <div className="flex justify-center gap-3">
                <Link href="/dashboard/groups/new">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Create Circle
                  </Button>
                </Link>
                <Link href="/dashboard/groups/join">
                  <Button variant="outline">
                    Join with Code
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                        {group.category || 'Savings'}
                      </span>
                      <CardTitle className="text-lg font-bold text-foreground mt-0.5">
                        {group.name}
                      </CardTitle>
                    </div>
                    <StatusBadge status={group.status} />
                  </div>
                  {group.description && (
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {group.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="space-y-2 text-xs border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contribution:</span>
                      <span className="font-semibold text-foreground">
                        <CurrencyDisplay amountKobo={group.contribution_amount_kobo} size="sm" /> / {group.frequency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members:</span>
                      <span className="font-medium text-foreground">
                        {group.current_members} of {group.max_members} max
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Role:</span>
                      <span className="font-semibold capitalize text-foreground">
                        {group.memberRole} {group.payoutPosition ? `(Position #${group.payoutPosition})` : ''}
                      </span>
                    </div>
                    {group.invitation_code && group.memberRole === 'admin' && (
                      <div className="flex justify-between items-center bg-muted/40 p-2 rounded-lg mt-2">
                        <span className="text-muted-foreground">Invite Code:</span>
                        <code className="font-mono font-bold text-emerald-600 text-xs tracking-wider">
                          {group.invitation_code}
                        </code>
                      </div>
                    )}
                  </div>

                  <Link href={`/dashboard/groups/${group.id}`} className="block">
                    <Button variant="outline" className="w-full text-xs font-medium">
                      Open Circle Details
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

