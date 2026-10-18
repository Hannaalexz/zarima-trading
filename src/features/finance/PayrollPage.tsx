import React, { useState } from 'react'
import { Wallet, CheckCircle2, Download, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency } from '@/lib/formatters'

export const PayrollPage: React.FC = () => {
  const { payroll } = useStore()
  const { toast } = useToast()
  const [payrollList, setPayrollList] = useState(payroll)

  const totalNetPay = payrollList.reduce((acc, p) => acc + p.netPayETB, 0)
  const totalPerDiem = payrollList.reduce((acc, p) => acc + p.perDiemETB, 0)
  const totalBasic = payrollList.reduce((acc, p) => acc + p.basicSalaryETB, 0)

  const handleDisburseAll = () => {
    setPayrollList((prev) =>
      prev.map((item) => ({ ...item, paymentStatus: 'Paid' }))
    )
    toast({
      title: 'Payroll Disbursed via CBE Direct Transfer',
      description: `Disbursed ${formatCurrency(totalNetPay)} to ${payrollList.length} staff accounts.`,
      type: 'success',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Payroll"
        description="Monthly employee compensation, road allowances, and electronic disbursements."
        breadcrumbs={[
          { label: 'Finance & Accounting', href: '/finance' },
          { label: 'Staff Payroll' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast({
                  title: 'Payroll Report Exported',
                  description: 'Payroll tax and salary slip file exported for CBE bulk upload.',
                  type: 'info',
                })
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-border hover:bg-surface-elevated text-foreground transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export Bank Batch</span>
            </button>
            <button
              onClick={handleDisburseAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Disburse Batch</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Total Monthly Net Payroll
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatCurrency(totalNetPay)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total take-home pay for current cycle
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Driver Road Per-Diems
          </div>
          <div className="text-2xl font-bold text-forest dark:text-forest-vibrant font-mono">
            {formatCurrency(totalPerDiem)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Haulage distance allowance bonuses
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Base Monthly Salaries
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatCurrency(totalBasic)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Zarima Trading core operational workforce
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-elevated/70 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Employee Full Name</th>
                <th className="py-3 px-4">Designation / Role</th>
                <th className="py-3 px-4 text-right">Basic Salary</th>
                <th className="py-3 px-4 text-right">Trip Per-Diem</th>
                <th className="py-3 px-4 text-right">Deductions (Tax &amp; Pension)</th>
                <th className="py-3 px-4 text-right">Net Payable (ETB)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {payrollList.map((p) => (
                <tr key={p.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {p.month}
                  </td>
                  <td className="py-3 px-4 font-bold text-foreground whitespace-nowrap">
                    {p.employeeName}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {p.role}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-foreground">
                    {formatCurrency(p.basicSalaryETB, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-forest dark:text-forest-vibrant font-semibold">
                    {formatCurrency(p.perDiemETB, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                    -{formatCurrency(p.deductionsETB, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                    {formatCurrency(p.netPayETB, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={p.paymentStatus} size="sm" />
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
