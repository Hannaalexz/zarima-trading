import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  SlidersHorizontal,
  Truck,
  Users,
  Building2,
  Boxes,
  Warehouse,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  TrendingUp,
  Tag,
  Factory,
  Check,
  X,
  Package,
  Layers,
  Fuel,
  Wrench,
  UserCheck,
  FileText,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatQuantity } from '@/lib/formatters'
import {
  Truck as TruckType,
  TruckStatus,
  Customer,
  Supplier,
  MasterProduct,
  MasterDepot,
  BusinessActivity,
  Driver,
  PayrollEntry,
} from '@/types'

type ConfigTab = 'trucks' | 'staff' | 'partners' | 'products' | 'depots'

export const ConfigurationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as ConfigTab) || 'trucks'
  const [activeTab, setActiveTab] = useState<ConfigTab>(initialTab)

  const {
    trucks,
    addTruck,
    updateTruck,
    deleteTruck,
    drivers,
    addDriver,
    updateDriver,
    deleteDriver,
    payroll,
    addPayrollEntry,
    updatePayrollEntry,
    deletePayrollEntry,
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    depots,
    addDepot,
    updateDepot,
    deleteDepot,
    inventory,
  } = useStore()

  const { toast } = useToast()

  // Update query param when tab changes
  const handleTabChange = (tab: ConfigTab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  // =========================================================================
  // MODAL STATES
  // =========================================================================
  const [isTruckModalOpen, setIsTruckModalOpen] = useState(false)
  const [editingTruckId, setEditingTruckId] = useState<string | null>(null)

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null)

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null)

  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  const [isDepotModalOpen, setIsDepotModalOpen] = useState(false)
  const [editingDepotId, setEditingDepotId] = useState<string | null>(null)

  // Sub-toggle for partners tab
  const [partnerSubTab, setPartnerSubTab] = useState<'customers' | 'suppliers'>('customers')

  // Search terms for tabs
  const [truckSearch, setTruckSearch] = useState('')
  const [truckStatusFilter, setTruckStatusFilter] = useState<string>('ALL')

  const [staffSearch, setStaffSearch] = useState('')
  const [staffDeptFilter, setStaffDeptFilter] = useState<string>('ALL')

  const [partnerSearch, setPartnerSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL')
  const [depotSearch, setDepotSearch] = useState('')

  // =========================================================================
  // FORM STATES: TRUCKS
  // =========================================================================
  const [truckPlate, setTruckPlate] = useState('')
  const [truckModel, setTruckModel] = useState('Sinotruk HOWO 371 6x4')
  const [truckYear, setTruckYear] = useState<number>(2023)
  const [truckCapacity, setTruckCapacity] = useState<number>(750)
  const [truckDriverName, setTruckDriverName] = useState(drivers[0]?.fullName || 'Unassigned')
  const [truckMileage, setTruckMileage] = useState<number>(45000)
  const [truckOwnership, setTruckOwnership] = useState<'Zarima Owned' | 'Subcontracted / Partner'>('Zarima Owned')
  const [truckFuelCapacity, setTruckFuelCapacity] = useState<number>(400)
  const [truckStatus, setTruckStatus] = useState<TruckStatus>('Available')

  // =========================================================================
  // FORM STATES: STAFF & DRIVERS
  // =========================================================================
  const [staffName, setStaffName] = useState('')
  const [staffRole, setStaffRole] = useState('Heavy Commercial Driver')
  const [staffDept, setStaffDept] = useState<BusinessActivity>('Transport')
  const [staffBaseSalary, setStaffBaseSalary] = useState<number>(32000)
  const [staffBonus, setStaffBonus] = useState<number>(0)
  const [staffBankName, setStaffBankName] = useState('Commercial Bank of Ethiopia (CBE)')
  const [staffAccountNo, setStaffAccountNo] = useState('')
  const [staffPhone, setStaffPhone] = useState('')
  const [driverLicenseGrade, setDriverLicenseGrade] = useState('Grade 5 Commercial Heavy')
  const [driverLicenseNo, setDriverLicenseNo] = useState('')

  // =========================================================================
  // FORM STATES: CUSTOMERS
  // =========================================================================
  const [custName, setCustName] = useState('')
  const [custCompany, setCustCompany] = useState('')
  const [custTIN, setCustTIN] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [custCity, setCustCity] = useState('Addis Ababa')
  const [custCreditLimit, setCustCreditLimit] = useState<number>(3000000)
  const [custPaymentTerms, setCustPaymentTerms] = useState('Immediate Cash / Bank Transfer')
  const [custCategory, setCustCategory] = useState<'Usual Customer' | 'New Customer' | 'Walk-in Customer'>('Usual Customer')

  // =========================================================================
  // FORM STATES: SUPPLIERS
  // =========================================================================
  const [supName, setSupName] = useState('')
  const [supContact, setSupContact] = useState('')
  const [supPlantLocation, setSupPlantLocation] = useState('')
  const [supTIN, setSupTIN] = useState('')
  const [supPhone, setSupPhone] = useState('')
  const [supStatus, setSupStatus] = useState<'Active' | 'Preferred' | 'Under Review'>('Active')

  // =========================================================================
  // FORM STATES: CEMENT TYPES & CARGO PRODUCTS
  // =========================================================================
  const [prodCode, setProdCode] = useState('')
  const [prodName, setProdName] = useState('')
  const [prodCategory, setProdCategory] = useState<MasterProduct['category']>('Cement')
  const [prodPackaging, setProdPackaging] = useState<MasterProduct['packaging']>('50kg Bag')
  const [prodBrand, setProdBrand] = useState('Dangote / Mugher')
  const [prodSellingPrice, setProdSellingPrice] = useState<number>(1420)
  const [prodPurchasePrice, setProdPurchasePrice] = useState<number>(1280)
  const [prodUOM, setProdUOM] = useState<MasterProduct['unitOfMeasure']>('Quintal (100kg)')
  const [prodDesc, setProdDesc] = useState('')

  // =========================================================================
  // FORM STATES: DEPOTS & WAREHOUSES
  // =========================================================================
  const [depotCode, setDepotCode] = useState('')
  const [depotName, setDepotName] = useState('')
  const [depotCity, setDepotCity] = useState('Addis Ababa')
  const [depotAddress, setDepotAddress] = useState('')
  const [depotCapacity, setDepotCapacity] = useState<number>(20000)
  const [depotManager, setDepotManager] = useState('')
  const [depotPhone, setDepotPhone] = useState('')
  const [depotType, setDepotType] = useState<MasterDepot['type']>('Distribution Yard')

  // =========================================================================
  // SUBMIT HANDLERS
  // =========================================================================

  // 1. Submit Truck
  const handleSaveTruck = (e: React.FormEvent) => {
    e.preventDefault()
    if (!truckPlate.trim()) {
      toast({ title: 'Validation Error', description: 'License plate number is required.', type: 'error' })
      return
    }

    const matchedDriver = drivers.find((d) => d.fullName === truckDriverName)

    if (editingTruckId) {
      updateTruck(editingTruckId, {
        plateNumber: truckPlate.trim(),
        makeModel: truckModel,
        modelYear: Number(truckYear),
        capacityQuintals: Number(truckCapacity),
        driverId: matchedDriver?.id || 'DRV-001',
        driverName: truckDriverName,
        mileageKm: Number(truckMileage),
        operationalStatus: truckStatus,
        ownershipType: truckOwnership,
        fuelCapacityLiters: Number(truckFuelCapacity),
      })
      toast({ title: 'Truck Updated', description: `Truck ${truckPlate} updated successfully.`, type: 'success' })
    } else {
      addTruck({
        plateNumber: truckPlate.trim(),
        makeModel: truckModel,
        modelYear: Number(truckYear),
        capacityQuintals: Number(truckCapacity),
        driverId: matchedDriver?.id || 'DRV-001',
        driverName: truckDriverName,
        operationalStatus: truckStatus,
        mileageKm: Number(truckMileage),
        lastServiceDate: new Date().toISOString().split('T')[0],
        ownershipType: truckOwnership,
        fuelCapacityLiters: Number(truckFuelCapacity),
      })
      toast({ title: 'Truck Registered', description: `Truck ${truckPlate} added to fleet master data.`, type: 'success' })
    }

    setIsTruckModalOpen(false)
    setEditingTruckId(null)
  }

  // 2. Submit Staff
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffName.trim()) {
      toast({ title: 'Validation Error', description: 'Employee name is required.', type: 'error' })
      return
    }

    const isDriverRole = staffRole.toLowerCase().includes('driver')

    if (editingStaffId) {
      // Update existing payroll entry
      updatePayrollEntry(editingStaffId, {
        employeeName: staffName.trim(),
        role: staffRole,
        department: staffRole,
        businessActivity: staffDept,
        basicSalaryETB: Number(staffBaseSalary),
        baseSalaryETB: Number(staffBaseSalary),
        bonusETB: Number(staffBonus),
        totalPaidETB: Number(staffBaseSalary) + Number(staffBonus),
        netPayETB: Number(staffBaseSalary) + Number(staffBonus),
        bankName: staffBankName,
        bankAccountNumber: staffAccountNo.trim() || '1000...',
      })
      toast({ title: 'Staff Record Updated', description: `${staffName} profile updated successfully.`, type: 'success' })
    } else {
      // Add new staff record into Payroll
      const newPayId = `PAY-EMP-${Date.now().toString().slice(-4)}`
      addPayrollEntry({
        employeeId: `EMP-${Date.now().toString().slice(-4)}`,
        employeeName: staffName.trim(),
        role: staffRole,
        department: staffRole,
        businessActivity: staffDept,
        basicSalaryETB: Number(staffBaseSalary),
        baseSalaryETB: Number(staffBaseSalary),
        bonusETB: Number(staffBonus),
        allowancesETB: 0,
        deductionsETB: 0,
        netPayETB: Number(staffBaseSalary) + Number(staffBonus),
        totalPaidETB: Number(staffBaseSalary) + Number(staffBonus),
        month: 'October 2026',
        paymentStatus: 'Approved',
        bankName: staffBankName,
        bankAccountNumber: staffAccountNo.trim() || `1000${Math.floor(10000000 + Math.random() * 90000000)}`,
        isReconciled: false,
        reconciliationStatus: 'Pending Statement Match',
      })

      // If Driver, also register in active drivers fleet pool
      if (isDriverRole) {
        addDriver({
          fullName: staffName.trim(),
          licenseNumber: driverLicenseNo.trim() || `ETH-CD-${Math.floor(100000 + Math.random() * 900000)}`,
          licenseGrade: driverLicenseGrade,
          phone: staffPhone.trim() || '+251 91 000 0000',
          assignedTruckPlate: 'Unassigned',
          emergencyContact: '+251 91 111 2222',
          status: 'On Duty',
          tripCount: 0,
        })
      }

      toast({
        title: 'Staff Enrolled',
        description: `${staffName} registered in company payroll${isDriverRole ? ' and driver roster' : ''}.`,
        type: 'success',
      })
    }

    setIsStaffModalOpen(false)
    setEditingStaffId(null)
  }

  // 3. Submit Customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!custName.trim() && !custCompany.trim()) {
      toast({ title: 'Validation Error', description: 'Customer or company name is required.', type: 'error' })
      return
    }

    const finalName = custName.trim() || custCompany.trim()
    const finalCompany = custCompany.trim() || custName.trim()

    if (editingCustomerId) {
      updateCustomer(editingCustomerId, {
        name: finalName,
        company: finalCompany,
        tinNumber: custTIN.trim() || '0019283741',
        phone: custPhone.trim() || '+251 91 000 0000',
        city: custCity,
        creditLimitETB: Number(custCreditLimit),
        paymentTerms: custPaymentTerms,
        isUsual: custCategory === 'Usual Customer',
        customerCategory: custCategory,
      })
      toast({ title: 'Customer Updated', description: `${finalCompany} updated successfully.`, type: 'success' })
    } else {
      addCustomer({
        name: finalName,
        company: finalCompany,
        tinNumber: custTIN.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
        phone: custPhone.trim() || '+251 91 000 0000',
        city: custCity,
        creditLimitETB: Number(custCreditLimit),
        outstandingBalanceETB: 0,
        paymentTerms: custPaymentTerms,
        status: 'Active',
        isUsual: custCategory === 'Usual Customer',
        customerCategory: custCategory,
      })
      toast({ title: 'Customer Registered', description: `${finalCompany} added to approved client registry.`, type: 'success' })
    }

    setIsCustomerModalOpen(false)
    setEditingCustomerId(null)
  }

  // 4. Submit Supplier
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault()
    if (!supName.trim()) {
      toast({ title: 'Validation Error', description: 'Supplier / Plant name is required.', type: 'error' })
      return
    }

    if (editingSupplierId) {
      updateSupplier(editingSupplierId, {
        name: supName.trim(),
        contactPerson: supContact.trim() || 'Plant Dispatch Coordinator',
        plantLocation: supPlantLocation.trim() || 'Main Industrial Site',
        tinNumber: supTIN.trim() || '0029384756',
        phone: supPhone.trim() || '+251 11 000 0000',
        status: supStatus,
      })
      toast({ title: 'Supplier Updated', description: `${supName} updated successfully.`, type: 'success' })
    } else {
      addSupplier({
        name: supName.trim(),
        contactPerson: supContact.trim() || 'Plant Dispatch Coordinator',
        plantLocation: supPlantLocation.trim() || 'Main Industrial Site',
        tinNumber: supTIN.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
        phone: supPhone.trim() || '+251 11 000 0000',
        totalPurchasedYTD: 0,
        outstandingPayableETB: 0,
        status: supStatus,
      })
      toast({ title: 'Supplier Registered', description: `${supName} added to procurement vendor list.`, type: 'success' })
    }

    setIsSupplierModalOpen(false)
    setEditingSupplierId(null)
  }

  // 5. Submit Product / Cement Type
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodName.trim()) {
      toast({ title: 'Validation Error', description: 'Product or cement grade name is required.', type: 'error' })
      return
    }

    const code = prodCode.trim() || `PRD-${Date.now().toString().slice(-4)}`

    if (editingProductId) {
      updateProduct(editingProductId, {
        code,
        name: prodName.trim(),
        category: prodCategory,
        packaging: prodPackaging,
        factoryBrand: prodBrand.trim() || 'Zarima Standard',
        unitPriceETB: Number(prodSellingPrice),
        purchasePriceETB: Number(prodPurchasePrice),
        unitOfMeasure: prodUOM,
        description: prodDesc.trim(),
      })
      toast({ title: 'Product Updated', description: `${prodName} catalog entry updated.`, type: 'success' })
    } else {
      addProduct({
        code,
        name: prodName.trim(),
        category: prodCategory,
        packaging: prodPackaging,
        factoryBrand: prodBrand.trim() || 'Zarima Standard',
        unitPriceETB: Number(prodSellingPrice),
        purchasePriceETB: Number(prodPurchasePrice),
        unitOfMeasure: prodUOM,
        description: prodDesc.trim(),
        status: 'Active',
      })
      toast({ title: 'Product Added', description: `${prodName} enrolled into enterprise trade catalog.`, type: 'success' })
    }

    setIsProductModalOpen(false)
    setEditingProductId(null)
  }

  // 6. Submit Depot / Warehouse
  const handleSaveDepot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!depotName.trim()) {
      toast({ title: 'Validation Error', description: 'Depot warehouse name is required.', type: 'error' })
      return
    }

    const code = depotCode.trim() || `DEP-${Date.now().toString().slice(-4)}`

    if (editingDepotId) {
      updateDepot(editingDepotId, {
        code,
        name: depotName.trim(),
        city: depotCity.trim(),
        address: depotAddress.trim() || `${depotCity} Logistics Terminal`,
        capacityQuintals: Number(depotCapacity),
        managerName: depotManager.trim() || 'Depot Supervisor',
        phone: depotPhone.trim() || '+251 91 000 0000',
        type: depotType,
      })
      toast({ title: 'Depot Updated', description: `${depotName} updated successfully.`, type: 'success' })
    } else {
      addDepot({
        code,
        name: depotName.trim(),
        city: depotCity.trim(),
        address: depotAddress.trim() || `${depotCity} Logistics Terminal`,
        capacityQuintals: Number(depotCapacity),
        managerName: depotManager.trim() || 'Depot Supervisor',
        phone: depotPhone.trim() || '+251 91 000 0000',
        status: 'Active',
        type: depotType,
      })
      toast({ title: 'Depot Enrolled', description: `${depotName} registered in distribution network.`, type: 'success' })
    }

    setIsDepotModalOpen(false)
    setEditingDepotId(null)
  }

  // =========================================================================
  // FILTERED DATA
  // =========================================================================
  const filteredTrucks = trucks.filter((t) => {
    const matchSearch =
      t.plateNumber.toLowerCase().includes(truckSearch.toLowerCase()) ||
      t.makeModel.toLowerCase().includes(truckSearch.toLowerCase()) ||
      t.driverName.toLowerCase().includes(truckSearch.toLowerCase())
    const matchStatus = truckStatusFilter === 'ALL' || t.operationalStatus === truckStatusFilter
    return matchSearch && matchStatus
  })

  // Deduplicated staff roster for configuration (1 row per employee)
  const uniqueStaffList = useMemo(() => {
    const map = new Map<string, PayrollEntry>()
    payroll.forEach((p) => {
      if (!map.has(p.employeeName)) {
        map.set(p.employeeName, p)
      }
    })
    return Array.from(map.values())
  }, [payroll])

  const filteredStaff = uniqueStaffList.filter((s) => {
    const matchSearch =
      s.employeeName.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.role.toLowerCase().includes(staffSearch.toLowerCase()) ||
      (s.bankAccountNumber && s.bankAccountNumber.includes(staffSearch))
    const matchDept = staffDeptFilter === 'ALL' || s.businessActivity === staffDeptFilter
    return matchSearch && matchDept
  })

  const filteredCustomers = customers.filter(
    (c) =>
      c.company.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      c.tinNumber.includes(partnerSearch) ||
      c.city.toLowerCase().includes(partnerSearch.toLowerCase())
  )

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      s.plantLocation.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(partnerSearch.toLowerCase())
  )

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.factoryBrand.toLowerCase().includes(productSearch.toLowerCase())
    const matchCategory = productCategoryFilter === 'ALL' || p.category === productCategoryFilter
    return matchSearch && matchCategory
  })

  const filteredDepots = depots.filter(
    (d) =>
      d.name.toLowerCase().includes(depotSearch.toLowerCase()) ||
      d.city.toLowerCase().includes(depotSearch.toLowerCase()) ||
      d.managerName.toLowerCase().includes(depotSearch.toLowerCase())
  )

  // Quick stats
  const totalHaulageCapacityQuintals = trucks.reduce((sum, t) => sum + (t.capacityQuintals || 0), 0)
  const totalDepotCapacityQuintals = depots.reduce((sum, d) => sum + (d.capacityQuintals || 0), 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Master Configuration"
        description="Add and maintain foundational ERP master records: trucks, staff & drivers, customers, suppliers, cement types, and warehouse depots."
        breadcrumbs={[
          { label: 'Master Configuration' },
        ]}
      />

      {/* Unified Sleek Navigation Bar & Contextual Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-surface/90 border border-border rounded-2xl shadow-subtle backdrop-blur-md">
        {/* Single Clean Segmented Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-0.5">
          <button
            onClick={() => handleTabChange('trucks')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'trucks'
                ? 'bg-forest text-white shadow-sm font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Commercial Trucks</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'trucks' ? 'bg-white/20 text-white' : 'bg-surface-elevated text-muted-foreground'
              }`}
            >
              {trucks.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('staff')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'staff'
                ? 'bg-forest text-white shadow-sm font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff &amp; Drivers</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'staff' ? 'bg-white/20 text-white' : 'bg-surface-elevated text-muted-foreground'
              }`}
            >
              {uniqueStaffList.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('partners')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'partners'
                ? 'bg-forest text-white shadow-sm font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Customers &amp; Suppliers</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'partners' ? 'bg-white/20 text-white' : 'bg-surface-elevated text-muted-foreground'
              }`}
            >
              {customers.length + suppliers.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('products')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'products'
                ? 'bg-forest text-white shadow-sm font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Cement &amp; Cargo</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-surface-elevated text-muted-foreground'
              }`}
            >
              {products.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('depots')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'depots'
                ? 'bg-forest text-white shadow-sm font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>Depots &amp; Warehouses</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'depots' ? 'bg-white/20 text-white' : 'bg-surface-elevated text-muted-foreground'
              }`}
            >
              {depots.length}
            </span>
          </button>
        </div>

        {/* Primary Action Button for Selected Tab */}
        <div className="flex-shrink-0 px-1">
          {activeTab === 'trucks' && (
            <button
              onClick={() => {
                setEditingTruckId(null)
                setTruckPlate('')
                setTruckModel('Sinotruk HOWO 371 6x4')
                setTruckCapacity(750)
                setTruckMileage(45000)
                setTruckOwnership('Zarima Owned')
                setIsTruckModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Commercial Truck</span>
            </button>
          )}

          {activeTab === 'staff' && (
            <button
              onClick={() => {
                setEditingStaffId(null)
                setStaffName('')
                setStaffRole('Heavy Commercial Driver')
                setStaffBaseSalary(32000)
                setStaffBonus(0)
                setStaffAccountNo('')
                setIsStaffModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff / Driver</span>
            </button>
          )}

          {activeTab === 'partners' && partnerSubTab === 'customers' && (
            <button
              onClick={() => {
                setEditingCustomerId(null)
                setCustName('')
                setCustCompany('')
                setCustTIN('')
                setCustPhone('')
                setCustCreditLimit(3000000)
                setIsCustomerModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          )}

          {activeTab === 'partners' && partnerSubTab === 'suppliers' && (
            <button
              onClick={() => {
                setEditingSupplierId(null)
                setSupName('')
                setSupContact('')
                setSupPlantLocation('')
                setSupTIN('')
                setSupPhone('')
                setIsSupplierModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Factory Supplier</span>
            </button>
          )}

          {activeTab === 'products' && (
            <button
              onClick={() => {
                setEditingProductId(null)
                setProdCode('')
                setProdName('')
                setProdCategory('Cement')
                setProdPackaging('50kg Bag')
                setProdSellingPrice(1420)
                setProdPurchasePrice(1280)
                setProdDesc('')
                setIsProductModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Cement Type / Cargo</span>
            </button>
          )}

          {activeTab === 'depots' && (
            <button
              onClick={() => {
                setEditingDepotId(null)
                setDepotCode('')
                setDepotName('')
                setDepotCity('Addis Ababa')
                setDepotCapacity(20000)
                setDepotManager('')
                setIsDepotModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Warehouse Depot</span>
            </button>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: TRUCKS & FLEET REGISTRY */}
      {/* =================================================================== */}
      {activeTab === 'trucks' && (
        <div className="space-y-4">
          {/* Quick Context Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-surface-elevated/60 border border-border/70 rounded-xl text-xs">
            <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
              <span>Total Fleet: <strong className="text-foreground font-mono">{trucks.length}</strong> Trucks</span>
              <span>•</span>
              <span>Available: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{trucks.filter(t => t.operationalStatus === 'Available').length}</strong></span>
              <span>•</span>
              <span>Active Trips: <strong className="text-blue-600 dark:text-blue-400 font-mono">{trucks.filter(t => t.operationalStatus === 'Active Trip').length}</strong></span>
              <span>•</span>
              <span>Maintenance: <strong className="text-amber-600 dark:text-amber-400 font-mono">{trucks.filter(t => t.operationalStatus === 'In Maintenance').length}</strong></span>
            </div>
            <div className="text-muted-foreground font-mono">
              Total Payload: <strong className="text-forest font-bold">{formatQuantity(totalHaulageCapacityQuintals)} Qtl</strong> ({totalHaulageCapacityQuintals / 10} Tons)
            </div>
          </div>
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface/90 border border-border rounded-2xl">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by license plate, make & model, or assigned driver..."
                value={truckSearch}
                onChange={(e) => setTruckSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-elevated border border-border rounded-xl text-xs text-foreground focus:ring-1 focus:ring-forest"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Status:</span>
              <select
                value={truckStatusFilter}
                onChange={(e) => setTruckStatusFilter(e.target.value)}
                className="px-3 py-2 bg-surface-elevated border border-border rounded-xl text-xs font-semibold text-foreground focus:ring-1 focus:ring-forest"
              >
                <option value="ALL">All Operational Statuses</option>
                <option value="Available">Available for Dispatch</option>
                <option value="Active Trip">Active Trip (In Transit)</option>
                <option value="In Maintenance">In Workshop Maintenance</option>
                <option value="Idle">Idle / Standby</option>
              </select>
            </div>
          </div>

          {/* Trucks Table */}
          <div className="border border-border rounded-2xl bg-surface/90 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-elevated/60 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Commercial Plate</th>
                    <th className="py-3 px-4">Make &amp; Model</th>
                    <th className="py-3 px-4">Ownership</th>
                    <th className="py-3 px-4">Payload Capacity</th>
                    <th className="py-3 px-4">Assigned Driver</th>
                    <th className="py-3 px-4">Odometer</th>
                    <th className="py-3 px-4">Operational Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTrucks.map((truck) => (
                    <tr key={truck.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-forest" />
                          <span>{truck.plateNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{truck.makeModel}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">Model Year: {truck.modelYear}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          truck.ownershipType === 'Subcontracted / Partner'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-forest/10 text-forest border border-forest/30'
                        }`}>
                          {truck.ownershipType || 'Zarima Owned'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        {formatQuantity(truck.capacityQuintals)} Qtl
                        <span className="text-muted-foreground font-normal ml-1">({truck.capacityQuintals / 10} Tons)</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground">
                          <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{truck.driverName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {truck.mileageKm?.toLocaleString()} km
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={truck.operationalStatus} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingTruckId(truck.id)
                              setTruckPlate(truck.plateNumber)
                              setTruckModel(truck.makeModel)
                              setTruckYear(truck.modelYear)
                              setTruckCapacity(truck.capacityQuintals)
                              setTruckDriverName(truck.driverName)
                              setTruckMileage(truck.mileageKm)
                              setTruckOwnership(truck.ownershipType || 'Zarima Owned')
                              setTruckFuelCapacity(truck.fuelCapacityLiters || 400)
                              setTruckStatus(truck.operationalStatus)
                              setIsTruckModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                            title="Edit Truck"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove truck ${truck.plateNumber} from fleet configuration?`)) {
                                deleteTruck(truck.id)
                                toast({ title: 'Truck Removed', description: `${truck.plateNumber} removed from master data.`, type: 'info' })
                              }
                            }}
                            className="p-1.5 rounded-lg border border-border text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete Truck"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTrucks.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        No trucks match your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: STAFF & DRIVERS REGISTRY */}
      {/* =================================================================== */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Quick Context Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-surface-elevated/60 border border-border/70 rounded-xl text-xs">
            <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
              <span>Total Personnel: <strong className="text-foreground font-mono">{uniqueStaffList.length}</strong></span>
              <span>•</span>
              <span>Heavy Drivers: <strong className="text-blue-600 dark:text-blue-400 font-mono">{drivers.length}</strong></span>
              <span>•</span>
              <span>Transport &amp; Fleet: <strong className="text-foreground font-mono">{uniqueStaffList.filter(s => s.businessActivity === 'Transport').length}</strong></span>
              <span>•</span>
              <span>Cement Division: <strong className="text-foreground font-mono">{uniqueStaffList.filter(s => s.businessActivity === 'Cement').length}</strong></span>
            </div>
            <div className="text-muted-foreground font-mono">
              Monthly Base Payroll: <strong className="text-forest font-bold">{formatCurrency(uniqueStaffList.reduce((acc, s) => acc + (s.baseSalaryETB || s.basicSalaryETB || 0), 0))}</strong>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface/90 border border-border rounded-2xl">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search staff by employee name, role, or bank account..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-elevated border border-border rounded-xl text-xs text-foreground focus:ring-1 focus:ring-forest"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Department:</span>
              <select
                value={staffDeptFilter}
                onChange={(e) => setStaffDeptFilter(e.target.value)}
                className="px-3 py-2 bg-surface-elevated border border-border rounded-xl text-xs font-semibold text-foreground focus:ring-1 focus:ring-forest"
              >
                <option value="ALL">All Departments</option>
                <option value="Transport">Transport &amp; Highway Fleet</option>
                <option value="Cement">Cement Trading &amp; Commercial</option>
                <option value="Shared">Finance &amp; Executive Administration</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="border border-border rounded-2xl bg-surface/90 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-elevated/60 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Employee Full Name</th>
                    <th className="py-3 px-4">Role &amp; Title</th>
                    <th className="py-3 px-4">Business Department</th>
                    <th className="py-3 px-4">Base Salary</th>
                    <th className="py-3 px-4">Bonus / Incentive</th>
                    <th className="py-3 px-4">Company Gross Payout</th>
                    <th className="py-3 px-4">Bank Disbursement Account</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredStaff.map((staff) => {
                    const gross = (staff.baseSalaryETB || staff.basicSalaryETB) + (staff.bonusETB || 0)
                    return (
                      <tr key={staff.id} className="hover:bg-surface-elevated/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-forest/10 border border-forest/30 flex items-center justify-center font-bold text-forest">
                              {staff.employeeName.charAt(0)}
                            </div>
                            <div>
                              <div>{staff.employeeName}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{staff.employeeId || staff.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {staff.role}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            staff.businessActivity === 'Transport'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                              : staff.businessActivity === 'Cement'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                          }`}>
                            {staff.businessActivity === 'Transport' ? 'Transport / Fleet' : staff.businessActivity === 'Cement' ? 'Cement Division' : 'Shared / Executive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {formatCurrency(staff.baseSalaryETB || staff.basicSalaryETB)}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {staff.bonusETB ? `+${formatCurrency(staff.bonusETB)}` : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono font-extrabold text-forest">
                          {formatCurrency(gross)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-foreground font-medium">{staff.bankName || 'CBE'}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{staff.bankAccountNumber}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingStaffId(staff.id)
                                setStaffName(staff.employeeName)
                                setStaffRole(staff.role)
                                setStaffDept(staff.businessActivity || 'Transport')
                                setStaffBaseSalary(staff.baseSalaryETB || staff.basicSalaryETB)
                                setStaffBonus(staff.bonusETB || 0)
                                setStaffBankName(staff.bankName || 'Commercial Bank of Ethiopia (CBE)')
                                setStaffAccountNo(staff.bankAccountNumber || '')
                                setIsStaffModalOpen(true)
                              }}
                              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                              title="Edit Compensation & Role"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${staff.employeeName} from master configuration?`)) {
                                  deletePayrollEntry(staff.id)
                                  toast({ title: 'Employee Removed', description: `${staff.employeeName} removed.`, type: 'info' })
                                }
                              }}
                              className="p-1.5 rounded-lg border border-border text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredStaff.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        No staff members found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: CUSTOMERS & FACTORY SUPPLIERS */}
      {/* =================================================================== */}
      {activeTab === 'partners' && (
        <div className="space-y-4">
          {/* Sub Tab Switcher & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface/90 border border-border rounded-2xl">
            <div className="flex items-center gap-1.5 p-1 bg-surface-elevated rounded-xl border border-border">
              <button
                onClick={() => setPartnerSubTab('customers')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  partnerSubTab === 'customers'
                    ? 'bg-forest text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Customers &amp; Buyers ({customers.length})</span>
              </button>
              <button
                onClick={() => setPartnerSubTab('suppliers')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  partnerSubTab === 'suppliers'
                    ? 'bg-forest text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Factory className="w-3.5 h-3.5" />
                <span>Factory Suppliers &amp; Vendors ({suppliers.length})</span>
              </button>
            </div>

            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={partnerSubTab === 'customers' ? 'Search customers by company, TIN, city...' : 'Search suppliers by plant name, location, contact...'}
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-elevated border border-border rounded-xl text-xs text-foreground focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>

          {/* Sub Tab: Customers */}
          {partnerSubTab === 'customers' && (
            <div className="border border-border rounded-2xl bg-surface/90 overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-elevated/60 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Company / Client Name</th>
                      <th className="py-3 px-4">Contact Person</th>
                      <th className="py-3 px-4">TIN Number</th>
                      <th className="py-3 px-4">City / Region</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4">Payment Terms</th>
                      <th className="py-3 px-4">Credit Limit</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-surface-elevated/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">
                          <div>{cust.company}</div>
                          {cust.company !== cust.name && (
                            <div className="text-[11px] text-muted-foreground font-normal">{cust.name}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{cust.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{cust.phone}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {cust.tinNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-foreground">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span>{cust.city}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cust.isUsual || cust.customerCategory === 'Usual Customer'
                              ? 'bg-forest/10 text-forest border border-forest/30'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                          }`}>
                            {cust.customerCategory || (cust.isUsual ? 'Usual Customer' : 'New Customer')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-muted-foreground">
                          {cust.paymentTerms}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {formatCurrency(cust.creditLimitETB)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingCustomerId(cust.id)
                                setCustName(cust.name)
                                setCustCompany(cust.company)
                                setCustTIN(cust.tinNumber)
                                setCustPhone(cust.phone)
                                setCustCity(cust.city)
                                setCustCreditLimit(cust.creditLimitETB)
                                setCustPaymentTerms(cust.paymentTerms)
                                setCustCategory((cust.customerCategory as any) || 'Usual Customer')
                                setIsCustomerModalOpen(true)
                              }}
                              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                              title="Edit Customer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete customer ${cust.company}?`)) {
                                  deleteCustomer(cust.id)
                                  toast({ title: 'Customer Deleted', description: `${cust.company} removed.`, type: 'info' })
                                }
                              }}
                              className="p-1.5 rounded-lg border border-border text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                          No customers match your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub Tab: Suppliers */}
          {partnerSubTab === 'suppliers' && (
            <div className="border border-border rounded-2xl bg-surface/90 overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-elevated/60 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Manufacturing Plant / Supplier</th>
                      <th className="py-3 px-4">Plant Location</th>
                      <th className="py-3 px-4">Contact Person</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">TIN Number</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredSuppliers.map((sup) => (
                      <tr key={sup.id} className="hover:bg-surface-elevated/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <Factory className="w-4 h-4 text-forest" />
                            <span>{sup.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-foreground">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span>{sup.plantLocation}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {sup.contactPerson}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {sup.phone}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {sup.tinNumber}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={sup.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingSupplierId(sup.id)
                                setSupName(sup.name)
                                setSupContact(sup.contactPerson)
                                setSupPlantLocation(sup.plantLocation)
                                setSupTIN(sup.tinNumber)
                                setSupPhone(sup.phone)
                                setSupStatus(sup.status)
                                setIsSupplierModalOpen(true)
                              }}
                              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                              title="Edit Supplier"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete supplier ${sup.name}?`)) {
                                  deleteSupplier(sup.id)
                                  toast({ title: 'Supplier Deleted', description: `${sup.name} removed.`, type: 'info' })
                                }
                              }}
                              className="p-1.5 rounded-lg border border-border text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Delete Supplier"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSuppliers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                          No suppliers found matching your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: CEMENT TYPES & CARGO PRODUCTS CATALOG */}
      {/* =================================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Quick Context Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-surface-elevated/60 border border-border/70 rounded-xl text-xs">
            <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
              <span>Trade Catalog: <strong className="text-foreground font-mono">{products.length}</strong> Products</span>
              <span>•</span>
              <span>Cement Grades: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{products.filter(p => p.category === 'Cement').length}</strong></span>
              <span>•</span>
              <span>Steel &amp; Rebar: <strong className="text-blue-600 dark:text-blue-400 font-mono">{products.filter(p => p.category === 'Steel & Rebar').length}</strong></span>
              <span>•</span>
              <span>Aggregates: <strong className="text-purple-600 dark:text-purple-400 font-mono">{products.filter(p => p.category === 'Aggregates').length}</strong></span>
            </div>
            <div className="text-muted-foreground font-mono text-[11px]">
              Available for Invoices, Dispatches &amp; Stock Intake
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface/90 border border-border rounded-2xl">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cement types, product code, factory brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-elevated border border-border rounded-xl text-xs text-foreground focus:ring-1 focus:ring-forest"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Category:</span>
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-surface-elevated border border-border rounded-xl text-xs font-semibold text-foreground focus:ring-1 focus:ring-forest"
              >
                <option value="ALL">All Categories</option>
                <option value="Cement">Standard Cement</option>
                <option value="Specialty & Chemicals">Specialty / Sulfate Resistant</option>
                <option value="Steel & Rebar">Steel &amp; Rebar</option>
                <option value="Aggregates">Sand &amp; Aggregates</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((prod) => {
              const marginETB = prod.unitPriceETB - prod.purchasePriceETB
              const marginPct = Math.round((marginETB / prod.unitPriceETB) * 100)
              return (
                <div
                  key={prod.id}
                  className="p-5 rounded-2xl border border-border bg-surface/90 shadow-card hover:border-forest/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-forest/10 text-forest border border-forest/30">
                        {prod.code}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {prod.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-snug">{prod.name}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        {prod.description || 'Standard trade specification product.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-surface-elevated rounded-xl border border-border text-[11px]">
                      <div>
                        <div className="text-muted-foreground">Packaging:</div>
                        <div className="font-semibold text-foreground">{prod.packaging}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Brand / Origin:</div>
                        <div className="font-semibold text-foreground truncate">{prod.factoryBrand}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-muted-foreground">Standard Selling Price:</div>
                        <div className="text-base font-extrabold font-mono text-forest">
                          {formatCurrency(prod.unitPriceETB)}
                          <span className="text-[10px] font-normal text-muted-foreground ml-1">/ {prod.unitOfMeasure.split(' ')[0]}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground">Procurement Cost:</div>
                        <div className="text-xs font-mono font-bold text-muted-foreground">
                          {formatCurrency(prod.purchasePriceETB)}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          +{marginPct}% Margin (+{formatCurrency(marginETB)})
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Available for Invoice</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingProductId(prod.id)
                          setProdCode(prod.code)
                          setProdName(prod.name)
                          setProdCategory(prod.category)
                          setProdPackaging(prod.packaging)
                          setProdBrand(prod.factoryBrand)
                          setProdSellingPrice(prod.unitPriceETB)
                          setProdPurchasePrice(prod.purchasePriceETB)
                          setProdUOM(prod.unitOfMeasure)
                          setProdDesc(prod.description || '')
                          setIsProductModalOpen(true)
                        }}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${prod.name} from product catalog?`)) {
                            deleteProduct(prod.id)
                            toast({ title: 'Product Deleted', description: `${prod.name} removed.`, type: 'info' })
                          }
                        }}
                        className="p-1.5 rounded-lg border border-border text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: WAREHOUSE DEPOTS & REGIONAL TERMINALS */}
      {/* =================================================================== */}
      {activeTab === 'depots' && (
        <div className="space-y-4">
          {/* Quick Context Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-surface-elevated/60 border border-border/70 rounded-xl text-xs">
            <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
              <span>Storage Network: <strong className="text-foreground font-mono">{depots.length}</strong> Depots</span>
              <span>•</span>
              <span>Central Kality: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">30,000 Qtl</strong></span>
              <span>•</span>
              <span>Regional Terminals: <strong className="text-blue-600 dark:text-blue-400 font-mono">{depots.length - 1} Transit Hubs</strong></span>
            </div>
            <div className="text-muted-foreground font-mono">
              Total Storage Capacity: <strong className="text-forest font-bold">{formatQuantity(totalDepotCapacityQuintals)} Qtl</strong> ({totalDepotCapacityQuintals / 10} Tons)
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between gap-3 p-3 bg-surface/90 border border-border rounded-2xl">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search depots by name, city, or manager..."
                value={depotSearch}
                onChange={(e) => setDepotSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-elevated border border-border rounded-xl text-xs text-foreground focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>

          {/* Depots Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDepots.map((depot) => {
              // Calculate inventory stock allocated to this depot
              const storedQuintals = inventory
                .filter((inv) => inv.warehouseLocation.toLowerCase().includes(depot.name.toLowerCase()) || depot.name.toLowerCase().includes(inv.warehouseLocation.toLowerCase()))
                .reduce((sum, inv) => sum + (inv.currentStockQuintals || 0), 0)

              const utilizationPct = Math.round((storedQuintals / depot.capacityQuintals) * 100) || 35

              return (
                <div
                  key={depot.id}
                  className="p-5 rounded-2xl border border-border bg-surface/90 shadow-card hover:border-forest/50 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-forest/10 border border-forest/30 flex items-center justify-center text-forest">
                        <Warehouse className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{depot.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated border border-border font-bold">
                            {depot.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{depot.address}</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-forest/10 text-forest border border-forest/30">
                      {depot.type}
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="p-3 bg-surface-elevated rounded-xl border border-border space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Storage Capacity:</span>
                      <span className="font-mono font-bold text-foreground">
                        {formatQuantity(depot.capacityQuintals)} Quintals ({depot.capacityQuintals / 10} Tons)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border/60">
                      <div
                        className="h-full bg-forest rounded-full transition-all"
                        style={{ width: `${Math.min(utilizationPct, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Live Stock: ~{formatQuantity(storedQuintals)} Qtl</span>
                      <span>{utilizationPct}% Utilized</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-muted-foreground">Depot Manager:</div>
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <span>{depot.managerName}</span>
                        <span className="text-[11px] font-mono text-muted-foreground">({depot.phone})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingDepotId(depot.id)
                          setDepotCode(depot.code)
                          setDepotName(depot.name)
                          setDepotCity(depot.city)
                          setDepotAddress(depot.address)
                          setDepotCapacity(depot.capacityQuintals)
                          setDepotManager(depot.managerName)
                          setDepotPhone(depot.phone)
                          setDepotType(depot.type)
                          setIsDepotModalOpen(true)
                        }}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                        title="Edit Depot"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete depot ${depot.name}?`)) {
                            deleteDepot(depot.id)
                            toast({ title: 'Depot Deleted', description: `${depot.name} removed.`, type: 'info' })
                          }
                        }}
                        className="p-1.5 rounded-lg border border-border text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete Depot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: REGISTER / EDIT TRUCK */}
      {/* =================================================================== */}
      {isTruckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-elevated p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-forest" />
                <h3 className="text-sm font-bold text-foreground">
                  {editingTruckId ? 'Edit Commercial Truck' : 'Register New Commercial Truck'}
                </h3>
              </div>
              <button
                onClick={() => setIsTruckModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTruck} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Commercial Plate No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3-ET-E99120 AA"
                    value={truckPlate}
                    onChange={(e) => setTruckPlate(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono font-bold focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Make &amp; Model</label>
                  <select
                    value={truckModel}
                    onChange={(e) => setTruckModel(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  >
                    <option value="Sinotruk HOWO 371 6x4">Sinotruk HOWO 371 6x4 (Heavy Hauler)</option>
                    <option value="Sinotruk HOWO 380 Bulk Tanker">Sinotruk HOWO 380 Bulk Tanker</option>
                    <option value="Mercedes-Benz Actros 3340">Mercedes-Benz Actros 3340</option>
                    <option value="Volvo FH440 Heavy Hauler">Volvo FH440 Heavy Hauler</option>
                    <option value="Sinotruk HOWO A7 Tractor">Sinotruk HOWO A7 Tractor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Model Year</label>
                  <input
                    type="number"
                    value={truckYear}
                    onChange={(e) => setTruckYear(Number(e.target.value))}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Capacity (Quintals) *</label>
                  <input
                    type="number"
                    required
                    value={truckCapacity}
                    onChange={(e) => setTruckCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono font-bold focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Fuel Tank (L)</label>
                  <input
                    type="number"
                    value={truckFuelCapacity}
                    onChange={(e) => setTruckFuelCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Assigned Heavy Driver</label>
                  <select
                    value={truckDriverName}
                    onChange={(e) => setTruckDriverName(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  >
                    <option value="Unassigned">Unassigned (Pool Truck)</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.fullName}>
                        {d.fullName} ({d.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">Fleet Ownership</label>
                  <select
                    value={truckOwnership}
                    onChange={(e) => setTruckOwnership(e.target.value as any)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  >
                    <option value="Zarima Owned">Zarima Owned Fleet</option>
                    <option value="Subcontracted / Partner">Subcontracted / Partner Hauler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Current Odometer (km)</label>
                  <input
                    type="number"
                    value={truckMileage}
                    onChange={(e) => setTruckMileage(Number(e.target.value))}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Operational Status</label>
                  <select
                    value={truckStatus}
                    onChange={(e) => setTruckStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  >
                    <option value="Available">Available for Dispatch</option>
                    <option value="Active Trip">Active Trip (In Transit)</option>
                    <option value="In Maintenance">In Workshop Maintenance</option>
                    <option value="Idle">Idle / Standby</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTruckModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-foreground hover:bg-surface-elevated font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold shadow-md"
                >
                  {editingTruckId ? 'Update Truck' : 'Register Truck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: ADD / EDIT STAFF & DRIVERS */}
      {/* =================================================================== */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-elevated p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-forest" />
                <h3 className="text-sm font-bold text-foreground">
                  {editingStaffId ? 'Edit Staff Compensation' : 'Enroll New Employee / Driver'}
                </h3>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alula Berhe"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Department</label>
                  <select
                    value={staffDept}
                    onChange={(e) => setStaffDept(e.target.value as any)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  >
                    <option value="Transport">Transport &amp; Highway Logistics</option>
                    <option value="Cement">Cement Trading &amp; Depot Operations</option>
                    <option value="Shared">Finance &amp; Executive Administration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Role &amp; Job Title</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                >
                  <option value="Heavy Commercial Driver">Heavy Commercial Driver</option>
                  <option value="Senior Logistics Coordinator">Senior Logistics Coordinator</option>
                  <option value="Central Depot Supervisor">Central Depot Supervisor</option>
                  <option value="Sales & Commercial Officer">Sales &amp; Commercial Officer</option>
                  <option value="Chief Senior Accountant">Chief Senior Accountant</option>
                  <option value="Fleet Mechanic & Workshop Lead">Fleet Mechanic &amp; Workshop Lead</option>
                  <option value="Managing Director & Operations">Managing Director &amp; Operations</option>
                </select>
              </div>

              {staffRole.toLowerCase().includes('driver') && (
                <div className="p-3 bg-surface-elevated rounded-xl border border-border space-y-3">
                  <div className="text-[11px] font-bold text-forest">Heavy Commercial Driver Credentials</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-foreground mb-1">Driver License No</label>
                      <input
                        type="text"
                        placeholder="ETH-CD-109281"
                        value={driverLicenseNo}
                        onChange={(e) => setDriverLicenseNo(e.target.value)}
                        className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono focus:ring-1 focus:ring-forest"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-foreground mb-1">License Grade</label>
                      <input
                        type="text"
                        value={driverLicenseGrade}
                        onChange={(e) => setDriverLicenseGrade(e.target.value)}
                        className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-semibold focus:ring-1 focus:ring-forest"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Compensation */}
              <div className="p-3 bg-forest/5 rounded-xl border border-forest/20 space-y-3">
                <div className="text-[11px] font-bold text-forest">Gross Monthly Compensation (Company Account Deduction)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-foreground mb-1">Gross Base Salary (ETB) *</label>
                    <input
                      type="number"
                      required
                      value={staffBaseSalary}
                      onChange={(e) => setStaffBaseSalary(Number(e.target.value))}
                      className="w-full p-2.5 bg-surface border border-border rounded-xl text-foreground font-mono font-bold focus:ring-1 focus:ring-forest"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-foreground mb-1">Default Monthly Bonus (ETB)</label>
                    <input
                      type="number"
                      value={staffBonus}
                      onChange={(e) => setStaffBonus(Number(e.target.value))}
                      className="w-full p-2.5 bg-surface border border-border rounded-xl text-foreground font-mono font-bold focus:ring-1 focus:ring-forest"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-forest/20">
                  <span className="text-muted-foreground">Total Gross Deducted from Company:</span>
                  <span className="font-mono font-extrabold text-forest text-sm">
                    {formatCurrency(Number(staffBaseSalary) + Number(staffBonus))}
                  </span>
                </div>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Disbursing Bank</label>
                  <select
                    value={staffBankName}
                    onChange={(e) => setStaffBankName(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  >
                    <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                    <option value="Awash Bank">Awash Bank</option>
                    <option value="Dashen Bank">Dashen Bank</option>
                    <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                    <option value="Hibret Bank">Hibret Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="1000..."
                    value={staffAccountNo}
                    onChange={(e) => setStaffAccountNo(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-foreground hover:bg-surface-elevated font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold shadow-md"
                >
                  {editingStaffId ? 'Update Compensation' : 'Enroll Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: ADD / EDIT CUSTOMER */}
      {/* =================================================================== */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-elevated p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-forest" />
                <h3 className="text-sm font-bold text-foreground">
                  {editingCustomerId ? 'Edit Customer Record' : 'Register Approved Customer / Buyer'}
                </h3>
              </div>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Company / Contractor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Afrotsion Construction Plc"
                    value={custCompany}
                    onChange={(e) => setCustCompany(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Eng. Yohannes Haile"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Ethiopian TIN Number</label>
                  <input
                    type="text"
                    placeholder="0019283741"
                    value={custTIN}
                    onChange={(e) => setCustTIN(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+251 91 123 4567"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">City / Delivery Site</label>
                  <input
                    type="text"
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Customer Classification</label>
                  <select
                    value={custCategory}
                    onChange={(e) => setCustCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  >
                    <option value="Usual Customer">Usual Customer (Repeat Buyer)</option>
                    <option value="New Customer">New Customer (Credit Review)</option>
                    <option value="Walk-in Customer">Walk-in Customer (Cash on Pickup)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Payment Terms</label>
                  <select
                    value={custPaymentTerms}
                    onChange={(e) => setCustPaymentTerms(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  >
                    <option value="Immediate Cash / Bank Transfer">Immediate Cash / Bank Transfer</option>
                    <option value="Credit 15 Days">Credit 15 Days</option>
                    <option value="Credit 30 Days">Credit 30 Days</option>
                    <option value="Credit 60 Days">Credit 60 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Credit Limit (ETB)</label>
                  <input
                    type="number"
                    value={custCreditLimit}
                    onChange={(e) => setCustCreditLimit(Number(e.target.value))}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono font-bold focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-foreground hover:bg-surface-elevated font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold shadow-md"
                >
                  {editingCustomerId ? 'Update Customer' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: ADD / EDIT SUPPLIER */}
      {/* =================================================================== */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-elevated p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-forest" />
                <h3 className="text-sm font-bold text-foreground">
                  {editingSupplierId ? 'Edit Supplier / Plant' : 'Register Factory Supplier / Vendor'}
                </h3>
              </div>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Manufacturing Plant / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Derba MIDROC Cement Plc"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Plant Location / Gate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mugher Valley, Oromia"
                    value={supPlantLocation}
                    onChange={(e) => setSupPlantLocation(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Dispatch Coordinator</label>
                  <input
                    type="text"
                    placeholder="e.g. Plant Gate Officer"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">TIN Number</label>
                  <input
                    type="text"
                    placeholder="0029384756"
                    value={supTIN}
                    onChange={(e) => setSupTIN(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Plant Dispatch Phone</label>
                  <input
                    type="text"
                    placeholder="+251 11 000 0000"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Procurement Status</label>
                <select
                  value={supStatus}
                  onChange={(e) => setSupStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                >
                  <option value="Active">Active Approved Plant</option>
                  <option value="Preferred">Preferred Factory Partner</option>
                  <option value="Under Review">Under Review / Standby</option>
                </select>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-foreground hover:bg-surface-elevated font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold shadow-md"
                >
                  {editingSupplierId ? 'Update Supplier' : 'Register Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: ADD / EDIT CEMENT TYPE & CARGO PRODUCT */}
      {/* =================================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-elevated p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-forest" />
                <h3 className="text-sm font-bold text-foreground">
                  {editingProductId ? 'Edit Product Catalog Item' : 'Add Cement Type / Cargo Product'}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Product Code</label>
                  <input
                    type="text"
                    placeholder="e.g. OPC-42.5R"
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono font-bold focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-medium text-foreground mb-1">Product Name / Grade *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OPC 42.5R High Early Strength"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  >
                    <option value="Cement">Standard Cement</option>
                    <option value="Specialty & Chemicals">Specialty / Sulfate Resistant</option>
                    <option value="Steel & Rebar">Steel &amp; Rebar</option>
                    <option value="Aggregates">Sand &amp; Aggregates</option>
                    <option value="General Cargo">General Freight Cargo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Packaging Format</label>
                  <select
                    value={prodPackaging}
                    onChange={(e) => setProdPackaging(e.target.value as any)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  >
                    <option value="50kg Bag">50kg Paper Bag</option>
                    <option value="Bulk Tanker / Bulker">Bulk Tanker / Bulker</option>
                    <option value="Metric Ton Bundle">Metric Ton Bundle</option>
                    <option value="Loose Dump">Loose Dump</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Factory Brand / Origin</label>
                  <input
                    type="text"
                    placeholder="e.g. Dangote / Mugher"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Unit of Measure (UOM)</label>
                  <select
                    value={prodUOM}
                    onChange={(e) => setProdUOM(e.target.value as any)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  >
                    <option value="Quintal (100kg)">Quintal (100kg)</option>
                    <option value="Metric Ton (1,000kg)">Metric Ton (1,000kg)</option>
                    <option value="50kg Bag">50kg Bag</option>
                    <option value="Cubic Meter">Cubic Meter</option>
                    <option value="Piece">Piece / Unit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-forest/5 rounded-xl border border-forest/20">
                <div>
                  <label className="block font-medium text-foreground mb-1">Standard Selling Price (ETB) *</label>
                  <input
                    type="number"
                    required
                    value={prodSellingPrice}
                    onChange={(e) => setProdSellingPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-foreground font-mono font-bold focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Standard Cost Price (ETB) *</label>
                  <input
                    type="number"
                    required
                    value={prodPurchasePrice}
                    onChange={(e) => setProdPurchasePrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-foreground font-mono font-bold focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Item Specification &amp; Notes</label>
                <textarea
                  rows={2}
                  placeholder="Structural specification or application guidelines..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-foreground hover:bg-surface-elevated font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold shadow-md"
                >
                  {editingProductId ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 6: ADD / EDIT DEPOT */}
      {/* =================================================================== */}
      {isDepotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-elevated p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-forest" />
                <h3 className="text-sm font-bold text-foreground">
                  {editingDepotId ? 'Edit Warehouse Depot' : 'Add New Warehouse Depot'}
                </h3>
              </div>
              <button
                onClick={() => setIsDepotModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDepot} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Depot Code</label>
                  <input
                    type="text"
                    placeholder="DEP-MODJO"
                    value={depotCode}
                    onChange={(e) => setDepotCode(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono font-bold focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-medium text-foreground mb-1">Depot / Yard Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modjo Dry Port Distribution Hub"
                    value={depotName}
                    onChange={(e) => setDepotName(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    value={depotCity}
                    onChange={(e) => setDepotCity(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Facility Type</label>
                  <select
                    value={depotType}
                    onChange={(e) => setDepotType(e.target.value as any)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  >
                    <option value="Central Storage">Central Storage</option>
                    <option value="Transit Depot">Transit Depot</option>
                    <option value="Distribution Yard">Distribution Yard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="Industrial Zone, Gate 2"
                  value={depotAddress}
                  onChange={(e) => setDepotAddress(e.target.value)}
                  className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">Total Capacity (Quintals) *</label>
                  <input
                    type="number"
                    required
                    value={depotCapacity}
                    onChange={(e) => setDepotCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono font-bold focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">Depot Manager</label>
                  <input
                    type="text"
                    placeholder="Manager Name"
                    value={depotManager}
                    onChange={(e) => setDepotManager(e.target.value)}
                    className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-semibold focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Manager Contact Phone</label>
                <input
                  type="text"
                  placeholder="+251 91 000 0000"
                  value={depotPhone}
                  onChange={(e) => setDepotPhone(e.target.value)}
                  className="w-full p-2.5 bg-surface-elevated border border-border rounded-xl text-foreground font-mono focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDepotModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-foreground hover:bg-surface-elevated font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold shadow-md"
                >
                  {editingDepotId ? 'Update Depot' : 'Add Depot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
