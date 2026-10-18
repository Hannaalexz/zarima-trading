import React, { useState } from 'react'
import { Plus, Filter, Download, ArrowUpDown, Check, Building2, Truck } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatQuantity, formatDate } from '@/lib/formatters'
import { CementPurchase, CementType } from '@/types'

export const PurchasesPage: React.FC = () => {
  const { purchases, addPurchase, suppliers, trucks } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [sortField, setSortField] = useState<'date' | 'amount' | 'qty'>('date')
  const [sortAsc, setSortAsc] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form state
  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || '')
  const [cementType, setCementType] = useState<CementType>('OPC 42.5N')
  const [quantity, setQuantity] = useState<number>(1000)
  const [unitPrice, setUnitPrice] = useState<number>(1280)
  const [factoryOrigin, setFactoryOrigin] = useState('Muger Plant, Oromia')
  const [deliveryStatus, setDeliveryStatus] = useState<CementPurchase['deliveryStatus']>('Pending')
  const [paymentStatus, setPaymentStatus] = useState<CementPurchase['paymentStatus']>('Paid')
  const [assignedTruck, setAssignedTruck] = useState(trucks[0]?.plateNumber || '')

  // Filtering & sorting
  const filtered = purchases
    .filter((p) => {
      const matchesSearch =
        p.purchaseOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.factoryOrigin.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'ALL' || p.deliveryStatus === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        return sortAsc ? -diff : diff
      }
      if (sortField === 'amount') {
        return sortAsc ? a.totalAmountETB - b.totalAmountETB : b.totalAmountETB - a.totalAmountETB
      }
      return sortAsc ? a.quantityQuintals - b.quantityQuintals : b.quantityQuintals - a.quantityQuintals
    })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierName || quantity <= 0 || unitPrice <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please ensure supplier name, quantity, and unit price are valid.',
        type: 'error',
      })
      return
    }

    const matchedSupplier = suppliers.find((s) => s.name === supplierName)

    addPurchase({
      purchaseOrderNo: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: matchedSupplier?.id || 'SUP-001',
      supplierName,
      cementType,
      quantityQuintals: Number(quantity),
      unitPriceETB: Number(unitPrice),
      totalAmountETB: Number(quantity) * Number(unitPrice),
      factoryOrigin,
      deliveryStatus,
      paymentStatus,
      orderDate: new Date().toISOString().split('T')[0],
      assignedTruck: assignedTruck || 'Pending Dispatch',
    })

    toast({
      title: 'Purchase Order Created',
      description: `Order successfully logged for ${quantity} Qtl ${cementType} from ${supplierName}.`,
      type: 'success',
    })

    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factory Purchases"
        description="Procurement contracts and direct factory orders."
        breadcrumbs={[
          { label: 'Cement Trading', href: '/cement' },
          { label: 'Purchases' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast({
                  title: 'Report Exported',
                  description: 'Factory purchase records downloaded as CSV.',
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
              <span>New Purchase Order</span>
            </button>
          </div>
        }
      />

      {/* Control Bar: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by PO, supplier, or plant..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'Received', 'In Transit', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? st === 'In Transit' || st === 'Pending'
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

      {/* Data Table */}
      <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No purchase orders found"
            description="No procurement orders match your filter criteria. Try adjusting the search query."
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
              <thead className="bg-surface-elevated/70 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Supplier / Factory</th>
                  <th className="py-3 px-4">Cement Grade</th>
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
                  <th className="py-3 px-4">Assigned Hauler</th>
                  <th className="py-3 px-4 text-center">Delivery</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((po) => (
                  <tr key={po.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {po.purchaseOrderNo}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(po.orderDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{po.supplierName}</div>
                      <div className="text-[11px] text-muted-foreground">{po.factoryOrigin}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                      {po.cementType}
                    </td>
                    <td className="py-3 px-4 font-mono text-foreground font-semibold">
                      {formatQuantity(po.quantityQuintals, 'Qtl')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                      {formatCurrency(po.totalAmountETB, { hideDecimals: true })}
                      <div className="text-[10px] text-muted-foreground font-normal">
                        @{po.unitPriceETB} ETB/Qtl
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      {po.assignedTruck || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={po.deliveryStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={po.paymentStatus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Purchase Order */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Issue Factory Purchase Order
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Create a simulated cement procurement contract with an Ethiopian manufacturing plant.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Supplier / Factory
                </label>
                <select
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:ring-1 focus:ring-brand-copper"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.plantLocation})
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
                    <option value="OPC 42.5N">OPC 42.5N (High Strength)</option>
                    <option value="PPC 32.5R">PPC 32.5R (Standard)</option>
                    <option value="Bulk Cement">Bulk Cement (Tanker)</option>
                    <option value="Special Sulfate Resistant">Special Sulfate Resistant</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Factory Plant Location
                  </label>
                  <input
                    type="text"
                    value={factoryOrigin}
                    onChange={(e) => setFactoryOrigin(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                    placeholder="e.g. Muger Plant, Oromia"
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
                    Unit Price (ETB / Qtl)
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
                <span className="font-medium text-muted-foreground">Computed Order Total:</span>
                <span className="text-sm font-bold text-foreground font-mono">
                  {formatCurrency(quantity * unitPrice)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Delivery Status
                  </label>
                  <select
                    value={deliveryStatus}
                    onChange={(e) => setDeliveryStatus(e.target.value as any)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    <option value="Pending">Pending Dispatch</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Received">Received in Depot</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    <option value="Paid">Prepaid Bank Transfer</option>
                    <option value="Partial">50% Advance Partial</option>
                    <option value="Credit">Factory Credit Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Assign Transport Hauler (Plate Number)
                </label>
                <select
                  value={assignedTruck}
                  onChange={(e) => setAssignedTruck(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                >
                  <option value="">Awaiting Dispatch</option>
                  {trucks.map((t) => (
                    <option key={t.id} value={t.plateNumber}>
                      {t.plateNumber} — {t.makeModel} (Cap: {t.capacityQuintals} Qtl)
                    </option>
                  ))}
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
                  Issue Purchase Order
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
