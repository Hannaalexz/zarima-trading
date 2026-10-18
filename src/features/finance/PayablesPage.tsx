import React, { useState } from 'react'
import { ArrowDownLeft, Filter, Download, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/formatters'

export const PayablesPage: React.FC = () => {
  const { payables } = useStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [payablesList, setPayablesList] = useState(payables)

  const totalPayables = payablesList.reduce((acc, p) => acc + p.balanceDueETB, 0)

  const handleApprove = (id: string) => {
    setPayablesList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Approved for Payment' } : item
      )
    )
    toast({
      title: 'Bill Approved for Disbursement',
      description: 'Vendor bill scheduled for CBE bank transfer.',
      type: 'success',
    })
  }

  const filtered = payablesList.filter(
    (p) =>
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts Payable"
        description="Factory supply bills, fuel depot allocations, and automotive parts liabilities."
        breadcrumbs={[
          { label: 'Finance & Accounting', href: '/finance' },
          { label: 'Payables' },
        ]}
        actions={
          <button
            onClick={() => {
              toast({
                title: 'Payables Exported',
                description: 'Supplier payables list exported for treasury approval.',
                type: 'info',
              })
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-border hover:bg-surface-elevated text-foreground transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Export Payables</span>
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by supplier, bill #, category..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-muted-foreground font-semibold">
          Total Commitments: <span className="text-foreground font-mono font-bold">{formatCurrency(totalPayables)}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-elevated/70 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Bill #</th>
                <th className="py-3 px-4">Supplier / Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Bill Date</th>
                <th className="py-3 px-4">Payment Due</th>
                <th className="py-3 px-4 text-right">Total (ETB)</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    {p.billNo}
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground">
                    {p.supplierName}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {p.category}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(p.billDate)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(p.dueDate)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground whitespace-nowrap">
                    {formatCurrency(p.totalAmountETB, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                    {formatCurrency(p.balanceDueETB, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.status === 'Pending' ? (
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-forest/10 hover:bg-forest/20 text-forest dark:text-forest-vibrant transition-colors"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-[11px] text-forest dark:text-forest-vibrant font-medium">
                        Approved
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
