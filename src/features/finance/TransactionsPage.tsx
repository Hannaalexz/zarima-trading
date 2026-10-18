import React, { useState } from 'react'
import { Plus, Filter, Download, ArrowUpDown, Receipt, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { FinancialTransaction, TransactionType } from '@/types'

export const TransactionsPage: React.FC = () => {
  const { transactions, addTransaction, bankAccounts } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states
  const [type, setType] = useState<TransactionType>('Expense')
  const [category, setCategory] = useState('Vehicle Spare Parts')
  const [amountETB, setAmountETB] = useState<number>(45000)
  const [fromAccount, setFromAccount] = useState(bankAccounts[0]?.bankName || '')
  const [paidByMember, setPaidByMember] = useState('Ato Dawit Tadesse (Managing Partner)')
  const [notes, setNotes] = useState('')

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      tx.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.paidByMember && tx.paidByMember.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchType = typeFilter === 'ALL' || tx.type === typeFilter
    return matchSearch && matchType
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amountETB <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Amount must be greater than zero.',
        type: 'error',
      })
      return
    }

    addTransaction({
      referenceNumber:
        type === 'Partner Funded'
          ? `PARTNER-MEM-0${Math.floor(5 + Math.random() * 20)}`
          : `TXN-2026-${Math.floor(1100 + Math.random() * 500)}`,
      date: new Date().toISOString().split('T')[0],
      type,
      category,
      amountETB: Number(amountETB),
      fromAccount: type === 'Partner Funded' ? 'Private Member Account' : fromAccount,
      paidByMember: type === 'Partner Funded' ? paidByMember : undefined,
      status: type === 'Partner Funded' ? 'Pending Reconciliation' : 'Cleared',
      notes: notes || `${category} recorded via treasury ledger`,
    })

    toast({
      title: 'Transaction Recorded',
      description: `Transaction of ${formatCurrency(amountETB)} logged under ${category}.`,
      type: 'success',
    })

    setIsModalOpen(false)
    setNotes('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Journal"
        description="Ledger of sales receipts, supplier payments, and partner outlays."
        breadcrumbs={[
          { label: 'Finance & Accounting', href: '/finance' },
          { label: 'Transactions' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast({
                  title: 'Journal Exported',
                  description: 'Transactions exported for accounting audit.',
                  type: 'info',
                })
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-border hover:bg-surface-elevated text-foreground transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export Ledger</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Transaction</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by ref, category, partner name, notes..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          {['ALL', 'Income', 'Expense', 'Partner Funded', 'Transfer'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                typeFilter === t
                  ? t === 'Partner Funded' || t === 'Expense'
                    ? 'bg-[#FF6B00] text-white shadow-sm'
                    : 'bg-[#060B08] dark:bg-forest text-white shadow-subtle'
                  : 'bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/70 hover:border-[#FF6B00]/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="No journal records match your current filter settings."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Reference #</th>
                  <th className="py-3 px-4">Category &amp; Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Origin / Funding Source</th>
                  <th className="py-3 px-4 text-right">Amount (ETB)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {tx.referenceNumber}
                    </td>
                    <td className="py-3 px-4 max-w-[260px]">
                      <div className="font-semibold text-foreground truncate">
                        {tx.category}
                      </div>
                      {tx.notes && (
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {tx.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
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
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tx.paidByMember ? (
                        <div className="text-forest dark:text-forest-vibrant font-semibold text-xs flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{tx.paidByMember}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">{tx.fromAccount || '—'}</span>
                      )}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
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
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={tx.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Record Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Record Financial Transaction
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Enter financial movement into Zarima's multi-account treasury ledger.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:ring-1 focus:ring-brand-copper font-semibold"
                  >
                    <option value="Expense">Expense (Corporate Account)</option>
                    <option value="Income">Income (Sales / Freight)</option>
                    <option value="Partner Funded">Partner Personally-Funded Expense</option>
                    <option value="Transfer">Inter-Account Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Accounting Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    <option value="Cement Factory Purchase">Cement Factory Purchase</option>
                    <option value="Cement Sales">Cement Sales</option>
                    <option value="Freight Revenue">Freight Revenue</option>
                    <option value="Vehicle Spare Parts">Vehicle Spare Parts</option>
                    <option value="Fleet Fuel &amp; Oil">Fleet Fuel &amp; Oil</option>
                    <option value="Driver Allowances">Driver Allowances</option>
                    <option value="Office &amp; Admin">Office &amp; Admin</option>
                    <option value="Bank Charges &amp; Fees">Bank Charges &amp; Fees</option>
                  </select>
                </div>
              </div>

              {/* Special Partner-Funded Expense Section */}
              {type === 'Partner Funded' && (
                <div className="p-3 rounded-xl bg-forest/10 border border-forest/30 space-y-2">
                  <div className="font-semibold text-forest dark:text-forest-vibrant flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Member Personal Outlay (Reimbursement Ledger)</span>
                  </div>
                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Company Member Who Paid Personally
                    </label>
                    <select
                      value={paidByMember}
                      onChange={(e) => setPaidByMember(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-semibold"
                    >
                      <option value="Ato Dawit Tadesse (Managing Partner)">
                        Ato Dawit Tadesse (Managing Partner)
                      </option>
                      <option value="W/ro Sara Bekele (Co-Founder &amp; Director)">
                        W/ro Sara Bekele (Co-Founder &amp; Director)
                      </option>
                      <option value="Ato Henok Tesfaye (Operations Partner)">
                        Ato Henok Tesfaye (Operations Partner)
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {type !== 'Partner Funded' && (
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Bank Account
                  </label>
                  <select
                    value={fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={`${b.bankName} (${b.branchName})`}>
                        {b.bankName} - {b.branchName} ({b.accountNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Amount in Ethiopian Birr (ETB)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amountETB}
                  onChange={(e) => setAmountETB(Number(e.target.value))}
                  className="w-full p-2.5 bg-surface border border-border rounded-lg text-foreground font-mono font-bold text-sm focus:ring-1 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Transaction Notes &amp; Justification
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="e.g. Emergency spare clutch kit bought directly to avoid truck standstill..."
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-surface-elevated text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white font-extrabold shadow-md shadow-[#FF6B00]/30 hover:scale-105 active:scale-95 transition-all text-xs"
                >
                  Save Transaction Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
