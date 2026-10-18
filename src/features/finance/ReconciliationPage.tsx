import React, { useState } from 'react'
import { Scale, CheckCircle2, AlertTriangle, RefreshCw, FileText } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { BankReconciliation } from '@/types'

export const ReconciliationPage: React.FC = () => {
  const { reconciliations } = useStore()
  const { toast } = useToast()
  const [items, setItems] = useState<BankReconciliation[]>(reconciliations)

  const handleResolveDiscrepancy = (id: string) => {
    setItems((prev) =>
      prev.map((rec) =>
        rec.id === id
          ? {
              ...rec,
              statementBalanceETB: rec.bookBalanceETB,
              differenceETB: 0,
              unreconciledCount: 0,
              status: 'Balanced',
            }
          : rec
      )
    )

    toast({
      title: 'Discrepancy Resolved',
      description: 'Account matched to bank statement and marked Balanced.',
      type: 'success',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Reconciliation"
        description="Balance internal cash ledgers against official bank statements."
        breadcrumbs={[
          { label: 'Finance & Accounting', href: '/finance' },
          { label: 'Reconciliation' },
        ]}
      />

      {/* Reconciliation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Reconciled Accounts
          </div>
          <div className="text-2xl font-bold text-forest dark:text-forest-vibrant font-mono">
            {items.filter((i) => i.status === 'Balanced').length} / {items.length} Balanced
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Zero difference between ledger and statement
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Active Discrepancies
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {items.filter((i) => i.status === 'Discrepancy').length} Variance Pending
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Awash Bank - ETB 84,500 uncredited member expense
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Statement Audit Cycle
          </div>
          <div className="text-2xl font-bold text-forest dark:text-forest-vibrant">
            Bi-Weekly Closing
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Automated sync with electronic statements
          </div>
        </div>
      </div>

      {/* Reconciliation Statement Table */}
      <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Statement Date</th>
                <th className="py-3 px-4">Bank Institution</th>
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4 text-right">Bank Statement Balance</th>
                <th className="py-3 px-4 text-right">Internal Book Balance</th>
                <th className="py-3 px-4 text-right">Variance / Difference</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(rec.statementDate)}
                  </td>
                  <td className="py-3 px-4 font-bold text-foreground">
                    {rec.bankName}
                  </td>
                  <td className="py-3 px-4 font-mono text-muted-foreground">
                    {rec.accountNumber}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                    {formatCurrency(rec.statementBalanceETB)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                    {formatCurrency(rec.bookBalanceETB)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                      rec.differenceETB !== 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-forest dark:text-forest-vibrant'
                    }`}
                  >
                    {formatCurrency(rec.differenceETB)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={rec.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    {rec.status === 'Discrepancy' ? (
                      <button
                        onClick={() => handleResolveDiscrepancy(rec.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors"
                      >
                        Match &amp; Balance
                      </button>
                    ) : (
                      <span className="text-[11px] text-forest dark:text-forest-vibrant font-medium flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                      </span>
                    )}
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
