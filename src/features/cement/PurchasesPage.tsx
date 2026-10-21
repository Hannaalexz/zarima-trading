import React, { useState } from 'react'
import { Plus, Filter, Download, ArrowUpDown, Building2, Truck, CheckCircle2, Boxes, ShieldCheck, Eye } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { useStore } from '@/data/storeContext'
import { useAuth } from '@/data/authContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatQuantity, formatDate } from '@/lib/formatters'
import { CementPurchase, CementType } from '@/types'
import { InvoiceDetailModal } from './InvoiceDetailModal'

const WAREHOUSE_DEPOTS = [
  'Addis Ababa Central Depot (Kality)',
]

export const PurchasesPage: React.FC = () => {
  const { purchases, addPurchase, suppliers, trucks, inventory } = useStore()
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL')
  const [sortField, setSortField] = useState<'date' | 'amount' | 'qty'>('date')
  const [sortAsc, setSortAsc] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPurchaseForDetail, setSelectedPurchaseForDetail] = useState<CementPurchase | null>(null)

  // Form state for New Purchases Invoice
  const [invoiceNo, setInvoiceNo] = useState('')
  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || '')
  const [cementType, setCementType] = useState<CementType>('OPC 42.5N')
  const [warehouseLocation, setWarehouseLocation] = useState(WAREHOUSE_DEPOTS[0])
  const [quantity, setQuantity] = useState<number>(1000)
  const [unitPrice, setUnitPrice] = useState<number>(1280)
  const [factoryOrigin, setFactoryOrigin] = useState('Muger Plant, Oromia')
  const [paymentStatus, setPaymentStatus] = useState<CementPurchase['paymentStatus']>('Paid')
  const [assignedTruck, setAssignedTruck] = useState(trucks[0]?.plateNumber || '')
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  // Filtering & sorting
  const filtered = purchases
    .filter((p) => {
      const invNum = p.purchaseInvoiceNo || p.purchaseOrderNo
      const matchesSearch =
        invNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.factoryOrigin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.warehouseLocation && p.warehouseLocation.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesWarehouse =
        warehouseFilter === 'ALL' ||
        (p.warehouseLocation && p.warehouseLocation === warehouseFilter) ||
        (!p.warehouseLocation && warehouseFilter === WAREHOUSE_DEPOTS[0])
      return matchesSearch && matchesWarehouse
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.receivedDate || a.orderDate).getTime()
        const dateB = new Date(b.receivedDate || b.orderDate).getTime()
        return sortAsc ? dateA - dateB : dateB - dateA
      }
      if (sortField === 'amount') {
        return sortAsc ? a.totalAmountETB - b.totalAmountETB : b.totalAmountETB - a.totalAmountETB
      }
      return sortAsc ? a.quantityQuintals - b.quantityQuintals : b.quantityQuintals - a.quantityQuintals
    })

  const openNewInvoiceModal = () => {
    setInvoiceNo(`PI-2026-${Math.floor(100 + Math.random() * 900)}`)
    setReceivedDate(new Date().toISOString().split('T')[0])
    setNotes('Landed stock verified by depot warehouseman. Quality certificates archived.')
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierName || quantity <= 0 || unitPrice <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please ensure supplier name, received quantity, and unit price are valid.',
        type: 'error',
      })
      return
    }

    const matchedSupplier = suppliers.find((s) => s.name === supplierName)
    const finalInvoiceNo = invoiceNo.trim() || `PI-2026-${Math.floor(100 + Math.random() * 900)}`

    addPurchase({
      purchaseInvoiceNo: finalInvoiceNo,
      purchaseOrderNo: finalInvoiceNo,
      supplierId: matchedSupplier?.id || 'SUP-001',
      supplierName,
      cementType,
      quantityQuintals: Number(quantity),
      unitPriceETB: Number(unitPrice),
      totalAmountETB: Number(quantity) * Number(unitPrice),
      factoryOrigin,
      warehouseLocation,
      deliveryStatus: 'Received', // purchases invoice is created when stock reaches inventory
      paymentStatus,
      orderDate: receivedDate,
      receivedDate,
      assignedTruck: assignedTruck || 'Depot Offloaded',
      notes,
    })

    toast({
      title: 'Purchases Invoice Logged & Stock Added',
      description: `Invoice ${finalInvoiceNo} logged: ${quantity} Qtl ${cementType} received and added into ${warehouseLocation} inventory.`,
      type: 'success',
    })

    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchases Invoices"
        description="Recorded commercial purchase invoices for cement received and physically added to depot inventory."
        breadcrumbs={[
          { label: 'Cement Trading', href: '/cement' },
          { label: 'Purchases Invoices' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast({
                  title: 'Purchases Invoices Exported',
                  description: 'Purchases invoice ledger exported to CSV format.',
                  type: 'info',
                })
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border hover:bg-surface-elevated text-foreground transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={openNewInvoiceModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Purchases Invoice</span>
            </button>
          </div>
        }
      />

      {/* Active Persona & Operating Invariant Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#22C55E]/15 via-surface to-transparent border border-[#22C55E]/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#22C55E]/20 text-[#16A34A] dark:text-[#22C55E] flex items-center justify-center font-black text-xs">
            {currentUser?.avatarInitials || 'BT'}
          </div>
          <div>
            <span className="font-bold text-foreground">
              {currentUser?.role === 'accountant' ? 'Invoicing Desk: Bethlehem Tefera' : 'Administrator: Dawit Tadesse'}
            </span>
            <span className="text-muted-foreground ml-2">
              Purchases Invoices are cut when cement physically arrives at the depot and automatically increments warehouse inventory.
            </span>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#16A34A] dark:text-[#22C55E] border border-[#22C55E]/30 flex-shrink-0">
          Stock Influx Active
        </span>
      </div>

      {/* Control Bar: Search & Warehouse Depot Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by invoice #, supplier, or depot warehouse..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1">
            <Boxes className="w-3.5 h-3.5" /> Depot:
          </span>
          <button
            onClick={() => setWarehouseFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              warehouseFilter === 'ALL'
                ? 'bg-[#060B08] dark:bg-forest text-white shadow-subtle'
                : 'bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/70'
            }`}
          >
            All Depots
          </button>
          {WAREHOUSE_DEPOTS.map((depot) => {
            const shortName = depot.split(' (')[0].replace('Distribution Yard', 'Adama').replace('Transit Store', 'Mojo').replace('Hub Depot', 'Hawassa')
            return (
              <button
                key={depot}
                onClick={() => setWarehouseFilter(depot)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  warehouseFilter === depot
                    ? 'bg-[#060B08] dark:bg-forest text-white shadow-subtle'
                    : 'bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/70'
                }`}
              >
                {shortName}
              </button>
            )
          })}
        </div>
      </div>

      {/* Purchases Invoices Table */}
      <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No purchases invoices found"
            description="No purchase invoice records match your search or depot filter."
            action={{
              label: 'Reset Filters',
              onClick: () => {
                setSearchTerm('')
                setWarehouseFilter('ALL')
              },
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-elevated/70 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Received Date</th>
                  <th className="py-3 px-4">Supplier & Plant</th>
                  <th className="py-3 px-4">Depot Warehouse</th>
                  <th className="py-3 px-4">Cement Grade</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-foreground"
                    onClick={() => {
                      setSortField('qty')
                      setSortAsc(!sortAsc)
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Received Qty</span>
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
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-center">Inventory Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((pi) => {
                  const invoiceDisplay = pi.purchaseInvoiceNo || pi.purchaseOrderNo
                  const warehouseDisplay = pi.warehouseLocation || 'Addis Ababa Central Depot (Kality)'
                  return (
                    <tr
                      key={pi.id}
                      onClick={() => setSelectedPurchaseForDetail(pi)}
                      className="hover:bg-surface-elevated/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-forest dark:text-forest-vibrant">#</span>
                          <span>{invoiceDisplay}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(pi.receivedDate || pi.orderDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground group-hover:text-forest transition-colors">{pi.supplierName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-muted-foreground/70" />
                          <span>{pi.factoryOrigin}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-forest/10 text-forest dark:text-forest-vibrant font-medium text-[11px] border border-forest/20 whitespace-nowrap">
                          <Boxes className="w-3 h-3" />
                          <span>{warehouseDisplay}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                        {pi.cementType}
                      </td>
                      <td className="py-3 px-4 font-mono text-foreground font-semibold">
                        {formatQuantity(pi.quantityQuintals, 'Qtl')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        {formatCurrency(pi.totalAmountETB, { hideDecimals: true })}
                        <div className="text-[10px] text-muted-foreground font-normal">
                          @{pi.unitPriceETB} ETB/Qtl
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={pi.paymentStatus} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Received in Inventory</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPurchaseForDetail(pi)
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border group-hover:bg-forest/10 group-hover:border-forest/40 group-hover:text-forest transition-colors text-xs font-semibold text-foreground shadow-sm"
                          title="View & Edit Purchases Tax Invoice"
                        >
                          <Eye className="w-3.5 h-3.5 text-forest dark:text-forest-vibrant" />
                          <span>View / Edit Detail</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Record Purchases Invoice (Cement Received into Inventory) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border/80 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-forest dark:text-forest-vibrant" />
                  <span>Record Purchases Invoice (Cement Received)</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Logged when cement arrives at the warehouse. Saving updates physical depot stock.
                </p>
              </div>
            </div>

            {/* Live Inventory Banner */}
            <div className="mb-4 p-3 rounded-xl bg-forest/10 border border-forest/25 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-forest dark:text-forest-vibrant mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-foreground">
                  Automatic Warehouse Inventory Update
                </div>
                <div className="text-muted-foreground text-[11px] mt-0.5">
                  Upon saving, <span className="font-semibold text-forest dark:text-forest-vibrant">{quantity} Qtl</span> of <span className="font-semibold">{cementType}</span> will be directly added to <span className="font-semibold">{warehouseLocation}</span> stock.
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Purchases Invoice / Ref No.
                  </label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full p-2 bg-surface-elevated border border-border rounded-lg text-foreground font-mono focus:ring-1 focus:ring-forest"
                    placeholder="e.g. PI-2026-105"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Received Date
                  </label>
                  <input
                    type="date"
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:ring-1 focus:ring-forest"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Manufacturer / Supplier
                  </label>
                  <select
                    value={supplierName}
                    onChange={(e) => {
                      setSupplierName(e.target.value)
                      const sup = suppliers.find((s) => s.name === e.target.value)
                      if (sup) setFactoryOrigin(sup.plantLocation)
                    }}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:ring-1 focus:ring-forest"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Receiving Depot Warehouse
                  </label>
                  <select
                    value={warehouseLocation}
                    onChange={(e) => setWarehouseLocation(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-semibold text-forest dark:text-forest-vibrant focus:ring-1 focus:ring-forest"
                  >
                    {WAREHOUSE_DEPOTS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Cement Grade
                  </label>
                  <select
                    value={cementType}
                    onChange={(e) => setCementType(e.target.value as CementType)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:ring-1 focus:ring-forest"
                  >
                    <option value="OPC 42.5N">OPC 42.5N (High Strength 50kg)</option>
                    <option value="PPC 32.5R">PPC 32.5R (Standard 50kg)</option>
                    <option value="Bulk Cement">Bulk Cement (Dry Tanker)</option>
                    <option value="Special Sulfate Resistant">Special Sulfate Resistant</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Factory Origin
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Received Quantity (Quintals)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Purchase Rate (ETB / Qtl)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                    required
                  />
                </div>
              </div>

              {/* Total Calculation Strip */}
              <div className="p-3.5 rounded-xl bg-surface-elevated border border-border/80 flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground font-medium">Invoiced Grand Total:</span>
                  <div className="text-[11px] text-muted-foreground">
                    {formatQuantity(quantity, 'Qtl')} @ {unitPrice} ETB/Qtl
                  </div>
                </div>
                <span className="text-base font-bold text-foreground font-mono">
                  {formatCurrency(quantity * unitPrice)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    <option value="Paid">Paid in Full (Bank Transfer)</option>
                    <option value="Partial">Partial / Advance Settlement</option>
                    <option value="Credit">Factory Credit (Payable Recorded)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Delivery Hauler / Truck Plate
                  </label>
                  <input
                    type="text"
                    value={assignedTruck}
                    onChange={(e) => setAssignedTruck(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                    placeholder="e.g. 3-ET-A41920 AA or Third-Party"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Receiving Inspection & Depot Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="e.g. Received at Depot Bay 2. Tally sheet signed by warehousekeeper."
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
                  className="px-5 py-2.5 rounded-full bg-forest hover:bg-forest-dark text-white font-extrabold shadow-subtle dark:shadow-glow hover:scale-105 active:scale-95 transition-all text-xs"
                >
                  Save Purchases Invoice & Increase Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Official Tax Invoice Detail Viewing Modal */}
      <InvoiceDetailModal
        isOpen={!!selectedPurchaseForDetail}
        onClose={() => setSelectedPurchaseForDetail(null)}
        type="purchases"
        purchase={selectedPurchaseForDetail}
      />
    </div>
  )
}
