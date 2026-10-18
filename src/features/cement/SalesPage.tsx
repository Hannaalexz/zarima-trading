import React, { useState } from 'react'
import { Plus, Filter, Download, ArrowUpDown, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatQuantity, formatDate } from '@/lib/formatters'
import { CementSale, CementType } from '@/types'

export const SalesPage: React.FC = () => {
  const { sales, addSale, customers } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [sortField, setSortField] = useState<'date' | 'amount' | 'qty'>('date')
  const [sortAsc, setSortAsc] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Modal form state
  const [customerName, setCustomerName] = useState(customers[0]?.company || '')
  const [cementType, setCementType] = useState<CementType>('OPC 42.5N')
  const [quantity, setQuantity] = useState<number>(800)
  const [unitPrice, setUnitPrice] = useState<number>(1450)
  const [paymentType, setPaymentType] = useState<CementSale['paymentType']>('Bank Transfer')
  const [paymentStatus, setPaymentStatus] = useState<CementSale['paymentStatus']>('Paid')
  const [deliveryStatus, setDeliveryStatus] = useState<CementSale['deliveryStatus']>('Delivered')
  const [destinationCity, setDestinationCity] = useState('Addis Ababa (Bole)')

  const filtered = sales
    .filter((s) => {
      const matchSearch =
        s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.destinationCity.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus =
        statusFilter === 'ALL' || s.paymentStatus === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
        return sortAsc ? -diff : diff
      }
      if (sortField === 'amount') {
        return sortAsc ? a.totalAmountETB - b.totalAmountETB : b.totalAmountETB - a.totalAmountETB
      }
      return sortAsc ? a.quantityQuintals - b.quantityQuintals : b.quantityQuintals - a.quantityQuintals
    })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || quantity <= 0 || unitPrice <= 0) {
      toast({
        title: 'Validation Failed',
        description: 'Customer, quantity, and unit price must be valid.',
        type: 'error',
      })
      return
    }

    const matchedCust = customers.find((c) => c.company === customerName)

    addSale({
      invoiceNo: `INV-2026-${Math.floor(400 + Math.random() * 500)}`,
      customerId: matchedCust?.id || 'CUST-001',
      customerName,
      cementType,
      quantityQuintals: Number(quantity),
      unitPriceETB: Number(unitPrice),
      totalAmountETB: Number(quantity) * Number(unitPrice),
      paymentType,
      paymentStatus,
      deliveryStatus,
      destinationCity,
      saleDate: new Date().toISOString().split('T')[0],
      dueDate:
        paymentType.includes('Credit')
          ? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
          : undefined,
    })

    toast({
      title: 'Sales Invoice Generated',
      description: `Invoice recorded for ${customerName} (${formatCurrency(quantity * unitPrice)}).`,
      type: 'success',
    })

    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Invoices"
        description="Wholesale contractor orders and credit invoices."
        breadcrumbs={[
          { label: 'Cement Trading', href: '/cement' },
          { label: 'Sales & Invoices' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast({
                  title: 'Sales Exported',
                  description: 'Sales ledger exported to CSV format.',
                  type: 'info',
                })
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border hover:bg-surface-elevated text-foreground transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Sales Invoice</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by invoice, contractor, or destination..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'Paid', 'Outstanding', 'Partial'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? st === 'Outstanding' || st === 'Partial'
                    ? 'bg-[#FF6B00] text-white shadow-sm'
                    : 'bg-[#060B08] dark:bg-forest text-white shadow-subtle'
                  : 'bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/70 hover:border-[#FF6B00]/40'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No sales orders found"
            description="No invoices match your search or filter settings."
            action={{
              label: 'Reset Filters',
              onClick: () => {
                setSearchTerm('')
                setStatusFilter('ALL')
              },
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Sale Date</th>
                  <th className="py-3 px-4">Client Contractor</th>
                  <th className="py-3 px-4">Grade</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-foreground"
                    onClick={() => {
                      setSortField('qty')
                      setSortAsc(!sortAsc)
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Quantity</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer hover:text-foreground"
                    onClick={() => {
                      setSortField('amount')
                      setSortAsc(!sortAsc)
                    }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Total (ETB)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Payment Terms</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-center">Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {sale.invoiceNo}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{sale.customerName}</div>
                      <div className="text-[11px] text-muted-foreground">{sale.destinationCity}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                      {sale.cementType}
                    </td>
                    <td className="py-3 px-4 font-mono text-foreground font-semibold">
                      {formatQuantity(sale.quantityQuintals, 'Qtl')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                      {formatCurrency(sale.totalAmountETB, { hideDecimals: true })}
                      <div className="text-[10px] text-muted-foreground font-normal">
                        @{sale.unitPriceETB} ETB/Qtl
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {sale.paymentType}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={sale.paymentStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={sale.deliveryStatus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Issue Sales Invoice */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Issue Wholesale Sales Invoice
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Record a cement sales transaction for commercial delivery to an Ethiopian client.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Customer / Contractor Company
                </label>
                <select
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:ring-1 focus:ring-brand-copper"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.company}>
                      {c.company} (TIN: {c.tinNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Cement Grade
                  </label>
                  <select
                    value={cementType}
                    onChange={(e) => setCementType(e.target.value as CementType)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:ring-1 focus:ring-brand-copper"
                  >
                    <option value="OPC 42.5N">OPC 42.5N</option>
                    <option value="PPC 32.5R">PPC 32.5R</option>
                    <option value="Bulk Cement">Bulk Cement</option>
                    <option value="Special Sulfate Resistant">Special Sulfate Resistant</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Destination Project / City
                  </label>
                  <input
                    type="text"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                    placeholder="e.g. Addis Ababa (Bole)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Quantity (Quintals)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Selling Price (ETB / Qtl)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-elevated border border-border/80 flex items-center justify-between">
                <span className="font-medium text-muted-foreground">Invoice Grand Total:</span>
                <span className="text-sm font-bold text-foreground font-mono">
                  {formatCurrency(quantity * unitPrice)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Payment Method / Terms
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    <option value="Bank Transfer">Bank Transfer (CBE / Awash)</option>
                    <option value="Cash">Cash on Delivery</option>
                    <option value="Credit 30 Days">Credit (30 Days Net)</option>
                    <option value="Credit 60 Days">Credit (60 Days Net)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Initial Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    <option value="Paid">Fully Settled / Paid</option>
                    <option value="Outstanding">Outstanding Balance</option>
                    <option value="Partial">Partial Deposit Received</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Delivery / Dispatch Status
                </label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value as any)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                >
                  <option value="Dispatched">Dispatched on Hauler</option>
                  <option value="Delivered">Delivered &amp; Signed</option>
                  <option value="Pending">Pending Loading</option>
                </select>
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
                  Generate Invoice
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
