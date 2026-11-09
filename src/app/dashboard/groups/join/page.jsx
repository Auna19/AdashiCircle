'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function JoinGroupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [invitationCode, setInvitationCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleJoin(e) {
    e.preventDefault()
    if (!invitationCode.trim()) {
      setError('Please enter a valid invitation code.')
      return
    }

    if (!user) {
      toast.error('Please sign in to join a group.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const code = invitationCode.trim().toUpperCase()

      // Find group by invitation code
      const { data: group, error: groupErr } = await supabase
        .from('savings_groups')
        .select('*')
        .eq('invitation_code', code)
        .maybeSingle()

      if (groupErr || !group) {
        setError('No active savings circle found with this invitation code.')
        setSubmitting(false)
        return
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id, status')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingMember) {
        toast.info('You are already a member of this circle!')
        router.push(`/dashboard/groups/${group.id}`)
        return
      }

      // Check max members
      if (group.current_members >= group.max_members) {
        setError('This circle has already reached its maximum member capacity.')
        setSubmitting(false)
        return
      }

      // Next payout position
      const nextPosition = (group.current_members || 1) + 1

      // Insert new member
      const { error: joinErr } = await supabase.from('group_members').insert({
        group_id: group.id,
        user_id: user.id,
        role: 'member',
        status: 'active',
        payout_position: nextPosition,
      })

      if (joinErr) {
        throw new Error(joinErr.message)
      }

      toast.success(`You have joined "${group.name}"!`)
      router.push(`/dashboard/groups`)
    } catch (err) {
      console.error('Error joining group:', err)
      setError(err.message || 'Failed to join group')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout pageTitle="Join Savings Circle">
      <div className="max-w-md mx-auto space-y-6 pt-6">
        <div>
          <Link
            href="/dashboard/groups"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to my groups
          </Link>
          <h2 className="text-2xl font-bold text-foreground">Join with Invitation Code</h2>
          <p className="text-sm text-muted-foreground">
            Enter the unique 8-character invitation code shared by your group organizer.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              Invitation Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">Circle Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. 7K9X2B4P"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  className="font-mono text-center tracking-widest text-lg h-12 uppercase"
                  maxLength={12}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying & Joining…
                  </>
                ) : (
                  'Join Circle'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

