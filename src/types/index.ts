// Domain Types for Zarima Trading & Logistics

export type CementType = 'OPC 42.5N' | 'PPC 32.5R' | 'Bulk Cement' | 'Special Sulfate Resistant'

export interface CementPurchase {
  id: string
  purchaseOrderNo: string
  supplierId: string
  supplierName: string
  cementType: CementType
  quantityQuintals: number
  unitPriceETB: number
  totalAmountETB: number
  factoryOrigin: string
  deliveryStatus: 'Pending' | 'In Transit' | 'Received'
  paymentStatus: 'Paid' | 'Partial' | 'Credit'
  orderDate: string
  assignedTruck?: string
}

export interface CementSale {
  id: string
  invoiceNo: string
  customerId: string
  customerName: string
  cementType: CementType
  quantityQuintals: number
  unitPriceETB: number
  totalAmountETB: number
  paymentType: 'Cash' | 'Bank Transfer' | 'Credit 30 Days' | 'Credit 60 Days'
  paymentStatus: 'Paid' | 'Outstanding' | 'Partial'
  deliveryStatus: 'Dispatched' | 'Delivered' | 'Pending'
  destinationCity: string
  saleDate: string
  dueDate?: string
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
  gpsStatus: 'Online' | 'Offline' | 'Standby'
}

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
  cargoQuintals: number
  departureTime: string
  estimatedArrival: string
  deliveryStatus: 'In Transit' | 'Delivered' | 'Scheduled' | 'Delayed'
  freightChargeETB: number
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
  nextServiceDueKm: number
  notes?: string
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
}

export interface GPSTrackingPoint {
  id: string
  plateNumber: string
  driverName: string
  latitude: number
  longitude: number
  speedKmH: number
  heading: string
  currentTown: string
  destinationTown: string
  route: string
  lastPingTime: string
  status: 'Moving' | 'Stopped' | 'Engine Off'
  cargo: string
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

export type TransactionType = 'Income' | 'Expense' | 'Transfer' | 'Partner Funded'

export interface FinancialTransaction {
  id: string
  referenceNumber: string
  date: string
  type: TransactionType
  category: string
  fromAccount?: string
  toAccount?: string
  amountETB: number
  paidByMember?: string
  status: 'Cleared' | 'Pending Reconciliation' | 'Reconciled'
  notes?: string
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
  role: string
  basicSalaryETB: number
  perDiemETB: number
  deductionsETB: number
  netPayETB: number
  paymentStatus: 'Paid' | 'Processing' | 'Approved'
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
  partnerFundedExpensesETB: number
  totalExpensesETB: number
  netProfitETB: number
  ebitdaMargin: number
}
