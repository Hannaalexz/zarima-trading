import React, { useState } from 'react'
import {
  Plus,
  Wrench,
  AlertTriangle,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  X,
  DollarSign,
  BookOpen,
  Check,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  Settings2,
  Sliders,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { FleetPurchase, MaintenanceRecord } from '@/types'

export const MaintenancePage: React.FC = () => {
  const {
    maintenance,
    addMaintenance,
    toggleReconcileMaintenance,
    fleetPurchases,
    addFleetPurchase,
    toggleReconcileFleetPurchase,
    updateTruckServiceInterval,
    trucks,
    bankAccounts,
    transactions,
  } = useStore()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'maintenance' | 'purchases' | 'journal' | 'intervals'>('maintenance')
  const [searchTerm, setSearchTerm] = useState('')

  // Maintenance Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [truckPlate, setTruckPlate] = useState(trucks[0]?.plateNumber || '')
  const [serviceType, setServiceType] = useState('10,000 km Engine Oil, Filter & Water Separator Overhaul')
  const [workshopName, setWorkshopName] = useState('TotalEnergies Truck Center Akaki')
  const [costETB, setCostETB] = useState<number>(38500)
  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts[0]?.id || 'BANK-01')
  const [disbursementRef, setDisbursementRef] = useState<string>(`CBE-MNT-2026-${Date.now().toString().slice(-4)}`)
  const [serviceIntervalKm, setServiceIntervalKm] = useState<number>(10000)
  const [nextServiceDueKm, setNextServiceDueKm] = useState<number>(152800)
  const [nextServiceDueDate, setNextServiceDueDate] = useState('2026-11-25')
  const [notes, setNotes] = useState('Routine 10,000 km interval: Shell Rimula 15W-40, oil filter & primary fuel separator cartridge.')

  // Fleet Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [purchaseTruckPlate, setPurchaseTruckPlate] = useState(trucks[0]?.plateNumber || 'Depot Spare Parts Stock')
  const [purchaseCategory, setPurchaseCategory] = useState<FleetPurchase['category']>('Tires')
  const [itemDescription, setItemDescription] = useState('')
  const [quantity, setQuantity] = useState<number>(4)
  const [unitPriceETB, setUnitPriceETB] = useState<number>(38500)
  const [supplierName, setSupplierName] = useState('Horizon Tyre SC (Addis Ababa)')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [purchaseBankId, setPurchaseBankId] = useState<string>(bankAccounts[0]?.id || 'BANK-01')
  const [purchaseRef, setPurchaseRef] = useState<string>(`CBE-FP-2026-${Date.now().toString().slice(-4)}`)
  const [paymentStatus, setPaymentStatus] = useState<FleetPurchase['paymentStatus']>('Paid')
  const [receiptNo, setReceiptNo] = useState('')
  const [purchaseNotes, setPurchaseNotes] = useState('')

  // Service Interval Customization Modal State
  const [isIntervalModalOpen, setIsIntervalModalOpen] = useState(false)
  const [intervalTruckPlate, setIntervalTruckPlate] = useState<string>(trucks[0]?.plateNumber || '')
  const [newIntervalKm, setNewIntervalKm] = useState<number>(10000)

  // Service Due Trucks Calculations
  const serviceDueTrucks = trucks.filter((t) => {
    const isKmDue = t.nextServiceDueKm ? t.mileageKm >= t.nextServiceDueKm : false
    const isDateDue = t.nextServiceDueDate ? new Date(t.nextServiceDueDate) <= new Date() : false
    return isKmDue || isDateDue
  })

  // Pre-fill modal for a specific truck when logging oil change
  const handleQuickLogOilChange = (plate: string) => {
    const target = trucks.find((t) => t.plateNumber === plate)
    const currentKm = target?.mileageKm || 0
    const interval = target?.serviceIntervalKm || 10000

    setTruckPlate(plate)
    setServiceType('10,000 km Scheduled Engine Oil & Filter Change')
    setServiceIntervalKm(interval)
    setNextServiceDueKm(currentKm + interval)
    setCostETB(32500)
    setDisbursementRef(`CBE-MNT-2026-${Date.now().toString().slice(-4)}`)
    setNotes(`10,000 km heavy haul maintenance: 15W-40 commercial diesel engine oil, dual spin-on filters, fuel strainer.`)
    setIsServiceModalOpen(true)
  }

  // Handle changing truck in maintenance modal
  const handleTruckChangeInModal = (plate: string) => {
    setTruckPlate(plate)
    const target = trucks.find((t) => t.plateNumber === plate)
    if (target) {
      const interval = target.serviceIntervalKm || 10000
      setServiceIntervalKm(interval)
      setNextServiceDueKm(target.mileageKm + interval)
    }
  }

  // Submit Maintenance Service Record
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

    const matchedBank = bankAccounts.find((b) => b.id === selectedBankId) || bankAccounts[0]
    const targetTruck = trucks.find((t) => t.plateNumber === truckPlate)
    const currentMileage = targetTruck?.mileageKm || 0

    addMaintenance({
      truckPlate,
      serviceType,
      date: new Date().toISOString().split('T')[0],
      workshopName,
      costETB: Number(costETB),
      status: 'Completed',
      lastServiceKm: currentMileage,
      serviceIntervalKm: Number(serviceIntervalKm || 10000),
      nextServiceDueKm: Number(nextServiceDueKm),
      nextServiceDueDate,
      paidFromAccountId: matchedBank.id,
      paidFromAccountName: matchedBank.bankName,
      paymentMethod: 'Bank Transfer',
      disbursementRef: disbursementRef.trim() || `CBE-MNT-2026-${Date.now().toString().slice(-4)}`,
      notes: notes.trim(),
    })

    toast({
      title: 'Service & Journal Entry Created',
      description: `Logged 10,000 km service for ${truckPlate} (${formatCurrency(costETB)}). Debit: 5200 (Fleet Expense) | Credit: ${matchedBank.bankName}. Next service due at ${nextServiceDueKm.toLocaleString()} km.`,
      type: 'success',
    })

    setIsServiceModalOpen(false)
  }

  // Submit Fleet Purchase
  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemDescription.trim() || quantity <= 0 || unitPriceETB <= 0 || !supplierName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please specify item description, valid quantity, rate, and supplier.',
        type: 'error',
      })
      return
    }

    const totalCost = Number(quantity) * Number(unitPriceETB)
    const matchedBank = bankAccounts.find((b) => b.id === purchaseBankId) || bankAccounts[0]

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
      paidFromAccountId: matchedBank.id,
      paidFromAccountName: matchedBank.bankName,
      paymentMethod: 'Bank Transfer',
      disbursementRef: purchaseRef.trim() || `CBE-FP-2026-${Date.now().toString().slice(-4)}`,
      receiptNo: receiptNo.trim() || `REC-${Date.now().toString().slice(-4)}`,
      notes: purchaseNotes.trim(),
      businessActivity: 'Transport',
    })

    toast({
      title: 'Fleet Purchase Registered & Journal Posted',
      description: `Purchased ${quantity}x ${itemDescription} (${formatCurrency(totalCost)}). Posted to GL (Debit: 5210 Spare Parts / Credit: ${matchedBank.bankName}).`,
      type: 'success',
    })

    setIsPurchaseModalOpen(false)
    setItemDescription('')
    setReceiptNo('')
    setPurchaseNotes('')
  }

  // Save Service Interval
  const handleSaveInterval = (e: React.FormEvent) => {
    e.preventDefault()
    if (!intervalTruckPlate || newIntervalKm <= 0) {
      toast({
        title: 'Invalid Interval',
        description: 'Please enter a valid mileage threshold greater than 0 km.',
        type: 'error',
      })
      return
    }

    updateTruckServiceInterval(intervalTruckPlate, Number(newIntervalKm))
    toast({
      title: 'Service Interval Updated',
      description: `Truck ${intervalTruckPlate} preventive service threshold set to every ${newIntervalKm.toLocaleString()} km.`,
      type: 'success',
    })
    setIsIntervalModalOpen(false)
  }

  // Filter Maintenance
  const filteredMaintenance = maintenance.filter(
    (m) =>
      m.truckPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.workshopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.disbursementRef && m.disbursementRef.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Filter Fleet Purchases
  const filteredPurchases = fleetPurchases.filter(
    (p) =>
      p.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.truckPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.purchaseInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.disbursementRef && p.disbursementRef.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Fleet GL Transactions (Debit 5200 / 5210, Credit Bank 1010)
  const fleetJournalEntries = transactions.filter(
    (tx) =>
      tx.category === 'Truck Maintenance & Servicing' ||
      tx.category === 'Fleet Spare Parts & Tires' ||
      tx.referenceNumber?.startsWith('CBE-MNT') ||
      tx.referenceNumber?.startsWith('AWB-MNT') ||
      tx.referenceNumber?.startsWith('CBE-FP') ||
      tx.referenceNumber?.startsWith('AWB-FP') ||
      tx.notes?.includes('Debit: Fleet Operating Expense')
  )

  const filteredJournalEntries = fleetJournalEntries.filter(
    (tx) =>
      tx.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.toAccount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromAccount?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.costETB, 0)
  const totalFleetPurchasesCost = fleetPurchases.reduce((sum, p) => sum + p.totalCostETB, 0)
  const totalCombinedFleetExpenditure = totalMaintenanceCost + totalFleetPurchasesCost

  const reconciledMaintenanceCount = maintenance.filter((m) => m.isReconciled).length
  const reconciledPurchasesCount = fleetPurchases.filter((p) => p.isReconciled).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Maintenance & Purchases"
        description="10,000 km preventive oil change tracking, double-entry expense journal posting (Debit 5200 / Credit 1010 Bank), and automated bank reconciliation."
        breadcrumbs={[
          { label: 'Transport & Fleet', href: '/fleet' },
          { label: 'Maintenance & Purchases' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsIntervalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-border hover:bg-surface-elevated text-foreground transition-all shadow-xs"
            >
              <Settings2 className="w-3.5 h-3.5 text-forest" />
              <span>Configure 10,000 km Intervals</span>
            </button>
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-[#FF6B00]/40 hover:bg-[#FF6B00]/10 text-foreground transition-all shadow-xs"
            >
              <Package className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Register Parts Purchase</span>
            </button>
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

      {/* HOW SERVICE IS TRACKED & 10,000 KM PREVENTIVE MONITOR */}
      <div className="rounded-2xl border border-forest/30 bg-gradient-to-br from-forest/10 via-surface/95 to-surface p-5 shadow-card backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-border/80">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shrink-0 shadow-lg shadow-forest/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-foreground">
                  Preventive Maintenance Cycle: 10,000 KM Engine Oil &amp; Filter Rule
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-forest text-white uppercase tracking-wider">
                  Automated Tracking
                </span>
                {serviceDueTrucks.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00] text-white animate-pulse">
                    {serviceDueTrucks.length} Overdue
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                <strong>How it works:</strong> Heavy commercial diesel rigs run on a standard <strong>10,000 km</strong> oil and filter cycle. As deliveries accumulate trip distance, the system notifies you when the truck hits the threshold. Logging the service resets the odometer counter, deducts the expense from the company bank account, and creates a matched Debit/Credit journal entry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start">
            <div className="text-right">
              <div className="text-[11px] text-muted-foreground">Standard Interval</div>
              <div className="text-sm font-bold font-mono text-forest">Every 10,000 km</div>
            </div>
            <button
              onClick={() => setIsIntervalModalOpen(true)}
              className="p-2 rounded-lg bg-surface border border-border hover:bg-forest/10 text-muted-foreground hover:text-forest transition-colors"
              title="Change Interval Setting"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TRUCK INTERVAL LIVE MONITOR CARDS */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {trucks.map((truck) => {
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
                className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                  isOverdue
                    ? 'border-[#FF6B00]/40 bg-[#FF6B00]/5 shadow-xs'
                    : kmRemaining <= 2000
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-border/80 bg-surface/90 hover:border-forest/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-sm text-foreground">
                        {truck.plateNumber}
                      </span>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                        {truck.makeModel}
                      </div>
                    </div>
                    {isOverdue ? (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#FF6B00] text-white">
                        +{Math.abs(kmRemaining).toLocaleString()} km OVERDUE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-forest/15 text-forest">
                        {kmRemaining.toLocaleString()} km left
                      </span>
                    )}
                  </div>

                  {/* Visual Progress Bar towards 10,000 km */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Cycle Progress ({kmSinceLastService.toLocaleString()} / {interval.toLocaleString()} km)</span>
                      <span className="font-bold">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden border border-border/60">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverdue
                            ? 'bg-[#FF6B00]'
                            : progressPercent > 80
                            ? 'bg-amber-500'
                            : 'bg-forest'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <div className="text-muted-foreground text-[10px]">Odometer</div>
                      <div className="font-bold text-foreground">{currentKm.toLocaleString()} km</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[10px]">Next Due (10k)</div>
                      <div className={`font-bold ${isOverdue ? 'text-[#FF6B00]' : 'text-foreground'}`}>
                        {nextDueKm.toLocaleString()} km
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center gap-2">
                  <button
                    onClick={() => handleQuickLogOilChange(truck.plateNumber)}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isOverdue
                        ? 'bg-[#FF6B00] hover:bg-[#e05e00] text-white shadow-xs'
                        : 'bg-forest/15 hover:bg-forest hover:text-white text-forest'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Log 10,000 km Service</span>
                  </button>
                  <button
                    onClick={() => {
                      setIntervalTruckPlate(truck.plateNumber)
                      setNewIntervalKm(truck.serviceIntervalKm || 10000)
                      setIsIntervalModalOpen(true)
                    }}
                    className="p-1.5 rounded-lg bg-surface border border-border hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
                    title="Change Interval"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FINANCIAL & RECONCILIATION SUMMARY KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Total Servicing (GL 5200)</span>
            <Wrench className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            {formatCurrency(totalMaintenanceCost, { hideDecimals: true })}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>{maintenance.length} workshop records</span>
            <span className="text-forest font-semibold">{reconciledMaintenanceCount} Reconciled</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Spare Parts &amp; Tires (GL 5210)</span>
            <Package className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            {formatCurrency(totalFleetPurchasesCost, { hideDecimals: true })}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>{fleetPurchases.length} parts batches</span>
            <span className="text-[#FF6B00] font-semibold">{reconciledPurchasesCount} Reconciled</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Total Fleet Outflows (GL Credit)</span>
            <DollarSign className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            {formatCurrency(totalCombinedFleetExpenditure, { hideDecimals: true })}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Debited from operating bank accounts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Bank Statement Match Rate</span>
            <ShieldCheck className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl font-bold font-mono text-forest">
            {Math.round(
              ((reconciledMaintenanceCount + reconciledPurchasesCount) /
                Math.max(1, maintenance.length + fleetPurchases.length)) *
                100
            )}
            %
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {reconciledMaintenanceCount + reconciledPurchasesCount} of {maintenance.length + fleetPurchases.length} transactions reconciled
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'maintenance'
                ? 'bg-forest text-white shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Maintenance Logs</span>
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'purchases'
                ? 'bg-[#FF6B00] text-white shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Fleet Purchases &amp; Parts</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'purchases' ? 'bg-white/20 text-white' : 'bg-surface text-muted-foreground'
              }`}
            >
              {fleetPurchases.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'journal'
                ? 'bg-blue-600 text-white shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>General Ledger Journal (Debit/Credit)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'journal' ? 'bg-white/20 text-white' : 'bg-surface text-muted-foreground'
              }`}
            >
              {fleetJournalEntries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('intervals')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'intervals'
                ? 'bg-purple-600 text-white shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Interval Settings</span>
          </button>
        </div>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={
            activeTab === 'maintenance'
              ? 'Search by truck plate, workshop, wire ref...'
              : activeTab === 'purchases'
              ? 'Search parts, plate, supplier, invoice...'
              : 'Search journal entries, GL accounts, references...'
          }
          className="w-full sm:w-80"
        />
      </div>

      {/* TAB 1: WORKSHOP MAINTENANCE TABLE (WITH TICK TO RECONCILE & BANK REF) */}
      {activeTab === 'maintenance' && (
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
          <div className="p-3.5 bg-surface-elevated/50 border-b border-border flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-2">
              <Wrench className="w-4 h-4 text-forest" />
              <span>Commercial Fleet Workshop Logs &amp; Bank Disbursals</span>
            </span>
            <span className="text-muted-foreground text-[11px]">
              Tick the box on any row to mark reconciled against CBE / Awash bank statements
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-3 text-center w-12">Reconcile</th>
                  <th className="py-3 px-4">Date &amp; Ref</th>
                  <th className="py-3 px-4">Truck Plate</th>
                  <th className="py-3 px-4">Service Description</th>
                  <th className="py-3 px-4">Workshop Facility</th>
                  <th className="py-3 px-4">Payment &amp; Bank</th>
                  <th className="py-3 px-4 text-right">Cost (ETB)</th>
                  <th className="py-3 px-4 text-right">10k Due (km)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMaintenance.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-elevated/40 transition-colors">
                    {/* Tick to Reconcile Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          toggleReconcileMaintenance(m.id)
                          toast({
                            title: m.isReconciled ? 'Reconciliation Reversed' : 'Maintenance Reconciled',
                            description: `${m.truckPlate} (${formatCurrency(m.costETB)}) marked as ${
                              m.isReconciled ? 'Pending Statement Match' : 'Reconciled with Bank Statement'
                            }.`,
                            type: 'info',
                          })
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${
                          m.isReconciled
                            ? 'bg-forest/15 border-forest text-forest hover:bg-forest/25'
                            : 'border-border text-muted-foreground hover:border-forest/60 hover:text-foreground'
                        }`}
                        title={m.isReconciled ? 'Click to unmark reconciled' : 'Click to tick reconciled'}
                      >
                        {m.isReconciled ? (
                          <CheckSquare className="w-4 h-4 text-forest" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{formatDate(m.date)}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{m.id}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-foreground">{m.truckPlate}</span>
                      {m.lastServiceKm && (
                        <div className="text-[10px] text-muted-foreground font-mono">
                          At: {m.lastServiceKm.toLocaleString()} km
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-foreground">{m.serviceType}</div>
                      {m.notes && (
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{m.notes}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{m.workshopName}</td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground">
                        {m.paidFromAccountName || 'Commercial Bank of Ethiopia'}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        Ref: {m.disbursementRef || 'CBE-MNT-DIRECT'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                      {formatCurrency(m.costETB, { hideDecimals: true })}
                    </td>

                    <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                      <span className="text-forest font-bold">{m.nextServiceDueKm.toLocaleString()}</span>
                      <span className="text-muted-foreground text-[10px]"> km</span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {m.isReconciled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-forest/15 text-forest border border-forest/30">
                          <Check className="w-3 h-3" />
                          <span>Reconciled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
                          <Clock className="w-3 h-3" />
                          <span>Pending Match</span>
                        </span>
                      )}
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
          <div className="p-3.5 bg-surface-elevated/50 border-b border-border flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#FF6B00]" />
              <span>Procured Tires, Heavy Batteries, Lubricants &amp; Spares</span>
            </span>
            <span className="text-muted-foreground text-[11px]">
              Tick to reconcile against company bank statement wire transfer debits
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-3 text-center w-12">Reconcile</th>
                  <th className="py-3 px-4">Date &amp; Invoice</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4">Truck Plate</th>
                  <th className="py-3 px-4 text-right">Qty</th>
                  <th className="py-3 px-4 text-right">Total Cost (ETB)</th>
                  <th className="py-3 px-4">Supplier &amp; Bank Ref</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-elevated/40 transition-colors">
                    {/* Tick to Reconcile Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          toggleReconcileFleetPurchase(p.id)
                          toast({
                            title: p.isReconciled ? 'Reconciliation Reversed' : 'Parts Purchase Reconciled',
                            description: `${p.itemDescription} (${formatCurrency(p.totalCostETB)}) marked as ${
                              p.isReconciled ? 'Pending Statement Match' : 'Reconciled'
                            }.`,
                            type: 'info',
                          })
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${
                          p.isReconciled
                            ? 'bg-forest/15 border-forest text-forest hover:bg-forest/25'
                            : 'border-border text-muted-foreground hover:border-[#FF6B00]/60 hover:text-foreground'
                        }`}
                        title={p.isReconciled ? 'Click to unmark reconciled' : 'Click to tick reconciled'}
                      >
                        {p.isReconciled ? (
                          <CheckSquare className="w-4 h-4 text-forest" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{formatDate(p.date)}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{p.purchaseInvoiceNo}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-elevated border border-border text-foreground">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{p.itemDescription}</div>
                      {p.notes && (
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{p.notes}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-foreground font-medium whitespace-nowrap">
                      {p.truckPlate}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                      {p.quantity}x
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-forest whitespace-nowrap">
                      {formatCurrency(p.totalCostETB, { hideDecimals: true })}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">{p.supplierName}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {p.paidFromAccountName || 'CBE'} &bull; Ref: {p.disbursementRef || p.receiptNo || 'N/A'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {p.isReconciled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-forest/15 text-forest border border-forest/30">
                          <Check className="w-3 h-3" />
                          <span>Reconciled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
                          <Clock className="w-3 h-3" />
                          <span>Pending Match</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GENERAL LEDGER JOURNAL (DEBIT / CREDIT ACCOUNTING TRACKER) */}
      {activeTab === 'journal' && (
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
          <div className="p-4 bg-blue-500/10 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">
                  Double-Entry General Ledger: Fleet Maintenance &amp; Parts Transactions
                </h4>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Standard Ethiopian logistics double-entry: <strong>Debit</strong> Fleet Operating Expense Account (5200 / 5210) &bull; <strong>Credit</strong> Company Bank Account (1010).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
              <span className="text-muted-foreground">Total Journal Postings:</span>
              <span className="font-bold text-foreground">{fleetJournalEntries.length} Entries</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Voucher / Wire Ref</th>
                  <th className="py-3 px-4">Transaction Details</th>
                  <th className="py-3 px-4">Debit Account (Expense)</th>
                  <th className="py-3 px-4">Credit Account (Asset)</th>
                  <th className="py-3 px-4 text-right">Debit (ETB)</th>
                  <th className="py-3 px-4 text-right">Credit (ETB)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredJournalEntries.map((tx) => {
                  const isMaintenance = tx.category === 'Truck Maintenance & Servicing'
                  return (
                    <tr key={tx.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                        {tx.referenceNumber}
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-foreground">{tx.category}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {tx.notes || `Disbursed to ${tx.toAccount}`}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          {isMaintenance ? '5200 - Truck Maintenance' : '5210 - Spare Parts & Tires'}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-forest/10 text-forest border border-forest/20">
                          1010 - {tx.fromAccount || 'CBE Current Account'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        {formatCurrency(tx.amountETB, { hideDecimals: true })}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-forest whitespace-nowrap">
                        {formatCurrency(tx.amountETB, { hideDecimals: true })}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {tx.status === 'Reconciled' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-forest/15 text-forest border border-forest/30">
                            <Check className="w-3 h-3" />
                            <span>Reconciled</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE INTERVAL SETTINGS */}
      {activeTab === 'intervals' && (
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>Commercial Vehicle Preventive Maintenance Intervals</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Configure the target mileage interval per vehicle. The standard benchmark is <strong>10,000 km</strong> for heavy-duty commercial freight rigs (HOWO, Actros, Volvo FH). Custom intervals can be set for lighter medium-duty trucks or specialized tankers.
              </p>
            </div>
            <button
              onClick={() => setIsIntervalModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold flex items-center gap-1.5 shadow-subtle shrink-0"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Adjust Truck Interval</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trucks.map((truck) => {
              const currentKm = truck.mileageKm || 0
              const interval = truck.serviceIntervalKm || 10000
              const lastKm = truck.lastServiceKm || 0
              const nextKm = truck.nextServiceDueKm || (lastKm + interval)

              return (
                <div key={truck.id} className="p-4 rounded-xl border border-border/80 bg-surface-elevated/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-foreground">{truck.plateNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-forest/15 text-forest">
                        {interval.toLocaleString()} km Interval
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{truck.makeModel}</div>

                    <div className="mt-4 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Odometer:</span>
                        <span className="font-bold text-foreground">{currentKm.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Serviced At:</span>
                        <span className="text-muted-foreground">{lastKm.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Scheduled:</span>
                        <span className="font-bold text-forest">{nextKm.toLocaleString()} km</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIntervalTruckPlate(truck.plateNumber)
                      setNewIntervalKm(interval)
                      setIsIntervalModalOpen(true)
                    }}
                    className="mt-4 w-full py-1.5 px-3 rounded-lg border border-border hover:bg-forest/10 hover:text-forest text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Change Interval Threshold</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* MODAL: LOG MAINTENANCE SERVICE (WITH 10K AUTO-CALCULATION & BANK SELECTION) */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Log 10,000 km Maintenance Service</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Posts GL Debit (5200 Fleet Expense) &bull; Credit (1010 Bank Account) &bull; Resets next 10k km schedule
                  </p>
                </div>
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
                  Commercial Fleet Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  value={truckPlate}
                  onChange={(e) => handleTruckChangeInModal(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                >
                  {trucks.map((t) => (
                    <option key={t.id} value={t.plateNumber}>
                      {t.plateNumber} — {t.makeModel} (Current: {t.mileageKm.toLocaleString()} km)
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
                  placeholder="e.g. 10,000 km Full Engine Oil, Filter & Grease Service"
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
                    Total Service Cost (ETB) <span className="text-red-500">*</span>
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

              {/* PAYMENT BANK & WIRE REFERENCE (GL RECONCILIATION) */}
              <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <DollarSign className="w-3.5 h-3.5 text-forest" />
                  <span>General Ledger Outflow &amp; Bank Deduction</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-muted-foreground text-[11px] mb-1">
                      Pay From Bank Account
                    </label>
                    <select
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      className="w-full p-1.5 bg-surface border border-border rounded-lg text-foreground font-medium text-xs"
                    >
                      {bankAccounts.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} (Bal: {formatCurrency(b.balanceETB, { hideDecimals: true })})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-muted-foreground text-[11px] mb-1">
                      Bank Wire Ref / Cheque #
                    </label>
                    <input
                      type="text"
                      required
                      value={disbursementRef}
                      onChange={(e) => setDisbursementRef(e.target.value)}
                      className="w-full p-1.5 bg-surface border border-border rounded-lg text-foreground font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Accounting Preview */}
                <div className="text-[11px] text-muted-foreground bg-surface p-2 rounded-lg border border-border/80 flex items-center justify-between">
                  <span><strong>Debit:</strong> 5200 Truck Maintenance</span>
                  <span>&bull;</span>
                  <span><strong>Credit:</strong> Bank Account</span>
                  <span>&bull;</span>
                  <span className="font-mono font-bold text-forest">{formatCurrency(costETB)}</span>
                </div>
              </div>

              {/* SERVICE INTERVAL & NEXT THRESHOLD */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Target Interval (km)
                  </label>
                  <input
                    type="number"
                    value={serviceIntervalKm}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setServiceIntervalKm(val)
                      const target = trucks.find((t) => t.plateNumber === truckPlate)
                      if (target) setNextServiceDueKm(target.mileageKm + val)
                    }}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Next Due Threshold (km)
                  </label>
                  <input
                    type="number"
                    value={nextServiceDueKm}
                    onChange={(e) => setNextServiceDueKm(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold text-forest"
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
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="Engine oil brand, filter batch numbers, technicians involved..."
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
                  className="px-4 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white font-semibold shadow-subtle dark:shadow-glow flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Post Service &amp; GL Journal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER FLEET PURCHASE */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Register Fleet Purchase &amp; Post GL</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Record tires, batteries, and parts. Posts GL Debit (5210) &bull; Credit (1010 Bank Account).
                  </p>
                </div>
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
                  <option value="Tires">Tires &amp; Tubeless Heavy Casings (315/80R22.5)</option>
                  <option value="Spare Parts">Mechanical, Suspension &amp; Engine Spare Parts</option>
                  <option value="Batteries">Heavy Commercial Maintenance-Free Batteries (200Ah)</option>
                  <option value="Lubricants & Oils">Engine Oil (15W-40), Gear Oil &amp; Grease</option>
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
                  placeholder="e.g. Bridgestone 315/80R22.5 Drive Axle Tires"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Assigned Vehicle / Depot Spare Stock
                </label>
                <select
                  value={purchaseTruckPlate}
                  onChange={(e) => setPurchaseTruckPlate(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                >
                  <option value="Depot Spare Parts Stock">-- Depot Spare Parts Stock (All Commercial Trucks) --</option>
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

              {/* Total Card */}
              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border flex justify-between items-center font-mono">
                <span className="text-muted-foreground text-xs">Total Outflow Cost:</span>
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

              {/* BANK & WIRE REF SELECTION */}
              <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <DollarSign className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Payment Bank Account &amp; Disbursement Wire Ref</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-muted-foreground text-[11px] mb-1">
                      Paid From Bank Account
                    </label>
                    <select
                      value={purchaseBankId}
                      onChange={(e) => setPurchaseBankId(e.target.value)}
                      className="w-full p-1.5 bg-surface border border-border rounded-lg text-foreground font-medium text-xs"
                    >
                      {bankAccounts.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} (Bal: {formatCurrency(b.balanceETB, { hideDecimals: true })})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-muted-foreground text-[11px] mb-1">
                      Bank Wire Ref / Cheque #
                    </label>
                    <input
                      type="text"
                      required
                      value={purchaseRef}
                      onChange={(e) => setPurchaseRef(e.target.value)}
                      className="w-full p-1.5 bg-surface border border-border rounded-lg text-foreground font-mono text-xs"
                    />
                  </div>
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
                  placeholder="DOT codes, batch numbers, warranty terms..."
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
                  className="px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#e05e00] text-white font-semibold shadow-subtle flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Register &amp; Post GL Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMIZE 10,000 KM SERVICE INTERVAL */}
      {isIntervalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Configure Service Interval</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Set mileage threshold for automated oil change alerts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIntervalModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInterval} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Select Vehicle Plate
                </label>
                <select
                  value={intervalTruckPlate}
                  onChange={(e) => {
                    setIntervalTruckPlate(e.target.value)
                    const t = trucks.find((trk) => trk.plateNumber === e.target.value)
                    if (t) setNewIntervalKm(t.serviceIntervalKm || 10000)
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
                  Preventive Service Interval (km) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  required
                  value={newIntervalKm}
                  onChange={(e) => setNewIntervalKm(Number(e.target.value))}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setNewIntervalKm(10000)}
                    className="px-2.5 py-1 rounded-md bg-forest/15 text-forest font-mono text-[11px] font-bold hover:bg-forest/25"
                  >
                    10,000 km (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewIntervalKm(15000)}
                    className="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-foreground font-mono text-[11px] hover:bg-surface"
                  >
                    15,000 km (Highway)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewIntervalKm(8000)}
                    className="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-foreground font-mono text-[11px] hover:bg-surface"
                  >
                    8,000 km (Severe)
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border text-[11px] text-muted-foreground space-y-1">
                <div>
                  <strong>Rule:</strong> When vehicle odometer reaches{' '}
                  <span className="font-mono text-foreground font-bold">
                    {(
                      (trucks.find((t) => t.plateNumber === intervalTruckPlate)?.lastServiceKm || 0) +
                      Number(newIntervalKm)
                    ).toLocaleString()}{' '}
                    km
                  </span>
                  , an overdue alert banner and notification will trigger.
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIntervalModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-surface-elevated text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white font-semibold shadow-subtle"
                >
                  Save Interval Setting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
