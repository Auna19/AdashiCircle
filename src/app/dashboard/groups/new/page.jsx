'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Users, Calendar, DollarSign, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createGroupSchema } from '@/lib/validations'
import { generateSlug, generateInvitationCode } from '@/lib/utils'
import { generateContributionPeriods } from '@/lib/utils/dates'

export default function CreateGroupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'General Savings',
      groupType: 'rotational',
      contributionAmountNaira: 10000,
      frequency: 'monthly',
      maxMembers: 12,
      startDate: new Date().toISOString().split('T')[0],
      firstContributionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      privacy: 'invite_only',
      latePenaltyNaira: 0,
      gracePeriodDays: 3,
      allowPartial: false,
      requireEvidence: true,
      rulesText: 'All contributions must be paid on or before the due date. Payouts are made according to the agreed rotational positions.',
    },
  })

  async function onSubmit(data) {
    if (!user) {
      toast.error('You must be signed in to create a group')
      return
    }

    setServerError(null)

    try {
      const slug = `${generateSlug(data.name)}-${Math.floor(1000 + Math.random() * 9000)}`
      const invitationCode = generateInvitationCode(8)
      const contributionAmountKobo = Math.round(data.contributionAmountNaira * 100)
      const latePenaltyKobo = Math.round((data.latePenaltyNaira || 0) * 100)

      // 1. Create Savings Group
      const { data: newGroup, error: groupErr } = await supabase
        .from('savings_groups')
        .insert({
          name: data.name,
          slug,
          description: data.description,
          category: data.category,
          group_type: data.groupType,
          status: 'active',
          privacy: data.privacy,
          created_by: user.id,
          contribution_amount_kobo: contributionAmountKobo,
          frequency: data.frequency,
          custom_frequency_days: data.customFrequencyDays || null,
          max_members: data.maxMembers,
          current_members: 1,
          start_date: data.startDate,
          first_contribution_date: data.firstContributionDate,
          invitation_code: invitationCode,
          invitation_link_active: true,
        })
        .select()
        .single()

      if (groupErr) {
        throw new Error(groupErr.message)
      }

      // 2. Add creator as admin member (position 1 by default)
      const { data: memberRecord, error: memberErr } = await supabase
        .from('group_members')
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
          role: 'admin',
          status: 'active',
          payout_position: 1,
        })
        .select()
        .single()

      if (memberErr) {
        console.error('Error adding admin member:', memberErr)
      }

      // 3. Create Group Rules
      await supabase.from('group_rules').insert({
        group_id: newGroup.id,
        rules_text: data.rulesText || '',
        late_penalty_kobo: latePenaltyKobo,
        grace_period_days: data.gracePeriodDays,
        allow_partial: data.allowPartial,
        require_evidence: data.requireEvidence,
      })

      // 4. Generate Initial Contribution Periods
      const periods = generateContributionPeriods(
        data.firstContributionDate,
        data.frequency,
        data.maxMembers,
        data.customFrequencyDays
      )

      if (periods.length > 0) {
        const periodInserts = periods.map((p) => ({
          group_id: newGroup.id,
          period_number: p.period_number,
          start_date: p.start_date,
          end_date: p.end_date,
          due_date: p.due_date,
          status: p.status,
        }))

        await supabase.from('contribution_periods').insert(periodInserts)
      }

      toast.success('Savings circle created successfully!')
      router.push(`/dashboard/groups`)
      router.refresh()
    } catch (err) {
      console.error('Failed to create group:', err)
      setServerError(err.message || 'Failed to create group')
    }
  }

  return (
    <DashboardLayout pageTitle="Create Savings Circle">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/groups"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to my groups
          </Link>
          <h2 className="text-2xl font-bold text-foreground">Create a Savings Circle</h2>
          <p className="text-sm text-muted-foreground">
            Configure your group&apos;s contribution rules, payout cycle, and member capacity.
          </p>
        </div>

        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Circle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Circle Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Lagos Techies Monthly Ajo"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Short purpose or goal for this savings group"
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="groupType">Savings Model</Label>
                  <select
                    id="groupType"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    {...register('groupType')}
                  >
                    <option value="rotational">Rotational (Traditional Adashi/Ajo)</option>
                    <option value="target">Target Savings (Shared Goal)</option>
                    <option value="fixed_term">Fixed-Term Cooperative</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    {...register('category')}
                  >
                    <option value="Family Savings">Family & Friends</option>
                    <option value="Workplace Cooperative">Workplace / Office</option>
                    <option value="Market Traders">Market Traders</option>
                    <option value="Community Association">Community Association</option>
                    <option value="General Savings">General Savings</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contribution & Schedule */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Contribution & Rotation Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contributionAmountNaira">Contribution Amount (₦) *</Label>
                  <Input
                    id="contributionAmountNaira"
                    type="number"
                    min="100"
                    step="100"
                    placeholder="10000"
                    {...register('contributionAmountNaira', { valueAsNumber: true })}
                  />
                  {errors.contributionAmountNaira && (
                    <p className="text-xs text-red-500">{errors.contributionAmountNaira.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="frequency">Contribution Frequency</Label>
                  <select
                    id="frequency"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    {...register('frequency')}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="maxMembers">Maximum Number of Members</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    min="2"
                    max="100"
                    {...register('maxMembers', { valueAsNumber: true })}
                  />
                  {errors.maxMembers && (
                    <p className="text-xs text-red-500">{errors.maxMembers.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="firstContributionDate">First Contribution Deadline</Label>
                  <Input
                    id="firstContributionDate"
                    type="date"
                    {...register('firstContributionDate')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Governance & Rules */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Group Governance & Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="rulesText">Custom Circle Agreement & Rules</Label>
                <textarea
                  id="rulesText"
                  rows={3}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  placeholder="State guidelines on late payments, payment proofs, and payout order..."
                  {...register('rulesText')}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="requireEvidence"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  {...register('requireEvidence')}
                />
                <Label htmlFor="requireEvidence" className="text-xs font-normal cursor-pointer">
                  Require members to upload payment receipt/evidence for each contribution
                </Label>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Savings Circle…
              </>
            ) : (
              'Create & Launch Circle'
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  )
}

