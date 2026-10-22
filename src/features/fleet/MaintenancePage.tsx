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
  ShieldCheck,
  Settings2,
  Sliders,
  Sparkles,
  RefreshCw,
  Building2,
  Layers,
  HelpCircle,
  ChevronRight,
  Gauge,
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
    updateTruckConfig,
    autoReconcileFleetExpenses,
    manualReconcileTransaction,
    trucks,
    bankAccounts,
    transactions,
    bankStatements,
  } = useStore()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'maintenance' | 'purchases' | 'journal' | 'intervals'>('maintenance')
  const [searchTerm, setSearchTerm] = useState('')

  // Journal Division Filter (Separate for Cement and Trucks)
  const [journalDivision, setJournalDivision] = useState<'Transport' | 'Cement' | 'All'>('Transport')

  // Maintenance Modal State
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
  const [nextServiceDueDate, setNextServiceDueDate] = useState('2026-11-25')
  const [notes, setNotes] = useState('Standard 10,000 km cycle: 15W-40 commercial diesel engine oil, dual spin-on filters, fuel water separator cleared.')

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

  // Service Interval & Truck Configuration Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [configTruckPlate, setConfigTruckPlate] = useState<string>(trucks[0]?.plateNumber || '')
  const [configCurrentKm, setConfigCurrentKm] = useState<number>(trucks[0]?.mileageKm || 142800)
  const [configIntervalKm, setConfigIntervalKm] = useState<number>(trucks[0]?.serviceIntervalKm || 10000)
  const [configWarningLeadKm, setConfigWarningLeadKm] = useState<number>(1500)
  const [configOilGrade, setConfigOilGrade] = useState<string>('15W-40 CI-4 Heavy Duty Commercial')
  const [configWorkshop, setConfigWorkshop] = useState<string>('TotalEnergies Truck Center Akaki')

  // Manual Reconciliation Modal State (for journal entries that didn't auto reconcile)
  const [isManualReconcileModalOpen, setIsManualReconcileModalOpen] = useState(false)
  const [selectedTxToReconcile, setSelectedTxToReconcile] = useState<any>(null)
  const [manualStatementRef, setManualStatementRef] = useState('CBE-STMT-OCT26-01')
  const [manualReconcileNotes, setManualReconcileNotes] = useState('')

  // Calculate Service Due Trucks
  const serviceDueTrucks = trucks.filter((t) => {
    const isKmDue = t.nextServiceDueKm ? t.mileageKm >= t.nextServiceDueKm : false
    const isDateDue = t.nextServiceDueDate ? new Date(t.nextServiceDueDate) <= new Date() : false
    return isKmDue || isDateDue
  })

  // Open Configuration Modal for a truck
  const handleOpenTruckConfig = (plate: string) => {
    const target = trucks.find((t) => t.plateNumber === plate) || trucks[0]
    setConfigTruckPlate(target.plateNumber)
    setConfigCurrentKm(target.mileageKm)
    setConfigIntervalKm(target.serviceIntervalKm || 10000)
    setConfigWarningLeadKm(target.warningLeadKm || 1500)
    setConfigOilGrade(target.engineOilGrade || '15W-40 CI-4 Heavy Duty Commercial')
    setConfigWorkshop(target.preferredWorkshop || 'TotalEnergies Truck Center Akaki')
    setIsConfigModalOpen(true)
  }

  // Handle changing truck inside Configuration Modal
  const handleConfigTruckSelect = (plate: string) => {
    setConfigTruckPlate(plate)
    const target = trucks.find((t) => t.plateNumber === plate)
    if (target) {
      setConfigCurrentKm(target.mileageKm)
      setConfigIntervalKm(target.serviceIntervalKm || 10000)
      setConfigWarningLeadKm(target.warningLeadKm || 1500)
      if (target.engineOilGrade) setConfigOilGrade(target.engineOilGrade)
      if (target.preferredWorkshop) setConfigWorkshop(target.preferredWorkshop)
    }
  }

  // Save Configuration Modal
  const handleSaveTruckConfig = (e: React.FormEvent) => {
    e.preventDefault()
    if (!configTruckPlate || configIntervalKm <= 0 || configCurrentKm < 0) {
      toast({
        title: 'Validation Error',
        description: 'Please specify a valid truck, current odometer reading, and interval.',
        type: 'error',
      })
      return
    }

    updateTruckConfig(configTruckPlate, {
      mileageKm: Number(configCurrentKm),
      serviceIntervalKm: Number(configIntervalKm),
      warningLeadKm: Number(configWarningLeadKm),
      engineOilGrade: configOilGrade,
      preferredWorkshop: configWorkshop,
    })

    toast({
      title: 'Truck Configuration Updated',
      description: `Saved: ${configTruckPlate} odometer updated to ${configCurrentKm.toLocaleString()} km. Service interval set to every ${configIntervalKm.toLocaleString()} km.`,
      type: 'success',
    })

    setIsConfigModalOpen(false)
  }

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
      if (target.preferredWorkshop) setWorkshopName(target.preferredWorkshop)
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
    const effectiveOdometer = Number(currentOdometerInput)
    const effectiveInterval = Number(serviceIntervalKm || 10000)
    const scheduledDue = Number(nextServiceDueKm) || (effectiveOdometer + effectiveInterval)

    // Update truck odometer if user adjusted it at service intake
    updateTruckConfig(truckPlate, {
      mileageKm: effectiveOdometer,
      serviceIntervalKm: effectiveInterval,
    })

    addMaintenance({
      truckPlate,
      serviceType,
      date: new Date().toISOString().split('T')[0],
      workshopName,
      costETB: Number(costETB),
      status: 'Completed',
      lastServiceKm: effectiveOdometer,
      serviceIntervalKm: effectiveInterval,
      nextServiceDueKm: scheduledDue,
      nextServiceDueDate,
      paidFromAccountId: matchedBank.id,
      paidFromAccountName: matchedBank.bankName,
      paymentMethod: 'Bank Transfer',
      disbursementRef: disbursementRef.trim() || `CBE-MNT-2026-${Date.now().toString().slice(-4)}`,
      notes: notes.trim(),
    })

    toast({
      title: 'Service & GL Journal Posted',
      description: `Logged 10,000 km service for ${truckPlate} (${formatCurrency(costETB)}). Debit: 5200 (Fleet Expense) | Credit: ${matchedBank.bankName}. Next service due at ${scheduledDue.toLocaleString()} km.`,
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
      title: 'Parts Purchase Registered & GL Posted',
      description: `Purchased ${quantity}x ${itemDescription} (${formatCurrency(totalCost)}). Posted to GL (Debit: 5210 Spare Parts / Credit: ${matchedBank.bankName}).`,
      type: 'success',
    })

    setIsPurchaseModalOpen(false)
    setItemDescription('')
    setReceiptNo('')
    setPurchaseNotes('')
  }

  // Run Automated Reconciliation
  const handleRunAutoReconcile = () => {
    const res = autoReconcileFleetExpenses()
    if (res.matchedCount > 0) {
      toast({
        title: 'Automated Reconciliation Complete',
        description: `Successfully auto-matched and reconciled ${res.matchedCount} fleet operating disbursement transactions against bank statements.`,
        type: 'success',
      })
    } else {
      toast({
        title: 'Auto-Reconciliation Engine',
        description: 'All eligible fleet disbursement wire references are already matched. Use manual reconcile for non-standard transactions.',
        type: 'info',
      })
    }
  }

  // Open Manual Reconcile Dialog
  const handleOpenManualReconcile = (tx: any) => {
    setSelectedTxToReconcile(tx)
    setManualStatementRef(tx.reconciledStatementRef || 'CBE-STMT-OCT26-01')
    setManualReconcileNotes(`Manually verified against bank debit wire reference ${tx.referenceNumber}`)
    setIsManualReconcileModalOpen(true)
  }

  // Confirm Manual Reconciliation
  const handleConfirmManualReconcile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTxToReconcile) return

    manualReconcileTransaction(selectedTxToReconcile.id, manualStatementRef, manualReconcileNotes)
    toast({
      title: 'Manual Reconciliation Applied',
      description: `Transaction ${selectedTxToReconcile.referenceNumber} (${formatCurrency(selectedTxToReconcile.amountETB)}) marked as Reconciled with statement ${manualStatementRef}.`,
      type: 'success',
    })
    setIsManualReconcileModalOpen(false)
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

  // General Ledger Entries — Separated between Cement and Trucks
  const cementJournalEntries = transactions.filter(
    (tx) => tx.businessActivity === 'Cement' || tx.category.includes('Cement')
  )

  const transportFleetJournalEntries = transactions.filter(
    (tx) =>
      tx.businessActivity === 'Transport' ||
      tx.category === 'Truck Maintenance & Servicing' ||
      tx.category === 'Fleet Spare Parts & Tires' ||
      tx.category === 'Fleet Fuel & Oil' ||
      tx.category === 'Freight Revenue' ||
      tx.referenceNumber?.startsWith('CBE-MNT') ||
      tx.referenceNumber?.startsWith('AWB-MNT') ||
      tx.referenceNumber?.startsWith('CBE-FP') ||
      tx.referenceNumber?.startsWith('AWB-FP') ||
      tx.notes?.includes('Debit: Fleet Operating Expense')
  )

  const activeJournalEntries =
    journalDivision === 'Transport'
      ? transportFleetJournalEntries
      : journalDivision === 'Cement'
      ? cementJournalEntries
      : transactions

  const filteredJournalEntries = activeJournalEntries.filter(
    (tx) =>
      tx.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.toAccount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromAccount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.truckPlate && tx.truckPlate.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.costETB, 0)
  const totalFleetPurchasesCost = fleetPurchases.reduce((sum, p) => sum + p.totalCostETB, 0)
  const totalCombinedFleetExpenditure = totalMaintenanceCost + totalFleetPurchasesCost

  const reconciledMaintenanceCount = maintenance.filter((m) => m.isReconciled).length
  const reconciledPurchasesCount = fleetPurchases.filter((p) => p.isReconciled).length

  // Transport journal totals
  const transportDebits = transportFleetJournalEntries
    .filter((tx) => tx.type === 'Expense')
    .reduce((sum, tx) => sum + tx.amountETB, 0)
  const transportReconciledCount = transportFleetJournalEntries.filter((tx) => tx.status === 'Reconciled').length
  const transportPendingCount = transportFleetJournalEntries.filter((tx) => tx.status !== 'Reconciled').length

  // Cement journal totals
  const cementDebits = cementJournalEntries
    .filter((tx) => tx.type === 'Expense')
    .reduce((sum, tx) => sum + tx.amountETB, 0)
  const cementCredits = cementJournalEntries
    .filter((tx) => tx.type === 'Income')
    .reduce((sum, tx) => sum + tx.amountETB, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Maintenance & Purchases"
        description="Track vehicle service cycles, spare parts purchases, and fleet expenses."
        breadcrumbs={[
          { label: 'Transport & Fleet', href: '/fleet' },
          { label: 'Maintenance & Purchases' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenTruckConfig(trucks[0]?.plateNumber || '')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-purple-500/40 hover:bg-purple-500/10 text-foreground transition-all shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Configure Intervals</span>
            </button>
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-[#FF6B00]/40 hover:bg-[#FF6B00]/10 text-foreground transition-all shadow-xs"
            >
              <Package className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>New Purchase</span>
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
              <span>Log Service</span>
            </button>
          </div>
        }
      />

      {/* SERVICE INTERVAL MONITOR */}
      <div className="rounded-2xl border border-forest/30 bg-gradient-to-br from-forest/10 via-surface/95 to-surface p-5 shadow-card backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest text-white flex items-center justify-center shrink-0 shadow-md shadow-forest/20">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground">
                Service Intervals &amp; Oil Cycles
              </h3>
              {serviceDueTrucks.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00] text-white">
                  {serviceDueTrucks.length} Overdue
                </span>
              )}
            </div>
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
                        +{Math.abs(kmRemaining).toLocaleString()} km overdue
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-forest/15 text-forest">
                        {kmRemaining.toLocaleString()} km left
                      </span>
                    )}
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1 font-mono">
                      <span>{kmSinceLastService.toLocaleString()} / {interval.toLocaleString()} km</span>
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
                      <div className="text-muted-foreground text-[10px]">Current Odometer</div>
                      <div className="font-bold text-foreground">{currentKm.toLocaleString()} km</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[10px]">Target Due</div>
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
                    <span>Log Service</span>
                  </button>
                  <button
                    onClick={() => handleOpenTruckConfig(truck.plateNumber)}
                    className="p-1.5 rounded-lg bg-surface border border-border hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
                    title="Configure Truck & Update Odometer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
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
            <span className="text-xs font-semibold">Truck Servicing (GL 5200)</span>
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
            <span className="text-xs font-semibold">Trucks GL Debits (Outflows)</span>
            <DollarSign className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            {formatCurrency(transportDebits, { hideDecimals: true })}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Debited from operating bank accounts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-card backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Reconciliation Engine</span>
            <ShieldCheck className="w-4 h-4 text-forest" />
          </div>
          <div className="text-xl font-bold font-mono text-forest">
            {transportReconciledCount} / {transportFleetJournalEntries.length} Reconciled
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>{transportPendingCount} Pending Match</span>
            <button
              onClick={handleRunAutoReconcile}
              className="text-forest hover:underline font-bold text-[10px] inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-Match</span>
            </button>
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
            <span>General Ledger Journal</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'journal' ? 'bg-white/20 text-white' : 'bg-surface text-muted-foreground'
              }`}
            >
              {activeJournalEntries.length}
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
            <span>Configuration &amp; Odometers</span>
          </button>
        </div>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={
            activeTab === 'maintenance'
              ? 'Search truck plate, workshop, wire ref...'
              : activeTab === 'purchases'
              ? 'Search parts, plate, supplier, invoice...'
              : activeTab === 'journal'
              ? 'Search journal, accounts, references...'
              : 'Search vehicles...'
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
              <span>Workshop Maintenance Logs</span>
            </span>
            <span className="text-muted-foreground text-[11px] font-mono">
              {filteredMaintenance.length} records
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
              <span>Fleet Parts &amp; Tires</span>
            </span>
            <span className="text-muted-foreground text-[11px] font-mono">
              {filteredPurchases.length} records
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

      {/* TAB 3: GENERAL LEDGER JOURNAL — SEPARATE FOR CEMENT AND TRUCKS */}
      {activeTab === 'journal' && (
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden space-y-0">
          {/* Top Control Bar with Division Switcher & Auto-Reconcile Button */}
          <div className="p-4 bg-surface-elevated/70 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-foreground">
                  General Ledger Journal
                </h3>
              </div>
            </div>

            {/* Division Switcher & Automated Reconcile Button */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-surface border border-border">
                <button
                  onClick={() => setJournalDivision('Transport')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    journalDivision === 'Transport'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Trucks &amp; Fleet Journal</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                    {transportFleetJournalEntries.length}
                  </span>
                </button>

                <button
                  onClick={() => setJournalDivision('Cement')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    journalDivision === 'Cement'
                      ? 'bg-forest text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Cement Journal</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                    {cementJournalEntries.length}
                  </span>
                </button>

                <button
                  onClick={() => setJournalDivision('All')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    journalDivision === 'All'
                      ? 'bg-surface-elevated text-foreground border border-border shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>All Ledgers</span>
                </button>
              </div>

              {journalDivision === 'Transport' && (
                <button
                  onClick={handleRunAutoReconcile}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold shadow-subtle transition-colors shrink-0"
                  title="Automatically match bank statement wire references against journal lines"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Reconcile Bank Lines</span>
                </button>
              )}
            </div>
          </div>

          {/* Division Financial Banner */}
          <div className="p-3 bg-blue-500/5 border-b border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>
                {journalDivision === 'Transport'
                  ? 'Transport & Fleet Ledger'
                  : journalDivision === 'Cement'
                  ? 'Cement Trading Ledger'
                  : 'Combined General Ledger'}
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
              {journalDivision === 'Transport' ? (
                <>
                  <span>
                    Total Fleet Debits:{' '}
                    <strong className="text-foreground">{formatCurrency(transportDebits)}</strong>
                  </span>
                  <span>
                    Auto-Reconciled:{' '}
                    <strong className="text-forest">{transportReconciledCount}</strong>
                  </span>
                  <span>
                    Pending Match:{' '}
                    <strong className="text-[#FF6B00]">{transportPendingCount}</strong>
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Total COGS Debits:{' '}
                    <strong className="text-foreground">{formatCurrency(cementDebits)}</strong>
                  </span>
                  <span>
                    Total Sales Receipts:{' '}
                    <strong className="text-forest">{formatCurrency(cementCredits)}</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Voucher / Wire Ref</th>
                  <th className="py-3 px-4">Activity &amp; Category</th>
                  <th className="py-3 px-4">Vehicle / Details</th>
                  <th className="py-3 px-4">Debit Account (5200 / 5100)</th>
                  <th className="py-3 px-4">Credit Account (1010 Bank)</th>
                  <th className="py-3 px-4 text-right">Debit (ETB)</th>
                  <th className="py-3 px-4 text-right">Credit (ETB)</th>
                  <th className="py-3 px-4 text-center">Reconciliation</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredJournalEntries.map((tx) => {
                  const isTransport = tx.businessActivity === 'Transport' || tx.category.includes('Fleet') || tx.category.includes('Maintenance')
                  const isMaintenance = tx.category === 'Truck Maintenance & Servicing'
                  const isSpareParts = tx.category === 'Fleet Spare Parts & Tires'

                  return (
                    <tr key={tx.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                        {tx.referenceNumber}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isTransport
                                ? 'bg-blue-600/15 text-blue-600 border border-blue-600/30'
                                : 'bg-forest/15 text-forest border border-forest/30'
                            }`}
                          >
                            {tx.businessActivity || (isTransport ? 'Transport' : 'Cement')}
                          </span>
                          <span className="font-semibold text-foreground">{tx.category}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        {tx.truckPlate && (
                          <div className="font-mono font-bold text-foreground">{tx.truckPlate}</div>
                        )}
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {tx.notes || `Disbursed to ${tx.toAccount}`}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          {isMaintenance
                            ? '5200 - Truck Maintenance'
                            : isSpareParts
                            ? '5210 - Spare Parts & Tires'
                            : tx.type === 'Expense'
                            ? '5100 - Factory Procurement'
                            : '4000 - Operating Revenue'}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-forest/10 text-forest border border-forest/20">
                          1010 - {tx.fromAccount || 'CBE Operating Account'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        {tx.type === 'Expense' ? formatCurrency(tx.amountETB, { hideDecimals: true }) : '—'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-forest whitespace-nowrap">
                        {tx.type === 'Income' ? formatCurrency(tx.amountETB, { hideDecimals: true }) : formatCurrency(tx.amountETB, { hideDecimals: true })}
                      </td>

                      {/* Reconciliation State Badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {tx.status === 'Reconciled' ? (
                          tx.reconciliationMethod === 'Auto-Matched' ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-forest/15 text-forest border border-forest/30"
                              title={`Auto-matched with ${tx.reconciledStatementRef || 'CBE-STMT'}`}
                            >
                              <Sparkles className="w-3 h-3 text-forest" />
                              <span>Auto-Reconciled</span>
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/15 text-blue-600 border border-blue-600/30"
                              title={`Manually reconciled: ${tx.reconciledBy || 'Reviewer'}`}
                            >
                              <Check className="w-3 h-3 text-blue-600" />
                              <span>Manual Reconciled</span>
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
                            <Clock className="w-3 h-3" />
                            <span>Pending Match</span>
                          </span>
                        )}
                      </td>

                      {/* Manual Reconcile Action Button */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenManualReconcile(tx)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                            tx.status === 'Reconciled'
                              ? 'bg-surface border border-border text-muted-foreground hover:text-foreground'
                              : 'bg-forest hover:bg-forest-dark text-white shadow-xs'
                          }`}
                        >
                          {tx.status === 'Reconciled' ? 'Edit / Reverse' : 'Reconcile Now'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TRUCK CONFIGURATION & ODOMETERS */}
      {activeTab === 'intervals' && (
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>Vehicle Configuration &amp; Odometers</span>
              </h3>
            </div>
            <button
              onClick={() => handleOpenTruckConfig(trucks[0]?.plateNumber || '')}
              className="px-3.5 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white text-xs font-semibold flex items-center gap-1.5 shadow-subtle shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Configure Vehicle</span>
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

                    <div className="mt-4 space-y-2 text-xs font-mono">
                      <div className="flex justify-between p-1.5 rounded bg-surface border border-border/60">
                        <span className="text-muted-foreground">Current Odometer:</span>
                        <span className="font-bold text-foreground">{currentKm.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Serviced:</span>
                        <span className="text-muted-foreground">{lastKm.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Scheduled Due:</span>
                        <span className="font-bold text-forest">{nextKm.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-border/60 text-[11px] font-sans">
                        <span className="text-muted-foreground">Recommended Oil:</span>
                        <span className="text-foreground truncate max-w-[150px]">
                          {truck.engineOilGrade || '15W-40 CI-4 Heavy Duty'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenTruckConfig(truck.plateNumber)}
                    className="mt-4 w-full py-1.5 px-3 rounded-lg border border-purple-500/40 hover:bg-purple-500/10 hover:border-purple-500 text-xs font-semibold text-foreground transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-600" />
                    <span>Update Odometer &amp; Interval</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: CONFIGURE TRUCK ODOMETER & SERVICE INTERVAL (10K RULE + OTHER CONFIGURABLES) */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Configure Truck Settings</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Update current odometer reading and service intervals.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTruckConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Select Commercial Truck Plate <span className="text-red-500">*</span>
                </label>
                <select
                  value={configTruckPlate}
                  onChange={(e) => handleConfigTruckSelect(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                >
                  {trucks.map((t) => (
                    <option key={t.id} value={t.plateNumber}>
                      {t.plateNumber} — {t.makeModel} (Current: {t.mileageKm.toLocaleString()} km)
                    </option>
                  ))}
                </select>
              </div>

              {/* CURRENT ODOMETER READING */}
              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-foreground">
                    Current Odometer (km) <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    required
                    value={configCurrentKm}
                    onChange={(e) => setConfigCurrentKm(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold text-sm"
                  />
                  <span className="font-mono font-bold text-muted-foreground text-xs shrink-0">KM</span>
                </div>
              </div>

              {/* SERVICE INTERVAL CONFIGURATION */}
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Preventive Service Interval (km) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  required
                  value={configIntervalKm}
                  onChange={(e) => setConfigIntervalKm(Number(e.target.value))}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold"
                />
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setConfigIntervalKm(10000)}
                    className="px-2.5 py-1 rounded-md bg-forest/15 text-forest font-mono text-[11px] font-bold hover:bg-forest/25"
                  >
                    10,000 km (Standard Heavy Rig)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfigIntervalKm(8000)}
                    className="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-foreground font-mono text-[11px] hover:bg-surface"
                  >
                    8,000 km (Severe Duty / Quarry)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfigIntervalKm(15000)}
                    className="px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-foreground font-mono text-[11px] hover:bg-surface"
                  >
                    15,000 km (Expressway Linehaul)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Notification Lead Warning (km)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={configWarningLeadKm}
                    onChange={(e) => setConfigWarningLeadKm(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                    placeholder="1500"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Alert amber when within lead km
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Primary Engine Oil Grade
                  </label>
                  <input
                    type="text"
                    value={configOilGrade}
                    onChange={(e) => setConfigOilGrade(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                    placeholder="e.g. 15W-40 CI-4"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Designated Workshop Facility
                </label>
                <input
                  type="text"
                  value={configWorkshop}
                  onChange={(e) => setConfigWorkshop(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="e.g. TotalEnergies Truck Center Akaki"
                />
              </div>

              {/* Calculation Preview */}
              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border text-[11px] text-muted-foreground space-y-1">
                <div>
                  <strong>Calculated Threshold:</strong> Next service will trigger at{' '}
                  <span className="font-mono text-foreground font-bold text-forest">
                    {(Number(configCurrentKm) + Number(configIntervalKm)).toLocaleString()} km
                  </span>
                  .
                </div>
                <div>
                  <strong>Warning Alert:</strong> Starts notifying when truck odometer hits{' '}
                  <span className="font-mono text-foreground font-bold">
                    {(Number(configCurrentKm) + Number(configIntervalKm) - Number(configWarningLeadKm)).toLocaleString()} km
                  </span>
                  .
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-surface-elevated text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white font-semibold shadow-subtle flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Configuration &amp; Odometer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG MAINTENANCE SERVICE (PRE-FILLED ODOMETER & GL POSTING) */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Log Maintenance Service</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Record completed service and update odometer cycle.
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

              {/* CURRENT ODOMETER AT SERVICE CHECK-IN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Current Odometer at Workshop (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={currentOdometerInput}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setCurrentOdometerInput(val)
                      setNextServiceDueKm(val + Number(serviceIntervalKm || 10000))
                    }}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold"
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
                  Service Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="e.g. 10,000 km Scheduled Engine Oil & Filter Change"
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
                  <span>General Ledger Outflow &amp; Bank Account Deduction</span>
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
                  <span><strong>Credit:</strong> 1010 Bank Account</span>
                  <span>&bull;</span>
                  <span className="font-mono font-bold text-forest">{formatCurrency(costETB)}</span>
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

      {/* MODAL 3: REGISTER FLEET PURCHASE */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Register Fleet Purchase</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Record tires, batteries, and spare parts procurement.
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

      {/* MODAL 4: MANUAL RECONCILIATION FOR ENTRIES THAT DIDN'T AUTO RECONCILE */}
      {isManualReconcileModalOpen && selectedTxToReconcile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Manual Bank Reconciliation</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Manually match internal expense entry to a bank statement line
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualReconcileModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmManualReconcile} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voucher / Ref:</span>
                  <span className="font-bold text-foreground">{selectedTxToReconcile.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-forest">{formatCurrency(selectedTxToReconcile.amountETB)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="text-foreground font-sans">{selectedTxToReconcile.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paying Account:</span>
                  <span className="text-foreground font-sans">{selectedTxToReconcile.fromAccount || 'CBE'}</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Bank Statement Reference <span className="text-red-500">*</span>
                </label>
                <select
                  value={manualStatementRef}
                  onChange={(e) => setManualStatementRef(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                >
                  {bankStatements.map((stmt) => (
                    <option key={stmt.id} value={stmt.statementNumber}>
                      {stmt.statementNumber} — {stmt.bankName} (Ending: {formatDate(stmt.periodEnd)})
                    </option>
                  ))}
                  <option value="MANUAL-EXTERNAL-CLEARANCE">Manual Verified Wire (External Statement)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Reviewer Notes &amp; Verification Rationale
                </label>
                <textarea
                  rows={2}
                  required
                  value={manualReconcileNotes}
                  onChange={(e) => setManualReconcileNotes(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="e.g. Verified against CBE physical wire transfer debit advice..."
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                {selectedTxToReconcile.status === 'Reconciled' ? (
                  <button
                    type="button"
                    onClick={() => {
                      manualReconcileTransaction(selectedTxToReconcile.id)
                      toast({
                        title: 'Reconciliation Reversed',
                        description: `Transaction ${selectedTxToReconcile.referenceNumber} reversed to Pending Reconciliation.`,
                        type: 'info',
                      })
                      setIsManualReconcileModalOpen(false)
                    }}
                    className="px-3 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-600 font-semibold"
                  >
                    Un-Reconcile
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsManualReconcileModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg border border-border hover:bg-surface-elevated text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-subtle flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Manual Match</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
