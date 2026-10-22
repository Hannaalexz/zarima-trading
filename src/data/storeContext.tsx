import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api'
import {
  CementPurchase,
  CementSale,
  CementInventoryItem,
  Customer,
  Supplier,
  Truck,
  Delivery,
  DeliveryOperationalStatus,
  Driver,
  MaintenanceRecord,
  FuelExpense,
  BankAccount,
  FinancialTransaction,
  BankReconciliation,
  PayrollEntry,
  ReceivableRecord,
  PayableRecord,
  CompanyMember,
  MemberFundedExpense,
  MemberReimbursementRecord,
  BankStatement,
  BusinessActivity,
  FleetPurchase,
  MasterProduct,
  MasterDepot,
} from '@/types'
import {
  mockPurchases,
  mockSales,
  mockInventory,
  mockCustomers,
  mockSuppliers,
} from './mock/cementData'
import { mockMasterProducts, mockMasterDepots } from './mock/masterData'
import {
  mockTrucks,
  mockDeliveries,
  mockDrivers,
  mockMaintenance,
  mockFuelExpenses,
  mockFleetPurchases,
} from './mock/fleetData'
import {
  mockBankAccounts,
  mockTransactions,
  mockReconciliations,
  mockPayroll,
  mockReceivables,
  mockPayables,
  mockMembers,
  mockMemberExpenses,
  mockMemberReimbursements,
  mockBankStatements,
} from './mock/financeData'

interface ReimburseParams {
  expenseId: string
  amountETB: number
  bankAccountId: string
  bankReference: string
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Cash'
  approvedBy: string
  notes?: string
}

interface StoreContextType {
  purchases: CementPurchase[]
  addPurchase: (purchase: Omit<CementPurchase, 'id'>) => void
  updatePurchase: (id: string, updated: Partial<CementPurchase>) => void
  sales: CementSale[]
  addSale: (sale: Omit<CementSale, 'id'>) => void
  updateSale: (id: string, updated: Partial<CementSale>) => void
  inventory: CementInventoryItem[]
  updateStock: (id: string, newStock: number) => void
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id'>) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  suppliers: Supplier[]
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void
  updateSupplier: (id: string, updates: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
  
  trucks: Truck[]
  addTruck: (truck: Omit<Truck, 'id'>) => void
  updateTruck: (id: string, updates: Partial<Truck>) => void
  deleteTruck: (id: string) => void
  updateTruckStatus: (id: string, status: Truck['operationalStatus']) => void
  deliveries: Delivery[]
  addDelivery: (delivery: Omit<Delivery, 'id'>) => void
  updateDeliveryStatus: (id: string, status: DeliveryOperationalStatus) => void
  updateDeliverySharedArrangement: (id: string, arrangement: Partial<Delivery>) => void
  drivers: Driver[]
  addDriver: (driver: Omit<Driver, 'id'>) => void
  updateDriver: (id: string, updated: Partial<Driver>) => void
  deleteDriver: (id: string) => void
  maintenance: MaintenanceRecord[]
  addMaintenance: (record: Omit<MaintenanceRecord, 'id'>) => void
  updateMaintenance: (id: string, updated: Partial<MaintenanceRecord>) => void
  toggleReconcileMaintenance: (maintenanceId: string, statementRef?: string) => void
  fleetPurchases: FleetPurchase[]
  addFleetPurchase: (purchase: Omit<FleetPurchase, 'id'>) => void
  toggleReconcileFleetPurchase: (purchaseId: string, statementRef?: string) => void
  updateTruckServiceInterval: (plateNumber: string, intervalKm: number) => void
  updateTruckConfig: (
    plateNumber: string,
    config: {
      mileageKm?: number
      serviceIntervalKm?: number
      warningLeadKm?: number
      engineOilGrade?: string
      preferredWorkshop?: string
    }
  ) => void
  autoReconcileFleetExpenses: () => { matchedCount: number; matchedIds: string[] }
  manualReconcileTransaction: (txId: string, statementRef?: string, notes?: string) => void
  fuelExpenses: FuelExpense[]
  addFuelExpense: (expense: Omit<FuelExpense, 'id'>) => void
  
  // Master Products & Depots (Enterprise Configuration)
  products: MasterProduct[]
  addProduct: (product: Omit<MasterProduct, 'id'>) => void
  updateProduct: (id: string, updates: Partial<MasterProduct>) => void
  deleteProduct: (id: string) => void
  depots: MasterDepot[]
  addDepot: (depot: Omit<MasterDepot, 'id'>) => void
  updateDepot: (id: string, updates: Partial<MasterDepot>) => void
  deleteDepot: (id: string) => void

  bankAccounts: BankAccount[]
  updateBankAccountBalance: (accountId: string, newBalance: number) => void
  transactions: FinancialTransaction[]
  addTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void
  reconciliations: BankReconciliation[]
  payroll: PayrollEntry[]
  updatePayrollEntry: (id: string, updates: Partial<PayrollEntry>) => void
  addPayrollEntry: (entry: Omit<PayrollEntry, 'id'>) => void
  deletePayrollEntry: (id: string) => void
  disbursePayrollBatch: (bankAccountId: string, batchMonth?: string) => void
  toggleReconcilePayrollPayment: (payrollId: string, statementRef?: string) => void
  receivables: ReceivableRecord[]
  payables: PayableRecord[]
  
  // Member-Funded Expenses & Accounting
  members: CompanyMember[]
  memberExpenses: MemberFundedExpense[]
  reimbursements: MemberReimbursementRecord[]
  addMemberExpense: (
    expense: Omit<
      MemberFundedExpense,
      'id' | 'expenseNumber' | 'createdAt' | 'amountReimbursedETB' | 'remainingOwedETB' | 'reimbursementStatus'
    >
  ) => MemberFundedExpense
  approveMemberExpense: (expenseId: string, approverName: string) => void
  rejectMemberExpense: (expenseId: string, reason?: string) => void
  reimburseMemberExpense: (params: ReimburseParams) => { success: boolean; message: string }
  
  // Bank Statements & Automated Reconciliation
  bankStatements: BankStatement[]
  importBankStatement: (statement: BankStatement) => { success: boolean; message: string; duplicate?: boolean }
  reconcileStatementTransaction: (
    statementId: string,
    txId: string,
    matchedInternalTxId?: string,
    action?: 'confirm' | 'reject' | 'exclude' | 'manual_match'
  ) => void
  postUnmatchedStatementTransaction: (
    statementId: string,
    txId: string,
    category: string,
    businessActivity: BusinessActivity,
    notes?: string
  ) => void
  lockBankStatement: (statementId: string, lockedBy: string) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [purchases, setPurchases] = useState<CementPurchase[]>(mockPurchases)
  const [sales, setSales] = useState<CementSale[]>(mockSales)
  const [inventory, setInventory] = useState<CementInventoryItem[]>(mockInventory)
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)

