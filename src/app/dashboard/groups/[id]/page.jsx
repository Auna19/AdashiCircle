'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Users,
  Wallet,
  Calendar,
  Clock,
  Shield,
  CreditCard,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Send,
  PlusCircle,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Megaphone,
  CheckCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CurrencyDisplay } from '@/components/ui/currency'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { exportGroupContributionsCSV, exportGroupContributionsPDF } from '@/lib/reports'

export default function GroupDetailPage() {
  const params = useParams()
  const groupId = params.id
  const router = useRouter()
  const { user, profile } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [periods, setPeriods] = useState([])
  const [contributions, setContributions] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [activeTab, setActiveTab] = useState('periods')
  const [copied, setCopied] = useState(false)
  const [userMemberRecord, setUserMemberRecord] = useState(null)

  // Modals state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [submittingPayment, setSubmittingPayment] = useState(false)

  // Admin Manual Record Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [recordMemberId, setRecordMemberId] = useState('')
  const [recordPeriodId, setRecordPeriodId] = useState('')
  const [recordAmountNaira, setRecordAmountNaira] = useState('')
  const [recordMethod, setRecordMethod] = useState('cash')
  const [submittingRecord, setSubmittingRecord] = useState(false)

  // Admin Payout Modal
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [payoutPeriod, setPayoutPeriod] = useState(null)
  const [payoutReference, setPayoutReference] = useState('')
  const [submittingPayout, setSubmittingPayout] = useState(false)

  // Announcement Modal
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false)
  const [announceTitle, setAnnounceTitle] = useState('')
  const [announceContent, setAnnounceContent] = useState('')
  const [submittingAnnounce, setSubmittingAnnounce] = useState(false)

  useEffect(() => {
    if (!groupId || !user) return

    async function loadGroupData() {
      setLoading(true)
      try {
        // 1. Fetch group info
        const { data: groupData, error: groupErr } = await supabase
          .from('savings_groups')
          .select('*')
          .eq('id', groupId)
          .single()

        if (groupErr) {
          // Provide fallback demo circle when Supabase tables are not yet migrated
          const demoGroup = {
            id: groupId || 'grp-1',
            name: groupId === 'grp-2' ? 'Abuja Family & Friends Ajo' : 'Lagos SME Cooperative Circle',
            slug: 'lagos-sme-cooperative-circle',
            description: 'Rotating savings association for Lagos market traders and business owners.',
            category: 'Market Traders',
            group_type: 'rotational',
            status: 'active',
            contribution_amount_kobo: 5000000,
            frequency: 'monthly',
            current_members: 10,
            max_members: 10,
            invitation_code: 'LAGOS001',
            start_date: '2026-01-01',
          }
          setGroup(demoGroup)
          setUserMemberRecord({ role: 'admin', payout_position: 1, user_id: user.id })
          setMembers([
            { id: 'm-1', user_id: user.id, role: 'admin', status: 'active', payout_position: 1, joined_at: new Date().toISOString(), users: { email: user.email } },
            { id: 'm-2', user_id: 'u-2', role: 'member', status: 'active', payout_position: 2, joined_at: new Date().toISOString(), users: { email: 'ngozi@sample.com' } },
            { id: 'm-3', user_id: 'u-3', role: 'member', status: 'active', payout_position: 3, joined_at: new Date().toISOString(), users: { email: 'emeka@sample.com' } },
          ])
          setPeriods([
            { id: 'p-1', period_number: 1, start_date: '2026-01-01', due_date: '2026-01-07', status: 'active' },
            { id: 'p-2', period_number: 2, start_date: '2026-02-01', due_date: '2026-02-07', status: 'upcoming' },
          ])
          setAnnouncements([
            { id: 'a-1', title: 'Welcome to Lagos SME Circle', content: 'Period #1 contributions are now active. Please transfer to the designated bank account.', created_at: new Date().toISOString() },
          ])
        } else {
          setGroup(groupData)

          // 2. Fetch members
          const { data: memberData } = await supabase
            .from('group_members')
            .select(`
              id,
              user_id,
              role,
              status,
              payout_position,
              joined_at,
              users (
                email,
                user_profiles (
                  first_name,
                  last_name,
                  avatar_url
                )
              )
            `)
            .eq('group_id', groupId)
            .order('payout_position', { ascending: true })

          setMembers(memberData || [])

          // Find current user's role
          const currentUserMember = (memberData || []).find((m) => m.user_id === user.id)
          setUserMemberRecord(currentUserMember)

          // 3. Fetch contribution periods
          const { data: periodData } = await supabase
            .from('contribution_periods')
            .select('*')
            .eq('group_id', groupId)
            .order('period_number', { ascending: true })

          setPeriods(periodData || [])

          // 4. Fetch contributions
          const { data: contribData } = await supabase
            .from('contributions')
            .select('*')
            .eq('group_id', groupId)

          setContributions(contribData || [])

          // 5. Fetch announcements
          const { data: announceData } = await supabase
            .from('announcements')
            .select('*')
            .eq('group_id', groupId)
            .order('created_at', { ascending: false })

          setAnnouncements(announceData || [])
        }
      } catch (err) {
        console.error('Failed to load group:', err)
        toast.error('Could not load circle details')
      } finally {
        setLoading(false)
      }
    }

    loadGroupData()
  }, [groupId, user, supabase])

  const copyInviteCode = () => {
    if (!group?.invitation_code) return
    navigator.clipboard.writeText(group.invitation_code)
    setCopied(true)
    toast.success('Invitation code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const isAdmin = userMemberRecord?.role === 'admin' || userMemberRecord?.role === 'organizer'
  const poolAmountKobo = (group?.contribution_amount_kobo || 0) * (group?.current_members || 1)
  const pendingContributions = contributions.filter((c) => c.status === 'awaiting_verification')

  // Handle Member Submitting Payment Evidence
  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    if (!selectedPeriod) return

    setSubmittingPayment(true)
    try {
      const generatedRef = paymentReference.trim() || `DEP-${Date.now().toString().slice(-6)}`
      const newContrib = {
        group_id: groupId,
        period_id: selectedPeriod.id,
        user_id: user.id,
        expected_amount_kobo: group.contribution_amount_kobo,
        amount_paid_kobo: group.contribution_amount_kobo,
        payment_method: paymentMethod,
        transaction_reference: generatedRef,
        status: 'awaiting_verification',
        payment_date: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('contributions')
        .insert(newContrib)
        .select()
        .single()

      if (!error && data) {
        setContributions([data, ...contributions])
      } else {
        // Optimistic update for demo
        setContributions([
          {
            ...newContrib,
            id: `contrib-${Date.now()}`,
          },
          ...contributions,
        ])
      }

      toast.success('Payment submitted! Awaiting circle admin verification.')
      setIsPayModalOpen(false)
      setPaymentReference('')
      setPaymentNotes('')
    } catch (err) {
      toast.error('Failed to submit payment evidence')
    } finally {
      setSubmittingPayment(false)
    }
  }

  // Handle Admin Manual Cash Recording
  const handleRecordCashPayment = async (e) => {
    e.preventDefault()
    if (!recordMemberId || !recordPeriodId) {
      toast.error('Please select both a member and a contribution period')
      return
    }

    setSubmittingRecord(true)
    try {
      const amountKobo = recordAmountNaira
        ? Math.round(parseFloat(recordAmountNaira) * 100)
        : group.contribution_amount_kobo

      const ref = `CASH-REC-${Date.now().toString().slice(-6)}`
      const newContrib = {
        group_id: groupId,
        period_id: recordPeriodId,
        user_id: recordMemberId,
        expected_amount_kobo: group.contribution_amount_kobo,
        amount_paid_kobo: amountKobo,
        payment_method: recordMethod,
        transaction_reference: ref,
        status: 'confirmed',
        payment_date: new Date().toISOString(),
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('contributions')
        .insert(newContrib)
        .select()
        .single()

      if (!error && data) {
        setContributions([data, ...contributions])
      } else {
        setContributions([{ ...newContrib, id: `c-${Date.now()}` }, ...contributions])
      }

      // Add to transactions ledger
      await supabase.from('transactions').insert({
        group_id: groupId,
        user_id: recordMemberId,
        type: 'contribution',
        amount_kobo: amountKobo,
        status: 'confirmed',
        reference: ref,
        description: `Manual ${recordMethod.toUpperCase()} payment recorded by Circle Admin`,
      })

      toast.success('Manual payment successfully confirmed and recorded!')
      setIsRecordModalOpen(false)
      setRecordAmountNaira('')
    } catch (err) {
      toast.error('Failed to record manual payment')
    } finally {
      setSubmittingRecord(false)
    }
  }

  // Handle Admin Approving Pending Contribution
  const handleApproveContribution = async (contribId) => {
    try {
      const { error } = await supabase
        .from('contributions')
        .update({
          status: 'confirmed',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', contribId)

      setContributions(
        contributions.map((c) =>
          c.id === contribId
            ? { ...c, status: 'confirmed', verified_by: user.id, verified_at: new Date().toISOString() }
            : c
        )
      )

      toast.success('Contribution approved and verified!')
    } catch (err) {
      toast.error('Failed to approve contribution')
    }
  }

  // Handle Admin Rejecting Pending Contribution
  const handleRejectContribution = async (contribId) => {
    const reason = window.prompt('Enter reason for rejection (e.g., payment not received in bank statement):')
    if (!reason) return

    try {
      await supabase
        .from('contributions')
        .update({
          status: 'rejected',
          notes: reason,
          verified_by: user.id,
        })
        .eq('id', contribId)

      setContributions(
        contributions.map((c) =>
          c.id === contribId ? { ...c, status: 'rejected', notes: reason } : c
        )
      )

      toast.info('Contribution marked as rejected.')
    } catch (err) {
      toast.error('Failed to reject contribution')
    }
  }

  // Handle Admin Disbursing Payout
  const handleConfirmPayout = async (e) => {
    e.preventDefault()
    if (!payoutPeriod) return

    setSubmittingPayout(true)
    try {
      const recipientMember = members.find((m) => m.payout_position === payoutPeriod.period_number)
      const ref = payoutReference.trim() || `PAYOUT-${Date.now().toString().slice(-6)}`

      // Record transaction
      await supabase.from('transactions').insert({
        group_id: groupId,
        user_id: recipientMember?.user_id || user.id,
        type: 'payout',
        amount_kobo: poolAmountKobo,
        status: 'confirmed',
        reference: ref,
        description: `Rotational payout for Period #${payoutPeriod.period_number}`,
      })

      // Update period status
      await supabase
        .from('contribution_periods')
        .update({ status: 'completed' })
        .eq('id', payoutPeriod.id)

      setPeriods(
        periods.map((p) => (p.id === payoutPeriod.id ? { ...p, status: 'completed' } : p))
      )

      toast.success(`Rotational payout of ₦${(poolAmountKobo / 100).toLocaleString()} successfully recorded!`)
      setIsPayoutModalOpen(false)
      setPayoutReference('')
    } catch (err) {
      toast.error('Failed to disburse payout')
    } finally {
      setSubmittingPayout(false)
    }
  }

  // Handle Admin Posting Announcement
  const handlePostAnnouncement = async (e) => {
    e.preventDefault()
    if (!announceTitle.trim() || !announceContent.trim()) {
      toast.error('Please enter both title and announcement message')
      return
    }

    setSubmittingAnnounce(true)
    try {
      const newAnnounce = {
        group_id: groupId,
        title: announceTitle.trim(),
        content: announceContent.trim(),
        created_by: user.id,
        is_pinned: true,
      }

      const { data, error } = await supabase
        .from('announcements')
        .insert(newAnnounce)
        .select()
        .single()

      if (!error && data) {
        setAnnouncements([data, ...announcements])
      } else {
        setAnnouncements([
          { ...newAnnounce, id: `ann-${Date.now()}`, created_at: new Date().toISOString() },
          ...announcements,
        ])
      }

      toast.success('Announcement broadcast to all circle members!')
      setIsAnnounceModalOpen(false)
      setAnnounceTitle('')
      setAnnounceContent('')
    } catch (err) {
      toast.error('Failed to post announcement')
    } finally {
      setSubmittingAnnounce(false)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const formatted = contributions.map((c) => ({
      groupName: group?.name || 'Savings Circle',
      memberName: 'Member',
      periodNumber: 1,
      expectedAmountKobo: c.expected_amount_kobo || group.contribution_amount_kobo,
      amountPaidKobo: c.amount_paid_kobo,
      paymentDate: c.payment_date ? new Date(c.payment_date).toLocaleDateString() : 'N/A',
      paymentMethod: c.payment_method || 'N/A',
      transactionReference: c.transaction_reference || 'N/A',
      status: c.status,
    }))
    exportGroupContributionsCSV(group?.name || 'Circle', formatted)
    toast.success('Circle contribution records exported to CSV!')
  }

  // Export PDF
  const handleExportPDF = () => {
    const formatted = contributions.map((c) => ({
      groupName: group?.name || 'Savings Circle',
      memberName: 'Member',
      periodNumber: 1,
      expectedAmountKobo: c.expected_amount_kobo || group.contribution_amount_kobo,
      amountPaidKobo: c.amount_paid_kobo,
      paymentDate: c.payment_date ? new Date(c.payment_date).toLocaleDateString() : 'N/A',
      paymentMethod: c.payment_method || 'N/A',
      transactionReference: c.transaction_reference || 'N/A',
      status: c.status,
    }))
    exportGroupContributionsPDF(group?.name || 'Circle', formatted, {
      totalMembers: members.length,
      totalConfirmedKobo: poolAmountKobo,
    })
    toast.success('Circle official statement generated (PDF)!')
  }

  if (loading) {
    return (
      <DashboardLayout pageTitle="Savings Circle">
        <div className="py-20 text-center text-muted-foreground">
          Loading circle details…
        </div>
      </DashboardLayout>
    )
  }

  if (!group) {
    return (
      <DashboardLayout pageTitle="Savings Circle">
        <div className="py-20 text-center space-y-3">
          <p className="text-muted-foreground">Savings circle not found or you do not have permission.</p>
          <Link href="/dashboard/groups">
            <Button variant="outline">Back to My Circles</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle={group.name}>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/dashboard/groups"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to my groups
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">{group.name}</h2>
                <StatusBadge status={group.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {group.description || 'Digital Rotating Savings Circle (Adashi/Ajo)'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {group.invitation_code && (
                <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-lg shadow-sm">
                  <div className="text-xs">
                    <span className="text-muted-foreground mr-1">Invite Code:</span>
                    <code className="font-mono font-bold text-emerald-600">{group.invitation_code}</code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyInviteCode}
                    className="h-7 px-2 text-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-1.5 text-xs h-9"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                CSV
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-1.5 text-xs h-9"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                PDF
              </Button>

              {isAdmin && (
                <Button
                  onClick={() => setIsRecordModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs h-9 shadow-sm"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Record Member Payment
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <span className="text-xs text-muted-foreground font-medium">Periodic Contribution</span>
              <div className="text-xl font-bold text-foreground mt-1">
                <CurrencyDisplay amountKobo={group.contribution_amount_kobo} size="lg" />
              </div>
              <span className="text-xs text-muted-foreground capitalize">Every {group.frequency}</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs text-muted-foreground font-medium">Total Pool Payout</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                <CurrencyDisplay amountKobo={poolAmountKobo} size="lg" />
              </div>
              <span className="text-xs text-muted-foreground">Each rotation payout</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs text-muted-foreground font-medium">Circle Membership</span>
              <div className="text-xl font-bold text-foreground mt-1">
                {group.current_members} / {group.max_members}
              </div>
              <span className="text-xs text-muted-foreground">Members enrolled</span>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs text-muted-foreground font-medium">Your Assigned Position</span>
              <div className="text-xl font-bold text-purple-600 mt-1">
                {userMemberRecord?.payout_position ? `#${userMemberRecord.payout_position}` : 'Unassigned'}
              </div>
              <span className="text-xs text-muted-foreground capitalize">Role: {userMemberRecord?.role || 'Member'}</span>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border flex gap-4 text-sm font-medium">
          <button
            onClick={() => setActiveTab('periods')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'periods'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Contribution Periods ({periods.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'members'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Members & Rotation Order ({members.length})
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('verifications')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'verifications'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Pending Verifications
              {pendingContributions.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {pendingContributions.length}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'announcements'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Announcements ({announcements.length})
          </button>
        </div>

        {/* TAB 1: CONTRIBUTION PERIODS */}
        {activeTab === 'periods' && (
          <div className="space-y-4">
            <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Period</th>
                    <th className="p-3.5">Start Date</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {periods.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground">
                        No contribution periods scheduled yet.
                      </td>
                    </tr>
                  ) : (
                    periods.map((period) => (
                      <tr key={period.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-semibold text-foreground">
                          Period #{period.period_number}
                        </td>
                        <td className="p-3.5 text-muted-foreground">
                          {period.start_date}
                        </td>
                        <td className="p-3.5 font-medium text-foreground">
                          {period.due_date}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={period.status} />
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 text-emerald-600 border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            onClick={() => {
                              setSelectedPeriod(period)
                              setIsPayModalOpen(true)
                            }}
                          >
                            Pay Contribution
                          </Button>
                          {isAdmin && period.status !== 'completed' && (
                            <Button
                              variant="default"
                              size="sm"
                              className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => {
                                setPayoutPeriod(period)
                                setIsPayoutModalOpen(true)
                              }}
                            >
                              Disburse Payout
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MEMBERS & ROTATION ORDER */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Rotation Position</th>
                    <th className="p-3.5">Member</th>
                    <th className="p-3.5">Circle Role</th>
                    <th className="p-3.5">Joined Date</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((m) => {
                    const profileInfo = m.users?.user_profiles?.[0]
                    const name = profileInfo
                      ? `${profileInfo.first_name} ${profileInfo.last_name}`
                      : m.users?.email || 'Member'

                    return (
                      <tr key={m.id} className="hover:bg-muted/20">
                        <td className="p-3.5 font-bold text-emerald-600">
                          #{m.payout_position || '-'}
                        </td>
                        <td className="p-3.5 font-medium text-foreground">
                          {name} {m.user_id === user.id && <span className="text-xs text-muted-foreground font-normal">(You)</span>}
                        </td>
                        <td className="p-3.5 capitalize text-muted-foreground">
                          {m.role}
                        </td>
                        <td className="p-3.5 text-muted-foreground">
                          {new Date(m.joined_at).toLocaleDateString()}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={m.status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN VERIFICATIONS */}
        {isAdmin && activeTab === 'verifications' && (
          <div className="space-y-4">
            {pendingContributions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-semibold text-foreground">All Submissions Verified</h4>
                  <p className="text-xs text-muted-foreground">
                    There are no pending member contributions awaiting verification right now.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">Reference</th>
                      <th className="p-3.5">Payment Method</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Date Submitted</th>
                      <th className="p-3.5 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingContributions.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/20">
                        <td className="p-3.5 font-mono text-xs font-semibold text-foreground">
                          {c.transaction_reference || 'N/A'}
                        </td>
                        <td className="p-3.5 capitalize text-muted-foreground text-xs">
                          {c.payment_method?.replace('_', ' ')}
                        </td>
                        <td className="p-3.5 font-bold text-emerald-600">
                          <CurrencyDisplay amountKobo={c.amount_paid_kobo} />
                        </td>
                        <td className="p-3.5 text-xs text-muted-foreground">
                          {new Date(c.payment_date).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveContribution(c.id)}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectContribution(c.id)}
                            className="h-8 text-xs text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GROUP ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-base">Circle Notice Board</h3>
              {isAdmin && (
                <Button
                  onClick={() => setIsAnnounceModalOpen(true)}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  Post Announcement
                </Button>
              )}
            </div>

            {announcements.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center space-y-2">
                  <Megaphone className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs text-muted-foreground">No announcements posted for this circle yet.</p>
                </CardContent>
              </Card>
            ) : (
              announcements.map((ann) => (
                <Card key={ann.id} className="border-border">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">{ann.title}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {ann.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* MODAL 1: PAY CONTRIBUTION (MEMBER) */}
        {isPayModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-lg text-foreground">
                    Submit Contribution Payment
                  </h3>
                </div>
                <button
                  onClick={() => setIsPayModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              {/* Bank Account Details */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  Circle Designated Bank Account:
                </span>
                <p className="text-emerald-900 dark:text-emerald-200">
                  Bank: <span className="font-semibold">Guaranty Trust Bank (GTBank)</span>
                </p>
                <p className="text-emerald-900 dark:text-emerald-200">
                  Account No: <span className="font-mono font-bold tracking-wider">0123456789</span>
                </p>
                <p className="text-emerald-900 dark:text-emerald-200">
                  Account Name: <span className="font-semibold">{group.name} Escrow</span>
                </p>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
                <div>
                  <Label className="text-xs">Required Amount</Label>
                  <div className="text-lg font-bold text-foreground mt-0.5">
                    <CurrencyDisplay amountKobo={group.contribution_amount_kobo} size="lg" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payMethod" className="text-xs">
                    Payment Method Used
                  </Label>
                  <select
                    id="payMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-9 px-3 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="bank_transfer">Direct Bank Transfer</option>
                    <option value="ussd">USSD Transfer (*737# etc.)</option>
                    <option value="cash">Direct Cash / In-person Deposit</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payRef" className="text-xs">
                    Transaction Reference / Session ID
                  </Label>
                  <Input
                    id="payRef"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g. GTB/20261109/98213812 or receipt code"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payNotes" className="text-xs">
                    Payment Narration / Notes (Optional)
                  </Label>
                  <Input
                    id="payNotes"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Sender name or branch deposit details"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPayModalOpen(false)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingPayment}
                    className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {submittingPayment ? 'Submitting…' : 'Submit for Verification'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADMIN RECORD CASH/MANUAL PAYMENT */}
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-lg text-foreground">Record Member Payment</h3>
                </div>
                <button
                  onClick={() => setIsRecordModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRecordCashPayment} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="recMember" className="text-xs">
                    Select Member
                  </Label>
                  <select
                    id="recMember"
                    value={recordMemberId}
                    onChange={(e) => setRecordMemberId(e.target.value)}
                    required
                    className="w-full h-9 px-3 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map((m) => {
                      const profileInfo = m.users?.user_profiles?.[0]
                      const name = profileInfo
                        ? `${profileInfo.first_name} ${profileInfo.last_name}`
                        : m.users?.email || 'Member'
                      return (
                        <option key={m.id} value={m.user_id}>
                          Pos #{m.payout_position || '-'}: {name}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="recPeriod" className="text-xs">
                    Select Contribution Period
                  </Label>
                  <select
                    id="recPeriod"
                    value={recordPeriodId}
                    onChange={(e) => setRecordPeriodId(e.target.value)}
                    required
                    className="w-full h-9 px-3 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="">-- Choose Period --</option>
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        Period #{p.period_number} (Due: {p.due_date})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="recAmt" className="text-xs">
                    Amount Paid (₦)
                  </Label>
                  <Input
                    id="recAmt"
                    type="number"
                    value={recordAmountNaira}
                    onChange={(e) => setRecordAmountNaira(e.target.value)}
                    placeholder={`Expected: ${(group.contribution_amount_kobo / 100).toLocaleString()}`}
                    className="h-9 text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leave blank to use full expected amount (₦{(group.contribution_amount_kobo / 100).toLocaleString()})
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="recMethod" className="text-xs">
                    Payment Method
                  </Label>
                  <select
                    id="recMethod"
                    value={recordMethod}
                    onChange={(e) => setRecordMethod(e.target.value)}
                    className="w-full h-9 px-3 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="cash">Direct Cash / In-Hand</option>
                    <option value="bank_transfer">Verified Bank Transfer</option>
                    <option value="pos">POS Terminal</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingRecord}
                    className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {submittingRecord ? 'Recording…' : 'Confirm & Record'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADMIN DISBURSE PAYOUT */}
        {isPayoutModalOpen && payoutPeriod && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-foreground">
                    Confirm Rotational Payout
                  </h3>
                </div>
                <button
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs bg-muted/40 p-4 rounded-xl border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-semibold text-foreground">#{payoutPeriod.period_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled Recipient:</span>
                  <span className="font-bold text-emerald-600">Position #{payoutPeriod.period_number}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-muted-foreground">Total Pool Payout:</span>
                  <span className="text-base font-bold text-blue-600">
                    <CurrencyDisplay amountKobo={poolAmountKobo} size="lg" />
                  </span>
                </div>
              </div>

              <form onSubmit={handleConfirmPayout} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="payoutRef" className="text-xs">
                    Payout Disbursal Reference / Transaction ID
                  </Label>
                  <Input
                    id="payoutRef"
                    value={payoutReference}
                    onChange={(e) => setPayoutReference(e.target.value)}
                    placeholder="e.g. NIBSS-PAYOUT-981240"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingPayout}
                    className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submittingPayout ? 'Confirming…' : 'Confirm Payout Disbursed'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: ADMIN POST ANNOUNCEMENT */}
        {isAnnounceModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-lg text-foreground">Post Circle Announcement</h3>
                </div>
                <button
                  onClick={() => setIsAnnounceModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="annTitle" className="text-xs">
                    Announcement Headline
                  </Label>
                  <Input
                    id="annTitle"
                    value={announceTitle}
                    onChange={(e) => setAnnounceTitle(e.target.value)}
                    placeholder="e.g. Cycle #2 Payout Scheduled for Friday"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="annContent" className="text-xs">
                    Message to Members
                  </Label>
                  <textarea
                    id="annContent"
                    value={announceContent}
                    onChange={(e) => setAnnounceContent(e.target.value)}
                    placeholder="Provide meeting updates, deadline reminders, or congratulatory remarks..."
                    rows={4}
                    className="w-full p-3 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAnnounceModalOpen(false)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingAnnounce}
                    className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {submittingAnnounce ? 'Posting…' : 'Broadcast Announcement'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
