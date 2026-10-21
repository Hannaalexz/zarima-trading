import React, { useState } from 'react'
import {
  Plus,
  PackageCheck,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
  Shuffle,
  Users,
  ShieldCheck,
  Building2,
  ChevronRight,
  Fuel,
  TrendingUp,
  Coins,
  Layers,
  Boxes,
  FileText,
  Sparkles,
  Search,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatQuantity, formatDateTime } from '@/lib/formatters'
import { Delivery, DeliveryStatus } from '@/types'

export const DeliveriesPage: React.FC = () => {
  const {
    deliveries,
    addDelivery,
    updateDeliveryStatus,
    updateDeliverySharedArrangement,
    trucks,
    drivers,
  } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSharedModalOpen, setIsSharedModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Form states for new trip delivery
  const [plateNumber, setPlateNumber] = useState(trucks[0]?.plateNumber || '')
  const [driverName, setDriverName] = useState(drivers[0]?.fullName || '')
  const [origin, setOrigin] = useState('Dangote Plant (Muger)')
  const [destination, setDestination] = useState('Addis Ababa Central Depot')
  const [cargoType, setCargoType] = useState('Cement / Bulk Cargo')
  const [cargoDescription, setCargoDescription] = useState('')
  const [shipperClientName, setShipperClientName] = useState('Flintstone Engineering')
  const [cargoQuintals, setCargoQuintals] = useState<number>(700)
  const [freightChargeETB, setFreightChargeETB] = useState<number>(125000)

  // Direct Trip Operational Costs
  const [fuelExpenseETB, setFuelExpenseETB] = useState<number>(40000)
  const [driverPerDiemETB, setDriverPerDiemETB] = useState<number>(6000)
  const [tollLoadingETB, setTollLoadingETB] = useState<number>(4500)

  // Shared Truckload form inputs
  const [isSharedTruckload, setIsSharedTruckload] = useState(false)
  const [partnerCarrierName, setPartnerCarrierName] = useState('Ethio-Djibouti Freight Alliance')
  const [partnerCargoQuintals, setPartnerCargoQuintals] = useState<number>(250)
  const [partnerRevenueShareETB, setPartnerRevenueShareETB] = useState<number>(55000)

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(deliveries[0]?.id || '')
  const selectedDelivery = deliveries.find((d) => d.id === selectedDeliveryId) || deliveries[0]

  // KPI Metrics calculation
  const totalFreightRevenue = deliveries.reduce((acc, d) => acc + (d.freightChargeETB || 0), 0)
  const totalTripCosts = deliveries.reduce((acc, d) => acc + (d.totalTripCostETB || ((d.fuelExpenseETB || 0) + (d.driverPerDiemETB || 0) + (d.tollLoadingETB || 0))), 0)
  const totalNetMargin = deliveries.reduce((acc, d) => acc + (d.netTripMarginETB || ((d.freightChargeETB || 0) - (d.totalTripCostETB || 0))), 0)
  const overallMarginPercent = totalFreightRevenue > 0 ? Math.round((totalNetMargin / totalFreightRevenue) * 100) : 0
  const deliveredCount = deliveries.filter((d) => d.deliveryStatus === 'Delivered').length

  const filtered = deliveries.filter((d) => {
    const matchSearch =
      d.waybillNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.shipperClientName && d.shipperClientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.cargoDescription && d.cargoDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.partnerCarrierName && d.partnerCarrierName.toLowerCase().includes(searchTerm.toLowerCase()))

    if (statusFilter === 'ALL') return matchSearch
    if (statusFilter === 'SHARED') return matchSearch && d.isSharedTruckload
    if (statusFilter === 'PENDING') return matchSearch && (d.deliveryStatus === 'Pending' || d.deliveryStatus === 'Assigned')
    return matchSearch && d.deliveryStatus === statusFilter
  })

  const handleStatusUpdate = (deliveryId: string, newStatus: DeliveryStatus) => {
    updateDeliveryStatus(deliveryId, newStatus)
    toast({
      title: 'Dispatch Status Updated',
      description: `Delivery waybill set to "${newStatus}".`,
      type: 'info',
    })
  }

  const handleCreateDelivery = (e: React.FormEvent) => {
    e.preventDefault()
    if (!plateNumber || cargoQuintals <= 0 || freightChargeETB <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide valid vehicle, payload, and freight charges.',
        type: 'error',
      })
      return
    }

    const matchedTruck = trucks.find((t) => t.plateNumber === plateNumber)
    const tripCost = Number(fuelExpenseETB) + Number(driverPerDiemETB) + Number(tollLoadingETB)
    const tripMargin = Number(freightChargeETB) - tripCost
    addDelivery({
      deliveryNoteNo: `DN-${Math.floor(880 + Math.random() * 100)}`,
      waybillNo: `WB-ET-2026-${Math.floor(4400 + Math.random() * 200)}`,
      truckId: matchedTruck?.id || 'TRK-01',
      plateNumber,
      driverName,
      origin,
      destination,
      cargoType: cargoType || 'Cement / Bulk Cargo',
      cargoCategory: 'General Freight',
      cargoDescription: cargoDescription || `${origin} to ${destination} (${cargoQuintals} Qtl)`,
      isThirdPartyCargo: true,
      shipperClientName: shipperClientName || 'Commercial Client',
      cargoQuintals: Number(cargoQuintals),
      departureTime: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + 6 * 3600000).toISOString(),
      deliveryStatus: 'In Transit',
      freightChargeETB: Number(freightChargeETB),
      fuelExpenseETB: Number(fuelExpenseETB),
      driverPerDiemETB: Number(driverPerDiemETB),
      tollLoadingETB: Number(tollLoadingETB),
      totalTripCostETB: tripCost,
      netTripMarginETB: tripMargin,
      businessActivity: 'Transport',
      isSharedTruckload,
      partnerCarrierName: isSharedTruckload ? partnerCarrierName : undefined,
      partnerCargoQuintals: isSharedTruckload ? Number(partnerCargoQuintals) : undefined,
      partnerRevenueShareETB: isSharedTruckload ? Number(partnerRevenueShareETB) : undefined,
    })

    toast({
      title: 'Trip Waybill Dispatched',
      description: `Dispatched ${plateNumber} for ${origin} → ${destination}. Freight Paid: ${formatCurrency(freightChargeETB, { hideDecimals: true })}.`,
      type: 'success',
    })

    setIsModalOpen(false)
  }

  const handleSaveSharedArrangement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDelivery) return

    updateDeliverySharedArrangement(selectedDelivery.id, {
      isSharedTruckload,
      partnerCarrierName: isSharedTruckload ? partnerCarrierName : undefined,
      partnerCargoQuintals: isSharedTruckload ? Number(partnerCargoQuintals) : undefined,
      partnerRevenueShareETB: isSharedTruckload ? Number(partnerRevenueShareETB) : undefined,
    })

    toast({
      title: 'Shared Truckload Arrangement Updated',
      description: isSharedTruckload
        ? `Co-loading registered with ${partnerCarrierName}. Partner share excluded from Zarima revenue.`
        : 'Truckload reset to exclusive Zarima cargo.',
      type: 'success',
    })

    setIsSharedModalOpen(false)
  }

  const allStatuses: DeliveryStatus[] = ['Pending', 'Assigned', 'In Transit', 'Delivered', 'Cancelled']

  return (
    <div className="space-y-6">
      <PageHeader
        title="Highway Freight & Delivery Logistics"
        description="Track truck routes, corridor destinations, freight revenue paid to go there, and direct trip operating expenses (fuel, driver per diem, tolls)."
        breadcrumbs={[
          { label: 'Transport & Fleet', href: '/fleet' },
          { label: 'Freight Logistics' },
        ]}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="inline-flex p-1 rounded-full bg-surface/90 border border-border shadow-xs text-xs">
              <button
                onClick={() => setViewMode('board')}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  viewMode === 'board'
                    ? 'bg-[#060B08] text-white shadow-xs dark:bg-white dark:text-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Dispatch Board
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#060B08] text-white shadow-xs dark:bg-white dark:text-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Manifest Table
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-black rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white transition-all shadow-lg shadow-[#FF6B00]/30 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Dispatch Shipment</span>
            </button>
          </div>
        }
      />

      {/* Clean Dedicated Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search waybill, truck plate, driver, route..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { label: 'All Dispatches', value: 'ALL' },
            { label: 'In Transit', value: 'In Transit' },
            { label: 'Delivered', value: 'Delivered' },
            { label: 'Pending / Assigned', value: 'PENDING' },
            { label: 'Shared Loads', value: 'SHARED' },
          ].map((tab) => {
            const isActive = statusFilter === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                  isActive
                    ? tab.value === 'In Transit'
                      ? 'bg-[#FF6B00] text-white shadow-xs'
                      : tab.value === 'Delivered'
                      ? 'bg-[#22C55E] text-black font-extrabold shadow-xs'
                      : 'bg-foreground text-background shadow-xs'
                    : 'bg-surface-elevated text-muted-foreground hover:text-foreground hover:bg-surface-elevated/80'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Signature Dark Cards Metric Showcase: Trip Operational Costs & Fleet Margins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Freight Billing */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#22C55E]/40 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#22C55E]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Total Freight Paid</span>
            <Truck className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(totalFreightRevenue, { hideDecimals: true })}
          </div>
          <div className="text-[11px] text-[#22C55E] mt-2 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{deliveries.length} recorded corridor trips</span>
          </div>
        </div>

        {/* Card 2: Direct Trip Costs */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#FF6B00]/40 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6B00]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Trip Operational Costs</span>
            <Fuel className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="text-2xl font-black text-[#FF6B00] tracking-tight">
            {formatCurrency(totalTripCosts, { hideDecimals: true })}
          </div>
          <div className="text-[11px] text-white/70 mt-2 flex items-center gap-1 font-semibold">
            <span>Fuel, driver per diem &amp; road tolls</span>
          </div>
        </div>

        {/* Card 3: Net Transport Margin */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#22C55E]/40 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#22C55E]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Net Fleet Trip Margin</span>
            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-black text-[#22C55E] tracking-tight">
            {formatCurrency(totalNetMargin, { hideDecimals: true })}
          </div>
          <div className="text-[11px] text-[#22C55E] mt-2 flex items-center gap-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{overallMarginPercent}% net transport profit margin</span>
          </div>
        </div>

        {/* Card 4: Average Tariff / Paid per Trip */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#22C55E]/40 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#22C55E]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Avg Freight Paid / Trip</span>
            <Coins className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-black text-[#22C55E] tracking-tight">
            {formatCurrency(Math.round(totalFreightRevenue / (deliveries.length || 1)), { hideDecimals: true })}
          </div>
          <div className="text-[11px] text-white/70 mt-2 flex items-center gap-1 font-semibold">
            <span>Average freight tariff earned per corridor haul</span>
          </div>
        </div>
      </div>

      {/* Main View Mode: Uncrowded Dispatch Board vs Table */}
      {viewMode === 'board' ? (
        filtered.length === 0 ? (
          <EmptyState
            title="No dispatches found"
            description="No active corridor trips match your current search or filter query."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((del) => {
              const tripCost = del.totalTripCostETB || ((del.fuelExpenseETB || 0) + (del.driverPerDiemETB || 0) + (del.tollLoadingETB || 0))
              const netMargin = del.netTripMarginETB !== undefined ? del.netTripMarginETB : ((del.freightChargeETB || 0) - tripCost)
              const marginPct = (del.freightChargeETB || 0) > 0 ? Math.round((netMargin / del.freightChargeETB) * 100) : 0

              return (
                <div
                  key={del.id}
                  className="p-5 rounded-3xl transition-all bg-surface/90 hover:bg-surface border border-border hover:border-[#22C55E]/40 hover:shadow-card flex flex-col justify-between group"
                >
                  <div>
                    {/* Top line: Route Corridor & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 bg-forest/10 dark:bg-forest/20 text-forest dark:text-[#22C55E] border border-forest/30 dark:border-[#22C55E]/40">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{del.origin.split(' (')[0]}</span>
                          <span>&rarr;</span>
                          <span className="truncate max-w-[120px]">{del.destination.split(' ')[0]}</span>
                        </span>

                        {del.isSharedTruckload && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40">
                            Shared
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                          del.deliveryStatus === 'In Transit'
                            ? 'bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30'
                            : del.deliveryStatus === 'Delivered'
                            ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                            : 'bg-surface-elevated text-muted-foreground border border-border'
                        }`}
                      >
                        {del.deliveryStatus}
                      </span>
                    </div>

                    {/* Middle: Truck, Driver, Waybill, Shipper */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl flex items-center justify-center flex-shrink-0 bg-forest/10 dark:bg-white/5 text-forest dark:text-[#22C55E]">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm leading-tight text-foreground">
                            {del.plateNumber} &bull; {del.driverName}
                          </h4>
                          <div className="text-xs font-mono mt-0.5 text-muted-foreground">
                            #{del.waybillNo} &bull; {del.cargoType || 'Cargo'} ({formatQuantity(del.cargoQuintals, 'Qtl')})
                          </div>
                          {del.shipperClientName && (
                            <div className="text-[11px] font-medium mt-0.5 text-forest dark:text-emerald-400">
                              Shipper: {del.shipperClientName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Paid to Truck badge */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold font-mono px-3 py-1 rounded-full bg-surface-elevated text-[#22C55E] border border-[#22C55E]/20">
                          {formatCurrency(del.freightChargeETB, { hideDecimals: true })}
                        </div>
                        <div className="text-[10px] mt-0.5 font-semibold text-muted-foreground">
                          Paid to Truck
                        </div>
                      </div>
                    </div>

                    {/* Trip Financial Strip */}
                    <div className="mt-3.5 p-2.5 rounded-2xl text-[11px] grid grid-cols-3 gap-2 text-center font-mono bg-surface-elevated/70 border border-border/50 text-foreground">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Paid</div>
                        <div className="font-bold text-foreground">{formatCurrency(del.freightChargeETB, { compact: true })}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Cost</div>
                        <div className="font-bold text-amber-500">{formatCurrency(tripCost, { compact: true })}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Profit</div>
                        <div className="font-bold text-[#22C55E]">
                          +{formatCurrency(netMargin, { compact: true })} ({marginPct}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer on every card */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedDeliveryId(del.id)
                        setIsDetailModalOpen(true)
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-foreground bg-surface-elevated hover:bg-surface-elevated/80 border border-border transition-all flex items-center gap-1.5"
                    >
                      <span>Trip Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {del.deliveryStatus === 'In Transit' && (
                        <button
                          onClick={() => handleStatusUpdate(del.id, 'Delivered')}
                          className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#22C55E] hover:bg-[#16A34A] text-black transition-all shadow-sm flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Delivered</span>
                        </button>
                      )}

                      {(del.deliveryStatus === 'Pending' || del.deliveryStatus === 'Assigned') && (
                        <button
                          onClick={() => handleStatusUpdate(del.id, 'In Transit')}
                          className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#FF6B00] hover:bg-[#EA580C] text-white transition-all shadow-sm flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Start Transit</span>
                        </button>
                      )}

                      {del.deliveryStatus === 'Delivered' && (
                        <span className="text-[11px] font-bold text-[#22C55E] flex items-center gap-1 px-2 py-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* Manifest Table View */
        <div className="rounded-3xl border border-white/80 dark:border-border bg-white/75 dark:bg-surface/85 backdrop-blur-xl shadow-card overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              title="No deliveries found"
              description="No active delivery records match your current filter settings."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-4">Waybill &amp; Shipper</th>
                    <th className="py-3 px-4">Truck &amp; Driver</th>
                    <th className="py-3 px-4">Corridor Route</th>
                    <th className="py-3 px-4">Load &amp; Weight</th>
                    <th className="py-3 px-4 text-right">Paid to Truck</th>
                    <th className="py-3 px-4 text-right">Trip Cost &amp; Profit</th>
                    <th className="py-3 px-4 text-center">Dispatch Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((del) => {
                    const tripCost = del.totalTripCostETB || ((del.fuelExpenseETB || 0) + (del.driverPerDiemETB || 0) + (del.tollLoadingETB || 0))
                    const netMargin = del.netTripMarginETB !== undefined ? del.netTripMarginETB : ((del.freightChargeETB || 0) - tripCost)
                    const marginPct = (del.freightChargeETB || 0) > 0 ? Math.round((netMargin / del.freightChargeETB) * 100) : 0

                    return (
                      <tr key={del.id} className="hover:bg-surface-elevated/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          <div>#{del.waybillNo}</div>
                          <div className="text-[10px] text-muted-foreground font-sans font-normal">
                            Shipper: {del.shipperClientName || 'Commercial Client'}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-foreground whitespace-nowrap">
                          <div>{del.plateNumber}</div>
                          <div className="text-[10px] text-muted-foreground font-sans font-normal">
                            {del.driverName}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <MapPin className="w-3.5 h-3.5 text-forest dark:text-forest-vibrant flex-shrink-0" />
                            <span>{del.origin.split(' ')[0]}</span>
                            <span className="text-muted-foreground">&rarr;</span>
                            <span>{del.destination.split(' ')[0]}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-foreground">
                            {formatQuantity(del.cargoQuintals, 'Qtl')}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[180px]">
                            {del.cargoType || 'Cargo'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                          {formatCurrency(del.freightChargeETB, { hideDecimals: true })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                          <div className="text-amber-500 text-[11px]">
                            Cost: {formatCurrency(tripCost, { hideDecimals: true })}
                          </div>
                          <div className="text-emerald-500 font-bold text-[11px]">
                            Net: +{formatCurrency(netMargin, { hideDecimals: true })} ({marginPct}%)
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={del.deliveryStatus}
                            onChange={(e) => handleStatusUpdate(del.id, e.target.value as DeliveryStatus)}
                            className="px-2 py-1 bg-surface border border-border rounded-lg text-xs font-bold text-foreground font-mono"
                          >
                            {allStatuses.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedDeliveryId(del.id)
                              setIsDetailModalOpen(true)
                            }}
                            className="px-3 py-1 rounded-xl text-xs font-bold text-foreground bg-surface-elevated hover:bg-surface-elevated/80 border border-border transition-all inline-flex items-center gap-1"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
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
      )}

      {/* Modal: Dispatch Delivery */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Dispatch Truck Trip Waybill
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Assign a truck to a corridor route, set the freight payment earned to go there, and record direct trip operating expenses (fuel, driver per diem, tolls).
            </p>

            <form onSubmit={handleCreateDelivery} className="space-y-4 text-xs">
              {/* Row 1: Vehicle & Driver */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Select Truck
                  </label>
                  <select
                    value={plateNumber}
                    onChange={(e) => {
                      setPlateNumber(e.target.value)
                      const trk = trucks.find((t) => t.plateNumber === e.target.value)
                      if (trk) setDriverName(trk.driverName)
                    }}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                  >
                    {trucks.map((t) => (
                      <option key={t.id} value={t.plateNumber}>
                        {t.plateNumber} ({t.makeModel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Assigned Driver
                  </label>
                  <select
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.fullName}>
                        {d.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Route Corridor (Where the truck is going) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Origin Point
                  </label>
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                    placeholder="e.g. Dangote Plant (Muger)"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Destination Site / City
                  </label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                    placeholder="e.g. Addis Ababa / Project Site"
                  />
                </div>
              </div>

              {/* Row 3: Freight Payment Paid to Truck & Payload */}
              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated/40 space-y-3">
                <div className="font-bold text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#22C55E]" />
                    <span>Freight Payment (How much truck is paid to go there)</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#22C55E] font-bold">
                    Tariff Revenue
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Freight Fee Paid to Truck (ETB)
                    </label>
                    <input
                      type="number"
                      min="1000"
                      required
                      value={freightChargeETB}
                      onChange={(e) => setFreightChargeETB(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold text-sm text-[#22C55E]"
                      placeholder="e.g. 125000"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Payload Weight (Quintals)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={cargoQuintals}
                      onChange={(e) => setCargoQuintals(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Load / Cargo Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={cargoType}
                      onChange={(e) => setCargoType(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                      placeholder="e.g. Cement, Steel, Materials"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Shipper / Client Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={shipperClientName}
                      onChange={(e) => setShipperClientName(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-medium"
                      placeholder="e.g. Flintstone Engineering"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Direct Trip Operational Costs Section */}
              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated/40 space-y-3">
                <div className="font-bold text-foreground flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-[#FF6B00]" />
                    <span>Direct Trip Operating Costs (Fuel, Driver &amp; Tolls)</span>
                  </div>
                  {(() => {
                    const totalCost = Number(fuelExpenseETB) + Number(driverPerDiemETB) + Number(tollLoadingETB)
                    const margin = Number(freightChargeETB) - totalCost
                    const pct = freightChargeETB > 0 ? Math.round((margin / freightChargeETB) * 100) : 0
                    return (
                      <span className="font-mono text-[11px] text-[#22C55E] font-bold">
                        Net Profit: +{formatCurrency(margin, { hideDecimals: true })} ({pct}%)
                      </span>
                    )
                  })()}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Diesel Fuel Cost (ETB)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={fuelExpenseETB}
                      onChange={(e) => setFuelExpenseETB(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Driver Per Diem (ETB)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={driverPerDiemETB}
                      onChange={(e) => setDriverPerDiemETB(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Tolls &amp; Loading (ETB)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={tollLoadingETB}
                      onChange={(e) => setTollLoadingETB(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Shared Truckload Arrangement Section */}
              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sharedCheck"
                      checked={isSharedTruckload}
                      onChange={(e) => setIsSharedTruckload(e.target.checked)}
                      className="w-4 h-4 rounded text-forest focus:ring-forest"
                    />
                    <label htmlFor="sharedCheck" className="font-bold text-foreground cursor-pointer">
                      Shared Truckload (Co-loading with Partner Carrier)
                    </label>
                  </div>
                  {isSharedTruckload && (
                    <span className="text-[10px] font-bold text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded-full">
                      Co-load Enabled
                    </span>
                  )}
                </div>

                {isSharedTruckload && (
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <div>
                      <label className="block font-medium text-foreground mb-1">
                        Partner Carrier Company
                      </label>
                      <input
                        type="text"
                        value={partnerCarrierName}
                        onChange={(e) => setPartnerCarrierName(e.target.value)}
                        className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                        placeholder="e.g. Ethio-Djibouti Freight Alliance"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-foreground mb-1">
                          Partner Cargo (Quintals)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={partnerCargoQuintals}
                          onChange={(e) => setPartnerCargoQuintals(Number(e.target.value))}
                          className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-foreground mb-1">
                          Partner Freight Share (ETB)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={partnerRevenueShareETB}
                          onChange={(e) => setPartnerRevenueShareETB(Number(e.target.value))}
                          className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground italic">
                      Note: Partner freight share is treated as a pass-through co-loading arrangement and is excluded from Zarima Trading operating revenue.
                    </p>
                  </div>
                )}
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
                  Issue &amp; Dispatch Waybill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Shared Truckload Arrangement */}
      {isSharedModalOpen && selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Configure Shared Truckload Arrangement
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Waybill #{selectedDelivery.waybillNo} ({selectedDelivery.plateNumber})
            </p>

            <form onSubmit={handleSaveSharedArrangement} className="space-y-4 text-xs">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-elevated">
                <input
                  type="checkbox"
                  id="modalSharedCheck"
                  checked={isSharedTruckload}
                  onChange={(e) => setIsSharedTruckload(e.target.checked)}
                  className="w-4 h-4 rounded text-forest focus:ring-forest"
                />
                <label htmlFor="modalSharedCheck" className="font-bold text-foreground cursor-pointer">
                  Enable Partner Co-loading on this Haul
                </label>
              </div>

              {isSharedTruckload && (
                <>
                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Partner Carrier
                    </label>
                    <input
                      type="text"
                      required
                      value={partnerCarrierName}
                      onChange={(e) => setPartnerCarrierName(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-foreground mb-1">
                        Partner Payload (Qtl)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={partnerCargoQuintals}
                        onChange={(e) => setPartnerCargoQuintals(Number(e.target.value))}
                        className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-foreground mb-1">
                        Partner Share (ETB)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={partnerRevenueShareETB}
                        onChange={(e) => setPartnerRevenueShareETB(Number(e.target.value))}
                        className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSharedModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-surface-elevated text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-extrabold shadow-md shadow-[#22C55E]/30 transition-all text-xs"
                >
                  Save Arrangement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pop-up Trip Detail Page */}
      {isDetailModalOpen && selectedDelivery && (() => {
        const tripCost = selectedDelivery.totalTripCostETB || ((selectedDelivery.fuelExpenseETB || 0) + (selectedDelivery.driverPerDiemETB || 0) + (selectedDelivery.tollLoadingETB || 0))
        const netMargin = selectedDelivery.netTripMarginETB !== undefined ? selectedDelivery.netTripMarginETB : ((selectedDelivery.freightChargeETB || 0) - tripCost)
        const marginPct = (selectedDelivery.freightChargeETB || 0) > 0 ? Math.round((netMargin / selectedDelivery.freightChargeETB) * 100) : 0

        const statusSteps: DeliveryStatus[] = ['Pending', 'Assigned', 'In Transit', 'Delivered']
        const currentStepIndex = statusSteps.indexOf(selectedDelivery.deliveryStatus)

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
            <div className="relative w-full max-w-2xl rounded-3xl bg-surface border border-border p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-surface-elevated border border-border text-foreground">
                      #{selectedDelivery.waybillNo}
                    </span>
                    <StatusBadge status={selectedDelivery.deliveryStatus} />
                    {selectedDelivery.isSharedTruckload && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest/20 text-forest dark:text-emerald-400 border border-forest/30 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Shared Load
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-foreground mt-1.5 flex items-center gap-2">
                    <span>{selectedDelivery.plateNumber}</span>
                    <span className="text-muted-foreground font-normal text-sm">&bull;</span>
                    <span className="text-base font-semibold text-muted-foreground">{selectedDelivery.driverName}</span>
                  </h3>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 rounded-full hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Workflow Progress Bar & 1-Click Status Transition Button */}
              <div className="my-5 p-4 rounded-2xl bg-surface-elevated/70 border border-border/60">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Trip Dispatch Lifecycle
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Change status:</span>
                    <select
                      value={selectedDelivery.deliveryStatus}
                      onChange={(e) => handleStatusUpdate(selectedDelivery.id, e.target.value as DeliveryStatus)}
                      className="px-2.5 py-1 bg-surface border border-border rounded-lg text-xs font-bold font-mono text-foreground"
                    >
                      {allStatuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Progress Bar steps */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                  {statusSteps.map((step, idx) => {
                    const isPassed = currentStepIndex >= idx
                    const isCurrent = selectedDelivery.deliveryStatus === step
                    return (
                      <div
                        key={step}
                        onClick={() => handleStatusUpdate(selectedDelivery.id, step)}
                        className={`p-2 rounded-xl cursor-pointer transition-all border ${
                          isCurrent
                            ? 'bg-forest/15 border-forest text-forest dark:text-emerald-400 font-extrabold shadow-sm'
                            : isPassed
                            ? 'bg-surface border-border text-foreground font-medium'
                            : 'bg-surface/40 border-border/40 text-muted-foreground/60'
                        }`}
                      >
                        <div className="text-[10px] opacity-75 font-mono">Step {idx + 1}</div>
                        <div className="truncate text-xs font-bold mt-0.5">{step}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Prominent Quick Action Button for Status Progression */}
                {selectedDelivery.deliveryStatus === 'In Transit' && (
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      Truck is on the highway hauling cargo to destination.
                    </div>
                    <button
                      onClick={() => handleStatusUpdate(selectedDelivery.id, 'Delivered')}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-[#22C55E] hover:bg-[#16A34A] text-black transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Arrival &amp; Mark as Delivered</span>
                    </button>
                  </div>
                )}

                {(selectedDelivery.deliveryStatus === 'Pending' || selectedDelivery.deliveryStatus === 'Assigned') && (
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      Waybill is queued. Dispatch driver to start highway transit.
                    </div>
                    <button
                      onClick={() => handleStatusUpdate(selectedDelivery.id, 'In Transit')}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-[#FF6B00] hover:bg-[#EA580C] text-white transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Depart Origin &amp; Start Transit</span>
                    </button>
                  </div>
                )}

                {selectedDelivery.deliveryStatus === 'Delivered' && (
                  <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#22C55E]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Waybill fulfilled. Freight delivered to consignee and verified.</span>
                  </div>
                )}
              </div>

              {/* Corridor Route & Milestones */}
              <div className="mb-5 p-4 rounded-2xl bg-surface border border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Highway Corridor Milestones
                </h4>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#FF6B00] border-2 border-surface ring-2 ring-[#FF6B00]/30" />
                    <div className="text-xs font-bold text-foreground">Origin: {selectedDelivery.origin}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      Departure: {formatDateTime(selectedDelivery.departureTime)}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-muted-foreground border-2 border-surface" />
                    <div className="text-xs font-medium text-foreground">Checkpoint: Expressway Toll &amp; Mojo Weigh Station</div>
                    <div className="text-[11px] text-muted-foreground">Cargo verified &bull; Standard transit corridor</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-surface ring-2 ring-[#22C55E]/30" />
                    <div className="text-xs font-bold text-foreground">Destination: {selectedDelivery.destination}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      ETA: {formatDateTime(selectedDelivery.estimatedArrival)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Freight Tariff & Direct Operational Costs (Paid to truck) */}
              <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left: Freight Paid */}
                <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Freight Tariff Paid to Truck
                  </span>
                  <div className="text-2xl font-black font-mono text-[#22C55E] mt-1">
                    {formatCurrency(selectedDelivery.freightChargeETB)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Agreed transport tariff for hauling load to destination
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Client / Consignee:</span>
                      <span className="font-bold text-foreground">{selectedDelivery.shipperClientName || 'Commercial Client'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Cargo Payload:</span>
                      <span className="font-bold font-mono text-foreground">
                        {selectedDelivery.cargoType || 'Cargo'} ({formatQuantity(selectedDelivery.cargoQuintals, 'Qtl')})
                      </span>
                    </div>
                    {selectedDelivery.cargoDescription && (
                      <div className="text-[11px] text-muted-foreground mt-1.5 italic">
                        "{selectedDelivery.cargoDescription}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Trip Costs & Net Profit */}
                <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Trip Operating Costs Breakdown
                  </span>
                  <div className="space-y-1.5 text-xs mt-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-sans">Fuel Expense:</span>
                      <span className="font-bold text-amber-500">{formatCurrency(selectedDelivery.fuelExpenseETB || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-sans">Driver Per Diem:</span>
                      <span className="font-bold text-amber-500">{formatCurrency(selectedDelivery.driverPerDiemETB || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-sans">Toll &amp; Road Fees:</span>
                      <span className="font-bold text-amber-500">{formatCurrency(selectedDelivery.tollLoadingETB || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-border/60 font-bold">
                      <span className="text-foreground font-sans">Total Direct Trip Cost:</span>
                      <span className="text-amber-500">{formatCurrency(tripCost)}</span>
                    </div>
                  </div>

                  <div className="mt-3.5 p-2.5 rounded-xl bg-surface border border-border text-center">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Net Haul Margin</div>
                    <div className="text-base font-black font-mono text-[#22C55E]">
                      +{formatCurrency(netMargin)} ({marginPct}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Shared Truckload Section */}
              <div className="mb-5 p-4 rounded-2xl bg-surface border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-forest dark:text-emerald-400" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Shared Truckload / Co-loading Details
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      setIsSharedModalOpen(true)
                    }}
                    className="text-xs text-forest dark:text-emerald-400 font-bold hover:underline"
                  >
                    {selectedDelivery.isSharedTruckload ? 'Edit Allocation' : 'Enable Shared Load'}
                  </button>
                </div>

                {selectedDelivery.isSharedTruckload ? (
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-surface-elevated p-2.5 rounded-xl text-center">
                    <div>
                      <div className="text-[10px] text-muted-foreground font-sans">Partner Carrier</div>
                      <div className="font-bold text-foreground truncate">{selectedDelivery.partnerCarrierName || 'Partner'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-sans">Co-loaded Weight</div>
                      <div className="font-bold text-foreground">{formatQuantity(selectedDelivery.partnerCargoQuintals || 0, 'Qtl')}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-sans">Partner Freight Share</div>
                      <div className="font-bold text-forest dark:text-emerald-400">{formatCurrency(selectedDelivery.partnerRevenueShareETB || 0)}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    This truck is operating as a dedicated single haul. You can co-load cargo with another carrier to optimize corridor fuel costs.
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-5 py-2 rounded-xl border border-border hover:bg-surface-elevated text-foreground font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
