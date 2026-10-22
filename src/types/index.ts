// Domain Types for Zarima Trading & Logistics

export type CementType = 'OPC 42.5N' | 'PPC 32.5R' | 'Bulk Cement' | 'Special Sulfate Resistant'

export type BusinessActivity = 'Cement' | 'Transport' | 'Shared'

export interface CementPurchase {
  id: string
  purchaseOrderNo: string // backward compatible
  purchaseInvoiceNo?: string
  supplierId: string
  supplierName: string
  cementType: CementType
  quantityQuintals: number
  unitPriceETB: number
  totalAmountETB: number
  factoryOrigin: string
  warehouseLocation?: string
  receivingWarehouseId?: string
  deliveryStatus: 'Pending' | 'In Transit' | 'Received'
  paymentStatus: 'Paid' | 'Partial' | 'Credit'
  orderDate: string
  receivedDate?: string
  assignedTruck?: string
  businessActivity?: 'Cement'
  notes?: string
}

export interface CementSale {
  id: string
  invoiceNo: string
  customerId: string
  customerName: string
  customerType?: 'Usual' | 'New'
  cementType: CementType
  quantityQuintals: number
  unitPriceETB: number
  deliveryFeeETB?: number // Specific delivery / freight fee charged to customer
  hasCompanyDelivery?: boolean // True if delivered using Zarima fleet
  totalAmountETB: number // (quantityQuintals * unitPriceETB) + (deliveryFeeETB || 0)
  paymentType: 'Cash' | 'Bank Transfer' | 'Credit 30 Days' | 'Credit 60 Days'
  paymentStatus: 'Paid' | 'Outstanding' | 'Partial'
  deliveryStatus: 'Dispatched' | 'Delivered' | 'Pending'
  destinationCity: string
  warehouseLocation?: string
  saleDate: string
  dueDate?: string
  assignedTruck?: string
  driverName?: string
  businessActivity?: 'Cement' | 'Transport'
  invoiceType?: 'Cement Sale' | 'Cement Sale & Delivery' | 'Freight Service'
  cargoDescription?: string // Used when issuing standalone freight service invoices for external cargo
}

export interface CementInventoryItem {
  id: string
  warehouseLocation: string
  cementType: CementType
  currentStockQuintals: number
  minThresholdQuintals: number
  unitCostETB: number
  totalValueETB: number
  lastRestockedDate: string
  status: 'Adequate' | 'Low Stock' | 'Critical'
}

export interface Customer {
  id: string
  name: string
  company: string
  tinNumber: string
  phone: string
  city: string
  creditLimitETB: number
  outstandingBalanceETB: number
  paymentTerms: string
  status: 'Active' | 'Review Required' | 'Blocked'
  isUsual?: boolean
  customerCategory?: 'Usual Customer' | 'New Customer' | 'Walk-in Customer'
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  tinNumber: string
  phone: string
  plantLocation: string
  totalPurchasedYTD: number
  outstandingPayableETB: number
  status: 'Active' | 'Preferred' | 'Under Review'
}

// Transport & Fleet Types
export type TruckStatus = 'Active Trip' | 'Available' | 'In Maintenance' | 'Idle'

export interface Truck {
  id: string
  plateNumber: string
  modelYear: number
  makeModel: string
  capacityQuintals: number
  driverId: string
  driverName: string
  operationalStatus: TruckStatus
  mileageKm: number
  lastServiceDate: string
  lastServiceKm?: number
  serviceIntervalKm?: number
  nextServiceDueKm?: number
  nextServiceDueDate?: string
  ownershipType?: 'Zarima Owned' | 'Subcontracted / Partner'
  fuelCapacityLiters?: number
  warningLeadKm?: number // e.g. 1500 km notification lead
  engineOilGrade?: string // e.g. '15W-40 CI-4 Heavy Duty'
  preferredWorkshop?: string // e.g. 'TotalEnergies Truck Center Akaki'
}

export type DeliveryOperationalStatus = 'Pending' | 'Assigned' | 'In Transit' | 'Delivered' | 'Cancelled'
export type DeliveryStatus = DeliveryOperationalStatus

export type CargoCategory =
  | 'Zarima Cement'
  | 'Third-Party Cement'
  | 'Steel & Rebar'
  | 'Sand & Aggregates'
  | 'Raw Materials'
  | 'General Freight'

