import React, { useState, useEffect } from 'react'
import {
  X,
  Printer,
  Edit3,
  Save,
  CheckCircle2,
  Boxes,
  Truck,
  CreditCard,
  Receipt,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { formatCurrency, formatQuantity, formatDate } from '@/lib/formatters'
import { CementPurchase, CementSale, CementType } from '@/types'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'

interface InvoiceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'sales' | 'purchases'
  sale?: CementSale | null
  purchase?: CementPurchase | null
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  type,
  sale,
  purchase,
}) => {
  const { updateSale, updatePurchase, customers, suppliers } = useStore()
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)

  const isSales = type === 'sales'

  // Edit fields state
  const [editCounterparty, setEditCounterparty] = useState('')
  const [editCementType, setEditCementType] = useState<CementType>('OPC 42.5N')
  const [editQuantity, setEditQuantity] = useState<number>(0)
  const [editUnitPrice, setEditUnitPrice] = useState<number>(0)
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>('Paid')
  const [editPaymentType, setEditPaymentType] = useState<string>('Bank Transfer')
  const [editDeliveryStatus, setEditDeliveryStatus] = useState<string>('Delivered')
  const [editDestinationOrOrigin, setEditDestinationOrOrigin] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editAssignedTruck, setEditAssignedTruck] = useState('')
  const [editDriverName, setEditDriverName] = useState('')
  const [editNotes, setEditNotes] = useState('')

  // Delivery & Freight Service extension fields
  const [editInvoiceType, setEditInvoiceType] = useState<'Cement Sale' | 'Cement Sale & Delivery' | 'Freight Service'>('Cement Sale & Delivery')
  const [editHasCompanyDelivery, setEditHasCompanyDelivery] = useState(true)
  const [editDeliveryFee, setEditDeliveryFee] = useState<number>(120000)
  const [editCargoDescription, setEditCargoDescription] = useState('')

  // Sync state when sale or purchase prop updates
  useEffect(() => {
    if (isSales && sale) {
      setEditCounterparty(sale.customerName || 'Walk-in Customer')
      setEditCementType(sale.cementType)
      setEditQuantity(sale.quantityQuintals)
      setEditUnitPrice(sale.unitPriceETB)
      setEditPaymentStatus(sale.paymentStatus)
      setEditPaymentType(sale.paymentType)
      setEditDeliveryStatus(sale.deliveryStatus)
      setEditDestinationOrOrigin(sale.destinationCity)
      setEditDate(sale.saleDate)
      setEditAssignedTruck(sale.assignedTruck || '')
      setEditDriverName(sale.driverName || '')
      setEditInvoiceType(sale.invoiceType || (sale.deliveryFeeETB ? 'Cement Sale & Delivery' : 'Cement Sale'))
      setEditHasCompanyDelivery(sale.hasCompanyDelivery ?? ((sale.deliveryFeeETB || 0) > 0))
      setEditDeliveryFee(sale.deliveryFeeETB || 0)
      setEditCargoDescription(sale.cargoDescription || '')
      setEditNotes('')
    } else if (!isSales && purchase) {
      setEditCounterparty(purchase.supplierName)
      setEditCementType(purchase.cementType)
      setEditQuantity(purchase.quantityQuintals)
      setEditUnitPrice(purchase.unitPriceETB)
      setEditPaymentStatus(purchase.paymentStatus)
      setEditPaymentType('Direct Factory Transfer')
      setEditDeliveryStatus(purchase.deliveryStatus)
      setEditDestinationOrOrigin(purchase.factoryOrigin)
      setEditDate(purchase.receivedDate || purchase.orderDate)
      setEditAssignedTruck(purchase.assignedTruck || '')
      setEditNotes(purchase.notes || '')
    }
    setIsEditing(false)
  }, [sale, purchase, isSales, isOpen])

  // Handle Escape Key and Body Scroll Locking
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Active view values (reflecting live edits or stored invoice)
  const invNumber = isSales ? sale?.invoiceNo : (purchase?.purchaseInvoiceNo || purchase?.purchaseOrderNo)
  const invDate = editDate || (isSales ? sale?.saleDate : (purchase?.receivedDate || purchase?.orderDate))
  const counterpartyName = editCounterparty || (isSales ? (sale?.customerName || 'Walk-in Customer') : (purchase?.supplierName || 'Factory Supplier'))
  const cementType = editCementType || (isSales ? sale?.cementType : purchase?.cementType)
  const quantity = editQuantity || (isSales ? (sale?.quantityQuintals || 0) : (purchase?.quantityQuintals || 0))
  const unitPrice = editUnitPrice || (isSales ? (sale?.unitPriceETB || 0) : (purchase?.unitPriceETB || 0))
  
  const isFreightService = isSales && editInvoiceType === 'Freight Service'
  const hasDelivery = isSales && (editHasCompanyDelivery || (sale?.deliveryFeeETB || 0) > 0)
  const deliveryFee = hasDelivery ? (editDeliveryFee !== undefined ? editDeliveryFee : (sale?.deliveryFeeETB || 0)) : 0
  const materialAmount = isFreightService ? 0 : quantity * unitPrice
  const totalAmount = materialAmount + deliveryFee
  const subtotal = totalAmount / 1.15
  const vatAmount = totalAmount - subtotal
  const paymentStatus = editPaymentStatus || (isSales ? sale?.paymentStatus : purchase?.paymentStatus)
  const paymentMethod = isSales ? (editPaymentType || sale?.paymentType) : 'Direct Commercial LC / Bank Transfer'
  const depotLocation = isSales ? (sale?.warehouseLocation || 'Addis Ababa Central Depot (Kality)') : 'Addis Ababa Central Depot Intake'

  const handlePrint = () => {
    window.print()
  }

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFreightService && (editQuantity <= 0 || editUnitPrice <= 0)) {
      toast({
        title: 'Validation Error',
        description: 'Quantity and unit price must be positive numbers.',
        type: 'error',
      })
      return
    }

    const calcMaterial = isFreightService ? 0 : Number(editQuantity) * Number(editUnitPrice)
    const calcDelivery = editHasCompanyDelivery ? Number(editDeliveryFee) : 0
    const calcTotal = calcMaterial + calcDelivery

    if (isSales && sale) {
      updateSale(sale.id, {
        customerName: editCounterparty.trim() || 'Walk-in Customer',
        cementType: editCementType,
        quantityQuintals: Number(editQuantity),
        unitPriceETB: Number(editUnitPrice),
        totalAmountETB: calcTotal,
        paymentStatus: editPaymentStatus as any,
        paymentType: editPaymentType as any,
        deliveryStatus: editDeliveryStatus as any,
        destinationCity: editDestinationOrOrigin,
        saleDate: editDate,
        assignedTruck: editAssignedTruck,
        driverName: editDriverName,
        deliveryFeeETB: calcDelivery,
        hasCompanyDelivery: editHasCompanyDelivery,
        invoiceType: editInvoiceType,
        cargoDescription: editCargoDescription,
      })
      toast({
        title: 'Sales Invoice Updated',
        description: `Invoice ${sale.invoiceNo} successfully updated. Grand total: ${formatCurrency(calcTotal)}.`,
        type: 'success',
      })
    } else if (!isSales && purchase) {
      updatePurchase(purchase.id, {
        supplierName: editCounterparty,
        cementType: editCementType,
        quantityQuintals: Number(editQuantity),
        unitPriceETB: Number(editUnitPrice),
        totalAmountETB: calcMaterial,
        paymentStatus: editPaymentStatus as any,
        deliveryStatus: editDeliveryStatus as any,
        factoryOrigin: editDestinationOrOrigin,
        receivedDate: editDate,
        assignedTruck: editAssignedTruck,
        notes: editNotes,
      })
      toast({
        title: 'Purchases Invoice Updated',
        description: `Purchases invoice ${purchase.purchaseInvoiceNo || purchase.purchaseOrderNo} successfully updated. Total: ${formatCurrency(calcMaterial)}.`,
        type: 'success',
      })
    }

    setIsEditing(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden my-auto sm:my-3 flex flex-col max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2.5rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Sticky Control Bar (Never cropped, always visible) */}
        <div className="print:hidden flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border bg-surface-elevated/95 backdrop-blur-md shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                  {isEditing ? 'Edit Invoice Record' : 'Official Invoice Detail'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] text-[10px] font-bold">
                  {isSales ? 'Sales Invoice' : 'Purchases Intake'}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono truncate">
                {invNumber} &bull; {formatDate(invDate || '2026-10-18')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#060B08] font-bold text-xs transition-all shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold text-xs transition-all shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-foreground font-bold text-xs transition-all"
              >
                <span>Cancel Editing</span>
              </button>
            )}

            {/* Prominent High-Contrast Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-red-500/10 border border-border hover:border-red-500/40 text-muted-foreground hover:text-red-500 font-bold text-xs transition-colors shadow-xs"
              title="Close popup (Esc)"
              aria-label="Close invoice popup"
            >
              <X className="w-4 h-4 text-red-500" />
              <span className="font-bold text-foreground">Close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body Container */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8 space-y-6">

          {/* ========================================================= */}
          {/* EDIT MODE FORM */}
          {/* ========================================================= */}
          {isEditing ? (
            <form onSubmit={handleSaveInvoice} className="space-y-5 text-xs bg-surface text-foreground">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
                  <Edit3 className="w-4 h-4" />
                  <span>Editing {isSales ? `Sales Invoice #${invNumber}` : `Purchases Invoice #${invNumber}`}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">Adjust quantities, prices, client info, and statuses</span>
              </div>

              {/* Row 1: Counterparty & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {isSales ? 'Customer / Buyer Name (Walk-in or Regular)' : 'Factory Supplier Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editCounterparty}
                    onChange={(e) => setEditCounterparty(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground font-medium focus:ring-1 focus:ring-[#22C55E]"
                    placeholder="e.g. Midroc Construction or Walk-in Buyer"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground font-mono focus:ring-1 focus:ring-[#22C55E]"
                  />
                </div>
              </div>

              {/* Sales Invoice Classification & Delivery Mode */}
              {isSales && (
                <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#FF6B00]" />
                      <span>Invoice Type &amp; Transport Mode</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Delivery fee has its own separate cost
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-foreground mb-1">
                        Invoice Transaction Type
                      </label>
                      <select
                        value={editInvoiceType}
                        onChange={(e) => {
                          const val = e.target.value as any
                          setEditInvoiceType(val)
                          if (val === 'Freight Service') {
                            setEditHasCompanyDelivery(true)
                            setEditCargoDescription('800 Qtl External Factory Cement Haulage to Project Site (Not bought from Zarima)')
                          } else if (val === 'Cement Sale (Ex-Depot)') {
                            setEditHasCompanyDelivery(false)
                            setEditDeliveryFee(0)
                          } else {
                            setEditHasCompanyDelivery(true)
                            if (editDeliveryFee === 0) setEditDeliveryFee(120000)
                          }
                        }}
                        className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground font-semibold"
                      >
                        <option value="Cement Sale & Delivery">Cement Sale &amp; Company Truck Delivery</option>
                        <option value="Cement Sale">Cement Sale Only (Ex-Depot / Self-Transport)</option>
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
                        disabled={editInvoiceType === 'Cement Sale'}
                        value={editDeliveryFee}
                        onChange={(e) => setEditDeliveryFee(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground font-mono font-bold"
                        placeholder="e.g. 120000"
                      />
                    </div>
                  </div>

                  {editInvoiceType === 'Freight Service' && (
                    <div className="space-y-1.5 pt-1">
                      <label className="block font-medium text-foreground">
                        Cargo Haulage Manifest Description
                      </label>
                      <input
                        type="text"
                        value={editCargoDescription}
                        onChange={(e) => setEditCargoDescription(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground"
                        placeholder="e.g. Haulage of 800 Qtl external Dangote cement bought directly by contractor"
                      />
                      <div className="text-[10px] text-amber-500 font-semibold">
                        * Zero quintals decremented from Zarima Central Addis inventory ledger. Pure transport revenue.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Row 2: Cement Grade & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {editInvoiceType === 'Freight Service' ? 'Cargo Category' : 'Cement Commodity Type'}
                  </label>
                  <select
                    value={editCementType}
                    onChange={(e) => setEditCementType(e.target.value as CementType)}
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground focus:ring-1 focus:ring-[#22C55E]"
                  >
                    <option value="OPC 42.5N">OPC 42.5N (High Strength Structural)</option>
                    <option value="PPC 32.5R">PPC 32.5R (Portland Pozzolana)</option>
                    <option value="Bulk Cement">Bulk Cement (Tanker Haulage)</option>
                    <option value="Special Sulfate Resistant">Special Sulfate Resistant (SR)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Quantity (Quintals / 100kg units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground font-mono font-bold focus:ring-1 focus:ring-[#22C55E]"
                  />
                </div>
              </div>

              {/* Row 3: Unit Rate & Computed Subtotal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {editInvoiceType === 'Freight Service' ? 'Material Price (0 for Pure Freight)' : 'Material Selling Price (ETB / Qtl)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editUnitPrice}
                    onChange={(e) => setEditUnitPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground font-mono font-bold focus:ring-1 focus:ring-[#22C55E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Destination Site / Factory Origin
                  </label>
                  <input
                    type="text"
                    required
                    value={editDestinationOrOrigin}
                    onChange={(e) => setEditDestinationOrOrigin(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground focus:ring-1 focus:ring-[#22C55E]"
                    placeholder="e.g. Addis Ababa Kality Yard / Bole Site"
                  />
                </div>
              </div>

              {/* Row 4: Payment Terms & Delivery Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Payment Method
                  </label>
                  <select
                    value={editPaymentType}
                    onChange={(e) => setEditPaymentType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground"
                  >
                    <option value="Bank Transfer">Bank Transfer (CBE / Awash)</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Credit 30 Days">Credit (30 Days)</option>
                    <option value="Credit 60 Days">Credit (60 Days)</option>
                    <option value="Direct Factory Transfer">Direct Factory Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Payment Status
                  </label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Outstanding">Outstanding</option>
                    <option value="Partial">Partial</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Fulfillment / Delivery Status
                  </label>
                  <select
                    value={editDeliveryStatus}
                    onChange={(e) => setEditDeliveryStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground"
                  >
                    <option value="Delivered">Delivered</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Received">Received</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Assigned Truck Plate & Driver */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Assigned Heavy Truck Plate (Optional)
                  </label>
                  <input
                    type="text"
                    value={editAssignedTruck}
                    onChange={(e) => setEditAssignedTruck(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground font-mono"
                    placeholder="e.g. 3-ET-A41920 AA"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Assigned Heavy Driver Name
                  </label>
                  <input
                    type="text"
                    value={editDriverName}
                    onChange={(e) => setEditDriverName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground"
                    placeholder="e.g. Dawit Mengistu"
                  />
                </div>
              </div>

              {/* Dynamic Live Total Card */}
              <div className="p-4 rounded-2xl bg-surface-elevated border border-[#22C55E]/40 flex items-center justify-between">
                <div>
                  <div className="text-muted-foreground font-medium">Recalculated Grand Total:</div>
                  <div className="text-[11px] text-muted-foreground">
                    {editInvoiceType === 'Freight Service' ? (
                      <span>Pure Transport Freight Service</span>
                    ) : (
                      <span>
                        Material: {formatCurrency(editQuantity * editUnitPrice)}
                        {editHasCompanyDelivery && editDeliveryFee > 0 ? ` + Delivery: ${formatCurrency(editDeliveryFee)}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xl font-black text-[#22C55E] font-mono">
                  {formatCurrency((editInvoiceType === 'Freight Service' ? 0 : editQuantity * editUnitPrice) + (editHasCompanyDelivery ? Number(editDeliveryFee) : 0))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl border border-border hover:bg-surface-elevated text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#060B08] font-black shadow-subtle hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes &amp; Recalculate</span>
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================= */
            /* PRINTABLE OFFICIAL ETHIOPIAN COMMERCIAL INVOICE DOCUMENT */
            /* ========================================================= */
            <div className="space-y-6 text-foreground">
              
              {/* Document Letterhead */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b-2 border-border/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#060B08] border border-[#22C55E]/40 p-1 flex items-center justify-center shadow-md shrink-0">
                      <img
                        src="/images/zarima_logo.jpg"
                        alt="Zarima Logo"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                        Zarima Trading &amp; Logistics PLC
                      </h1>
                      <p className="text-[11px] text-muted-foreground font-semibold">
                        Authorized Factory Cement Allocation &amp; Heavy Corridor Haulage
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1">
                    <div>Central Inventory: Kality Industrial Zone, Gate 2, Addis Ababa, Ethiopia</div>
                    <div>TIN: <span className="font-mono font-bold text-foreground">0049281729</span> &bull; VAT Reg: <span className="font-mono font-bold text-foreground">119482910</span> &bull; Tel: +251 11 439 2810</div>
                  </div>
                </div>

                {/* Invoice Stamp Box */}
                <div className="text-left sm:text-right space-y-1 sm:self-start">
                  <span className="inline-block px-3 py-1 rounded-lg bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] text-xs font-black uppercase tracking-wider border border-[#22C55E]/30">
                    {isSales ? 'Commercial Sales Invoice' : 'Purchases Intake Voucher'}
                  </span>
                  <div className="text-lg font-black font-mono text-foreground mt-1">
                    {invNumber}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Date: <strong className="text-foreground">{formatDate(invDate || '2026-10-18')}</strong>
                  </div>
                </div>
              </div>

              {/* Billed To / Supplier & Depot Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-surface-elevated/70 border border-border text-xs">
                {/* Party Details */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    {isSales ? 'Customer / Buyer Details' : 'Factory Supplier Details'}
                  </div>
                  <div className="text-base font-black text-foreground">
                    {counterpartyName}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">Classification:</span> {(counterpartyName || '').toLowerCase().includes('walk-in') ? 'Walk-in Customer' : 'Regular Customer'}
                  </div>
                  {isSales && (
                    <div className="text-muted-foreground">
                      <span className="font-semibold text-foreground">Destination Site:</span> {editDestinationOrOrigin || sale?.destinationCity || 'Addis Ababa Region'}
                    </div>
                  )}
                  {!isSales && (
                    <div className="text-muted-foreground">
                      <span className="font-semibold text-foreground">Origin Factory:</span> {editDestinationOrOrigin || purchase?.factoryOrigin || 'Muger Plant, Oromia'}
                    </div>
                  )}
                </div>

                {/* Transaction & Fulfillment Details */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Warehouse Depot &amp; Settlement
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>{depotLocation}</span>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Payment Method:</span> {paymentMethod}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">Payment Status:</span>
                    <span className="font-bold text-[#16A34A] dark:text-[#22C55E]">{paymentStatus}</span>
                  </div>
                  {(editAssignedTruck || sale?.assignedTruck || purchase?.assignedTruck) && (
                    <div className="text-muted-foreground flex items-center gap-1 font-mono text-[11px]">
                      <Truck className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Assigned Hauler: {editAssignedTruck || sale?.assignedTruck || purchase?.assignedTruck}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-elevated border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Service &amp; Commodity Description</th>
                      <th className="py-3 px-4 text-right">Quantity</th>
                      <th className="py-3 px-4 text-right">Unit Rate (ETB)</th>
                      <th className="py-3 px-4 text-right">Amount (ETB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isFreightService ? (
                      <tr>
                        <td className="py-4 px-4 font-mono text-muted-foreground">01</td>
                        <td className="py-4 px-4">
                          <div className="font-extrabold text-foreground">
                            Commercial Freight &amp; Transport Logistics
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {editCargoDescription || sale?.cargoDescription || 'Haulage of external factory cement / third-party cargo (Not purchased from Zarima Trading)'}
                          </div>
                          <div className="text-[10px] text-amber-500 font-semibold mt-0.5">
                            * Third-Party Consignment — 0 Qtl deducted from Zarima central stock
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-foreground">
                          {formatQuantity(quantity, 'Qtl')}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-foreground">
                          {formatCurrency(deliveryFee / (quantity || 1))} / Qtl
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-black text-foreground">
                          {formatCurrency(deliveryFee)}
                        </td>
                      </tr>
                    ) : (
                      <>
                        <tr>
                          <td className="py-4 px-4 font-mono text-muted-foreground">01</td>
                          <td className="py-4 px-4">
                            <div className="font-extrabold text-foreground">{cementType}</div>
                            <div className="text-[11px] text-muted-foreground">
                              Standard Ethiopian Grade &bull; 50kg Bags ({quantity * 2} Bags) &bull; Central Depot Stock
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-foreground">
                            {formatQuantity(quantity, 'Qtl')}
                          </td>
                          <td className="py-4 px-4 text-right font-mono text-foreground">
                            {formatCurrency(unitPrice)}
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-black text-foreground">
                            {formatCurrency(materialAmount)}
                          </td>
                        </tr>

                        {hasDelivery && deliveryFee > 0 && (
                          <tr className="bg-surface-elevated/40">
                            <td className="py-4 px-4 font-mono text-muted-foreground">02</td>
                            <td className="py-4 px-4">
                              <div className="font-extrabold text-foreground flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-[#FF6B00]" />
                                <span>Commercial Heavy Truck Delivery &amp; Freight Service</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                Direct site delivery to {editDestinationOrOrigin || sale?.destinationCity || 'Customer Project Site'} &bull; Assigned Truck: {editAssignedTruck || sale?.assignedTruck || 'Zarima Heavy Fleet'}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-bold text-foreground">
                              1 Trip ({quantity} Qtl)
                            </td>
                            <td className="py-4 px-4 text-right font-mono text-foreground">
                              {formatCurrency(deliveryFee)}
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-black text-foreground">
                              {formatCurrency(deliveryFee)}
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals & Tax Summary Grid */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-2">
                {/* Stock Movement Verification Stamp */}
                <div className="p-3.5 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 max-w-sm text-xs space-y-1">
                  <div className="font-bold text-[#16A34A] dark:text-[#22C55E] flex items-center gap-1.5 uppercase text-[10.5px]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {isFreightService ? 'Third-Party Freight Logistics Carrier Verification' : 'Single Inventory & Delivery Audit Verification'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {isFreightService
                      ? 'Zero quintals deducted from Zarima Central Addis inventory ledger. Zarima Trading operated strictly as commercial freight hauler for client.'
                      : 'Physical warehouse balance verified at Addis Ababa Central Depot. Material stock decremented from central ledger. Commercial transport operated by Zarima fleet.'}
                  </p>
                </div>

                {/* Calculations Breakdown */}
                <div className="w-full sm:w-72 space-y-2 text-xs">
                  {!isFreightService && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Cement Material:</span>
                      <span className="font-mono text-foreground font-semibold">{formatCurrency(materialAmount)}</span>
                    </div>
                  )}

                  {hasDelivery && deliveryFee > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span className="text-[#FF6B00] font-semibold">Truck Delivery Fee:</span>
                      <span className="font-mono text-[#FF6B00] font-bold">+{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground pt-1 border-t border-border/60">
                    <span>Subtotal (Net):</span>
                    <span className="font-mono text-foreground font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT (15% Included):</span>
                    <span className="font-mono text-foreground font-semibold">{formatCurrency(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-border text-sm">
                    <span className="font-black text-foreground">Total Grand Amount:</span>
                    <span className="font-mono font-black text-[#FF6B00]">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures & Execution Section */}
              <div className="pt-8 border-t border-border grid grid-cols-3 gap-6 text-center text-xs">
                <div className="space-y-8">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase">
                    Prepared By (Accountant)
                  </div>
                  <div className="border-b border-border w-3/4 mx-auto" />
                  <div className="text-[11px] font-semibold text-foreground">
                    Bethlehem Tefera
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase">
                    Warehouse / Yard Clerk
                  </div>
                  <div className="border-b border-border w-3/4 mx-auto" />
                  <div className="text-[11px] font-semibold text-foreground">
                    Addis Ababa Central Depot
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase">
                    Customer Received By
                  </div>
                  <div className="border-b border-border w-3/4 mx-auto" />
                  <div className="text-[11px] font-semibold text-foreground">
                    Signature &amp; Date
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Bottom Control Bar */}
        <div className="print:hidden flex items-center justify-between px-4 sm:px-6 py-3 border-t border-border bg-surface-elevated/95 backdrop-blur-md shrink-0">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono text-[10px]">Esc</kbd> or click Close
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-xl border border-border text-foreground font-semibold text-xs hover:bg-surface transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-foreground font-bold text-xs transition-colors shadow-xs"
            >
              Close Window
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
