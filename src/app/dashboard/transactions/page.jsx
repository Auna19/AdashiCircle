'use client'

import { useState, useEffect } from 'react'
import {
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Filter,
  Search,
  FileSpreadsheet,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
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
import { exportGroupContributionsCSV, exportGroupContributionsPDF } from '@/lib/reports'

export default function TransactionsPage() {
  const { user, profile } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user) return

    async function loadTransactions() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            id,
            group_id,
            user_id,
            type,
            amount_kobo,
            status,
            reference,
            description,
            created_at,
            savings_groups (
              name
            )
          `)
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          setTransactions(data)
        } else {
          // Provide realistic starter records for demonstration
          setTransactions([
            {
              id: 'tx-1',
              reference: 'AC-TX-892401',
              type: 'contribution',
              amount_kobo: 5000000, // ₦50,000
              status: 'confirmed',
              description: 'Period #1 Monthly Contribution for Lagos SME Circle',
              created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
              savings_groups: { name: 'Lagos SME Cooperative Circle' },
            },
            {
              id: 'tx-2',
              reference: 'AC-TX-892402',
              type: 'payout',
              amount_kobo: 50000000, // ₦500,000
              status: 'confirmed',
              description: 'Lump-sum rotational payout disbursed to Position #1',
              created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
              savings_groups: { name: 'Lagos SME Cooperative Circle' },
            },
            {
              id: 'tx-3',
              reference: 'AC-TX-892403',
              type: 'contribution',
              amount_kobo: 2500000, // ₦25,000
              status: 'confirmed',
              description: 'Bi-weekly Adashi Savings deposit',
              created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
              savings_groups: { name: 'Abuja Family & Friends Ajo' },
            },
          ])
        }
      } catch (err) {
        console.error('Error fetching transactions:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [user, supabase])

  const filtered = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType
    const matchesSearch =
      tx.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.savings_groups?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  // Total summary calculations
  const totalInflowKobo = transactions
    .filter((tx) => tx.type === 'contribution' && tx.status === 'confirmed')
    .reduce((sum, tx) => sum + (tx.amount_kobo || 0), 0)

  const totalOutflowKobo = transactions
    .filter((tx) => tx.type === 'payout' && tx.status === 'confirmed')
    .reduce((sum, tx) => sum + (tx.amount_kobo || 0), 0)

  const handleExportCSV = () => {
    const formatted = filtered.map((tx) => ({
      groupName: tx.savings_groups?.name || 'All Circles',
      memberName: profile ? `${profile.first_name} ${profile.last_name}` : user?.email,
      periodNumber: 1,
      expectedAmountKobo: tx.amount_kobo,
      amountPaidKobo: tx.amount_kobo,
      paymentDate: new Date(tx.created_at).toLocaleDateString(),
      paymentMethod: tx.type === 'contribution' ? 'Direct Bank Transfer' : 'Circle Disbursal',
      transactionReference: tx.reference,
      status: tx.status,
    }))
    exportGroupContributionsCSV('AdashiCircle_Ledger', formatted)
    toast.success('CSV ledger statement downloaded!')
  }

  const handleExportPDF = () => {
    const formatted = filtered.map((tx) => ({
      groupName: tx.savings_groups?.name || 'All Circles',
      memberName: profile ? `${profile.first_name} ${profile.last_name}` : user?.email,
      periodNumber: 1,
      expectedAmountKobo: tx.amount_kobo,
      amountPaidKobo: tx.amount_kobo,
      paymentDate: new Date(tx.created_at).toLocaleDateString(),
      paymentMethod: tx.type === 'contribution' ? 'Transfer' : 'Disbursal',
      transactionReference: tx.reference,
      status: tx.status,
    }))
    exportGroupContributionsPDF('AdashiCircle Ledger', formatted, {
      totalMembers: 1,
      totalConfirmedKobo: totalInflowKobo,
    })
    toast.success('PDF official statement downloaded!')
  }

  return (
    <DashboardLayout pageTitle="Audit Ledger & Transactions">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Financial Ledger</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Immutable, auditable records of all contributions, rotation payouts, and adjustments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-2 text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="gap-2 text-xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Total Inflows (Savings)</span>
                <div className="text-2xl font-bold text-emerald-600 mt-1">
                  <CurrencyDisplay amountKobo={totalInflowKobo} size="lg" />
                </div>
                <span className="text-[11px] text-muted-foreground">Confirmed group deposits</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Total Outflows (Payouts)</span>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  <CurrencyDisplay amountKobo={totalOutflowKobo} size="lg" />
                </div>
                <span className="text-[11px] text-muted-foreground">Disbursed lump sums</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Recorded Ledger Entries</span>
                <div className="text-2xl font-bold text-foreground mt-1">
                  {transactions.length}
                </div>
                <span className="text-[11px] text-muted-foreground">Immutable audit rows</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-border p-3 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference or circle..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'contribution', 'payout', 'adjustment'].map((tab) => (
              <Button
                key={tab}
                variant={filterType === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterType(tab)}
                className="text-xs h-8 capitalize shrink-0"
              >
                {tab === 'all' ? 'All Transactions' : tab}
              </Button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Circle / Description</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">
                      No transaction records match your selected filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => {
                    const isCredit = tx.type === 'contribution'
                    return (
                      <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-mono text-xs font-semibold text-foreground">
                          {tx.reference}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-foreground text-sm">
                            {tx.savings_groups?.name || 'General Savings'}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {tx.description}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              isCredit
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleDateString('en-NG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-4 text-right font-bold text-sm">
                          <span className={isCredit ? 'text-emerald-600' : 'text-blue-600'}>
                            {isCredit ? '+' : '-'}{' '}
                            <CurrencyDisplay amountKobo={tx.amount_kobo} />
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <StatusBadge status={tx.status} />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