export interface Delivery {
  id: string
  deliveryNoteNo: string
  waybillNo: string
  truckId: string
  plateNumber: string
  driverName: string
  origin: string
  destination: string
  cargoType: CementType | string
  cargoCategory?: CargoCategory
  cargoDescription?: string
  isThirdPartyCargo?: boolean // True if cargo or cement was NOT bought from Zarima!
  shipperClientName?: string // Client or contractor contracting the transport haul
  cargoQuintals: number
  departureTime: string
  estimatedArrival: string
  deliveryStatus: DeliveryOperationalStatus
  freightChargeETB: number
  
  // Trip Direct Operating Costs & Margin Breakdown
  fuelExpenseETB?: number
  driverPerDiemETB?: number
  tollLoadingETB?: number
  totalTripCostETB?: number
  netTripMarginETB?: number

  businessActivity?: 'Transport'
  
  // Shared truckload and partner company arrangements
  isSharedTruckload?: boolean
  partnerCompanyName?: string
  partnerCarrierName?: string
  partnerCargoQuintals?: number
  partnerRevenueShareETB?: number
  totalFreightRevenueETB?: number
  zarimaShareETB?: number
  zarimaSharePercentage?: number
  partnerShareETB?: number
  partnerSharePercentage?: number
  partnerPayerParty?: 'Zarima' | 'Partner' | 'Third Party Customer'
  partnerPaymentStatus?: 'Pending' | 'Partially Paid' | 'Settled'
  partnerAmountReceivedETB?: number
  partnerBalanceDueETB?: number
  sharedArrangementNotes?: string
}

export interface Driver {
  id: string
  fullName: string
  licenseNumber: string
  licenseGrade: string
  phone: string
  assignedTruckPlate: string
  emergencyContact: string
  status: 'On Duty' | 'Off Duty' | 'On Leave'
  tripCount: number
}

export interface MaintenanceRecord {
  id: string
  truckPlate: string
  serviceType: string
  date: string
  workshopName: string
  costETB: number
  status: 'Completed' | 'In Progress' | 'Scheduled'
  lastServiceKm?: number
  serviceIntervalKm?: number
  nextServiceDueKm: number
  nextServiceDueDate?: string
  partsReplaced?: string
  notes?: string
  businessActivity?: 'Transport'
  
  // General Ledger Debit/Credit & Bank Reconciliation
  paymentMethod?: 'Bank Transfer' | 'Cheque' | 'Cash' | 'Member Outlay'
  paidFromAccountId?: string
  paidFromAccountName?: string
  disbursementRef?: string
  isReconciled?: boolean
  reconciliationStatus?: 'Reconciled' | 'Pending Statement Match'
  reconciledDate?: string
  reconciledStatementRef?: string
  journalEntryId?: string
}

export interface FleetPurchase {
  id: string
  purchaseInvoiceNo: string
  date: string
  itemDescription: string
  category: 'Tires' | 'Spare Parts' | 'Batteries' | 'Lubricants & Oils' | 'Accessories & Safety'
  truckPlate: string
  quantity: number
  unitPriceETB: number
  totalCostETB: number
  supplierName: string
  paymentStatus: 'Paid' | 'Outstanding' | 'Partial'
  receiptNo?: string
  notes?: string
  businessActivity?: 'Transport'
  
  // General Ledger Debit/Credit & Bank Reconciliation
  paymentMethod?: 'Bank Transfer' | 'Cheque' | 'Cash' | 'Member Outlay'
  paidFromAccountId?: string
  paidFromAccountName?: string
  disbursementRef?: string
  isReconciled?: boolean
  reconciliationStatus?: 'Reconciled' | 'Pending Statement Match'
  reconciledDate?: string
  reconciledStatementRef?: string
  journalEntryId?: string
}

export interface FuelExpense {
  id: string
  truckPlate: string
  driverName: string
  date: string
  fuelLiters: number
  pricePerLiterETB: number
  totalCostETB: number
  stationName: string
  currentOdometerKm: number
  receiptNo: string
  businessActivity?: 'Transport'
  isMemberFunded?: boolean
  memberExpenseId?: string
}

// Finance & Accounting Types
export interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  branchName: string
  accountType: 'Current Account' | 'Savings' | 'Letter of Credit (LC) Escrow'
  balanceETB: number
  lastReconciledDate: string
  status: 'Active' | 'Pending Review'
}

