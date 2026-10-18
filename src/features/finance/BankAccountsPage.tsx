import React from 'react'
import { Landmark, CheckCircle2, AlertCircle, RefreshCw, ArrowUpRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Link } from 'react-router-dom'

export const BankAccountsPage: React.FC = () => {
  const { bankAccounts } = useStore()
  const { toast } = useToast()

  const totalLiquidity = bankAccounts.reduce((acc, b) => acc + b.balanceETB, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Portfolios"
        description="Treasury oversight across 10 corporate banking accounts."
        breadcrumbs={[
          { label: 'Finance & Accounting', href: '/finance' },
          { label: 'Bank Accounts' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/finance/reconciliation"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Perform Reconciliation</span>
            </Link>
          </div>
        }
      />

      {/* Aggregate Liquidity Card */}
      <div className="p-5 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Consolidated Treasury Liquidity (10 Accounts)
          </span>
          <div className="text-3xl font-extrabold text-foreground font-mono mt-1">
            {formatCurrency(totalLiquidity)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Reconciled against internal general ledger records
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-forest/10 text-forest dark:bg-forest-light/20 dark:text-forest-vibrant flex items-center gap-2">
            <Landmark className="w-5 h-5" />
            <div className="text-xs">
              <span className="font-bold block">10 / 10 Accounts Active</span>
              <span className="text-muted-foreground">Daily statement sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 10 Bank Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bankAccounts.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card hover:border-forest/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-forest/10 text-forest dark:bg-forest-light/20 dark:text-forest-vibrant flex-shrink-0">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground leading-tight">
                      {b.bankName}
                    </h3>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {b.branchName}
                    </div>
                  </div>
                </div>
                <StatusBadge status={b.status} size="sm" />
              </div>

              <div className="my-3 p-3 rounded-xl bg-surface-elevated/70 border border-border/80 space-y-1.5 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Available Balance:</span>
                  <span className="text-base font-bold text-foreground font-mono">
                    {formatCurrency(b.balanceETB)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <span>Account Number:</span>
                  <span className="font-mono font-medium text-foreground">{b.accountNumber}</span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Classification:</span>
                  <span className="font-medium text-foreground">{b.accountType}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest dark:text-forest-vibrant" />
                <span>Reconciled: {formatDate(b.lastReconciledDate)}</span>
              </span>

              <Link
                to="/finance/reconciliation"
                className="text-forest dark:text-forest-vibrant font-semibold hover:underline inline-flex items-center gap-0.5 text-xs"
              >
                <span>Reconcile</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