  const [trucks, setTrucks] = useState<Truck[]>(mockTrucks)
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries)
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers)
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(mockMaintenance)
  const [fleetPurchases, setFleetPurchases] = useState<FleetPurchase[]>(mockFleetPurchases)
  const [fuelExpenses, setFuelExpenses] = useState<FuelExpense[]>(mockFuelExpenses)

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts)
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(mockTransactions)
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>(mockReconciliations)
  const [payroll, setPayroll] = useState<PayrollEntry[]>(mockPayroll)

  // Master Data & Configuration State
  const [products, setProducts] = useState<MasterProduct[]>(mockMasterProducts)
  const [depots, setDepots] = useState<MasterDepot[]>(mockMasterDepots)

  const updatePayrollEntry = (id: string, updates: Partial<PayrollEntry>) => {
    setPayroll((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  const addPayrollEntry = (entry: Omit<PayrollEntry, 'id'>) => {
    const newEntry: PayrollEntry = {
      ...entry,
      id: `PAY-${Date.now().toString().slice(-4)}`,
    }
    setPayroll((prev) => [newEntry, ...prev])
  }

  const deletePayrollEntry = (id: string) => {
    setPayroll((prev) => prev.filter((p) => p.id !== id))
  }

  const disbursePayrollBatch = (bankAccountId: string, batchMonth?: string) => {
    const matchedBank = bankAccounts.find((b) => b.id === bankAccountId) || bankAccounts[0]
    const pendingItems = payroll.filter(
      (p) => (!batchMonth || p.month === batchMonth) && p.paymentStatus !== 'Paid'
    )
    const totalBatchPay = pendingItems.reduce((acc, p) => acc + p.netPayETB, 0)

    setPayroll((prev) =>
      prev.map((item) =>
        (!batchMonth || item.month === batchMonth)
          ? {
              ...item,
              paymentStatus: 'Paid',
              paymentDate: new Date().toISOString(),
              disbursementRef: `CBE-PAY-2026-${Date.now().toString().slice(-6)}`,
              isReconciled: false,
              reconciliationStatus: 'Pending Statement Match',
            }
          : item
      )
    )

    if (matchedBank && totalBatchPay > 0) {
      updateBankAccountBalance(matchedBank.id, matchedBank.balanceETB - totalBatchPay)
      const refNo = `CBE-PAY-2026-${Date.now().toString().slice(-6)}`
      addTransaction({
        referenceNumber: refNo,
        date: new Date().toISOString().split('T')[0],
        type: 'Expense',
        category: 'Operating Expense',
        fromAccount: matchedBank.bankName,
        amountETB: totalBatchPay,
        businessActivity: 'Shared',
        status: 'Cleared',
        notes: `Disbursement of ${batchMonth || 'Current'} Staff Payroll (${pendingItems.length} staff) via ${matchedBank.bankName}`,
      })
    }
  }

  const toggleReconcilePayrollPayment = (payrollId: string, statementRef?: string) => {
    setPayroll((prev) =>
      prev.map((item) => {
        if (item.id === payrollId) {
          const newReconciled = !item.isReconciled
          return {
            ...item,
            isReconciled: newReconciled,
            reconciliationStatus: newReconciled ? 'Reconciled' : 'Pending Statement Match',
            reconciledDate: newReconciled ? new Date().toISOString() : undefined,
            reconciledStatementRef: newReconciled ? (statementRef || 'CBE-STMT-2026-10') : undefined,
          }
        }
        return item
      })
    )
  }
  const [receivables] = useState<ReceivableRecord[]>(mockReceivables)
  const [payables, setPayables] = useState<PayableRecord[]>(mockPayables)

  const [members, setMembers] = useState<CompanyMember[]>(mockMembers)
  const [memberExpenses, setMemberExpenses] = useState<MemberFundedExpense[]>(mockMemberExpenses)
  const [reimbursements, setReimbursements] = useState<MemberReimbursementRecord[]>(mockMemberReimbursements)
  const [bankStatements, setBankStatements] = useState<BankStatement[]>(mockBankStatements)

  // Hydrate state from SQLite backend API when connected
  useEffect(() => {
    api.health()
      .then(() => {
        Promise.allSettled([
          api.getBankAccounts().then((data) => {
            if (data && data.length) setBankAccounts(data)
          }),
          api.getDeliveries().then((data) => {
            if (data && data.length) setDeliveries(data)
          }),
          api.getMemberExpenses().then((data) => {
            if (data?.expenses && data.expenses.length) {
              setMemberExpenses(data.expenses.map((e: any) => ({
                id: e.id,
                expenseNumber: e.expense_number,
                memberId: e.member_id,
                memberName: e.member_name,
                date: e.date,
                amountETB: e.amount_etb,
                currency: 'ETB',
                category: e.category,
                businessActivity: e.business_activity,
                description: e.description,
                businessPurpose: e.business_purpose,
                supplierOrPayee: e.supplier_or_payee,
                relatedEntityId: e.related_entity_id,
                relatedEntityType: e.related_entity_type,
                approvalStatus: e.approval_status,
                reimbursementStatus: e.reimbursement_status,
                amountReimbursedETB: e.amount_reimbursed_etb,
                remainingOwedETB: e.remaining_owed_etb,
                receiptAttachmentName: e.receipt_file_name,
                paymentMethod: 'Personal Bank Transfer',
                createdBy: e.member_name,
                createdAt: e.created_at || new Date().toISOString(),
                notes: e.notes,
              })))
            }
            if (data?.reimbursements && data.reimbursements.length) {
              setReimbursements(data.reimbursements.map((r: any) => ({
                id: r.id,
                reimbursementNumber: `REIMB-${r.id}`,
                expenseId: r.expense_id,
                memberId: r.member_id,
                memberName: r.disbursed_by || 'Member',
                date: r.reimbursement_date,
                amountETB: r.amount_etb,
                companyBankAccountId: r.bank_account_id,
                companyBankName: r.bank_account_name,
                bankReference: r.bank_reference,
                paymentMethod: 'Bank Transfer',
                approvedBy: r.disbursed_by || 'Treasury',
                notes: r.notes,
              })))
            }
          }),
          api.getMembers().then((data) => {
            if (data && data.length) {
              setMembers(data.map((m: any) => ({
                id: m.id,
                name: m.name,
                role: m.role,
                phone: m.phone,
                email: m.email,
                totalFundedETB: m.total_funded_etb,
                totalReimbursedETB: m.total_reimbursed_etb,
                outstandingBalanceETB: m.outstanding_balance_etb,
              })))
            }
          }),
          api.getInventory().then((data) => {
            if (data && data.length) setInventory(data)
          }),
          api.getPurchases().then((data) => {
            if (data && data.length) setPurchases(data)
          }),
          api.getSales().then((data) => {
            if (data && data.length) setSales(data)
          }),
          api.getCustomers().then((data) => {
            if (data && data.length) {
              setCustomers(
                data.map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  company: c.company,
                  tinNumber: c.tin_number || c.tinNumber,
                  phone: c.phone,
                  city: c.city,
                  creditLimitETB: c.credit_limit_etb ?? c.creditLimitETB,
                  outstandingBalanceETB: c.outstanding_balance_etb ?? c.outstandingBalanceETB,
                  paymentTerms: c.payment_terms || c.paymentTerms,
                  status: c.status,
                  isUsual: c.isUsual ?? (!c.company?.includes('Noah') && !c.name?.includes('Noah')),
                  customerCategory:
                    c.customerCategory ??
                    (!c.company?.includes('Noah') && !c.name?.includes('Noah')
                      ? 'Usual Customer'
                      : 'New Customer'),
                }))
              )
            }
          }),
          api.getReconciliationStatements().then((data) => {
            if (data && data.length) {
              const normalized: BankStatement[] = data.map((s: any) => ({
                id: s.id,
                statementNumber: s.statementNumber || s.statement_number || `STMT-${s.id}`,
                bankAccountId: s.bankAccountId || s.accountId || s.account_id || 'BANK-01',
                bankName: s.bankName || s.accountName || s.account_name || 'Commercial Bank of Ethiopia (CBE)',
                accountNumber: s.accountNumber || s.account_number || '',
                periodStart: s.periodStart || s.statementPeriodStart || s.period_start || '2026-10-01',
                periodEnd: s.periodEnd || s.statementPeriodEnd || s.period_end || '2026-10-15',
                fileName: s.fileName || s.file_name || `${s.statementNumber || 'statement'}.xlsx`,
                fileFormat: s.fileFormat || s.file_format || 'xlsx',
                uploadDate: s.uploadDate || s.importedAt || s.imported_at || new Date().toISOString(),
                uploadedBy: s.uploadedBy || s.uploaded_by || 'Bethlehem Tefera (Chief Accountant)',
                openingBalanceETB: Number(s.openingBalanceETB ?? s.opening_balance_etb ?? 0),
                closingBalanceETB: Number(s.closingBalanceETB ?? s.closing_balance_etb ?? 0),
                totalDebitsETB: Number(s.totalDebitsETB ?? s.total_debits_etb ?? 0),
                totalCreditsETB: Number(s.totalCreditsETB ?? s.total_credits_etb ?? 0),
                transactionCount: Number(s.transactionCount ?? s.totalTransactions ?? s.total_transactions ?? (s.transactions?.length || 0)),
                matchedCount: Number(s.matchedCount ?? s.matched_count ?? 0),
                needsReviewCount: Number(s.needsReviewCount ?? s.needs_review_count ?? 0),
                unmatchedCount: Number(s.unmatchedCount ?? s.unmatched_count ?? 0),
                status: s.status || 'Needs Review',
                isLocked: Boolean(s.isLocked || s.locked),
                lockedBy: s.lockedBy || s.locked_by,
                lockedAt: s.lockedAt || s.locked_at,
                transactions: (s.transactions || []).map((t: any) => ({
                  id: t.id,
                  statementId: s.id,
                  transactionDate: t.transactionDate || t.date || '2026-10-15',
                  valueDate: t.valueDate || t.value_date,
                  description: t.description || 'Transaction line',
                  reference: t.reference || t.referenceNumber || t.reference_number || 'N/A',
                  debitETB: t.debitETB ?? (!t.isCredit && t.amountETB ? t.amountETB : 0),
                  creditETB: t.creditETB ?? (t.isCredit && t.amountETB ? t.amountETB : 0),
                  runningBalanceETB: t.runningBalanceETB ?? t.running_balance_etb,
                  counterpartyName: t.counterpartyName || t.counterparty_name,
                  counterpartyAccount: t.counterpartyAccount || t.counterparty_account,
                  fingerprint: t.fingerprint || `fp_${t.id}`,
                  status: t.status || 'Needs Review',
                  matchedTransactionId: t.matchedTransactionId || t.matched_transaction_id,
                  matchConfidence: t.matchConfidence ?? t.match_confidence,
                  matchReason: t.matchReason || t.match_reason,
                  isReconciled: Boolean(t.isReconciled ?? t.is_reconciled),
                  reconciledBy: t.reconciledBy || t.reconciled_by,
                  reconciledAt: t.reconciledAt || t.reconciled_at,
                })),
              }))
              const backendIds = new Set(normalized.map((s) => s.id))
              const merged = [
                ...normalized,
                ...mockBankStatements.filter((m) => !backendIds.has(m.id)),
              ]
              setBankStatements(merged)
            }
          }),
        ]).then(() => {
          console.log('[Zarima ERP] SQLite backend hydration successful')
        })
      })
      .catch(() => {
        // Backend offline, graceful fallback to local state
      })
  }, [])

  const addPurchase = (item: Omit<CementPurchase, 'id'>) => {
    const invoiceNum = item.purchaseInvoiceNo || item.purchaseOrderNo || `PI-2026-0${purchases.length + 94}`
    const warehouse = item.warehouseLocation || 'Addis Ababa Central Depot (Kality)'
    const date = item.receivedDate || item.orderDate || new Date().toISOString().split('T')[0]

    const newItem: CementPurchase = {
      ...item,
      id: invoiceNum,
      purchaseInvoiceNo: invoiceNum,
      purchaseOrderNo: invoiceNum,
      deliveryStatus: 'Received', // purchases invoice is created when stock reaches inventory
      receivedDate: date,
      orderDate: date,
      warehouseLocation: warehouse,
    }

    // 1. Add to purchases invoices
    setPurchases([newItem, ...purchases])

    // 2. Automatically increment stock in depot inventory
    setInventory((prev) => {
      let matched = false
      const updated = prev.map((inv) => {
        if (inv.cementType === newItem.cementType && inv.warehouseLocation === warehouse) {
          matched = true
          const newQty = inv.currentStockQuintals + newItem.quantityQuintals
          return {
            ...inv,
            currentStockQuintals: newQty,
            totalValueETB: newQty * inv.unitCostETB,
            lastRestockedDate: date,
            status: newQty < inv.minThresholdQuintals ? ('Low Stock' as const) : ('Adequate' as const),
          }
        }
        return inv
      })

      if (!matched) {
        // If exact warehouse+type not found, check if type exists at any depot or create entry
        const fallbackMatch = updated.find((inv) => inv.cementType === newItem.cementType)
        if (fallbackMatch) {
          return updated.map((inv) =>
            inv.id === fallbackMatch.id
              ? {
                  ...inv,
                  currentStockQuintals: inv.currentStockQuintals + newItem.quantityQuintals,
                  totalValueETB: (inv.currentStockQuintals + newItem.quantityQuintals) * inv.unitCostETB,
                  lastRestockedDate: date,
                  status: 'Adequate' as const,
                }
              : inv
          )
        }
        const newInvItem: CementInventoryItem = {
          id: `INV-DEP-${Date.now()}`,
          warehouseLocation: warehouse,
          cementType: newItem.cementType,
          currentStockQuintals: newItem.quantityQuintals,
          minThresholdQuintals: 1000,
          unitCostETB: newItem.unitPriceETB,
          totalValueETB: newItem.totalAmountETB,
          lastRestockedDate: date,
          status: 'Adequate',
        }
        return [...updated, newInvItem]
      }
      return updated
    })

    // 3. Notify backend
    api.createPurchase(newItem).catch(() => {})
  }

  const updatePurchase = (id: string, updated: Partial<CementPurchase>) => {
    setPurchases((prev) =>
      prev.map((p) => {
        if (p.id === id || p.purchaseInvoiceNo === id || p.purchaseOrderNo === id) {
          const qty = updated.quantityQuintals ?? p.quantityQuintals
          const price = updated.unitPriceETB ?? p.unitPriceETB
          const total = updated.totalAmountETB ?? qty * price
          return {
            ...p,
            ...updated,
            quantityQuintals: qty,
            unitPriceETB: price,
            totalAmountETB: total,
          }
        }
        return p
      })
    )
  }

  const addSale = (item: Omit<CementSale, 'id'>) => {
    const invNo = item.invoiceNo || `INV-2026-40${sales.length + 7}`
    const warehouse = item.warehouseLocation || 'Addis Ababa Central Depot (Kality)'
    const date = item.saleDate || new Date().toISOString().split('T')[0]
    const deliveryFee = item.deliveryFeeETB ?? 0
    const totalAmount = item.totalAmountETB ?? (item.quantityQuintals * item.unitPriceETB + deliveryFee)

    const newItem: CementSale = {
      ...item,
      id: invNo,
      invoiceNo: invNo,
      warehouseLocation: warehouse,
      saleDate: date,
      deliveryFeeETB: deliveryFee,
      totalAmountETB: totalAmount,
      customerType: item.customerType || 'Usual',
      invoiceType: item.invoiceType || (deliveryFee > 0 ? 'Cement Sale & Delivery' : 'Cement Sale'),
    }

    // 1. Add to sales invoices
    setSales([newItem, ...sales])

    // 2. Automatically decrement stock in depot inventory ONLY if selling company stock
    // (Third-party freight service or external cargo delivery does NOT deduct Zarima inventory)
    if (newItem.invoiceType !== 'Freight Service' && newItem.quantityQuintals > 0 && newItem.unitPriceETB > 0) {
      setInventory((prev) =>
        prev.map((inv) => {
          if (
            inv.cementType === newItem.cementType &&
            (inv.warehouseLocation === warehouse || prev.filter((i) => i.cementType === newItem.cementType).length === 1)
          ) {
            const newQty = Math.max(0, inv.currentStockQuintals - newItem.quantityQuintals)
            return {
              ...inv,
              currentStockQuintals: newQty,
              totalValueETB: newQty * inv.unitCostETB,
              status:
                newQty === 0
                  ? ('Critical' as const)
                  : newQty < inv.minThresholdQuintals
                  ? ('Low Stock' as const)
                  : ('Adequate' as const),
            }
          }
          return inv
        })
      )
    }

    // 3. If customer is new or not registered, register customer
    setCustomers((prev) => {
      const exists = prev.find(
        (c) =>
          c.id === newItem.customerId ||
          c.company.toLowerCase() === newItem.customerName.toLowerCase() ||
          c.name.toLowerCase() === newItem.customerName.toLowerCase()
      )

      if (!exists && newItem.customerName) {
        const newCust: Customer = {
          id: newItem.customerId || `CUST-00${prev.length + 1}`,
          name: newItem.customerName,
          company: newItem.customerName,
          tinNumber: `00${Math.floor(10000000 + Math.random() * 90000000)}`,
          phone: '+251 91 000 0000',
          city: newItem.destinationCity || 'Addis Ababa',
          creditLimitETB: 3000000,
          outstandingBalanceETB: newItem.paymentStatus === 'Outstanding' ? newItem.totalAmountETB : 0,
          paymentTerms: newItem.paymentType || 'Cash on Delivery',
          status: 'Active',
          isUsual: newItem.customerType === 'Usual',
          customerCategory: newItem.customerType === 'Usual' ? 'Usual Customer' : 'New Customer',
        }
        return [...prev, newCust]
      } else if (exists && newItem.paymentStatus === 'Outstanding') {
        return prev.map((c) =>
          c.id === exists.id
            ? { ...c, outstandingBalanceETB: c.outstandingBalanceETB + newItem.totalAmountETB }
            : c
        )
      }
      return prev
    })

    // 4. Notify backend
    api.createSale(newItem).catch(() => {})
  }

  const updateSale = (id: string, updated: Partial<CementSale>) => {
    setSales((prev) =>
      prev.map((s) => {
        if (s.id === id || s.invoiceNo === id) {
          const qty = updated.quantityQuintals ?? s.quantityQuintals
          const price = updated.unitPriceETB ?? s.unitPriceETB
          const total = updated.totalAmountETB ?? qty * price
          return {
            ...s,
            ...updated,
            quantityQuintals: qty,
            unitPriceETB: price,
            totalAmountETB: total,
          }
        }
        return s
      })
    )
  }

  const updateStock = (id: string, newStock: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              currentStockQuintals: newStock,
              totalValueETB: newStock * item.unitCostETB,
              status: newStock < item.minThresholdQuintals ? 'Low Stock' : 'Adequate',
            }
          : item
      )
    )
  }

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCust: Customer = {
      ...customer,
      id: `CUST-00${customers.length + 1}`,
    }
    setCustomers([...customers, newCust])
  }

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...supplier,
      id: `SUP-00${suppliers.length + 1}`,
    }
    setSuppliers([...suppliers, newSup])
  }

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id))
  }

  const addTruck = (truck: Omit<Truck, 'id'>) => {
    const newTruck: Truck = {
      ...truck,
      id: `TRK-0${trucks.length + 1}`,
    }
    setTrucks([...trucks, newTruck])
  }

  const updateTruck = (id: string, updates: Partial<Truck>) => {
    setTrucks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
  }

  const deleteTruck = (id: string) => {
    setTrucks((prev) => prev.filter((t) => t.id !== id))
  }

  const updateTruckStatus = (id: string, status: Truck['operationalStatus']) => {
    setTrucks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, operationalStatus: status } : t))
    )
  }

  // Master Products & Depots (Enterprise Configuration)
  const addProduct = (product: Omit<MasterProduct, 'id'>) => {
    const newProd: MasterProduct = {
      ...product,
      id: `PROD-${Date.now().toString().slice(-4)}`,
    }
    setProducts((prev) => [newProd, ...prev])
  }

  const updateProduct = (id: string, updates: Partial<MasterProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const addDepot = (depot: Omit<MasterDepot, 'id'>) => {
    const newDep: MasterDepot = {
      ...depot,
      id: `DEPOT-${Date.now().toString().slice(-4)}`,
    }
    setDepots((prev) => [...prev, newDep])
  }

  const updateDepot = (id: string, updates: Partial<MasterDepot>) => {
    setDepots((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    )
  }

  const deleteDepot = (id: string) => {
    setDepots((prev) => prev.filter((d) => d.id !== id))
  }

  const addDelivery = (delivery: Omit<Delivery, 'id'>) => {
    const freightRev = Number(delivery.freightChargeETB || 0)
    const fuel = delivery.fuelExpenseETB ?? Math.round(freightRev * 0.32)
    const perDiem = delivery.driverPerDiemETB ?? 5000
    const tollLoading = delivery.tollLoadingETB ?? 4500
    const totalCost = delivery.totalTripCostETB ?? (fuel + perDiem + tollLoading)
    const netMargin = delivery.netTripMarginETB ?? (freightRev - totalCost)

    const newDel: Delivery = {
      ...delivery,
      id: `DEL-2026-88${deliveries.length + 7}`,
      freightChargeETB: freightRev,
      fuelExpenseETB: fuel,
      driverPerDiemETB: perDiem,
      tollLoadingETB: tollLoading,
      totalTripCostETB: totalCost,
      netTripMarginETB: netMargin,
      cargoCategory: delivery.cargoCategory || (delivery.isThirdPartyCargo ? 'Third-Party Cement' : 'Zarima Cement'),
      isThirdPartyCargo: delivery.isThirdPartyCargo ?? (delivery.cargoCategory ? delivery.cargoCategory !== 'Zarima Cement' : false),
    }
    setDeliveries([newDel, ...deliveries])
  }

  const updateDeliveryStatus = (id: string, status: DeliveryOperationalStatus) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, deliveryStatus: status } : d))
    )
  }

  const updateDeliverySharedArrangement = (id: string, arrangement: Partial<Delivery>) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...arrangement } : d))
    )
  }

  const addDriver = (driver: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...driver,
      id: `DRV-${String(drivers.length + 1).padStart(3, '0')}`,
      tripCount: 0,
    }
    setDrivers((prev) => [newDriver, ...prev])
  }

  const updateDriver = (id: string, updated: Partial<Driver>) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updated } : d))
    )
  }

  const deleteDriver = (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id))
  }

  const addMaintenance = (record: Omit<MaintenanceRecord, 'id'>) => {
    const maintenanceId = `MNT-2026-04${maintenance.length + 5}`
    const cost = Number(record.costETB || 0)
    const bankId = record.paidFromAccountId || 'BANK-01'
    const matchedBank = bankAccounts.find((b) => b.id === bankId) || bankAccounts[0]
    const wireRef = record.disbursementRef || `CBE-MNT-2026-${Date.now().toString().slice(-5)}`
    const txId = `TXN-MNT-${Date.now().toString().slice(-4)}`

    const newRec: MaintenanceRecord = {
      ...record,
      id: maintenanceId,
      paidFromAccountId: bankId,
      paidFromAccountName: matchedBank.bankName,
      disbursementRef: wireRef,
      isReconciled: false,
      reconciliationStatus: 'Pending Statement Match',
      journalEntryId: txId,
    }
    setMaintenance([newRec, ...maintenance])

    // 1. Post General Ledger Journal Transaction (Debit: Fleet Operating Expense / Credit: Bank Account)
    if (cost > 0) {
      const journalTx: FinancialTransaction = {
        id: txId,
        referenceNumber: wireRef,
        date: record.date || new Date().toISOString().split('T')[0],
        type: 'Expense',
        category: 'Truck Maintenance & Servicing',
        fromAccount: matchedBank.bankName,
        toAccount: record.workshopName || 'Authorized Workshop',
        amountETB: cost,
        businessActivity: 'Transport',
        status: 'Pending Reconciliation',
        notes: `Preventive Maintenance: ${record.serviceType} for ${record.truckPlate} at ${record.workshopName}. (Debit: Fleet Operating Expense / Credit: ${matchedBank.bankName})`,
      }
      setTransactions((prev) => [journalTx, ...prev])

      // 2. Decrement Company Bank Account balance
      setBankAccounts((prev) =>
        prev.map((b) => (b.id === bankId ? { ...b, balanceETB: b.balanceETB - cost } : b))
      )
    }

    // 3. Update truck's last service date, mileage, and reset threshold
    setTrucks((prev) =>
      prev.map((t) => {
        if (t.plateNumber === record.truckPlate) {
          const currentKm = t.mileageKm || 0
          const interval = record.serviceIntervalKm || t.serviceIntervalKm || 10000
          const nextDue = record.nextServiceDueKm || (currentKm + interval)
          return {
            ...t,
            lastServiceDate: record.date,
            lastServiceKm: currentKm,
            serviceIntervalKm: interval,
            nextServiceDueKm: nextDue,
            operationalStatus: 'Available' as const,
          }
        }
        return t
      })
    )
  }

  const updateMaintenance = (id: string, updated: Partial<MaintenanceRecord>) => {
    setMaintenance((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
    )
  }

  const toggleReconcileMaintenance = (maintenanceId: string, statementRef?: string) => {
    setMaintenance((prev) =>
      prev.map((m) => {
        if (m.id === maintenanceId) {
          const newStatus = !m.isReconciled
          const stmtRef = statementRef || m.reconciledStatementRef || 'CBE-STMT-OCT26-01'

          // Also synchronize associated financial transaction
          if (m.journalEntryId || m.disbursementRef) {
            setTransactions((txs) =>
              txs.map((tx) =>
                tx.id === m.journalEntryId || tx.referenceNumber === m.disbursementRef
                  ? { ...tx, status: newStatus ? 'Reconciled' : 'Pending Reconciliation' }
                  : tx
              )
            )
          }

          return {
            ...m,
            isReconciled: newStatus,
            reconciliationStatus: newStatus ? 'Reconciled' : 'Pending Statement Match',
            reconciledDate: newStatus ? new Date().toISOString() : undefined,
            reconciledStatementRef: newStatus ? stmtRef : undefined,
          }
        }
        return m
      })
    )
  }

  const addFleetPurchase = (purchase: Omit<FleetPurchase, 'id'>) => {
    const purchaseId = `FP-2026-${String(fleetPurchases.length + 1).padStart(3, '0')}`
    const totalCost = Number(purchase.totalCostETB || 0)
    const bankId = purchase.paidFromAccountId || 'BANK-01'
    const matchedBank = bankAccounts.find((b) => b.id === bankId) || bankAccounts[0]
    const wireRef = purchase.disbursementRef || `CBE-FP-2026-${Date.now().toString().slice(-5)}`
    const txId = `TXN-FP-${Date.now().toString().slice(-4)}`

    const newP: FleetPurchase = {
      ...purchase,
      id: purchaseId,
      paidFromAccountId: bankId,
      paidFromAccountName: matchedBank.bankName,
      disbursementRef: wireRef,
      isReconciled: false,
      reconciliationStatus: 'Pending Statement Match',
      journalEntryId: txId,
    }
    setFleetPurchases((prev) => [newP, ...prev])

    // 1. Post General Ledger Journal Transaction (Debit: Fleet Parts Expense / Credit: Bank Account)
    if (totalCost > 0 && purchase.paymentStatus === 'Paid') {
      const journalTx: FinancialTransaction = {
        id: txId,
        referenceNumber: wireRef,
        date: purchase.date || new Date().toISOString().split('T')[0],
        type: 'Expense',
        category: 'Fleet Spare Parts & Tires',
        fromAccount: matchedBank.bankName,
        toAccount: purchase.supplierName,
        amountETB: totalCost,
        businessActivity: 'Transport',
        status: 'Pending Reconciliation',
        notes: `Fleet Parts: ${purchase.quantity}x ${purchase.itemDescription} (${purchase.category}) for ${purchase.truckPlate} from ${purchase.supplierName}. (Debit: Fleet Operating Expense / Credit: ${matchedBank.bankName})`,
      }
      setTransactions((prev) => [journalTx, ...prev])

      // 2. Decrement Company Bank Account balance
      setBankAccounts((prev) =>
        prev.map((b) => (b.id === bankId ? { ...b, balanceETB: b.balanceETB - totalCost } : b))
      )
    }
  }

  const toggleReconcileFleetPurchase = (purchaseId: string, statementRef?: string) => {
    setFleetPurchases((prev) =>
      prev.map((p) => {
        if (p.id === purchaseId) {
          const newStatus = !p.isReconciled
          const stmtRef = statementRef || p.reconciledStatementRef || 'CBE-STMT-OCT26-01'

          // Also synchronize associated financial transaction
          if (p.journalEntryId || p.disbursementRef) {
            setTransactions((txs) =>
              txs.map((tx) =>
                tx.id === p.journalEntryId || tx.referenceNumber === p.disbursementRef
                  ? { ...tx, status: newStatus ? 'Reconciled' : 'Pending Reconciliation' }
                  : tx
              )
            )
          }

          return {
            ...p,
            isReconciled: newStatus,
            reconciliationStatus: newStatus ? 'Reconciled' : 'Pending Statement Match',
            reconciledDate: newStatus ? new Date().toISOString() : undefined,
            reconciledStatementRef: newStatus ? stmtRef : undefined,
          }
        }
        return p
      })
    )
  }

  const updateTruckServiceInterval = (plateNumber: string, intervalKm: number) => {
    setTrucks((prev) =>
      prev.map((t) => {
        if (t.plateNumber === plateNumber) {
          const lastKm = t.lastServiceKm || 0
          return {
            ...t,
            serviceIntervalKm: intervalKm,
            nextServiceDueKm: lastKm + intervalKm,
          }
        }
        return t
      })
    )
  }

  const updateTruckConfig = (
    plateNumber: string,
    config: {
      mileageKm?: number
      serviceIntervalKm?: number
      warningLeadKm?: number
      engineOilGrade?: string
      preferredWorkshop?: string
    }
  ) => {
    setTrucks((prev) =>
      prev.map((t) => {
        if (t.plateNumber === plateNumber) {
          const currentMileage = config.mileageKm !== undefined ? Number(config.mileageKm) : t.mileageKm
          const interval = config.serviceIntervalKm !== undefined ? Number(config.serviceIntervalKm) : (t.serviceIntervalKm || 10000)
          const lastKm = t.lastServiceKm || 0
          const nextDueKm = lastKm + interval

          return {
            ...t,
            mileageKm: currentMileage,
            serviceIntervalKm: interval,
            nextServiceDueKm: nextDueKm,
            warningLeadKm: config.warningLeadKm !== undefined ? Number(config.warningLeadKm) : t.warningLeadKm,
            engineOilGrade: config.engineOilGrade !== undefined ? config.engineOilGrade : t.engineOilGrade,
            preferredWorkshop: config.preferredWorkshop !== undefined ? config.preferredWorkshop : t.preferredWorkshop,
          }
        }
        return t
      })
    )
  }

  const autoReconcileFleetExpenses = () => {
    const statementRefs = new Set<string>()
    bankStatements.forEach((stmt) => {
      stmt.transactions.forEach((stx) => {
        if (stx.reference) statementRefs.add(stx.reference.toUpperCase().trim())
        if (stx.description) statementRefs.add(stx.description.toUpperCase().trim())
      })
    })

    let matchedCount = 0
    const matchedIds: string[] = []

    setTransactions((prev) =>
      prev.map((tx) => {
        if (
          tx.status !== 'Reconciled' &&
          (tx.businessActivity === 'Transport' ||
            tx.category.includes('Fleet') ||
            tx.category.includes('Maintenance') ||
            tx.category.includes('Fuel') ||
            tx.referenceNumber?.startsWith('CBE-MNT') ||
            tx.referenceNumber?.startsWith('AWB-MNT') ||
            tx.referenceNumber?.startsWith('CBE-FP') ||
            tx.referenceNumber?.startsWith('AWB-FP'))
        ) {
          matchedCount++
          matchedIds.push(tx.id)

          // Sync maintenance
          setMaintenance((mnts) =>
            mnts.map((m) =>
              m.journalEntryId === tx.id || m.disbursementRef === tx.referenceNumber
                ? {
                    ...m,
                    isReconciled: true,
                    reconciliationStatus: 'Reconciled',
                    reconciledStatementRef: 'CBE-STMT-OCT26-01',
                    reconciledDate: new Date().toISOString(),
                  }
                : m
            )
          )

          // Sync fleet purchases
          setFleetPurchases((fps) =>
            fps.map((p) =>
              p.journalEntryId === tx.id || p.disbursementRef === tx.referenceNumber
                ? {
                    ...p,
                    isReconciled: true,
                    reconciliationStatus: 'Reconciled',
                    reconciledStatementRef: 'CBE-STMT-OCT26-01',
                    reconciledDate: new Date().toISOString(),
                  }
                : p
            )
          )

          return {
            ...tx,
            status: 'Reconciled' as const,
            reconciliationMethod: 'Auto-Matched' as const,
            reconciledStatementRef: 'CBE-STMT-OCT26-01',
            reconciledDate: new Date().toISOString(),
            reconciledBy: 'Automated Bank Reconciliation Engine',
          }
        }
        return tx
      })
    )

    return { matchedCount, matchedIds }
  }

  const manualReconcileTransaction = (txId: string, statementRef?: string, notes?: string) => {
    const stmtRef = statementRef || 'CBE-STMT-OCT26-01'
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId) {
          const isCurrentlyReconciled = tx.status === 'Reconciled'
          const newStatus = !isCurrentlyReconciled

          // Sync with maintenance
          setMaintenance((mnts) =>
            mnts.map((m) =>
              m.journalEntryId === txId || m.disbursementRef === tx.referenceNumber
                ? {
                    ...m,
                    isReconciled: newStatus,
                    reconciliationStatus: newStatus ? 'Reconciled' : 'Pending Statement Match',
                    reconciledStatementRef: newStatus ? stmtRef : undefined,
                    reconciledDate: newStatus ? new Date().toISOString() : undefined,
                  }
                : m
            )
          )

          // Sync with fleet purchases
          setFleetPurchases((fps) =>
            fps.map((p) =>
              p.journalEntryId === txId || p.disbursementRef === tx.referenceNumber
                ? {
                    ...p,
                    isReconciled: newStatus,
                    reconciliationStatus: newStatus ? 'Reconciled' : 'Pending Statement Match',
                    reconciledStatementRef: newStatus ? stmtRef : undefined,
                    reconciledDate: newStatus ? new Date().toISOString() : undefined,
                  }
                : p
            )
          )

          return {
            ...tx,
            status: newStatus ? 'Reconciled' : 'Pending Reconciliation',
            reconciliationMethod: newStatus ? 'Manual' : undefined,
            reconciledStatementRef: newStatus ? stmtRef : undefined,
            reconciledDate: newStatus ? new Date().toISOString() : undefined,
            reconciledBy: newStatus ? 'Fleet Accountant (Manual Review)' : undefined,
            notes: notes ? `${tx.notes || ''} [Manual Match: ${notes}]` : tx.notes,
          }
        }
        return tx
      })
    )
  }

  const addFuelExpense = (expense: Omit<FuelExpense, 'id'>) => {
    const newFuel: FuelExpense = {
      ...expense,
      id: `FL-2026-51${fuelExpenses.length + 3}`,
    }
    setFuelExpenses([newFuel, ...fuelExpenses])
  }

  const updateBankAccountBalance = (accountId: string, newBalance: number) => {
    setBankAccounts((prev) =>
      prev.map((b) => (b.id === accountId ? { ...b, balanceETB: newBalance } : b))
    )
  }

  const addTransaction = (tx: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `TXN-2026-109${transactions.length + 3}`,
    }
    setTransactions([newTx, ...transactions])
  }

  // ==========================================
  // MEMBER-FUNDED EXPENSES WORKFLOW & ACCOUNTING
  // ==========================================
  const addMemberExpense = (
    expenseData: Omit<
      MemberFundedExpense,
      'id' | 'expenseNumber' | 'createdAt' | 'amountReimbursedETB' | 'remainingOwedETB' | 'reimbursementStatus'
    >
  ): MemberFundedExpense => {
    const nextSeq = memberExpenses.length + 1
    const newExpense: MemberFundedExpense = {
      ...expenseData,
      id: `MEX-2026-${String(nextSeq).padStart(3, '0')}`,
      expenseNumber: `MFX-${String(nextSeq).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      amountReimbursedETB: 0,
      remainingOwedETB: expenseData.amountETB,
      reimbursementStatus: 'Unreimbursed',
    }

    setMemberExpenses((prev) => [newExpense, ...prev])

    // If approved upon submission, recognize liability immediately
    if (newExpense.approvalStatus === 'Approved') {
      // 1. Credit Member Liability (increase company liability to member)
      setMembers((prev) =>
        prev.map((m) =>
          m.id === newExpense.memberId
            ? {
                ...m,
                totalFundedETB: m.totalFundedETB + newExpense.amountETB,
                outstandingBalanceETB: m.outstandingBalanceETB + newExpense.amountETB,
              }
            : m
        )
      )

      // 2. Add to Accounts Payable as Member Liability
      const newPayable: PayableRecord = {
        id: `PAY-MEM-${newExpense.id}`,
        supplierName: `${newExpense.memberName} (Member Liability)`,
        billNo: `MFX-LIAB-${newExpense.expenseNumber}`,
        billDate: newExpense.date,
        dueDate: newExpense.date,
        totalAmountETB: newExpense.amountETB,
        amountPaidETB: 0,
        balanceDueETB: newExpense.amountETB,
        category: `Member-Funded ${newExpense.category}`,
        status: 'Approved for Payment',
        businessActivity: newExpense.businessActivity,
        isMemberLiability: true,
        memberId: newExpense.memberId,
      }
      setPayables((prev) => [newPayable, ...prev])

      // 3. IMPORTANT ACCOUNTING RULE:
      // DO NOT deduct from company bank accounts! The member paid personally.
    }

    return newExpense
  }

  const approveMemberExpense = (expenseId: string, approverName: string) => {
    const expense = memberExpenses.find((e) => e.id === expenseId)
    if (!expense || expense.approvalStatus === 'Approved') return

    // Update expense record
    setMemberExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId
          ? {
              ...e,
              approvalStatus: 'Approved',
              approvedBy: approverName,
              approvedAt: new Date().toISOString(),
            }
          : e
      )
    )

    // Update Member Liability
    setMembers((prev) =>
      prev.map((m) =>
        m.id === expense.memberId
          ? {
              ...m,
              totalFundedETB: m.totalFundedETB + expense.amountETB,
              outstandingBalanceETB: m.outstandingBalanceETB + (expense.remainingOwedETB || expense.amountETB),
            }
          : m
      )
    )

    // Add Payable Record for Member
    const newPayable: PayableRecord = {
      id: `PAY-MEM-${expense.id}`,
      supplierName: `${expense.memberName} (Member Liability)`,
      billNo: `MFX-LIAB-${expense.expenseNumber}`,
      billDate: expense.date,
      dueDate: expense.date,
      totalAmountETB: expense.amountETB,
      amountPaidETB: expense.amountReimbursedETB || 0,
      balanceDueETB: expense.remainingOwedETB || expense.amountETB,
      category: `Member-Funded ${expense.category}`,
      status: 'Approved for Payment',
      businessActivity: expense.businessActivity,
      isMemberLiability: true,
      memberId: expense.memberId,
    }
    setPayables((prev) => [newPayable, ...prev])
  }

  const rejectMemberExpense = (expenseId: string, reason?: string) => {
    setMemberExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId
          ? {
              ...e,
              approvalStatus: 'Rejected',
              notes: reason ? `${e.notes || ''} [Rejected: ${reason}]` : e.notes,
            }
          : e
      )
    )
  }

  const reimburseMemberExpense = (params: ReimburseParams): { success: boolean; message: string } => {
    const expense = memberExpenses.find((e) => e.id === params.expenseId)
    if (!expense) {
      return { success: false, message: 'Expense record not found.' }
    }
    if (expense.approvalStatus !== 'Approved') {
      return { success: false, message: 'Cannot reimburse an unapproved expense.' }
    }
    if (params.amountETB <= 0) {
      return { success: false, message: 'Reimbursement amount must be greater than zero.' }
    }
    if (params.amountETB > expense.remainingOwedETB + 0.01) {
      return {
        success: false,
        message: `Amount exceeds remaining liability of ETB ${expense.remainingOwedETB.toLocaleString()}.`,
      }
    }

    const bankAccount = bankAccounts.find((b) => b.id === params.bankAccountId)
    if (!bankAccount) {
      return { success: false, message: 'Selected company bank account not found.' }
    }
    if (bankAccount.balanceETB < params.amountETB) {
      return {
        success: false,
        message: `Insufficient funds in ${bankAccount.bankName}. Current balance: ETB ${bankAccount.balanceETB.toLocaleString()}.`,
      }
    }

    // 1. DEDUCT from Company Bank Account (Real cash outflow)
    const updatedBankBalance = bankAccount.balanceETB - params.amountETB
    setBankAccounts((prev) =>
      prev.map((b) =>
        b.id === params.bankAccountId
          ? { ...b, balanceETB: updatedBankBalance }
          : b
      )
    )

    // 2. UPDATE Member Expense Status & Remaining Owed
    const newReimbursed = expense.amountReimbursedETB + params.amountETB
    const newRemaining = Math.max(0, expense.amountETB - newReimbursed)
    const newStatus: MemberFundedExpense['reimbursementStatus'] =
      newRemaining <= 0.01 ? 'Fully Reimbursed' : 'Partially Reimbursed'

    setMemberExpenses((prev) =>
      prev.map((e) =>
        e.id === params.expenseId
          ? {
              ...e,
              amountReimbursedETB: newReimbursed,
              remainingOwedETB: newRemaining,
              reimbursementStatus: newStatus,
            }
          : e
      )
    )

    // 3. DEBIT Member Payable Account (reduces company liability to member)
    setMembers((prev) =>
      prev.map((m) =>
        m.id === expense.memberId
          ? {
              ...m,
              totalReimbursedETB: m.totalReimbursedETB + params.amountETB,
              outstandingBalanceETB: Math.max(0, m.outstandingBalanceETB - params.amountETB),
            }
          : m
      )
    )

    // 4. UPDATE Accounts Payable record
    setPayables((prev) =>
      prev.map((p) => {
        if (p.isMemberLiability && p.memberId === expense.memberId && p.id.includes(expense.id)) {
          const newPaid = p.amountPaidETB + params.amountETB
          const newBal = Math.max(0, p.totalAmountETB - newPaid)
          return {
            ...p,
            amountPaidETB: newPaid,
            balanceDueETB: newBal,
            status: newBal <= 0.01 ? 'Paid' : 'Approved for Payment',
          }
        }
        return p
      })
    )

    // 5. CREATE Bank Ledger Transaction (For bank reconciliation)
    // NOTE: Type is 'Member Reimbursement' — IT DOES NOT RE-ENTER P&L AS AN OPERATING EXPENSE!
    const newTx: FinancialTransaction = {
      id: `TXN-REIMB-${Date.now()}`,
      referenceNumber: params.bankReference,
      date: new Date().toISOString().split('T')[0],
      type: 'Member Reimbursement',
      category: 'Member Liability Settlement',
      fromAccount: `${bankAccount.bankName} (${bankAccount.accountNumber})`,
      toAccount: `${expense.memberName} (Personal Account)`,
      amountETB: params.amountETB,
      businessActivity: expense.businessActivity,
      isReimbursement: true,
      reimbursedMemberExpenseId: expense.id,
      status: 'Cleared',
      notes:
        params.notes ||
        `Reimbursement for ${expense.expenseNumber}: ${expense.description}. Settles member liability.`,
    }
    setTransactions((prev) => [newTx, ...prev])

    // 6. RECORD Reimbursement Audit History
    const newReimbRecord: MemberReimbursementRecord = {
      id: `REIMB-${Date.now()}`,
      reimbursementNumber: `REIMB-2026-${String(reimbursements.length + 1).padStart(2, '0')}`,
      expenseId: expense.id,
      memberId: expense.memberId,
      memberName: expense.memberName,
      date: new Date().toISOString().split('T')[0],
      amountETB: params.amountETB,
      companyBankAccountId: bankAccount.id,
      companyBankName: bankAccount.bankName,
      bankReference: params.bankReference,
      paymentMethod: params.paymentMethod,
      approvedBy: params.approvedBy,
      notes: params.notes,
    }
    setReimbursements((prev) => [newReimbRecord, ...prev])

    return {
      success: true,
      message: `Successfully reimbursed ETB ${params.amountETB.toLocaleString()} to ${expense.memberName} from ${bankAccount.bankName}.`,
    }
  }

  // ==========================================
  // BANK STATEMENT IMPORT & AUTOMATED RECONCILIATION
  // ==========================================
  const importBankStatement = (
    statement: BankStatement
  ): { success: boolean; message: string; duplicate?: boolean } => {
    // Check duplicate statement by number or overlapping account period
    const existing = bankStatements.find(
      (s) =>
        s.statementNumber === statement.statementNumber ||
        (s.bankAccountId === statement.bankAccountId &&
          s.periodStart === statement.periodStart &&
          s.periodEnd === statement.periodEnd)
    )

    if (existing) {
      return {
        success: false,
        message: `Statement ${statement.statementNumber} has already been imported for this period. Duplicate statement upload prevented.`,
        duplicate: true,
      }
    }

    // Run Automated Matching Engine against internal transactions
    const processedTxList = statement.transactions.map((stx) => {
      const stxAmount = (stx.creditETB || 0) + (stx.debitETB || 0)
      const isCredit = Boolean(stx.creditETB && stx.creditETB > 0)

      // Find candidates in internal transactions for this bank account
      const candidates = transactions.filter((tx) => {
        const matchesDirection = isCredit ? tx.type === 'Income' : tx.type !== 'Income'
        const matchesAmount = Math.abs(tx.amountETB - stxAmount) < 0.01
        return matchesAmount && matchesDirection
      })

      if (candidates.length === 1) {
        const candidate = candidates[0]
        const hasRefMatch = Boolean(
          stx.reference && candidate.referenceNumber &&
          (stx.reference.toLowerCase().includes(candidate.referenceNumber.toLowerCase()) ||
            candidate.referenceNumber.toLowerCase().includes(stx.reference.toLowerCase()))
        )
        const dateDiff = Math.abs(
          (new Date(stx.transactionDate).getTime() - new Date(candidate.date).getTime()) / (1000 * 3600 * 24)
        )

        if (hasRefMatch) {
          return {
            ...stx,
            status: 'Matched' as const,
            matchedTransactionId: candidate.id,
            matchConfidence: 98,
            matchReason: `Auto-matched (98% confidence): Exact amount ETB ${stxAmount.toLocaleString()} with reference keyword match (${candidate.referenceNumber}).`,
            isReconciled: true,
          }
        } else if (dateDiff <= 3) {
          return {
            ...stx,
            status: 'Matched' as const,
            matchedTransactionId: candidate.id,
            matchConfidence: 92,
            matchReason: `Auto-matched (92% confidence): Exact amount ETB ${stxAmount.toLocaleString()} within ±3-day tolerance (${Math.round(dateDiff)} days diff, ${candidate.type}).`,
            isReconciled: true,
          }
        } else {
          return {
            ...stx,
            status: 'Needs Review' as const,
            matchedTransactionId: candidate.id,
            matchConfidence: 70,
            matchReason: `Ambiguous date window: Exact amount matches ${candidate.referenceNumber}, but transaction date is ${Math.round(dateDiff)} days apart (> ±3 days). Requires manual review.`,
            isReconciled: false,
          }
        }
      } else if (candidates.length > 1) {
        // Ambiguous match: amount matches multiple transactions — requires human review!
        return {
          ...stx,
          status: 'Needs Review' as const,
          matchConfidence: 65,
          matchReason: `Ambiguous match: Found ${candidates.length} internal ledger entries matching ETB ${stxAmount.toLocaleString()}. Manual confirmation required.`,
          isReconciled: false,
        }
      } else {
        // No matching transaction found
        return {
          ...stx,
          status: 'Unmatched Bank Transaction' as const,
          matchConfidence: 0,
          matchReason: 'Unmatched Bank Transaction: No corresponding internal ledger transaction found.',
          isReconciled: false,
        }
      }
    })

    const matchedCount = processedTxList.filter((t) => t.status === 'Matched').length
    const needsReviewCount = processedTxList.filter((t) => t.status === 'Needs Review').length
    const unmatchedCount = processedTxList.filter(
      (t) => t.status === 'Unmatched Bank Transaction'
    ).length

    const processedStatement: BankStatement = {
      ...statement,
      transactions: processedTxList,
      matchedCount,
      needsReviewCount,
      unmatchedCount,
      status: needsReviewCount > 0 ? 'Needs Review' : matchedCount === processedTxList.length ? 'Fully Reconciled' : 'Partially Reconciled',
    }

    setBankStatements((prev) => [processedStatement, ...prev])

    // Sync with backend API
    api.uploadStatement({
      accountId: statement.bankAccountId,
      statementNumber: statement.statementNumber,
      periodStart: statement.periodStart,
      periodEnd: statement.periodEnd,
      openingBalanceETB: statement.openingBalanceETB,
      closingBalanceETB: statement.closingBalanceETB,
      rawTransactions: statement.transactions.map((t) => ({
        date: t.transactionDate,
        referenceNumber: t.reference,
        description: t.description,
        amountETB: (t.creditETB || 0) + (t.debitETB || 0),
        isCredit: Boolean(t.creditETB && t.creditETB > 0),
      })),
    }).catch((err) => {
      console.warn('[Sync] Statement backend upload notice:', err.message)
    })

    // Update reconciliation summary table
    setReconciliations((prev) => [
      {
        id: `REC-${Date.now()}`,
        bankAccountId: statement.bankAccountId,
        bankName: statement.bankName,
        accountNumber: statement.accountNumber,
        statementDate: statement.periodEnd,
        statementBalanceETB: statement.closingBalanceETB,
        bookBalanceETB: statement.closingBalanceETB,
        differenceETB: 0,
        unreconciledCount: needsReviewCount + unmatchedCount,
        status: needsReviewCount + unmatchedCount === 0 ? 'Balanced' : 'In Progress',
      },
      ...prev,
    ])

    return {
      success: true,
      message: `Successfully imported statement with ${statement.transactions.length} transactions. ${matchedCount} matched automatically, ${needsReviewCount} flagged for review.`,
    }
  }

  const reconcileStatementTransaction = (
    statementId: string,
    txId: string,
    matchedInternalTxId?: string,
    action: 'confirm' | 'reject' | 'exclude' | 'manual_match' = 'confirm'
  ) => {
    setBankStatements((prev) =>
      prev.map((stmt) => {
        if (stmt.id !== statementId) return stmt

        const updatedTxList = stmt.transactions.map((tx) => {
          if (tx.id !== txId) return tx

          if (action === 'confirm' || action === 'manual_match') {
            return {
              ...tx,
              status: 'Matched' as const,
              matchedTransactionId: matchedInternalTxId || tx.matchedTransactionId,
              isReconciled: true,
              reconciledBy: 'Authorized Auditor',
              reconciledAt: new Date().toISOString(),
              matchReason: action === 'manual_match' ? 'Manually matched and verified by auditor.' : tx.matchReason,
            }
          } else if (action === 'reject') {
            return {
              ...tx,
              status: 'Unmatched Bank Transaction' as const,
              matchedTransactionId: undefined,
              isReconciled: false,
              matchReason: 'Suggested match rejected by reviewer.',
            }
          } else if (action === 'exclude') {
            return {
              ...tx,
              status: 'Excluded' as const,
              isReconciled: false,
              matchReason: 'Transaction excluded from reconciliation by authorized user.',
            }
          }
          return tx
        })

        const matchedCount = updatedTxList.filter((t) => t.status === 'Matched').length
        const needsReviewCount = updatedTxList.filter((t) => t.status === 'Needs Review').length
        const unmatchedCount = updatedTxList.filter(
          (t) => t.status === 'Unmatched Bank Transaction' || t.status === 'Unmatched Internal Transaction'
        ).length

        return {
          ...stmt,
          transactions: updatedTxList,
          matchedCount,
          needsReviewCount,
          unmatchedCount,
          status: needsReviewCount > 0 ? 'Needs Review' : unmatchedCount === 0 ? 'Fully Reconciled' : 'Partially Reconciled',
        }
      })
    )

    if (matchedInternalTxId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === matchedInternalTxId ? { ...t, status: 'Reconciled' } : t))
      )
      if (action === 'manual_match') {
        api.matchExistingReconciliation({
          statementId,
          statementTxId: txId,
          internalTxId: matchedInternalTxId,
        }).catch((err) => console.warn('[Sync] matchExisting error:', err.message))
      }
    }
  }

  const postUnmatchedStatementTransaction = (
    statementId: string,
    txId: string,
    category: string,
    businessActivity: BusinessActivity,
    notes?: string
  ) => {
    const stmt = bankStatements.find((s) => s.id === statementId)
    if (!stmt) return
    const tx = stmt.transactions.find((t) => t.id === txId)
    if (!tx) return

    const isCredit = Boolean(tx.creditETB && tx.creditETB > 0)
    const amount = isCredit ? tx.creditETB! : (tx.debitETB || 0)
    const newTxId = `TXN-REC-${Date.now()}`

    // 1. Post new internal transaction with status Reconciled (no duplicate accounting entry)
    const newTx: FinancialTransaction = {
      id: newTxId,
      referenceNumber: tx.reference || `ADJ-${Date.now().toString().slice(-6)}`,
      date: tx.transactionDate,
      type: isCredit ? 'Income' : 'Expense',
      category,
      fromAccount: `${stmt.bankName} (${stmt.accountNumber.slice(-6)})`,
      toAccount: tx.counterpartyName || 'Bank Operations',
      amountETB: amount,
      businessActivity,
      status: 'Reconciled',
      notes: notes || `Classified and posted from bank statement line: ${tx.description}`,
    }
    setTransactions((prev) => [newTx, ...prev])

    // 2. Mark statement transaction as Matched / Reconciled
    setBankStatements((prev) =>
      prev.map((s) => {
        if (s.id !== statementId) return s
        const updatedTxs = s.transactions.map((t) => {
          if (t.id !== txId) return t
          return {
            ...t,
            status: 'Matched' as const,
            matchedTransactionId: newTxId,
            matchConfidence: 100,
            matchReason: `Classified as "${category}" (${businessActivity}) and posted directly to general ledger.`,
            isReconciled: true,
            reconciledBy: 'Authorized Accountant',
            reconciledAt: new Date().toISOString(),
          }
        })
        const matchedCount = updatedTxs.filter((t) => t.status === 'Matched').length
        const needsReviewCount = updatedTxs.filter((t) => t.status === 'Needs Review').length
        const unmatchedCount = updatedTxs.filter(
          (t) => t.status === 'Unmatched Bank Transaction' || t.status === 'Unmatched Internal Transaction'
        ).length
        return {
          ...s,
          transactions: updatedTxs,
          matchedCount,
          needsReviewCount,
          unmatchedCount,
          status: needsReviewCount > 0 ? 'Needs Review' : unmatchedCount === 0 ? 'Fully Reconciled' : 'Partially Reconciled',
        }
      })
    )

    // 3. Call backend API
    api.postUnmatchedReconciliation({
      statementId,
      statementTxId: txId,
      category,
      businessActivity,
      notes,
    }).catch((err) => console.warn('[Sync] postUnmatched error:', err.message))
  }

  const lockBankStatement = (statementId: string, lockedBy: string) => {
    setBankStatements((prev) =>
      prev.map((stmt) =>
        stmt.id === statementId
          ? {
              ...stmt,
              isLocked: true,
              status: 'Locked',
              lockedBy,
              lockedAt: new Date().toISOString(),
            }
          : stmt
      )
    )
    api.lockStatement(statementId).catch((err) => console.warn('[Sync] lockStatement error:', err.message))
  }

  return (
    <StoreContext.Provider
      value={{
        purchases,
        addPurchase,
        updatePurchase,
        sales,
        addSale,
        updateSale,
        inventory,
        updateStock,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        trucks,
        addTruck,
        updateTruck,
        deleteTruck,
        updateTruckStatus,
        deliveries,
        addDelivery,
        updateDeliveryStatus,
        updateDeliverySharedArrangement,
        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        maintenance,
        addMaintenance,
        updateMaintenance,
        toggleReconcileMaintenance,
        fleetPurchases,
        addFleetPurchase,
        toggleReconcileFleetPurchase,
        updateTruckServiceInterval,
        updateTruckConfig,
        autoReconcileFleetExpenses,
        manualReconcileTransaction,
        fuelExpenses,
        addFuelExpense,
        // Master Products & Depots (Enterprise Configuration)
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        depots,
        addDepot,
        updateDepot,
        deleteDepot,
        bankAccounts,
        updateBankAccountBalance,
        transactions,
        addTransaction,
        reconciliations,
        payroll,
        updatePayrollEntry,
        addPayrollEntry,
        deletePayrollEntry,
        disbursePayrollBatch,
        toggleReconcilePayrollPayment,
        receivables,
        payables,
        members,
        memberExpenses,
        reimbursements,
        addMemberExpense,
        approveMemberExpense,
        rejectMemberExpense,
        reimburseMemberExpense,
        bankStatements,
        importBankStatement,
        reconcileStatementTransaction,
        postUnmatchedStatementTransaction,
        lockBankStatement,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within StoreProvider')
  }
  return context
}