export type TransactionType = 'Income' | 'Expense' | 'Transfer' | 'Member Reimbursement' | 'Capital Contribution' | 'Partner Funded'

export interface SharedExpenseAllocation {
  cementPercentage: number
  transportPercentage: number
  allocatedCementETB: number
  allocatedTransportETB: number
}

export interface FinancialTransaction {
  id: string
  referenceNumber: string
  date: string
  type: TransactionType
  category: string
  fromAccount?: string
  toAccount?: string
  amountETB: number
  businessActivity?: BusinessActivity
  sharedAllocation?: SharedExpenseAllocation
  isMemberFunded?: boolean
  paidByMember?: string | boolean
  memberId?: string
  memberName?: string
  isReimbursement?: boolean
  reimbursedMemberExpenseId?: string
  status: 'Cleared' | 'Pending Reconciliation' | 'Reconciled'
  reconciliationMethod?: 'Auto-Matched' | 'Manual'
  reconciledStatementRef?: string
  reconciledDate?: string
  reconciledBy?: string
  truckPlate?: string
  notes?: string
}

export interface FinancialReportSummary {
  period: string
  cementSalesRevenueETB: number
  transportFreightRevenueETB: number
  totalRevenueETB: number
  cementPurchaseCostETB: number
  fuelExpensesETB: number
  maintenanceCostsETB: number
  payrollCostsETB: number
  partnerFundedExpensesETB?: number
  memberFundedExpensesETB?: number
  totalExpensesETB: number
  netProfitETB: number
  ebitdaMargin: number
}

// Member-Funded Expenses Models
export interface CompanyMember {
  id: string
  name: string
  role: string
  phone: string
  email: string
  totalFundedETB: number
  totalReimbursedETB: number
  outstandingBalanceETB: number
}

export type MemberExpenseApprovalStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected'
export type MemberExpenseReimbursementStatus = 'Unreimbursed' | 'Partially Reimbursed' | 'Fully Reimbursed'

export interface MemberFundedExpense {
  id: string
  expenseNumber: string
  memberId: string
  memberName: string
  date: string
  amountETB: number
  currency: 'ETB'
  category: string // 'Fuel', 'Truck Maintenance', 'Toll Fees', 'Spare Parts', 'Depot Rent', 'Office Supplies', 'General Overhead'
  businessActivity: BusinessActivity
  description: string
  businessPurpose: string
  supplierOrPayee?: string
  relatedEntityId?: string
  relatedEntityType?: 'Truck' | 'Delivery' | 'Purchase' | 'Shared Overhead'
  paymentMethod: 'Personal Bank Transfer' | 'Cash' | 'Telebirr' | 'Personal Card'
  receiptAttachmentName?: string
  approvalStatus: MemberExpenseApprovalStatus
  approvedBy?: string
  approvedAt?: string
  reimbursementStatus: MemberExpenseReimbursementStatus
  amountReimbursedETB: number
  remainingOwedETB: number
  createdBy: string
  createdAt: string
  notes?: string
  sharedAllocation?: SharedExpenseAllocation
}

export interface MemberReimbursementRecord {
  id: string
  reimbursementNumber: string
  expenseId: string
  memberId: string
  memberName: string
  date: string
  amountETB: number
  companyBankAccountId: string
  companyBankName: string
  bankReference: string
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Cash'
  approvedBy: string
  notes?: string
}

// Bank Reconciliation Models
export type ReconciliationMatchStatus =
  | 'Matched'
  | 'Needs Review'
  | 'Unmatched Bank Transaction'
  | 'Unmatched Internal Transaction'
  | 'Duplicate'
  | 'Excluded'

export interface BankStatementTransaction {
  id: string
  statementId: string
  transactionDate: string
  valueDate?: string
  description: string
  reference: string
  debitETB?: number
  creditETB?: number
  runningBalanceETB?: number
  counterpartyName?: string
  counterpartyAccount?: string
  fingerprint: string
  status: ReconciliationMatchStatus
  matchedTransactionId?: string
  matchConfidence?: number // 0-100%
  matchReason?: string
  isReconciled: boolean
  reconciledBy?: string
  reconciledAt?: string
}

