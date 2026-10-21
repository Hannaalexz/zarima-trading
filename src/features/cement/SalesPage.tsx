import React, { useState } from 'react'
import {
  Plus,
  Filter,
  Download,
  ArrowUpDown,
  Building2,
  Boxes,
  UserCheck,
  UserPlus,
  Star,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Eye,
  Truck,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { useStore } from '@/data/storeContext'
import { useAuth } from '@/data/authContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatQuantity, formatDate } from '@/lib/formatters'
import { CementSale, CementType, Customer } from '@/types'
import { InvoiceDetailModal } from './InvoiceDetailModal'

const WAREHOUSE_DEPOTS = [
  'Addis Ababa Central Depot (Kality)',
]

export const SalesPage: React.FC = () => {
  const { sales, addSale, customers, addCustomer, inventory, trucks } = useStore()
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'ALL' | 'Usual' | 'New'>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [sortField, setSortField] = useState<'date' | 'amount' | 'qty'>('date')
  const [sortAsc, setSortAsc] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSaleForDetail, setSelectedSaleForDetail] = useState<CementSale | null>(null)

  // Modal form state
  const [customerMode, setCustomerMode] = useState<'Usual' | 'New'>('Usual')
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    customers.find((c) => c.id === 'CUST-WALKIN')?.id || customers[0]?.id || ''
  )
  
  // New customer registration fields
  const [newCompanyName, setNewCompanyName] = useState('')
  const [newContactPerson, setNewContactPerson] = useState('')
  const [newTinNumber, setNewTinNumber] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newCity, setNewCity] = useState('Addis Ababa')
  const [newPaymentTerms, setNewPaymentTerms] = useState('Bank Transfer / Cash')
  const [newCreditLimit, setNewCreditLimit] = useState<number>(3000000)

  // Invoice transaction fields
  const [invoiceNo, setInvoiceNo] = useState('')
  const [cementType, setCementType] = useState<CementType>('OPC 42.5N')
  const [warehouseLocation, setWarehouseLocation] = useState(WAREHOUSE_DEPOTS[0])
  const [quantity, setQuantity] = useState<number>(800)
  const [unitPrice, setUnitPrice] = useState<number>(1450)
  const [paymentType, setPaymentType] = useState<CementSale['paymentType']>('Bank Transfer')
  const [paymentStatus, setPaymentStatus] = useState<CementSale['paymentStatus']>('Paid')
  const [deliveryStatus, setDeliveryStatus] = useState<CementSale['deliveryStatus']>('Delivered')
  const [destinationCity, setDestinationCity] = useState('Addis Ababa (Bole)')
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0])

  // Truck Delivery & Third-Party Cargo Fields
  const [invoiceType, setInvoiceType] = useState<'Cement Sale & Delivery' | 'Cement Sale' | 'Freight Service'>('Cement Sale & Delivery')
  const [hasCompanyDelivery, setHasCompanyDelivery] = useState(true)
  const [deliveryFeeETB, setDeliveryFeeETB] = useState<number>(120000)
  const [assignedTruck, setAssignedTruck] = useState(trucks[0]?.plateNumber || '3-ET-A41920 AA')
  const [driverName, setDriverName] = useState(trucks[0]?.driverName || 'Dawit Mengistu')
  const [cargoDescription, setCargoDescription] = useState('')

  // Filtered sales list
  const filtered = sales
    .filter((s) => {
      const matchSearch =
        s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.destinationCity.toLowerCase().includes(searchTerm.toLowerCase())
      
      const isUsualMatch =
        customerTypeFilter === 'ALL' ||
        (customerTypeFilter === 'Usual' && (s.customerType === 'Usual' || !s.customerType)) ||
        (customerTypeFilter === 'New' && s.customerType === 'New')

      const matchStatus = statusFilter === 'ALL' || s.paymentStatus === statusFilter
      return matchSearch && isUsualMatch && matchStatus
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

  const openNewInvoiceModal = () => {
    setInvoiceNo(`INV-2026-${Math.floor(400 + Math.random() * 500)}`)
    setSaleDate(new Date().toISOString().split('T')[0])
    setCustomerMode('Usual')
    const walkin = customers.find((c) => c.id === 'CUST-WALKIN')
    setSelectedCustomerId(walkin ? walkin.id : (customers[0]?.id || ''))
    setDestinationCity('Addis Ababa (Direct Counter)')
    setIsModalOpen(true)
  }

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let finalCustomerId = selectedCustomerId
    let finalCustomerName = ''
    let isUsualCustomer = true

    if (customerMode === 'Usual') {
      const matched = customers.find((c) => c.id === selectedCustomerId)
      if (!matched) {
        toast({
          title: 'Customer Required',
          description: 'Please choose a registered usual customer.',
          type: 'error',
        })
        return
      }
      finalCustomerId = matched.id
      finalCustomerName = matched.company
      isUsualCustomer = matched.isUsual ?? true
    } else {
      // New Customer
      if (!newCompanyName.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Company name is required for new customer registration.',
          type: 'error',
        })
        return
      }
      finalCustomerName = newCompanyName.trim()
      finalCustomerId = `CUST-${Date.now()}`
      isUsualCustomer = false

      // Register new customer in store
      addCustomer({
        name: newContactPerson.trim() || finalCustomerName,
        company: finalCustomerName,
        tinNumber: newTinNumber.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
        phone: newPhone.trim() || '+251 91 000 0000',
        city: newCity.trim() || destinationCity,
        creditLimitETB: Number(newCreditLimit) || 3000000,
        outstandingBalanceETB: paymentStatus === 'Outstanding' ? Number(quantity) * Number(unitPrice) : 0,
        paymentTerms: newPaymentTerms,
        status: 'Active',
        isUsual: false,
        customerCategory: 'New Customer',
      })
    }

    const isFreight = invoiceType === 'Freight Service'
    if (!isFreight && (quantity <= 0 || unitPrice <= 0)) {
      toast({
        title: 'Validation Failed',
        description: 'Quantity and unit price must be valid positive numbers.',
        type: 'error',
      })
      return
    }

    const calcMaterial = isFreight ? 0 : Number(quantity) * Number(unitPrice)
    const calcDelivery = hasCompanyDelivery ? Number(deliveryFeeETB) : 0
    const calcGrandTotal = calcMaterial + calcDelivery

    const finalInvNo = invoiceNo.trim() || `INV-2026-${Math.floor(400 + Math.random() * 500)}`

    addSale({
      invoiceNo: finalInvNo,
      customerId: finalCustomerId,
      customerName: finalCustomerName,
      customerType: isUsualCustomer ? 'Usual' : 'New',
      cementType,
      quantityQuintals: Number(quantity),
      unitPriceETB: isFreight ? 0 : Number(unitPrice),
      totalAmountETB: calcGrandTotal,
      deliveryFeeETB: calcDelivery,
      hasCompanyDelivery,
      assignedTruck: hasCompanyDelivery ? assignedTruck : undefined,
      driverName: hasCompanyDelivery ? driverName : undefined,
      invoiceType,
      cargoDescription: cargoDescription || (isFreight ? 'Third-Party Freight Haulage (Non-Zarima Cargo)' : undefined),
      paymentType,
      paymentStatus,
      deliveryStatus,
      destinationCity,
      warehouseLocation,
      saleDate,
      dueDate:
        paymentType.includes('Credit')
          ? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
          : undefined,
    })

    toast({
      title: isFreight ? 'Freight Service Invoice Generated' : 'Sales Invoice Generated',
      description: isFreight
        ? `Freight invoice ${finalInvNo} issued for ${finalCustomerName}. Zero depot stock deducted.`
        : `Invoice ${finalInvNo} issued for ${finalCustomerName} (${isUsualCustomer ? 'Usual Customer' : 'New Customer'}). Depot stock decremented.`,
      type: 'success',
    })

    setIsModalOpen(false)
    setNewCompanyName('')
    setNewContactPerson('')
    setNewTinNumber('')
    setNewPhone('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Invoices"
        description="Wholesale customer invoices for regular returning clients (from dropdown) and one-time walk-in buyers."
        breadcrumbs={[
          { label: 'Cement Trading', href: '/cement' },
          { label: 'Sales Invoices' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast({
                  title: 'Sales Exported',
                  description: 'Sales invoices ledger exported to CSV format.',
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
              <span>New Sales Invoice</span>
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
              Sales Invoices bill Regular Customers (via dropdown) or One-Time Walk-In buyers (name written on invoice), and automatically decrement depot inventory.
            </span>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#16A34A] dark:text-[#22C55E] border border-[#22C55E]/30 flex-shrink-0">
          Billing &amp; Stock Outflux
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by invoice #, customer name, or destination..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Customer Type Filter */}
          <span className="text-muted-foreground font-medium flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Client:
          </span>
          <button
            onClick={() => setCustomerTypeFilter('ALL')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              customerTypeFilter === 'ALL'
                ? 'bg-[#060B08] dark:bg-forest text-white shadow-subtle'
                : 'bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/70'
            }`}
          >
            All Clients
          </button>
          <button
            onClick={() => setCustomerTypeFilter('Usual')}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              customerTypeFilter === 'Usual'
                ? 'bg-forest text-white shadow-subtle'
                : 'bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/70'
            }`}
          >
            <Star className="w-3 h-3 text-amber-300" />
            <span>Usual Customers</span>
          </button>
          <button
            onClick={() => setCustomerTypeFilter('New')}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              customerTypeFilter === 'New'
                ? 'bg-amber-600 text-white shadow-subtle'
                : 'bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/70'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-200" />
            <span>New Customers</span>
          </button>

          <span className="text-muted-foreground/40 mx-1">|</span>

          {/* Payment Status Filter */}
          <span className="text-muted-foreground font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'Paid', 'Outstanding', 'Partial'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? st === 'Outstanding' || st === 'Partial'
                    ? 'bg-[#FF6B00] text-white shadow-sm'
                    : 'bg-[#060B08] dark:bg-forest text-white shadow-subtle'
                  : 'bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/70'
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
            title="No sales invoices found"
            description="No invoices match your search, customer type, or payment filter settings."
            action={{
              label: 'Reset Filters',
              onClick: () => {
                setSearchTerm('')
                setCustomerTypeFilter('ALL')
                setStatusFilter('ALL')
              },
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-elevated/70 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Sale Date</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Customer Type</th>
                  <th className="py-3 px-4">Depot Source</th>
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
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((sale) => {
                  const isNew = sale.customerType === 'New'
                  const warehouseDisplay = sale.warehouseLocation || 'Addis Ababa Central Depot (Kality)'
                  return (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedSaleForDetail(sale)}
                      className="hover:bg-surface-elevated/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        {sale.invoiceNo}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(sale.saleDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground group-hover:text-forest transition-colors">{sale.customerName}</div>
                        <div className="text-[11px] text-muted-foreground">{sale.destinationCity}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isNew ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold text-[11px] border border-amber-500/30">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>One-Time Customer</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-forest/15 text-emerald-900 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-forest/30">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>Regular Customer</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Boxes className="w-3 h-3 text-muted-foreground/70" />
                          <span>{warehouseDisplay.split(' (')[0]}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                        {sale.invoiceType === 'Freight Service' ? (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
                              Freight Service
                            </span>
                            <div className="text-[11px] text-muted-foreground mt-0.5">External Cargo</div>
                          </div>
                        ) : (
                          sale.cementType
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-foreground font-semibold">
                        {formatQuantity(sale.quantityQuintals, 'Qtl')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        {formatCurrency(sale.totalAmountETB, { hideDecimals: true })}
                        {sale.invoiceType === 'Freight Service' ? (
                          <div className="text-[10px] text-amber-500 font-semibold">
                            Pure Freight (0 Qtl Stock)
                          </div>
                        ) : (
                          <div className="text-[10px] text-muted-foreground font-normal">
                            @{sale.unitPriceETB} ETB/Qtl
                            {sale.deliveryFeeETB && sale.deliveryFeeETB > 0 ? (
                              <span className="text-[#FF6B00] block font-semibold">
                                +{formatCurrency(sale.deliveryFeeETB, { compact: true })} Delivery
                              </span>
                            ) : null}
                          </div>
                        )}
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
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedSaleForDetail(sale)
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border group-hover:bg-forest/10 group-hover:border-forest/40 group-hover:text-forest transition-colors text-xs font-semibold text-foreground shadow-sm"
                          title="View & Edit Sales Tax Invoice"
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

      {/* Modal: Issue Sales Invoice (With Usual vs New Customer Switch) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border/80 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-forest dark:text-forest-vibrant" />
                  <span>Issue Commercial Sales Invoice</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate wholesale invoice for Regular Customers (from dropdown) or write down a One-Time Walk-In buyer.
                </p>
              </div>
            </div>

            {/* Segmented Customer Mode Selector */}
            <div className="mb-4 p-1 rounded-xl bg-slate-100 dark:bg-surface-elevated border border-slate-200 dark:border-border flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCustomerMode('Usual')}
                className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  customerMode === 'Usual'
                    ? 'bg-[#0F172A] text-white dark:bg-[#22C55E] dark:text-[#060B08] shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/5'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${customerMode === 'Usual' ? 'fill-amber-400 text-amber-400 dark:text-[#060B08]' : 'text-slate-400'}`} />
                <span className="font-bold">Regular Customer (From Dropdown)</span>
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('New')}
                className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  customerMode === 'New'
                    ? 'bg-[#FF6B00] text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/5'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="font-bold">One-Time / Walk-In (Write Name)</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Usual Customer Selection */}
              {customerMode === 'Usual' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-900 dark:text-slate-100">
                      Select Regular Customer (From Registered Dropdown)
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">No contract required</span>
                  </div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value)
                      const c = customers.find((cust) => cust.id === e.target.value)
                      if (c) setDestinationCity(`${c.city} Site`)
                    }}
                    className="w-full p-2.5 bg-white dark:bg-[#0E1712] border border-slate-300 dark:border-border rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-[#FF6B00] shadow-sm"
                  >
                    {customers.map((c) => (
                      <option 
                        key={c.id} 
                        value={c.id}
                        className="bg-white dark:bg-[#0E1712] text-slate-900 dark:text-slate-100 font-medium py-1"
                      >
                        {c.company} — TIN: {c.tinNumber} ({c.city})
                      </option>
                    ))}
                  </select>

                  {/* Customer Snapshot Box */}
                  {selectedCustomerObj && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-forest/5 border border-slate-200 dark:border-forest/20 text-[11px] grid grid-cols-2 gap-2 text-slate-600 dark:text-muted-foreground">
                      {selectedCustomerObj.id === 'CUST-WALKIN' ? (
                        <div className="col-span-2 flex items-center gap-2 text-emerald-800 dark:text-forest-vibrant font-semibold">
                          <span>Walk-in Customer (Counter Sale) — Direct cash or bank transfer payment. No contract required.</span>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-foreground">Contact: </span>
                            <span className="text-slate-700 dark:text-slate-200">{selectedCustomerObj.name}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-foreground">Phone: </span>
                            <span className="text-slate-700 dark:text-slate-200">{selectedCustomerObj.phone}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-foreground">Payment Terms: </span>
                            <span className="text-slate-700 dark:text-slate-200">{selectedCustomerObj.paymentTerms}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-foreground">Credit Limit: </span>
                            <span className="font-mono font-bold text-[#FF6B00]">{formatCurrency(selectedCustomerObj.creditLimitETB, { compact: true })}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* One-time / Walk-in Customer Fields */
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                      <UserPlus className="w-4 h-4" />
                      <span>One-Time / Walk-In Customer (Written Directly on Invoice)</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">No contract needed</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-foreground mb-1">
                        Customer / Buyer Name (Written on Invoice) *
                      </label>
                      <input
                        type="text"
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        placeholder="e.g. Ato Solomon / Bole Highrise Project"
                        className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-foreground mb-1">
                        Contact Person Name
                      </label>
                      <input
                        type="text"
                        value={newContactPerson}
                        onChange={(e) => setNewContactPerson(e.target.value)}
                        placeholder="e.g. Ato Daniel Assefa"
                        className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium text-foreground mb-1">
                        Ethiopian TIN Number
                      </label>
                      <input
                        type="text"
                        value={newTinNumber}
                        onChange={(e) => setNewTinNumber(e.target.value)}
                        placeholder="e.g. 0078129033"
                        className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-foreground mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="e.g. +251 91 234 5678"
                        className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-foreground mb-1">
                        City / Location
                      </label>
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Addis Ababa"
                        className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Fulfilling Warehouse & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Fulfill From Depot Warehouse
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

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Cement Grade
                  </label>
                  <select
                    value={cementType}
                    onChange={(e) => setCementType(e.target.value as CementType)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:ring-1 focus:ring-forest"
                  >
                    <option value="OPC 42.5N">OPC 42.5N (High Strength)</option>
                    <option value="PPC 32.5R">PPC 32.5R (Standard)</option>
                    <option value="Bulk Cement">Bulk Cement (Dry Tanker)</option>
                    <option value="Special Sulfate Resistant">Special Sulfate Resistant</option>
                  </select>
                </div>
              </div>

              {/* Destination & Sale Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Destination Project / Site
                  </label>
                  <input
                    type="text"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                    placeholder="e.g. Addis Ababa (Bole)"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Invoice Sale Date
                  </label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                    required
                  />
                </div>
              </div>

              {/* Transport Mode & Heavy Fleet Delivery Pricing */}
              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#FF6B00]" />
                    <span>Transport Delivery Mode &amp; Separate Cost</span>
                  </span>
                  <span className="text-[11px] text-[#22C55E] font-mono font-bold">
                    Itemized Delivery Charge
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Invoice Mode
                    </label>
                    <select
                      value={invoiceType}
                      onChange={(e) => {
                        const val = e.target.value as any
                        setInvoiceType(val)
                        if (val === 'Freight Service') {
                          setHasCompanyDelivery(true)
                          setCargoDescription('800 Qtl External Factory Cement Haulage (Not purchased from Zarima)')
                        } else if (val === 'Cement Sale') {
                          setHasCompanyDelivery(false)
                          setDeliveryFeeETB(0)
                        } else {
                          setHasCompanyDelivery(true)
                          if (deliveryFeeETB === 0) setDeliveryFeeETB(120000)
                        }
                      }}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-semibold"
                    >
                      <option value="Cement Sale & Delivery">Cement Sale &amp; Company Truck Delivery</option>
                      <option value="Cement Sale">Cement Sale Only (Ex-Depot / Self-Collection)</option>
                      <option value="Freight Service">Freight Service (External Cement or Non-Zarima Cargo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-foreground mb-1">
                      Truck Delivery Fee (ETB)
                    </label>
                    <input
                      type="number"
                      min="0"
                      disabled={invoiceType === 'Cement Sale'}
                      value={deliveryFeeETB}
                      onChange={(e) => setDeliveryFeeETB(Number(e.target.value))}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold"
                      placeholder="e.g. 120000"
                    />
                  </div>
                </div>

                {hasCompanyDelivery && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-medium text-foreground mb-1">
                        Assigned Commercial Truck
                      </label>
                      <select
                        value={assignedTruck}
                        onChange={(e) => {
                          setAssignedTruck(e.target.value)
                          const t = trucks.find((trk) => trk.plateNumber === e.target.value)
                          if (t) setDriverName(t.driverName)
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
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                        placeholder="Driver name"
                      />
                    </div>
                  </div>
                )}

                {invoiceType === 'Freight Service' && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block font-medium text-foreground">
                      Third-Party Cargo Manifest Description
                    </label>
                    <input
                      type="text"
                      value={cargoDescription}
                      onChange={(e) => setCargoDescription(e.target.value)}
                      className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                      placeholder="e.g. Haulage of 800 Qtl external Dangote cement bought directly by contractor"
                    />
                    <div className="text-[10px] text-amber-500 font-semibold">
                      * Third-Party Haulage: 0 Quintals deducted from central depot inventory. Pure transport billing.
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity & Unit Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {invoiceType === 'Freight Service' ? 'Cargo Weight (Quintals)' : 'Quantity Sold (Quintals)'}
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
                    {invoiceType === 'Freight Service' ? 'Material Price (0 for Pure Freight)' : 'Selling Price (ETB / Qtl)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                    required
                  />
                </div>
              </div>

              {/* Grand Total Strip */}
              <div className="p-3.5 rounded-xl bg-surface-elevated border border-border/80 flex items-center justify-between">
                <div>
                  <span className="font-medium text-muted-foreground">Invoice Grand Total:</span>
                  <div className="text-[11px] text-muted-foreground">
                    {invoiceType === 'Freight Service' ? (
                      <span>Pure Transport Freight Service</span>
                    ) : (
                      <span>
                        Material: {formatCurrency(quantity * unitPrice)}
                        {hasCompanyDelivery && deliveryFeeETB > 0 ? ` + Delivery: ${formatCurrency(deliveryFeeETB)}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-base font-bold text-foreground font-mono">
                  {formatCurrency((invoiceType === 'Freight Service' ? 0 : quantity * unitPrice) + (hasCompanyDelivery ? Number(deliveryFeeETB) : 0))}
                </span>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    <option value="Bank Transfer">Bank Transfer (CBE / Awash / Dashen)</option>
                    <option value="Cash">Cash on Delivery</option>
                    <option value="Credit 30 Days">Credit (Net 30 Days)</option>
                    <option value="Credit 60 Days">Credit (Net 60 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    <option value="Paid">Paid in Full</option>
                    <option value="Outstanding">Outstanding / On Credit</option>
                    <option value="Partial">Partial Deposit Received</option>
                  </select>
                </div>
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
                  Generate Sales Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Official Tax Invoice Detail Viewing Modal */}
      <InvoiceDetailModal
        isOpen={!!selectedSaleForDetail}
        onClose={() => setSelectedSaleForDetail(null)}
        type="sales"
        sale={selectedSaleForDetail}
      />
    </div>
  )
}
