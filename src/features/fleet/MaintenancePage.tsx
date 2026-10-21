import React, { useState } from 'react'
import {
  Plus,
  Wrench,
  AlertTriangle,
  ArrowUpDown,
  ShoppingBag,
  Package,
  Layers,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  FileText,
  DollarSign,
  BatteryCharging,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { FleetPurchase } from '@/types'

export const MaintenancePage: React.FC = () => {
  const { maintenance, addMaintenance, fleetPurchases, addFleetPurchase, trucks } = useStore()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'maintenance' | 'purchases'>('maintenance')
  const [searchTerm, setSearchTerm] = useState('')

  // Maintenance Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [truckPlate, setTruckPlate] = useState(trucks[0]?.plateNumber || '')
  const [serviceType, setServiceType] = useState('Full Engine Oil & Filter Service')
  const [workshopName, setWorkshopName] = useState('Kality Heavy Duty Automotive Workshop')
  const [costETB, setCostETB] = useState<number>(45000)
  const [nextServiceDueKm, setNextServiceDueKm] = useState<number>(180000)
  const [nextServiceDueDate, setNextServiceDueDate] = useState('2026-11-20')
  const [notes, setNotes] = useState('')

  // Fleet Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [purchaseTruckPlate, setPurchaseTruckPlate] = useState(trucks[0]?.plateNumber || 'Depot Spare Parts Stock')
  const [purchaseCategory, setPurchaseCategory] = useState<FleetPurchase['category']>('Tires')
  const [itemDescription, setItemDescription] = useState('')
  const [quantity, setQuantity] = useState<number>(4)
  const [unitPriceETB, setUnitPriceETB] = useState<number>(38500)
  const [supplierName, setSupplierName] = useState('Horizon Tyre SC (Addis Ababa)')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentStatus, setPaymentStatus] = useState<FleetPurchase['paymentStatus']>('Paid')
  const [receiptNo, setReceiptNo] = useState('')
  const [purchaseNotes, setPurchaseNotes] = useState('')

  // Calculate Service Due Trucks
  const serviceDueTrucks = trucks.filter((t) => {
    const isKmDue = t.nextServiceDueKm ? t.mileageKm >= t.nextServiceDueKm : false
    const isDateDue = t.nextServiceDueDate ? new Date(t.nextServiceDueDate) <= new Date() : false
    return isKmDue || isDateDue
  })

  // Quick action from Service Alert: open modal pre-filled with the overdue truck
  const handleLogServiceForTruck = (plate: string) => {
    const target = trucks.find((t) => t.plateNumber === plate)
    setTruckPlate(plate)
    if (target) {
      setNextServiceDueKm((target.mileageKm || 0) + 15000)
    }
    setIsServiceModalOpen(true)
  }

  // Filter Maintenance
  const filteredMaintenance = maintenance.filter(
    (m) =>
      m.truckPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.workshopName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter Fleet Purchases
  const filteredPurchases = fleetPurchases.filter(
    (p) =>
      p.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.truckPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.purchaseInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Maintenance Submit
  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!truckPlate || costETB <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please specify truck plate and service cost.',
        type: 'error',
      })
      return
    }

    addMaintenance({
      truckPlate,
      serviceType,
      date: new Date().toISOString().split('T')[0],
      workshopName,
      costETB: Number(costETB),
      status: 'Completed',
      nextServiceDueKm: Number(nextServiceDueKm),
      nextServiceDueDate,
      notes,
    })

    toast({
      title: 'Service Record Logged',
      description: `Maintenance recorded for ${truckPlate} (${formatCurrency(costETB)}). Next service scheduled at ${nextServiceDueKm.toLocaleString()} km.`,
      type: 'success',
    })

    setIsServiceModalOpen(false)
  }

  // Fleet Purchase Submit
  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemDescription.trim() || quantity <= 0 || unitPriceETB <= 0 || !supplierName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please specify item description, valid quantity, unit price, and supplier.',
        type: 'error',
      })
      return
    }

    const totalCost = Number(quantity) * Number(unitPriceETB)

    addFleetPurchase({
      purchaseInvoiceNo: `FP-INV-${String(fleetPurchases.length + 1).padStart(3, '0')}`,
      date: purchaseDate,
      itemDescription: itemDescription.trim(),
      category: purchaseCategory,
      truckPlate: purchaseTruckPlate,
      quantity: Number(quantity),
      unitPriceETB: Number(unitPriceETB),
      totalCostETB: totalCost,
      supplierName: supplierName.trim(),
      paymentStatus,
      receiptNo: receiptNo.trim() || `REC-${Date.now().toString().slice(-4)}`,
      notes: purchaseNotes.trim(),
      businessActivity: 'Transport',
    })

    toast({
      title: 'Fleet Purchase Registered',
      description: `Registered ${quantity}x ${itemDescription} (${formatCurrency(totalCost)}) for ${purchaseTruckPlate}.`,
      type: 'success',
    })

    setIsPurchaseModalOpen(false)
    setItemDescription('')
    setReceiptNo('')
    setPurchaseNotes('')
  }

  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.costETB, 0)
  const totalFleetPurchasesCost = fleetPurchases.reduce((sum, p) => sum + p.totalCostETB, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Maintenance & Purchases"
        description="Preventive workshop servicing, spare parts & tire procurement, and automated service due alerts."
        breadcrumbs={[
          { label: 'Transport & Fleet', href: '/fleet' },
          { label: 'Maintenance & Purchases' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-surface border border-forest/40 hover:bg-forest/10 text-foreground transition-all"
            >
              <Package className="w-3.5 h-3.5 text-forest" />
              <span>Register Fleet Purchase</span>
            </button>
            <button
              onClick={() => setIsServiceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Maintenance Service</span>
            </button>
          </div>
        }
      />

      {/* SERVICE DUE NOTIFICATION ALERT BANNER */}
      {serviceDueTrucks.length > 0 && (
        <div className="rounded-2xl border-2 border-[#FF6B00]/40 bg-gradient-to-r from-[#FF6B00]/15 via-surface/95 to-[#FF6B00]/10 p-5 shadow-card backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#FF6B00]/30 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    Fleet Service Due Notification ({serviceDueTrucks.length} Vehicle{serviceDueTrucks.length === 1 ? '' : 's'})
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00] text-white uppercase tracking-wider">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                  The following commercial trucks have reached or exceeded their manufacturer-recommended service intervals. Immediate workshop inspection, engine oil flush, and brake lining check is advised before heavy freight dispatch.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-[#FF6B00] self-end md:self-auto shrink-0">
              {serviceDueTrucks.length} Truck{serviceDueTrucks.length === 1 ? '' : 's'} Overdue
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {serviceDueTrucks.map((truck) => {
              const kmDiff = (truck.mileageKm || 0) - (truck.nextServiceDueKm || 0)
              return (
                <div
                  key={truck.id}
                  className="rounded-xl border border-[#FF6B00]/30 bg-surface/90 p-3.5 flex flex-col justify-between hover:border-[#FF6B00] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {truck.plateNumber}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#FF6B00]/15 text-[#FF6B00]">
                        {kmDiff > 0 ? `+${kmDiff.toLocaleString()} km Overdue` : 'Interval Reached'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {truck.makeModel} &bull; Driver: {truck.driverName}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-border/70 text-[11px] space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Odometer:</span>
                        <span className="font-bold text-foreground">
                          {truck.mileageKm.toLocaleString()} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service Due Threshold:</span>
                        <span className="text-[#FF6B00] font-bold">
                          {truck.nextServiceDueKm?.toLocaleString()} km
                        </span>
                      </div>
                      {truck.nextServiceDueDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Scheduled Date:</span>
                          <span className="text-foreground">{formatDate(truck.nextServiceDueDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleLogServiceForTruck(truck.plateNumber)}
                    className="mt-3 w-full py-1.5 px-3 rounded-lg bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-subtle transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Log Service For {truck.plateNumber.split(' ')[0]}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Total Servicing Costs</span>
            <Wrench className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            {formatCurrency(totalMaintenanceCost, { hideDecimals: true })}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {maintenance.length} workshop overhaul records
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Fleet Purchases (Parts &amp; Tires)</span>
            <Package className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            {formatCurrency(totalFleetPurchasesCost, { hideDecimals: true })}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {fleetPurchases.length} registered parts batches
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Commercial Fleet Units</span>
            <Truck className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl font-bold font-mono text-foreground">{trucks.length} Trucks</div>
          <div className="text-[11px] text-forest mt-1 font-semibold">
            {trucks.filter((t) => t.operationalStatus === 'Available').length} Available for Dispatch
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Service Health Status</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                serviceDueTrucks.length > 0 ? 'text-[#FF6B00]' : 'text-forest'
              }`}
            />
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              serviceDueTrucks.length > 0 ? 'text-[#FF6B00]' : 'text-forest'
            }`}
          >
            {serviceDueTrucks.length > 0 ? `${serviceDueTrucks.length} Overdue` : 'All Clear'}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {serviceDueTrucks.length > 0
              ? 'Immediate servicing required'
              : 'All vehicle odometers within limit'}
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-surface-elevated border border-border/80">
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'maintenance'
                ? 'bg-forest text-white shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Workshop Maintenance Logs</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'maintenance' ? 'bg-white/20 text-white' : 'bg-surface text-muted-foreground'
              }`}
            >
              {maintenance.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'purchases'
                ? 'bg-[#FF6B00] text-white shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Fleet Purchases &amp; Spare Parts</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'purchases' ? 'bg-white/20 text-white' : 'bg-surface text-muted-foreground'
              }`}
            >
              {fleetPurchases.length}
            </span>
          </button>
        </div>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={
            activeTab === 'maintenance'
              ? 'Search by truck plate, workshop, or service description...'
              : 'Search by part description, plate, supplier, invoice...'
          }
          className="w-full sm:w-80"
        />
      </div>

      {/* TAB 1: WORKSHOP MAINTENANCE TABLE */}
      {activeTab === 'maintenance' && (
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Truck Plate</th>
                  <th className="py-3 px-4">Service Description</th>
                  <th className="py-3 px-4">Workshop Facility</th>
                  <th className="py-3 px-4 text-right">Cost (ETB)</th>
                  <th className="py-3 px-4 text-right">Next Due (km)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMaintenance.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(m.date)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {m.truckPlate}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{m.serviceType}</div>
                      {m.notes && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">{m.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{m.workshopName}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                      {formatCurrency(m.costETB, { hideDecimals: true })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      {m.nextServiceDueKm.toLocaleString()} km
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={m.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FLEET PURCHASES & SPARE PARTS TABLE */}
      {activeTab === 'purchases' && (
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Invoice / Receipt</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4">Truck Plate</th>
                  <th className="py-3 px-4 text-right">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Rate (ETB)</th>
                  <th className="py-3 px-4 text-right">Total Cost (ETB)</th>
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(p.date)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                      {p.purchaseInvoiceNo}
                      {p.receiptNo && (
                        <div className="text-[10px] text-muted-foreground font-normal">
                          Ref: {p.receiptNo}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-elevated border border-border text-foreground">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{p.itemDescription}</div>
                      {p.notes && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">{p.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-foreground font-medium whitespace-nowrap">
                      {p.truckPlate}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                      {p.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground whitespace-nowrap">
                      {formatCurrency(p.unitPriceETB, { hideDecimals: true })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-forest whitespace-nowrap">
                      {formatCurrency(p.totalCostETB, { hideDecimals: true })}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {p.supplierName}
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
      )}

      {/* MODAL: LOG MAINTENANCE SERVICE */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">Log Maintenance Record</h3>
                <p className="text-xs text-muted-foreground">
                  Record vehicle overhaul, routine fluid maintenance, or mechanical repair.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Commercial Truck Plate
                </label>
                <select
                  value={truckPlate}
                  onChange={(e) => {
                    setTruckPlate(e.target.value)
                    const t = trucks.find((trk) => trk.plateNumber === e.target.value)
                    if (t) setNextServiceDueKm((t.mileageKm || 0) + 15000)
                  }}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                >
                  {trucks.map((t) => (
                    <option key={t.id} value={t.plateNumber}>
                      {t.plateNumber} — {t.makeModel} ({t.mileageKm.toLocaleString()} km)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Service Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="e.g. Brake Lining Overhaul & Hub Seals"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Workshop Facility <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={workshopName}
                    onChange={(e) => setWorkshopName(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Total Cost (ETB) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={costETB}
                    onChange={(e) => setCostETB(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Next Service Due (km)
                  </label>
                  <input
                    type="number"
                    value={nextServiceDueKm}
                    onChange={(e) => setNextServiceDueKm(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Next Service Due Date
                  </label>
                  <input
                    type="date"
                    value={nextServiceDueDate}
                    onChange={(e) => setNextServiceDueDate(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Technical Notes &amp; Warranty
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="Warranty period, parts batch numbers..."
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-surface-elevated text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white font-semibold shadow-subtle dark:shadow-glow"
                >
                  Save Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER FLEET PURCHASE */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">Register Fleet Purchase</h3>
                <p className="text-xs text-muted-foreground">
                  Record tires, spare parts, commercial batteries, and lubricants.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPurchaseModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Purchased Item Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={purchaseCategory}
                  onChange={(e) => setPurchaseCategory(e.target.value as any)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                >
                  <option value="Tires">Tires &amp; Tubeless Heavy Casings</option>
                  <option value="Spare Parts">Mechanical &amp; Engine Spare Parts</option>
                  <option value="Batteries">Heavy Commercial Batteries</option>
                  <option value="Lubricants & Oils">Engine Oil, Gear Oil &amp; Grease</option>
                  <option value="Accessories & Safety">Fleet Accessories &amp; Safety Tools</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Item Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="e.g. Michelin 315/80R22.5 Heavy Drive Tires"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Assigned Truck / Depot Stock
                </label>
                <select
                  value={purchaseTruckPlate}
                  onChange={(e) => setPurchaseTruckPlate(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                >
                  <option value="Depot Spare Parts Stock">-- Depot Spare Parts Stock (All Trucks) --</option>
                  {trucks.map((t) => (
                    <option key={t.id} value={t.plateNumber}>
                      {t.plateNumber} — {t.makeModel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Unit Price (ETB) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={unitPriceETB}
                    onChange={(e) => setUnitPriceETB(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
              </div>

              {/* Computed Total Cost Card */}
              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border flex justify-between items-center font-mono">
                <span className="text-muted-foreground text-xs">Total Purchase Cost:</span>
                <span className="text-forest font-bold text-sm">
                  {formatCurrency(Number(quantity) * Number(unitPriceETB))}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Supplier / Vendor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                    placeholder="e.g. Horizon Tyre SC"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Outstanding">Outstanding</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Receipt / Invoice Ref #
                  </label>
                  <input
                    type="text"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                    placeholder="REC-HT-9902"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Procurement Notes &amp; Serial Numbers
                </label>
                <textarea
                  rows={2}
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="DOT codes, warranty period, delivery receipt details..."
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-surface-elevated text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#e05e00] text-white font-semibold shadow-subtle"
                >
                  Register Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
