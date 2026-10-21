import React from 'react'
import { Link } from 'react-router-dom'
import {
  Landmark,
  Receipt,
  Scale,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  TrendingUp,
  FileBarChart,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { MetricCard } from '@/components/shared/MetricCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useStore } from '@/data/storeContext'
import { formatCurrency, formatDate } from '@/lib/formatters'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { mockRevenueTrends } from '@/data/mock/financeData'
import { useTheme } from '@/hooks/useTheme'

export const FinanceDashboard: React.FC = () => {
  const { bankAccounts, transactions, receivables, payables } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const totalBankBalance = bankAccounts.reduce((acc, b) => acc + b.balanceETB, 0)
  const totalReceivables = receivables.reduce((acc, r) => acc + r.balanceDueETB, 0)
  const totalPayables = payables.reduce((acc, p) => acc + p.balanceDueETB, 0)

  // Partner funded expenses total
  const totalPartnerFunded = transactions
    .filter((t) => t.type === 'Partner Funded')
    .reduce((acc, t) => acc + t.amountETB, 0)

  const gridColor = isDark ? '#1E3326' : '#E2ECE4'
  const textColor = isDark ? '#8A9E90' : '#5C7265'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance &amp; Treasury"
        description="Consolidated bank liquidity, trade credit, payables, and treasury transactions."
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/finance/banks"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface/90 border border-border hover:bg-surface-elevated text-foreground transition-colors shadow-subtle"
            >
              <Landmark className="w-3.5 h-3.5 text-forest dark:text-forest-vibrant" />
              <span>Reconciliations</span>
            </Link>
            <Link
              to="/finance/transactions"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Transaction</span>
            </Link>
          </div>
        }
      />

      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Consolidated Bank Balances"
          value={formatCurrency(totalBankBalance, { compact: true })}
          subtitle={`${bankAccounts.length} Corporate accounts active`}
          trend={{ value: 9.2 }}
          icon={<Landmark className="w-5 h-5 text-forest dark:text-forest-vibrant" />}
        />
        <MetricCard
          title="Total Receivables (AR)"
          value={formatCurrency(totalReceivables, { compact: true })}
          subtitle="Customer trade credit"
          trend={{ value: 3.5, isPositiveGood: false }}
          icon={<ArrowUpRight className="w-5 h-5 text-forest dark:text-forest-vibrant" />}
        />
        <MetricCard
          title="Total Payables (AP)"
          value={formatCurrency(totalPayables, { compact: true })}
          subtitle="Factory &amp; fuel obligations"
          trend={{ value: -5.1 }}
          icon={<ArrowDownLeft className="w-5 h-5 text-rose-600" />}
        />
        <MetricCard
          title="Partner-Funded Outlays"
          value={formatCurrency(totalPartnerFunded, { compact: true })}
          subtitle="Reimbursement queue"
          trend={{ value: 0 }}
          icon={<ShieldCheck className="w-5 h-5 text-forest dark:text-forest-vibrant" />}
        />
      </div>

      {/* Middle Grid: Corporate Accounts List + Cashflow chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Recharts (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Consolidated Operational Cashflow
              </h3>
              <p className="text-xs text-muted-foreground">
                Monthly trading receipts against procurement and operating obligations
              </p>
            </div>
            <Link
              to="/finance/reports"
              className="text-xs text-forest dark:text-forest-vibrant font-semibold hover:underline"
            >
              Full P&amp;L Report
            </Link>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockRevenueTrends}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111D16' : '#FFFFFF',
                    borderColor: isDark ? '#1E3326' : '#E2ECE4',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#F0F5F1' : '#17251D',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(0,0,0,0.5)'
                      : '0 8px 24px rgba(23, 107, 69, 0.08)',
                  }}
                  formatter={(value: any) => [`${value}M ETB`, '']}
                />
                {/* All Light Green shades - NO white bars, NO dark green */}
                <Bar dataKey="cementRevenue" name="Cement Sales" fill="#22C55E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="transportRevenue" name="Haulage Freight" fill="#4ADE80" radius={[6, 6, 0, 0]} />
                <Bar dataKey="totalExpenses" name="Operating Expenses" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 4 Bank Balances (1 col) */}
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Landmark className="w-4 h-4 text-forest dark:text-forest-vibrant" />
                <span>Primary Bank Accounts</span>
              </h3>
              <Link
                to="/finance/banks"
                className="text-xs text-forest dark:text-forest-vibrant font-semibold hover:underline"
              >
                All 10 Accounts
              </Link>
            </div>

            <div className="space-y-3 mt-3">
              {bankAccounts.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-surface-elevated/70 border border-border/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{b.bankName}</span>
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(b.balanceETB, { compact: true })}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex justify-between">
                    <span>{b.branchName}</span>
                    <span className="font-mono">{b.accountNumber}</span>
                  </div>
                  <div className="text-[10px] text-forest dark:text-forest-vibrant flex items-center gap-1 pt-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Reconciled: {formatDate(b.lastReconciledDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/finance/banks"
            className="w-full py-2 text-center text-xs font-semibold rounded-xl bg-surface-elevated hover:bg-forest/10 dark:hover:bg-forest-light/20 text-forest dark:text-forest-vibrant border border-forest/20 transition-colors block"
          >
            Review Bank Portfolios ({bankAccounts.length})
          </Link>
        </div>
      </div>

      {/* Bottom Row: Recent Financial Transactions */}
      <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">
            Financial Ledger Transactions
          </h3>
          <Link
            to="/finance/transactions"
            className="text-xs text-forest dark:text-forest-vibrant font-semibold hover:underline"
          >
            Open Transaction Journal
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-elevated/70 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Ref #</th>
                <th className="py-2.5 px-4">Transaction Details</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4 text-right">Amount (ETB)</th>
                <th className="py-2.5 px-4 text-center">Reconciliation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-foreground">
                    {tx.referenceNumber}
                  </td>
                  <td className="py-2.5 px-4 max-w-[240px]">
                    <div className="font-medium text-foreground truncate">
                      {tx.notes || tx.category}
                    </div>
                    {tx.paidByMember && (
                      <div className="text-[10px] text-forest dark:text-forest-vibrant font-semibold">
                        Paid by Member: {tx.paidByMember}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                    {tx.category}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tx.type === 'Income'
                          ? 'bg-forest/15 text-forest dark:text-forest-vibrant'
                          : tx.type === 'Expense'
                          ? 'bg-slate-500/10 text-foreground'
                          : tx.type === 'Partner Funded'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td
                    className={`py-2.5 px-4 text-right font-mono font-bold whitespace-nowrap ${
                      tx.type === 'Income'
                        ? 'text-forest dark:text-forest-vibrant'
                        : tx.type === 'Partner Funded'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-foreground'
                    }`}
                  >
                    {tx.type === 'Income' ? '+' : '-'}
                    {formatCurrency(tx.amountETB)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <StatusBadge status={tx.status} size="sm" />
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