export interface BankStatement {
  id: string
  statementNumber: string
  bankAccountId: string
  bankName: string
  accountNumber: string
  periodStart: string
  periodEnd: string
  fileName: string
  fileFormat: 'xlsx' | 'xls' | 'pdf' | 'docx' | 'doc'
  uploadDate: string
  uploadedBy: string
  openingBalanceETB: number
  closingBalanceETB: number
  totalDebitsETB: number
  totalCreditsETB: number
  transactionCount: number
  matchedCount: number
  needsReviewCount: number
  unmatchedCount: number
  status: 'Draft' | 'Needs Review' | 'Partially Reconciled' | 'Fully Reconciled' | 'Locked'
  isLocked: boolean
  lockedBy?: string
  lockedAt?: string
  transactions: BankStatementTransaction[]
}

export interface BankReconciliation {
  id: string
  bankAccountId: string
  bankName: string
  accountNumber: string
  statementDate: string
  statementBalanceETB: number
  bookBalanceETB: number
  differenceETB: number
  unreconciledCount: number
  status: 'Balanced' | 'Discrepancy' | 'In Progress'
}

export interface PayrollEntry {
  id: string
  month: string
  employeeName: string
  employeeId?: string
  role: string
  department?: string
  phone?: string
  bankName?: string
  bankAccountNumber?: string
  baseSalaryETB?: number
  basicSalaryETB: number
  bonusETB?: number
  totalPaidETB?: number
  perDiemETB?: number
  allowancesETB?: number
  overtimeETB?: number
  grossSalaryETB?: number
  incomeTaxETB?: number
  employeePensionETB?: number
  employerPensionETB?: number
  otherDeductionsETB?: number
  deductionsETB: number
  netPayETB: number
  paymentStatus: 'Paid' | 'Processing' | 'Approved'
  businessActivity: BusinessActivity
  paymentDate?: string
  disbursementRef?: string
  notes?: string
  isReconciled?: boolean
  reconciliationStatus?: 'Reconciled' | 'Pending Statement Match' | 'Unreconciled'
  reconciledDate?: string
  reconciledStatementRef?: string
}

export interface ReceivableRecord {
  id: string
  customerName: string
  invoiceNo: string
  invoiceDate: string
  dueDate: string
  totalAmountETB: number
  amountPaidETB: number
  balanceDueETB: number
  agingBucket: '0-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days'
  status: 'Current' | 'Overdue' | 'Critical'
  businessActivity: BusinessActivity
  isPartnerCompany?: boolean
}

export interface PayableRecord {
  id: string
  supplierName: string
  billNo: string
  billDate: string
  dueDate: string
  totalAmountETB: number
  amountPaidETB: number
  balanceDueETB: number
  category: string
  status: 'Pending' | 'Approved for Payment' | 'Paid'
  businessActivity: BusinessActivity
  isMemberLiability?: boolean
  memberId?: string
}

export interface ActivityProfitAndLoss {
  activity: BusinessActivity | 'Combined'
  revenue: number
  costOfGoodsSold: number
  grossProfit: number
  grossMarginPercentage: number
  operatingExpenses: {
    category: string
    amount: number
  }[]
  totalOperatingExpenses: number
  allocatedSharedOverhead: number
  netProfit: number
  netMarginPercentage: number
}

export interface TruckProfitabilityRecord {
  truckId: string
  plateNumber: string
  driverName: string
  totalTrips: number
  totalFreightRevenueETB: number
  fuelCostETB: number
  maintenanceCostETB: number
  driverAllowanceETB: number
  allocatedSharedCostETB: number
  totalDirectCostsETB: number
  netOperatingProfitETB: number
  operatingMarginPercentage: number
}

// Enterprise Master Data & Configuration Types
export interface MasterProduct {
  id: string
  code: string
  name: string
  category: 'Cement' | 'Steel & Rebar' | 'Aggregates' | 'Specialty & Chemicals' | 'General Cargo'
  packaging: '50kg Bag' | 'Bulk Tanker / Bulker' | 'Metric Ton Bundle' | 'Loose Dump'
  factoryBrand: string
  unitPriceETB: number
  purchasePriceETB: number
  unitOfMeasure: 'Quintal (100kg)' | 'Metric Ton (1,000kg)' | '50kg Bag' | 'Cubic Meter' | 'Piece'
  description?: string
  status: 'Active' | 'Inactive'
}

export interface MasterDepot {
  id: string
  code: string
  name: string
  city: string
  address: string
  capacityQuintals: number
  managerName: string
  phone: string
  status: 'Active' | 'Maintenance' | 'Full'
  type: 'Central Storage' | 'Transit Depot' | 'Distribution Yard'
}
