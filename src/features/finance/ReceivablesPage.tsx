import React, { useState } from 'react'
import { ArrowUpRight, Filter, Download, AlertCircle, Clock } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/formatters'

export const ReceivablesPage: React.FC = () => {
  const { receivables } = useStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [agingFilter, setAgingFilter] = useState<string>('ALL')

  const totalOutstanding = receivables.reduce((acc, r) => acc + r.balanceDueETB, 0)
  const overdueTotal = receivables
    .filter((r) => r.status === 'Overdue')
    .reduce((acc, r) => acc + r.balanceDueETB, 0)

  const filtered = receivables.filter((r) => {
    const matchSearch =
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchAging = agingFilter === 'ALL' || r.agingBucket === agingFilter
    return matchSearch && matchAging
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts Receivable"
        description="Contractor trade credit, aging brackets, and pending collections."
        breadcrumbs={[
          { label: 'Finance & Accounting', href: '/finance' },
          { label: 'Receivables' },
        ]}
        actions={
          <button
            onClick={() => {
              toast({
                title: 'Aging Schedule Exported',
                description: 'Receivables aging schedule exported as PDF summary.',
                type: 'info',
              })
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-border hover:bg-surface-elevated text-foreground transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Export Aging Report</span>
          </button>
        }
      />

      {/* Aging Brackets Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'].map((bucket) => {
          const bucketAmount = receivables
            .filter((r) => r.agingBucket === bucket)
            .reduce((acc, r) => acc + r.balanceDueETB, 0)
          return (
            <div
              key={bucket}
              onClick={() => setAgingFilter(agingFilter === bucket ? 'ALL' : bucket)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                agingFilter === bucket
                  ? 'border-forest bg-forest/10 shadow-subtle dark:shadow-glow'
                  : 'border-border bg-surface/90 backdrop-blur-md hover:border-forest/40 shadow-card'
              }`}
            >
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>{bucket}</span>
                <Clock className="w-3.5 h-3.5 text-forest dark:text-forest-vibrant" />
              </div>
              <div className="text-xl font-bold text-foreground font-mono">
                {formatCurrency(bucketAmount, { compact: true })}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {receivables.filter((r) => r.agingBucket === bucket).length} Invoices
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by customer, invoice #..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-muted-foreground font-semibold">
          Total Due: <span className="text-foreground font-mono font-bold">{formatCurrency(totalOutstanding)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Contractor Customer</th>
                <th className="py-3 px-4">Invoice Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Invoice Total</th>
                <th className="py-3 px-4 text-right">Settled Amount</th>
                <th className="py-3 px-4 text-right">Balance Due (ETB)</th>
                <th className="py-3 px-4 text-center">Aging Bracket</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    {r.invoiceNo}
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground">
                    {r.customerName}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(r.invoiceDate)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(r.dueDate)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground whitespace-nowrap">
                    {formatCurrency(r.totalAmountETB, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatCurrency(r.amountPaidETB, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                    {formatCurrency(r.balanceDueETB, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded bg-muted text-[10px] font-medium text-foreground">
                      {r.agingBucket}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={r.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
