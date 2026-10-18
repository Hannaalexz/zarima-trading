import React, { useState } from 'react'
import { FileBarChart, Calendar, Download, Printer, TrendingUp, Layers, Truck } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { mockMonthlyReport } from '@/data/mock/financeData'
import { useToast } from '@/hooks/useToast'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { useTheme } from '@/hooks/useTheme'

export const ReportsPage: React.FC = () => {
  const { toast } = useToast()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [dateRange, setDateRange] = useState('Month to Date (September 2026)')

  const revenueBreakdown = [
    { name: 'Cement Trading Sales', value: mockMonthlyReport.cementSalesRevenueETB, color: '#22C55E' },
    { name: 'Transport Haulage Freight', value: mockMonthlyReport.transportFreightRevenueETB, color: '#4ADE80' },
  ]

  const expenseBreakdown = [
    { name: 'Factory Cement Purchases', value: mockMonthlyReport.cementPurchaseCostETB, color: '#22C55E' },
    { name: 'Fleet Diesel Fuel', value: mockMonthlyReport.fuelExpensesETB, color: '#4ADE80' },
    { name: 'Vehicle Service & Overhaul', value: mockMonthlyReport.maintenanceCostsETB, color: '#16A34A' },
    { name: 'Staff & Driver Payroll', value: mockMonthlyReport.payrollCostsETB, color: '#86EFAC' },
    { name: 'Partner-Funded Outlays', value: mockMonthlyReport.partnerFundedExpensesETB, color: '#27C865' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Reports &amp; P&amp;L"
        description="Comparative revenue, operating expenses, and EBITDA performance."
        breadcrumbs={[
          { label: 'Finance & Accounting', href: '/finance' },
          { label: 'Reports & P&L' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast({
                  title: 'Print Preview Prepared',
                  description: 'Financial statement generated for executive board review.',
                  type: 'info',
                })
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface/90 border border-border hover:bg-surface-elevated text-foreground transition-colors shadow-subtle"
            >
              <Printer className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={() => {
                toast({
                  title: 'Report Downloaded',
                  description: 'Exported P&L statement in Excel and PDF.',
                  type: 'success',
                })
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export P&amp;L (PDF)</span>
            </button>
          </div>
        }
      />

      {/* Date Range Selector Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border text-xs shadow-card">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-forest dark:text-forest-vibrant" />
          <span className="font-semibold text-foreground">Reporting Period:</span>
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value)
              toast({
                title: 'Period Updated',
                description: `Filtering figures for ${e.target.value}.`,
                type: 'info',
              })
            }}
            className="p-1.5 bg-surface-elevated border border-border rounded-lg text-foreground font-medium focus:ring-1 focus:ring-forest"
          >
            <option value="Month to Date (September 2026)">Month to Date (September 2026)</option>
            <option value="Previous Month (August 2026)">Previous Month (August 2026)</option>
            <option value="Quarter 3 (Q3 2026)">Quarter 3 (Q3 2026)</option>
            <option value="Year to Date (YTD 2026)">Year to Date (YTD 2026)</option>
          </select>
        </div>

        <div className="text-muted-foreground text-[11px] font-mono">
          Currency: Ethiopian Birr (ETB) &bull; Accounting Basis: Accrual
        </div>
      </div>

      {/* Top 3 High-Level Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Gross Revenue
          </span>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            {formatCurrency(mockMonthlyReport.totalRevenueETB)}
          </div>
          <div className="text-xs text-forest dark:text-forest-vibrant font-medium">
            +14.2% vs previous period
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Operating Outlays
          </span>
          <div className="text-2xl font-extrabold text-foreground font-mono">
            {formatCurrency(mockMonthlyReport.totalExpensesETB)}
          </div>
          <div className="text-xs text-muted-foreground">
            Procurement, fuel, fleet repairs &amp; payroll
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Net Operational Profit
          </span>
          <div className="text-2xl font-extrabold text-forest dark:text-forest-vibrant font-mono">
            {formatCurrency(mockMonthlyReport.netProfitETB)}
          </div>
          <div className="text-xs text-forest dark:text-forest-vibrant font-semibold">
            EBITDA Margin: {mockMonthlyReport.ebitdaMargin}%
          </div>
        </div>
      </div>

      {/* P&L Statement Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Formal P&L Statement table */}
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">
              Statement of Profit or Loss ({dateRange})
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
              DEMO DATA
            </span>
          </div>

          <div className="divide-y divide-border/60 text-xs">
            {/* Revenue section */}
            <div className="py-2.5 font-bold text-foreground uppercase tracking-wider text-[11px]">
              Revenue
            </div>
            <div className="py-2 flex justify-between pl-3">
              <span className="text-muted-foreground">Cement Trading Wholesale</span>
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(mockMonthlyReport.cementSalesRevenueETB)}
              </span>
            </div>
            <div className="py-2 flex justify-between pl-3">
              <span className="text-muted-foreground">Transport &amp; Freight Haulage</span>
              <span className="font-mono font-semibold text-foreground">
                {formatCurrency(mockMonthlyReport.transportFreightRevenueETB)}
              </span>
            </div>
            <div className="py-2.5 flex justify-between font-bold text-foreground bg-surface-elevated/60 px-3 rounded">
              <span>Gross Total Revenue</span>
              <span className="font-mono">{formatCurrency(mockMonthlyReport.totalRevenueETB)}</span>
            </div>

            {/* Cost of Sales / Operations */}
            <div className="py-2.5 font-bold text-foreground uppercase tracking-wider text-[11px] pt-4">
              Cost of Sales &amp; Direct Haulage
            </div>
            <div className="py-2 flex justify-between pl-3">
              <span className="text-muted-foreground">Factory Cement Procurement</span>
              <span className="font-mono text-foreground">
                ({formatCurrency(mockMonthlyReport.cementPurchaseCostETB)})
              </span>
            </div>
            <div className="py-2 flex justify-between pl-3">
              <span className="text-muted-foreground">Commercial Diesel &amp; Fuel</span>
              <span className="font-mono text-foreground">
                ({formatCurrency(mockMonthlyReport.fuelExpensesETB)})
              </span>
            </div>
            <div className="py-2 flex justify-between pl-3">
              <span className="text-muted-foreground">Fleet Maintenance &amp; Parts</span>
              <span className="font-mono text-foreground">
                ({formatCurrency(mockMonthlyReport.maintenanceCostsETB)})
              </span>
            </div>

            {/* Operating Overheads */}
            <div className="py-2.5 font-bold text-foreground uppercase tracking-wider text-[11px] pt-4">
              Operational Overheads &amp; Payroll
            </div>
            <div className="py-2 flex justify-between pl-3">
              <span className="text-muted-foreground">Workforce Salaries &amp; Per-Diems</span>
              <span className="font-mono text-foreground">
                ({formatCurrency(mockMonthlyReport.payrollCostsETB)})
              </span>
            </div>
            <div className="py-2 flex justify-between pl-3">
              <span className="text-muted-foreground">Partner-Covered Operational Outlays</span>
              <span className="font-mono text-foreground">
                ({formatCurrency(mockMonthlyReport.partnerFundedExpensesETB)})
              </span>
            </div>

            {/* Net Total */}
            <div className="py-3 flex justify-between font-extrabold text-sm text-forest dark:text-forest-vibrant bg-forest/10 dark:bg-forest-light/15 px-3 rounded mt-2">
              <span>Net Operating Profit</span>
              <span className="font-mono">{formatCurrency(mockMonthlyReport.netProfitETB)}</span>
            </div>
          </div>
        </div>

        {/* Right: Revenue vs Expense Distribution Charts */}
        <div className="space-y-6">
          {/* Revenue Sources Pie Chart */}
          <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card space-y-3">
            <h3 className="text-sm font-bold text-foreground">
              Revenue Contribution Breakdown
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#111D16' : '#FFFFFF',
                      borderColor: isDark ? '#1E3326' : '#E2ECE4',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: isDark ? '#F0F5F1' : '#17251D',
                    }}
                    formatter={(val: any) => [formatCurrency(val), 'Revenue']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Distribution Pie Chart */}
          <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card space-y-3">
            <h3 className="text-sm font-bold text-foreground">
              Operational Cost Composition
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#111D16' : '#FFFFFF',
                      borderColor: isDark ? '#1E3326' : '#E2ECE4',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: isDark ? '#F0F5F1' : '#17251D',
                    }}
                    formatter={(val: any) => [formatCurrency(val), 'Expense']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
