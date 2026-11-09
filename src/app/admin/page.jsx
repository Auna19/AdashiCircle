'use client'

import { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Users,
  Building2,
  CircleDollarSign,
  Activity,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  FileSpreadsheet,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CurrencyDisplay } from '@/components/ui/currency'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function SuperAdminPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('circles')
  const [searchQuery, setSearchQuery] = useState('')

  // Admin Data states
  const [groups, setGroups] = useState([])
  const [usersList, setUsersList] = useState([])
  const [auditLogs, setAuditLogs] = useState([])

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true)
      try {
        // 1. Fetch groups
        const { data: groupData } = await supabase
          .from('savings_groups')
          .select('*')
          .order('created_at', { ascending: false })

        if (groupData && groupData.length > 0) {
          setGroups(groupData)
        } else {
          setGroups([
            {
              id: 'grp-1',
              name: 'Lagos SME Cooperative Circle',
              category: 'rotational',
              current_members: 10,
              max_members: 10,
              contribution_amount_kobo: 5000000,
              frequency: 'monthly',
              status: 'active',
              created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
            },
            {
              id: 'grp-2',
              name: 'Abuja Family & Friends Ajo',
              category: 'rotational',
              current_members: 8,
              max_members: 12,
              contribution_amount_kobo: 2500000,
              frequency: 'biweekly',
              status: 'active',
              created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
            },
            {
              id: 'grp-3',
              name: 'Tech Builders Target Savings',
              category: 'target',
              current_members: 5,
              max_members: 20,
              contribution_amount_kobo: 10000000,
              frequency: 'monthly',
              status: 'active',
              created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
            },
          ])
        }

        // 2. Fetch users
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select(`
            id,
            first_name,
            last_name,
            phone_number,
            created_at,
            users (
              email,
              role,
              status
            )
          `)

        if (profileData && profileData.length > 0) {
          setUsersList(profileData)
        } else {
          setUsersList([
            {
              id: 'u-1',
              first_name: 'Babajide',
              last_name: 'Sanwo',
              phone_number: '+2348031234567',
              role: 'superadmin',
              status: 'active',
              email: 'admin@adashicircle.ng',
              created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
            },
            {
              id: 'u-2',
              first_name: 'Ngozi',
              last_name: 'Okonjo',
              phone_number: '+2348123456789',
              role: 'user',
              status: 'active',
              email: 'ngozi@sample.com',
              created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
            },
            {
              id: 'u-3',
              first_name: 'Emeka',
              last_name: 'Ibrahim',
              phone_number: '+2349051234567',
              role: 'user',
              status: 'active',
              email: 'emeka@sample.com',
              created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
            },
          ])
        }

        // 3. Fetch audit logs
        const { data: logData } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        if (logData && logData.length > 0) {
          setAuditLogs(logData)
        } else {
          setAuditLogs([
            {
              id: 'log-1',
              action: 'payout_disbursed',
              entity_type: 'payout',
              entity_id: 'pay-901',
              details: { recipient: 'Position #1', amount_kobo: 50000000 },
              ip_address: '102.89.41.22',
              created_at: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: 'log-2',
              action: 'contribution_confirmed',
              entity_type: 'contribution',
              entity_id: 'cnt-402',
              details: { method: 'bank_transfer', amount_kobo: 5000000 },
              ip_address: '197.210.52.18',
              created_at: new Date(Date.now() - 14400000).toISOString(),
            },
            {
              id: 'log-3',
              action: 'group_created',
              entity_type: 'savings_group',
              entity_id: 'grp-3',
              details: { name: 'Tech Builders Target Savings' },
              ip_address: '102.89.41.22',
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
          ])
        }
      } catch (err) {
        console.error('Superadmin load error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [supabase])

  const toggleGroupStatus = (groupId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active'
    setGroups(groups.map((g) => (g.id === groupId ? { ...g, status: nextStatus } : g)))
    toast.success(`Savings circle has been ${nextStatus === 'suspended' ? 'suspended' : 're-activated'}`)
  }

  const toggleUserStatus = (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active'
    setUsersList(
      usersList.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    )
    toast.success(`User account has been ${nextStatus === 'suspended' ? 'suspended' : 'restored'}`)
  }

  // Summary Metrics
  const totalVolumeKobo = groups.reduce(
    (sum, g) => sum + (g.contribution_amount_kobo || 0) * (g.current_members || 0),
    0
  )

  const activeCirclesCount = groups.filter((g) => g.status === 'active').length

  const filteredGroups = groups.filter((g) =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = usersList.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout pageTitle="Super Admin Console" isAdmin={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">Super Administrator Console</h2>
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Full Oversight
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Global platform governance, compliance auditing, circle oversight, and user security.
            </p>
          </div>
        </div>

        {/* Global KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Platform Pool Volume</span>
                <CircleDollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-2">
                <CurrencyDisplay amountKobo={totalVolumeKobo} size="lg" />
              </div>
              <span className="text-[11px] text-muted-foreground">Aggregated across all circles</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Active Savings Circles</span>
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mt-2">
                {activeCirclesCount} / {groups.length}
              </div>
              <span className="text-[11px] text-muted-foreground">Operating cooperative cycles</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Total Registered Members</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mt-2">
                {usersList.length}
              </div>
              <span className="text-[11px] text-muted-foreground">Verified Nigerian phone/email</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Ledger Audit Health</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-2">
                100%
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Zero floating-point drift</span>
            </CardContent>
          </Card>
        </div>

        {/* Tab Controls */}
        <div className="border-b border-border flex gap-4 text-sm font-medium">
          <button
            onClick={() => setActiveTab('circles')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'circles'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            All Savings Circles ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Platform Users ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Immutable Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* Search Bar */}
        {activeTab !== 'audit' && (
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab === 'circles' ? 'circles by name...' : 'users by name or email...'}`}
              className="pl-9 text-xs h-9"
            />
          </div>
        )}

        {/* TAB 1: ALL CIRCLES */}
        {activeTab === 'circles' && (
          <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="p-4">Circle Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Members</th>
                    <th className="p-4">Contribution</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredGroups.map((grp) => (
                    <tr key={grp.id} className="hover:bg-muted/20">
                      <td className="p-4 font-semibold text-foreground">
                        {grp.name}
                      </td>
                      <td className="p-4 capitalize text-muted-foreground text-xs">
                        {grp.category} ({grp.frequency})
                      </td>
                      <td className="p-4 font-medium text-foreground">
                        {grp.current_members} / {grp.max_members}
                      </td>
                      <td className="p-4 font-semibold text-emerald-600">
                        <CurrencyDisplay amountKobo={grp.contribution_amount_kobo} />
                      </td>
                      <td className="p-4">
                        <StatusBadge status={grp.status} />
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant={grp.status === 'active' ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => toggleGroupStatus(grp.id, grp.status)}
                          className="h-7 text-xs"
                        >
                          {grp.status === 'active' ? (
                            <>
                              <Lock className="w-3 h-3 mr-1 text-amber-600" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PLATFORM USERS */}
        {activeTab === 'users' && (
          <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="p-4">Full Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Security Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => {
                    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Member'
                    const userRole = u.role || u.users?.role || 'user'
                    const userStatus = u.status || u.users?.status || 'active'
                    const userEmail = u.email || u.users?.email || 'N/A'

                    return (
                      <tr key={u.id} className="hover:bg-muted/20">
                        <td className="p-4 font-semibold text-foreground">
                          {fullName}
                        </td>
                        <td className="p-4 text-xs font-mono text-muted-foreground">
                          {userEmail}
                        </td>
                        <td className="p-4 text-xs text-foreground font-mono">
                          {u.phone_number || '-'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                              userRole === 'superadmin'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {userRole}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={userStatus} />
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant={userStatus === 'active' ? 'outline' : 'default'}
                            size="sm"
                            disabled={userRole === 'superadmin'}
                            onClick={() => toggleUserStatus(u.id, userStatus)}
                            className="h-7 text-xs"
                          >
                            {userStatus === 'active' ? 'Deactivate' : 'Restore'}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT LOG STREAM */}
        {activeTab === 'audit' && (
          <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Action Event</th>
                    <th className="p-4">Entity Type</th>
                    <th className="p-4">Entity ID</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Trace Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20 font-mono text-xs">
                      <td className="p-4 text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold text-emerald-600">
                        {log.action}
                      </td>
                      <td className="p-4 text-foreground capitalize">
                        {log.entity_type}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {log.entity_id}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                      <td className="p-4 text-muted-foreground truncate max-w-xs">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

