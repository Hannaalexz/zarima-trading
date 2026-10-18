import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Filter, PackageCheck, MapPin, Download, ArrowUpDown, Truck } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatQuantity, formatDateTime } from '@/lib/formatters'
import { Delivery } from '@/types'

export const DeliveriesPage: React.FC = () => {
  const { deliveries, addDelivery, trucks, drivers } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states
  const [plateNumber, setPlateNumber] = useState(trucks[0]?.plateNumber || '')
  const [driverName, setDriverName] = useState(drivers[0]?.fullName || '')
  const [origin, setOrigin] = useState('Dangote Plant (Muger)')
  const [destination, setDestination] = useState('Addis Ababa Central Depot')
  const [cargoType, setCargoType] = useState('OPC 42.5N Cement')
  const [cargoQuintals, setCargoQuintals] = useState<number>(700)
  const [freightChargeETB, setFreightChargeETB] = useState<number>(140000)

  const filtered = deliveries.filter((d) => {
    const matchSearch =
      d.waybillNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.destination.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || d.deliveryStatus === statusFilter
    return matchSearch && matchStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
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

    addDelivery({
      deliveryNoteNo: `DN-${Math.floor(880 + Math.random() * 100)}`,
      waybillNo: `WB-ET-2026-${Math.floor(4400 + Math.random() * 200)}`,
      truckId: matchedTruck?.id || 'TRK-01',
      plateNumber,
      driverName,
      origin,
      destination,
      cargoType,
      cargoQuintals: Number(cargoQuintals),
      departureTime: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + 6 * 3600000).toISOString(),
      deliveryStatus: 'In Transit',
      freightChargeETB: Number(freightChargeETB),
    })

    toast({
      title: 'Delivery Waybill Dispatched',
      description: `Waybill created for ${plateNumber} transporting ${cargoQuintals} Qtl to ${destination}.`,
      type: 'success',
    })

    setIsModalOpen(false)
  }

  const [viewMode, setViewMode] = useState<'radar' | 'table'>('radar')
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(deliveries[0]?.id || '')

  const selectedDelivery = deliveries.find((d) => d.id === selectedDeliveryId) || deliveries[0]

  return (
    <div className="space-y-6">
      {/* Light Green Shipments Top Bar */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-[#22C55E] via-[#24CB63] to-[#16A34A] text-[#060B08] shadow-[0_14px_45px_rgba(34,197,94,0.30)] border border-[#22C55E] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Subtle glass glow orbs */}
        <div className="absolute -top-12 -left-12 w-56 h-56 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#060B08] font-sans">
              Shipments
            </h1>

            {/* Segmented Filter Pills */}
            <div className="inline-flex items-center p-1 rounded-full bg-white/95 border border-white/60 shadow-sm text-xs">
              {['Prepaid', 'In Transit', 'Completed'].map((tab) => {
                const isActive = (tab === 'Prepaid' && statusFilter === 'ALL') || 
                                 (tab === 'In Transit' && statusFilter === 'In Transit') || 
                                 (tab === 'Completed' && statusFilter === 'Delivered')
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      if (tab === 'Prepaid') setStatusFilter('ALL')
                      else if (tab === 'In Transit') setStatusFilter('In Transit')
                      else if (tab === 'Completed') setStatusFilter('Delivered')
                    }}
                    className={`px-3.5 py-1 rounded-full font-extrabold transition-all ${
                      isActive
                        ? tab === 'In Transit'
                          ? 'bg-[#FF6B00] text-white shadow-xs'
                          : 'bg-[#060B08] text-white shadow-xs'
                        : 'text-[#060B08]/75 hover:text-[#060B08] hover:bg-[#FF6B00]/10'
                    }`}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-[#060B08]/85 max-w-xl leading-relaxed">
            Live corridor dispatch, GPS radar telemetry, and driver consignments.
          </p>
        </div>

        {/* Action Controls & View Switcher on the Green Bar */}
        <div className="relative z-10 flex items-center gap-3 flex-wrap flex-shrink-0 self-start md:self-center">
          <div className="inline-flex p-1 rounded-full bg-white/95 border border-white/60 shadow-sm text-xs">
            <button
              onClick={() => setViewMode('radar')}
              className={`px-3.5 py-1 rounded-full font-extrabold transition-all ${
                viewMode === 'radar'
                  ? 'bg-[#060B08] text-white shadow-xs'
                  : 'text-[#060B08]/75 hover:text-[#060B08]'
              }`}
            >
              Radar View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-1 rounded-full font-extrabold transition-all ${
                viewMode === 'table'
                  ? 'bg-[#060B08] text-white shadow-xs'
                  : 'text-[#060B08]/75 hover:text-[#060B08]'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white transition-all shadow-xl shadow-[#FF6B00]/30 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Add Shipment</span>
          </button>
        </div>
      </div>

      {/* Main View Mode: Image 2 Split Screen (Radar View) */}
      {viewMode === 'radar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Shipment Cards List (Image 2 style) */}
          <div className="lg:col-span-6 space-y-3.5">
            {filtered.map((del, idx) => {
              const isSelected = del.id === (selectedDelivery?.id || deliveries[0]?.id)
              return (
                <div
                  key={del.id}
                  onClick={() => setSelectedDeliveryId(del.id)}
                  className={`p-5 rounded-3xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-lg shadow-[#22C55E]/25 dark:from-[#22C55E] dark:to-[#16A34A] dark:text-black dark:shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                      : 'bg-white/75 dark:bg-[#0E1712] border border-white/80 dark:border-[#1A3323] text-foreground hover:border-[#22C55E]/50 dark:hover:border-[#22C55E]/50 backdrop-blur-xl shadow-sm'
                  }`}
                >
                  {/* Top line: Cargo title & Amount badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                            : 'bg-forest/10 dark:bg-white/5 text-forest dark:text-[#22C55E]'
                        }`}
                      >
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-tight">
                          {del.cargoType} ({del.cargoQuintals} Qtl)
                        </h4>
                        <div
                          className={`text-xs font-mono mt-0.5 ${
                            isSelected ? 'text-white/80 dark:text-black/75' : 'text-muted-foreground'
                          }`}
                        >
                          #{del.waybillNo} &bull; {del.plateNumber}
                        </div>
                      </div>
                    </div>

                    {/* Amount badge */}
                    <div
                      className={`text-sm font-bold font-mono px-3 py-1 rounded-full ${
                        isSelected
                          ? 'bg-white/25 text-white dark:bg-black/20 dark:text-black'
                          : 'bg-surface-elevated text-foreground'
                      }`}
                    >
                      {formatCurrency(del.freightChargeETB, { hideDecimals: true })}
                    </div>
                  </div>

                  {/* Route Corridor Dashed Line */}
                  <div className="mt-4 pt-3 border-t border-current/15">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="truncate max-w-[120px]">{del.origin.split(' (')[0]}</span>
                      
                      {/* Dashed connector with distance badge */}
                      <div className="flex-1 flex items-center justify-center px-3 relative">
                        <div className="w-full border-t border-dashed border-current/40" />
                        <span
                          className={`absolute px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isSelected
                              ? 'bg-white/30 text-white dark:bg-black/30 dark:text-black'
                              : 'bg-surface-elevated text-muted-foreground'
                          }`}
                        >
                          320 km
                        </span>
                      </div>

                      <span className="truncate max-w-[120px] text-right">{del.destination.split(' ')[0]}</span>
                    </div>

                    {/* Dates line */}
                    <div
                      className={`flex items-center justify-between text-[11px] mt-2 font-mono ${
                        isSelected ? 'text-white/80 dark:text-black/75' : 'text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>Pickup: {formatDateTime(del.departureTime).split(',')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Delivery: {formatDateTime(del.estimatedArrival).split(',')[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Real-time Highway Radar Map (Image 2 style) */}
          <div className="lg:col-span-6">
            <div className="sticky top-20 rounded-3xl border border-[#1A2E22] bg-[#080F0B] p-6 text-white min-h-[500px] flex flex-col justify-between overflow-hidden shadow-xl dark:shadow-glow relative">
              {/* Background Map Grid & Roads */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#22C55E 1px, transparent 1px), radial-gradient(#1A3323 1px, #080F0B 1px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px',
                }}
              />

              {/* Glowing SVG Highway Corridor (London to Manchester style) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                <svg viewBox="0 0 400 450" className="w-full h-full overflow-visible">
                  <defs>
                    <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Highway road vectors in background */}
                  <path
                    d="M 60 400 Q 150 350 180 280 T 260 120 T 320 60"
                    fill="none"
                    stroke="#1E3326"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 120 420 Q 200 320 220 220 T 280 40"
                    fill="none"
                    stroke="#13241A"
                    strokeWidth="4"
                    strokeDasharray="4 4"
                  />

                  {/* Active glowing green route track (Image 2 exact track) */}
                  <path
                    d="M 100 380 C 130 340, 170 320, 200 250 C 230 180, 220 120, 260 80"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#glow-green)"
                  />

                  {/* Origin Beacon Pin (Green Pin) */}
                  <circle cx="100" cy="380" r="12" fill="#22C55E" fillOpacity="0.25" />
                  <circle cx="100" cy="380" r="6" fill="#22C55E" />
                  <text x="115" y="385" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                    {selectedDelivery?.origin.split(' ')[0] || 'Addis Ababa'}
                  </text>

                  {/* Mid-route Waypoint (Green Beacon Arrow) */}
                  <circle cx="200" cy="250" r="10" fill="#22C55E" fillOpacity="0.4" />
                  <polygon points="200,244 205,254 195,254" fill="#22C55E" />
                  <text x="215" y="254" fill="#8EA696" fontSize="11" fontWeight="600">
                    Mojo Dry Port
                  </text>

                  {/* Destination Beacon Pin (Red Pin) */}
                  <circle cx="260" cy="80" r="14" fill="#EF4444" fillOpacity="0.25" />
                  <circle cx="260" cy="80" r="6" fill="#EF4444" />
                  <text x="280" y="85" fill="#FFFFFF" fontSize="13" fontWeight="bold">
                    {selectedDelivery?.destination.split(' ')[0] || 'Adama'}
                  </text>

                  {/* Radar transponder dots */}
                  <circle cx="310" cy="190" r="4" fill="#FF6B00" fillOpacity="0.85" />
                  <circle cx="90" cy="180" r="4" fill="#FF6B00" fillOpacity="0.85" />
                  <circle cx="140" cy="90" r="4" fill="#FF6B00" fillOpacity="0.85" />
                </svg>
              </div>

              {/* Top Map Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-[#1A2E22] pb-4">
                <div>
                  <div className="text-[11px] font-mono text-[#22C55E] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
                    <span>Live GPS Corridor Telemetry</span>
                  </div>
                  <h3 className="text-lg font-bold font-mono mt-0.5 text-white">
                    {selectedDelivery?.plateNumber} &bull; {selectedDelivery?.driverName}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-[#22C55E]">
                    68 <span className="text-xs font-normal text-white/60">km/h</span>
                  </div>
                  <div className="text-[10px] text-white/60 font-mono">Modjo Corridor</div>
                </div>
              </div>

              {/* Bottom Floating Status Bar (Exact Image 2 style) */}
              <div className="relative z-10 mt-auto pt-4 border-t border-[#1A2E22] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-white">
                    Order ID - #{selectedDelivery?.waybillNo}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/40">
                    ON THE WAY
                  </span>
                </div>

                <Link
                  to="/fleet/gps"
                  className="text-xs font-bold font-mono text-[#22C55E] hover:underline"
                >
                  Full Radar &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
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
                    <th className="py-3 px-4">Waybill Number</th>
                    <th className="py-3 px-4">Truck Plate</th>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Transit Route</th>
                    <th className="py-3 px-4">Cargo &amp; Payload</th>
                    <th className="py-3 px-4 text-right">Freight Charge (ETB)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((del) => (
                    <tr key={del.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        {del.waybillNo}
                        <div className="text-[10px] text-muted-foreground font-normal">
                          Note: {del.deliveryNoteNo}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-foreground whitespace-nowrap">
                        {del.plateNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                        {del.driverName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <MapPin className="w-3.5 h-3.5 text-forest dark:text-forest-vibrant flex-shrink-0" />
                          <span>{del.origin}</span>
                          <span className="text-muted-foreground">&rarr;</span>
                          <span>{del.destination}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-foreground">
                          {formatQuantity(del.cargoQuintals, 'Qtl')}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {del.cargoType}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        {formatCurrency(del.freightChargeETB, { hideDecimals: true })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={del.deliveryStatus} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Dispatch Delivery */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Dispatch Cement Transport Waybill
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Authorize commercial freight trip from plant or depot with official waybill number.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Select Commercial Truck
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
                    Assigned Heavy Driver
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
                    Destination Site / Depot
                  </label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                    placeholder="e.g. Kality Central Depot"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Cargo Grade
                  </label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    <option value="OPC 42.5N Cement">OPC 42.5N Cement</option>
                    <option value="PPC 32.5R Cement">PPC 32.5R Cement</option>
                    <option value="Bulk Cement Tanker">Bulk Cement Tanker</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Payload (Quintals)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cargoQuintals}
                    onChange={(e) => setCargoQuintals(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Agreed Freight Charge (ETB)
                </label>
                <input
                  type="number"
                  min="1000"
                  value={freightChargeETB}
                  onChange={(e) => setFreightChargeETB(Number(e.target.value))}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold"
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
                  Issue &amp; Dispatch Waybill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
