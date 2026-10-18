import { createContext, useContext, useState, ReactNode } from 'react'
import {
  CementPurchase,
  CementSale,
  CementInventoryItem,
  Customer,
  Supplier,
  Truck,
  Delivery,
  Driver,
  MaintenanceRecord,
  FuelExpense,
  GPSTrackingPoint,
  BankAccount,
  FinancialTransaction,
  BankReconciliation,
  PayrollEntry,
  ReceivableRecord,
  PayableRecord,
} from '@/types'
import {
  mockPurchases,
  mockSales,
  mockInventory,
  mockCustomers,
  mockSuppliers,
} from './mock/cementData'
import {
  mockTrucks,
  mockDeliveries,
  mockDrivers,
  mockMaintenance,
  mockFuelExpenses,
  mockGPSLocations,
} from './mock/fleetData'
import {
  mockBankAccounts,
  mockTransactions,
  mockReconciliations,
  mockPayroll,
  mockReceivables,
  mockPayables,
} from './mock/financeData'

interface StoreContextType {
  purchases: CementPurchase[]
  addPurchase: (purchase: Omit<CementPurchase, 'id'>) => void
  sales: CementSale[]
  addSale: (sale: Omit<CementSale, 'id'>) => void
  inventory: CementInventoryItem[]
  updateStock: (id: string, newStock: number) => void
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id'>) => void
  suppliers: Supplier[]
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void
  trucks: Truck[]
  addTruck: (truck: Omit<Truck, 'id'>) => void
  updateTruckStatus: (id: string, status: Truck['operationalStatus']) => void
  deliveries: Delivery[]
  addDelivery: (delivery: Omit<Delivery, 'id'>) => void
  drivers: Driver[]
  maintenance: MaintenanceRecord[]
  addMaintenance: (record: Omit<MaintenanceRecord, 'id'>) => void
  fuelExpenses: FuelExpense[]
  addFuelExpense: (expense: Omit<FuelExpense, 'id'>) => void
  gpsLocations: GPSTrackingPoint[]
  bankAccounts: BankAccount[]
  transactions: FinancialTransaction[]
  addTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void
  reconciliations: BankReconciliation[]
  payroll: PayrollEntry[]
  receivables: ReceivableRecord[]
  payables: PayableRecord[]
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
  const [drivers] = useState<Driver[]>(mockDrivers)
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(mockMaintenance)
  const [fuelExpenses, setFuelExpenses] = useState<FuelExpense[]>(mockFuelExpenses)
  const [gpsLocations] = useState<GPSTrackingPoint[]>(mockGPSLocations)

  const [bankAccounts] = useState<BankAccount[]>(mockBankAccounts)
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(mockTransactions)
  const [reconciliations] = useState<BankReconciliation[]>(mockReconciliations)
  const [payroll] = useState<PayrollEntry[]>(mockPayroll)
  const [receivables] = useState<ReceivableRecord[]>(mockReceivables)
  const [payables] = useState<PayableRecord[]>(mockPayables)

  const addPurchase = (item: Omit<CementPurchase, 'id'>) => {
    const newItem: CementPurchase = {
      ...item,
      id: `PO-2026-0${purchases.length + 94}`,
    }
    setPurchases([newItem, ...purchases])
  }

  const addSale = (item: Omit<CementSale, 'id'>) => {
    const newItem: CementSale = {
      ...item,
      id: `INV-2026-40${sales.length + 6}`,
    }
    setSales([newItem, ...sales])
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

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...supplier,
      id: `SUP-00${suppliers.length + 1}`,
    }
    setSuppliers([...suppliers, newSup])
  }

  const addTruck = (truck: Omit<Truck, 'id'>) => {
    const newTruck: Truck = {
      ...truck,
      id: `TRK-0${trucks.length + 1}`,
    }
    setTrucks([...trucks, newTruck])
  }

  const updateTruckStatus = (id: string, status: Truck['operationalStatus']) => {
    setTrucks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, operationalStatus: status } : t))
    )
  }

  const addDelivery = (delivery: Omit<Delivery, 'id'>) => {
    const newDel: Delivery = {
      ...delivery,
      id: `DEL-2026-88${deliveries.length + 5}`,
    }
    setDeliveries([newDel, ...deliveries])
  }

  const addMaintenance = (record: Omit<MaintenanceRecord, 'id'>) => {
    const newRec: MaintenanceRecord = {
      ...record,
      id: `MNT-2026-04${maintenance.length + 2}`,
    }
    setMaintenance([newRec, ...maintenance])
  }

  const addFuelExpense = (expense: Omit<FuelExpense, 'id'>) => {
    const newFuel: FuelExpense = {
      ...expense,
      id: `FL-2026-51${fuelExpenses.length + 3}`,
    }
    setFuelExpenses([newFuel, ...fuelExpenses])
  }

  const addTransaction = (tx: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `TXN-2026-109${transactions.length + 3}`,
    }
    setTransactions([newTx, ...transactions])
  }

  return (
    <StoreContext.Provider
      value={{
        purchases,
        addPurchase,
        sales,
        addSale,
        inventory,
        updateStock,
        customers,
        addCustomer,
        suppliers,
        addSupplier,
        trucks,
        addTruck,
        updateTruckStatus,
        deliveries,
        addDelivery,
        drivers,
        maintenance,
        addMaintenance,
        fuelExpenses,
        addFuelExpense,
        gpsLocations,
        bankAccounts,
        transactions,
        addTransaction,
        reconciliations,
        payroll,
        receivables,
        payables,
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
