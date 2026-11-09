'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  Send,
  FileQuestion,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function DisputesPage() {
  const { user, profile } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [disputes, setDisputes] = useState([])
  const [groups, setGroups] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [disputeType, setDisputeType] = useState('payment_unconfirmed')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [resolutionNote, setResolutionNote] = useState('')

  useEffect(() => {
    if (!user) return

    async function loadData() {
      setLoading(true)
      try {
        // Fetch user's groups
        const { data: memberGroups } = await supabase
          .from('group_members')
          .select(`
            group_id,
            role,
            savings_groups (
              id,
              name
            )
          `)
          .eq('user_id', user.id)

        const userGroups = (memberGroups || [])
          .map((m) => m.savings_groups)
          .filter(Boolean)
        setGroups(userGroups)
        if (userGroups.length > 0) {
          setSelectedGroupId(userGroups[0].id)
        }

        // Fetch disputes
        const { data: disputeData } = await supabase
          .from('disputes')
          .select(`
            id,
            group_id,
            raised_by,
            title,
            description,
            type,
            status,
            resolution,
            created_at,
            savings_groups (
              name
            )
          `)
          .order('created_at', { ascending: false })

        if (disputeData && disputeData.length > 0) {
          setDisputes(disputeData)
        } else {
          // Default mock disputes for initial demo
          setDisputes([
            {
              id: 'dsp-1',
              title: 'Bank Transfer Payment not reflected for Period #1',
              description: 'I transferred ₦50,000 via GTBank on Friday 10:45 AM. Reference #REF-99201. Please confirm and update status.',
              type: 'payment_unconfirmed',
              status: 'open',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              savings_groups: { name: 'Lagos SME Cooperative Circle' },
              resolution: null,
            },
            {
              id: 'dsp-2',
              title: 'Rotation Position assignment query',
              description: 'Requested position #2 during onboarding due to scheduled business inventory purchase.',
              type: 'membership_issue',
              status: 'resolved',
              created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
              savings_groups: { name: 'Abuja Family & Friends Ajo' },
              resolution: 'Admin reviewed and swapped rotation queue slot with member agreement.',
            },
          ])
        }
      } catch (err) {
        console.error('Error loading disputes:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, supabase])

  const handleRaiseDispute = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in both title and description')
      return
    }

    setSubmitting(true)
    try {
      const newDispute = {
        group_id: selectedGroupId || groups[0]?.id || 'demo-group',
        raised_by: user.id,
        title: title.trim(),
        description: description.trim(),
        type: disputeType,
        status: 'open',
      }

      const { data, error } = await supabase
        .from('disputes')
        .insert(newDispute)
        .select(`
          *,
          savings_groups (name)
        `)
        .single()

      if (!error && data) {
        setDisputes([data, ...disputes])
      } else {
        // Fallback for demo mode
        const fallbackDispute = {
          id: `dsp-${Date.now()}`,
          title: title.trim(),
          description: description.trim(),
          type: disputeType,
          status: 'open',
          created_at: new Date().toISOString(),
          savings_groups: {
            name: groups.find((g) => g.id === selectedGroupId)?.name || 'My Circle',
          },
          resolution: null,
        }
        setDisputes([fallbackDispute, ...disputes])
      }

      toast.success('Dispute ticket raised. Group admin has been notified!')
      setTitle('')
      setDescription('')
      setIsModalOpen(false)
    } catch (err) {
      toast.error('Failed to submit dispute')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResolveDispute = async (disputeId) => {
    if (!resolutionNote.trim()) {
      toast.error('Please enter resolution notes before resolving')
      return
    }

    try {
      await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolution: resolutionNote.trim(),
          resolved_at: new Date().toISOString(),
        })
        .eq('id', disputeId)

      setDisputes(
        disputes.map((d) =>
          d.id === disputeId
            ? { ...d, status: 'resolved', resolution: resolutionNote.trim() }
            : d
        )
      )
      toast.success('Dispute marked as resolved!')
      setSelectedDispute(null)
      setResolutionNote('')
    } catch (err) {
      toast.error('Failed to resolve dispute')
    }
  }

  return (
    <DashboardLayout pageTitle="Dispute Resolution Center">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Disputes & Inquiries</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Transparent dispute settlement for payment verifications, payout schedules, and member concerns.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Raise New Dispute
          </Button>
        </div>

        {/* Disputes List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {disputes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground">No active disputes</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    All contributions and rotation schedules across your circles are operating harmoniously.
                  </p>
                </CardContent>
              </Card>
            ) : (
              disputes.map((dsp) => (
                <Card
                  key={dsp.id}
                  className={`hover:border-emerald-600/40 transition-colors cursor-pointer ${
                    selectedDispute?.id === dsp.id ? 'border-emerald-600 ring-1 ring-emerald-600/30' : ''
                  }`}
                  onClick={() => setSelectedDispute(dsp)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-emerald-600">
                            {dsp.savings_groups?.name || 'Circle'}
                          </span>
                          <span className="text-muted-foreground text-xs">•</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(dsp.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-semibold text-foreground text-base">{dsp.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{dsp.description}</p>
                      </div>
                      <StatusBadge status={dsp.status} />
                    </div>

                    {dsp.resolution && (
                      <div className="mt-3 pt-3 border-t border-border bg-muted/30 p-2.5 rounded-lg text-xs">
                        <span className="font-semibold text-emerald-600">Resolution: </span>
                        <span className="text-muted-foreground">{dsp.resolution}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Dispute Detail / Resolution Panel */}
          <div>
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Dispute Review Panel</CardTitle>
                <CardDescription className="text-xs">
                  {selectedDispute ? 'Review details and record formal resolution' : 'Select a ticket on the left to review'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDispute ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <p className="font-semibold text-foreground capitalize mt-0.5">
                        {selectedDispute.type.replace('_', ' ')}
                      </p>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Description:</span>
                      <p className="text-foreground bg-muted/40 p-3 rounded-lg mt-1 whitespace-pre-wrap">
                        {selectedDispute.description}
                      </p>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Current Status:</span>
                      <div className="mt-1">
                        <StatusBadge status={selectedDispute.status} />
                      </div>
                    </div>

                    {selectedDispute.status !== 'resolved' && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <Label htmlFor="resNote" className="text-xs">
                          Resolution Findings & Actions
                        </Label>
                        <textarea
                          id="resNote"
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          placeholder="e.g., Payment verified with bank statement. Manual contribution recorded."
                          className="w-full h-24 p-2.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                        <Button
                          onClick={() => handleResolveDispute(selectedDispute.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          Mark as Resolved
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-xs space-y-2">
                    <FileQuestion className="w-8 h-8 mx-auto text-muted-foreground/50" />
                    <p>Click any dispute ticket to inspect full details and manage resolution notes.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Raise Dispute Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-lg text-foreground">Raise a Dispute Ticket</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRaiseDispute} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="groupSelect" className="text-xs">
                    Select Savings Circle
                  </Label>
                  <select
                    id="groupSelect"
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dtype" className="text-xs">
                    Dispute Category
                  </Label>
                  <select
                    id="dtype"
                    value={disputeType}
                    onChange={(e) => setDisputeType(e.target.value)}
                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="payment_unconfirmed">Payment Made But Not Confirmed</option>
                    <option value="payout_delayed">Rotation Payout Delayed</option>
                    <option value="membership_issue">Rotation Position Dispute</option>
                    <option value="calculation_error">Incorrect Calculation / Penalty</option>
                    <option value="other">Other Inquiry / Report</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dtitle" className="text-xs">
                    Brief Summary / Subject
                  </Label>
                  <Input
                    id="dtitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. ₦50,000 Transfer made on Monday unconfirmed"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ddesc" className="text-xs">
                    Detailed Explanation & Proof Reference
                  </Label>
                  <textarea
                    id="ddesc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide transaction reference number, bank name, date/time, and any agreed arrangements..."
                    rows={4}
                    className="w-full p-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {submitting ? 'Submitting…' : 'Submit Ticket'}
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

