import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Wrench,
  AlertTriangle,
  Truck,
  CheckCircle2,
  Clock,
  X,
  DollarSign,
  ShieldCheck,
  Sliders,
  ChevronRight,
  Gauge,
  Plus,
  Search,
  Filter,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { MaintenanceRecord } from '@/types'

export const ServicePage: React.FC = () => {
  const {
    maintenance,
    addMaintenance,
    updateTruckConfig,
    trucks,
    bankAccounts,
  } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OVERDUE' | 'DUE_SOON' | 'HEALTHY'>('ALL')

  // Log Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [truckPlate, setTruckPlate] = useState(trucks[0]?.plateNumber || '')
  const [serviceType, setServiceType] = useState('10,000 km Scheduled Engine Oil, Filter & Water Separator Service')
  const [workshopName, setWorkshopName] = useState('TotalEnergies Truck Center Akaki')
  const [costETB, setCostETB] = useState<number>(38500)
  const [currentOdometerInput, setCurrentOdometerInput] = useState<number>(trucks[0]?.mileageKm || 142800)
  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts[0]?.id || 'BANK-01')
  const [disbursementRef, setDisbursementRef] = useState<string>(`CBE-MNT-2026-${Date.now().toString().slice(-4)}`)
  const [serviceIntervalKm, setServiceIntervalKm] = useState<number>(10000)
  const [nextServiceDueKm, setNextServiceDueKm] = useState<number>(152800)
  const [notes, setNotes] = useState('Routine 10,000 km preventive overhaul: 15W-40 CI-4 commercial diesel engine oil, dual spin-on filters, fuel strainer.')

  // Service Due Trucks Computation
  const serviceDueTrucks = trucks.filter((truck) => {
    const currentKm = truck.mileageKm || 0
    const nextKm = truck.nextServiceDueKm || (truck.serviceIntervalKm || 10000)
    return currentKm >= nextKm
  })

  const serviceDueSoonTrucks = trucks.filter((truck) => {
    const currentKm = truck.mileageKm || 0
    const nextKm = truck.nextServiceDueKm || (truck.serviceIntervalKm || 10000)
    const diff = nextKm - currentKm
    return diff > 0 && diff <= 2000
  })

  // Pre-fill modal for a specific truck when logging oil change
  const handleQuickLogOilChange = (plate: string) => {
    const target = trucks.find((t) => t.plateNumber === plate)
    const currentKm = target?.mileageKm || 0
    const interval = target?.serviceIntervalKm || 10000

    setTruckPlate(plate)
    setCurrentOdometerInput(currentKm)
    setServiceType('10,000 km Scheduled Engine Oil, Filter & Water Separator Service')
    setServiceIntervalKm(interval)
    setNextServiceDueKm(currentKm + interval)
    setCostETB(38500)
    setDisbursementRef(`CBE-MNT-2026-${Date.now().toString().slice(-4)}`)
    setNotes(`Routine 10,000 km preventive overhaul: 15W-40 CI-4 commercial diesel engine oil, dual spin-on filters, fuel strainer.`)
    if (target?.designatedWorkshop || target?.preferredWorkshop) {
      setWorkshopName(target.designatedWorkshop || target.preferredWorkshop || 'TotalEnergies Truck Center Akaki')
    }
    setIsServiceModalOpen(true)
  }

  // Handle changing truck in maintenance modal
  const handleTruckChangeInModal = (plate: string) => {
    setTruckPlate(plate)
    const target = trucks.find((t) => t.plateNumber === plate)
    if (target) {
      const currentKm = target.mileageKm || 0
      const interval = target.serviceIntervalKm || 10000
      setCurrentOdometerInput(currentKm)
      setServiceIntervalKm(interval)
      setNextServiceDueKm(currentKm + interval)
      if (target.designatedWorkshop || target.preferredWorkshop) {
        setWorkshopName(target.designatedWorkshop || target.preferredWorkshop || 'TotalEnergies Truck Center Akaki')
      }
    }
  }

  // Submit Scheduled Service Record
  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!truckPlate || costETB <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select a commercial truck plate and enter valid service cost.',
        type: 'error',
      })
      return
    }

    const matchedBank = bankAccounts.find((b) => b.id === selectedBankId)
    const serviceDate = new Date().toISOString().split('T')[0]
    const calculatedNextDueKm = currentOdometerInput + serviceIntervalKm

    addMaintenance({
      truckPlate,
      serviceType,
      date: serviceDate,
      costETB,
      workshopName,
      status: 'Completed',
      notes,
      lastServiceKm: currentOdometerInput,
      serviceIntervalKm,
      nextServiceDueKm: calculatedNextDueKm,
      paymentMethod: 'Bank Transfer',
      paidFromAccountId: selectedBankId,
      paidFromAccountName: matchedBank ? `${matchedBank.bankName} (${matchedBank.accountNumber})` : 'Commercial Bank of Ethiopia',
      disbursementRef,
      businessActivity: 'Transport',
      partsReplaced: '15W-40 CI-4 Engine Oil (36L), Engine Oil Filter (2x), Primary Fuel Filter, Water Separator Element',
    })

    // Reset odometer counter for the truck in store
    updateTruckConfig(truckPlate, {
      mileageKm: currentOdometerInput,
      serviceIntervalKm,
    })

    toast({
      title: 'Scheduled Service Logged & Counter Reset',
      description: `Truck ${truckPlate} service recorded. Next 10,000 km service due at ${calculatedNextDueKm.toLocaleString()} km. Debit entry posted to General Ledger.`,
      type: 'success',
    })

    setIsServiceModalOpen(false)
  }

  // Filter trucks for live monitor
  const filteredTrucks = trucks.filter((truck) => {
    const matchSearch =
      truck.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.makeModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.driverName.toLowerCase().includes(searchTerm.toLowerCase())

    const currentKm = truck.mileageKm || 0
    const lastKm = truck.lastServiceKm || (truck.nextServiceDueKm ? truck.nextServiceDueKm - 10000 : 0)
    const interval = truck.serviceIntervalKm || 10000
    const nextDueKm = truck.nextServiceDueKm || (lastKm + interval)
    const kmRemaining = nextDueKm - currentKm
    const isOverdue = kmRemaining <= 0
    const isDueSoon = !isOverdue && kmRemaining <= 2000

    if (!matchSearch) return false
    if (statusFilter === 'OVERDUE') return isOverdue
    if (statusFilter === 'DUE_SOON') return isDueSoon
    if (statusFilter === 'HEALTHY') return !isOverdue && !isDueSoon
    return true
  })

  // Filter scheduled service history records
  const scheduledServiceRecords = maintenance.filter((m) =>
    m.serviceType.toLowerCase().includes('service') ||
    m.serviceType.toLowerCase().includes('oil') ||
    m.serviceType.toLowerCase().includes('10,000') ||
    m.serviceType.toLowerCase().includes('preventive')
  )

  const totalServiceSpend = scheduledServiceRecords.reduce((acc, r) => acc + r.costETB, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduled Service & Oil Cycles"
        description="Live truck odometer tracking, 10,000 km engine oil & filter cycles, and routine preventive service records."
        breadcrumbs={[
          { label: 'Transport & Fleet', href: '/fleet' },
          { label: 'Scheduled Service' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/configuration?tab=trucks"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-purple-500/40 hover:bg-purple-500/10 text-foreground transition-all shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Master Configuration</span>
            </Link>
            <Link
              to="/fleet/maintenance"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-forest/30 hover:bg-forest/10 text-foreground transition-all shadow-xs"
            >
              <Wrench className="w-3.5 h-3.5 text-forest" />
              <span>Maintenance &amp; Repairs &rarr;</span>
            </Link>
            <button
              onClick={() => {
                const target = trucks[0]
                if (target) handleQuickLogOilChange(target.plateNumber)
                else setIsServiceModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log 10,000 km Service</span>
            </button>
          </div>
        }
      />

      {/* KPI METRICS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Active Commercial Fleet</span>
            <Truck className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            {trucks.length} Commercial Rigs
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Heavy-duty Sinotruk HOWO &amp; Actros
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Overdue for Oil Service</span>
            <AlertTriangle className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#FF6B00]">
            {serviceDueTrucks.length} Trucks Overdue
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Exceeded configured service interval
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Approaching Service</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-500">
            {serviceDueSoonTrucks.length} Trucks Due Soon
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Within 2,000 km notification window
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Preventive Service Spend</span>
            <DollarSign className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            {formatCurrency(totalServiceSpend, { hideDecimals: true })}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {scheduledServiceRecords.length} completed routine oil overhauls
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by truck plate, model, or driver..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border/80 text-xs overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-forest text-white shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Rigs ({trucks.length})
          </button>
          <button
            onClick={() => setStatusFilter('OVERDUE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'OVERDUE'
                ? 'bg-[#FF6B00] text-white shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Overdue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {serviceDueTrucks.length}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('DUE_SOON')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'DUE_SOON'
                ? 'bg-amber-500 text-white shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Due Soon</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {serviceDueSoonTrucks.length}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('HEALTHY')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'HEALTHY'
                ? 'bg-emerald-600 text-white shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Healthy
          </button>
        </div>
      </div>

      {/* LIVE ODOMETER & OIL CYCLE MONITOR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTrucks.map((truck) => {
          const currentKm = truck.mileageKm || 0
          const lastKm = truck.lastServiceKm || (truck.nextServiceDueKm ? truck.nextServiceDueKm - 10000 : 0)
          const interval = truck.serviceIntervalKm || 10000
          const nextDueKm = truck.nextServiceDueKm || (lastKm + interval)
          const kmSinceLastService = Math.max(0, currentKm - lastKm)
          const kmRemaining = nextDueKm - currentKm
          const isOverdue = kmRemaining <= 0
          const progressPercent = Math.min(100, Math.round((kmSinceLastService / interval) * 100))

          return (
            <div
              key={truck.id}
              className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between shadow-card ${
                isOverdue
                  ? 'border-[#FF6B00]/40 bg-[#FF6B00]/5'
                  : kmRemaining <= 2000
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-border/80 bg-surface/90 hover:border-forest/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="font-mono font-black text-base text-foreground tracking-wide">
                      {truck.plateNumber}
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                      {truck.makeModel} &bull; {truck.driverName}
                    </div>
                  </div>
                  {isOverdue ? (
                    <span className="px-2.5 py-1 rounded-md font-mono text-xs font-black bg-[#FF6B00] text-white shadow-xs">
                      +{Math.abs(kmRemaining).toLocaleString()} km OVERDUE
                    </span>
                  ) : kmRemaining <= 2000 ? (
                    <span className="px-2.5 py-1 rounded-md font-mono text-xs font-bold bg-amber-500 text-white">
                      Due in {kmRemaining.toLocaleString()} km
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md font-mono text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {kmRemaining.toLocaleString()} km left
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">
                      Cycle: {kmSinceLastService.toLocaleString()} / {interval.toLocaleString()} km
                    </span>
                    <span className={isOverdue ? 'font-bold text-[#FF6B00]' : 'text-foreground'}>
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${
                        isOverdue
                          ? 'bg-[#FF6B00]'
                          : kmRemaining <= 2000
                          ? 'bg-amber-500'
                          : 'bg-forest'
                      }`}
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Details Strip */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-border/70 my-2">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Current Odometer</span>
                    <span className="font-mono font-bold text-foreground">
                      {currentKm.toLocaleString()} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Target Due</span>
                    <span className="font-mono font-bold text-foreground">
                      {nextDueKm.toLocaleString()} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Oil Grade</span>
                    <span className="font-medium text-foreground truncate block">
                      {truck.engineOilGrade || '15W-40 CI-4'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Facility</span>
                    <span className="font-medium text-foreground truncate block">
                      {truck.designatedWorkshop || truck.preferredWorkshop || 'Akaki Workshop'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 mt-2">
                <button
                  onClick={() => handleQuickLogOilChange(truck.plateNumber)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    isOverdue
                      ? 'bg-[#FF6B00] hover:bg-[#EA580C] text-white shadow-[#FF6B00]/25'
                      : 'bg-forest hover:bg-forest-dark text-white'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Log 10,000 km Service</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* SCHEDULED SERVICE AUDIT HISTORY TABLE */}
      <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Scheduled Preventive Service Logs
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Completed engine oil, filter replacement, and preventive overhaul disbursements.
            </p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {scheduledServiceRecords.length} Service Logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-elevated text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Plate Number</th>
                <th className="py-3 px-4">Odometer at Service</th>
                <th className="py-3 px-4">Next Due (km)</th>
                <th className="py-3 px-4">Service Details</th>
                <th className="py-3 px-4">Workshop Facility</th>
                <th className="py-3 px-4">Disbursement Ref</th>
                <th className="py-3 px-4 text-right">Cost (ETB)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scheduledServiceRecords.map((record) => (
                <tr key={record.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                    {formatDate(record.date)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    {record.truckPlate}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-foreground">
                    {record.lastServiceKm ? `${record.lastServiceKm.toLocaleString()} km` : '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-forest font-semibold">
                    {record.nextServiceDueKm ? `${record.nextServiceDueKm.toLocaleString()} km` : '—'}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-foreground font-medium" title={record.serviceType}>
                    {record.serviceType}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {record.workshopName}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                    {record.disbursementRef || '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                    {formatCurrency(record.costETB)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{record.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center shadow-subtle">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Log 10,000 km Scheduled Service
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Reset truck odometer cycle and post GL maintenance disbursement.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Select Commercial Truck Plate *
                </label>
                <select
                  value={truckPlate}
                  onChange={(e) => handleTruckChangeInModal(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border rounded-lg text-foreground font-mono font-bold focus:ring-1 focus:ring-forest"
                >
                  {trucks.map((t) => (
                    <option key={t.id} value={t.plateNumber}>
                      {t.plateNumber} — {t.makeModel} ({t.mileageKm?.toLocaleString()} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Current Odometer (km) *
                  </label>
                  <input
                    type="number"
                    required
                    value={currentOdometerInput}
                    onChange={(e) => {
                      const km = Number(e.target.value)
                      setCurrentOdometerInput(km)
                      setNextServiceDueKm(km + serviceIntervalKm)
                    }}
                    className="w-full p-2.5 bg-surface border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Next Due Target (km)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={nextServiceDueKm}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-lg text-forest font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Preventive Service Description
                </label>
                <input
                  type="text"
                  required
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border rounded-lg text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Authorized Workshop Facility
                  </label>
                  <input
                    type="text"
                    required
                    value={workshopName}
                    onChange={(e) => setWorkshopName(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Total Service Cost (ETB) *
                  </label>
                  <input
                    type="number"
                    required
                    value={costETB}
                    onChange={(e) => setCostETB(Number(e.target.value))}
                    className="w-full p-2.5 bg-surface border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Payment Bank Account
                  </label>
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-lg text-foreground"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} ({b.accountNumber.slice(-4)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Bank Disbursement Wire Ref
                  </label>
                  <input
                    type="text"
                    required
                    value={disbursementRef}
                    onChange={(e) => setDisbursementRef(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Workshop Notes &amp; Consumables
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border rounded-lg text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-surface-elevated text-foreground font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-forest hover:bg-forest-dark text-white font-extrabold shadow-subtle hover:scale-105 active:scale-95 transition-all"
                >
                  Confirm &amp; Reset Odometer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
