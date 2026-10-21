import React, { useState, useMemo } from 'react'
import {
  Wallet,
  CheckCircle2,
  Download,
  DollarSign,
  Edit3,
  Eye,
  Building2,
  Printer,
  X,
  Search,
  Plus,
  FileText,
  ArrowRight,
  Clock,
  Coins,
  Users,
  CreditCard,
  TrendingUp,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Check,
  History,
  RotateCcw,
  Copy,
  Gift,
  CheckSquare,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDateTime } from '@/lib/formatters'
import { PayrollEntry, BusinessActivity } from '@/types'

export const PayrollPage: React.FC = () => {
  const {
    payroll,
    updatePayrollEntry,
    addPayrollEntry,
    disbursePayrollBatch,
    toggleReconcilePayrollPayment,
    bankAccounts,
    updateBankAccountBalance,
    addTransaction,
  } = useStore()
  const { toast } = useToast()

  // Main Tabs: Staff Roster (Unique 1-row per employee with Pay Tick) vs Master Reconciliation Ledger
  const [activeTab, setActiveTab] = useState<'roster' | 'ledger'>('roster')

  // Search & Filters for Active Roster
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<string>('October 2026')
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Search & Filters for Master Bank Reconciliation Ledger Tab
  const [ledgerSearch, setLedgerSearch] = useState('')
  const [ledgerEmployeeFilter, setLedgerEmployeeFilter] = useState<string>('ALL')
  const [ledgerMonthFilter, setLedgerMonthFilter] = useState<string>('ALL')
  const [ledgerReconciliationFilter, setLedgerReconciliationFilter] = useState<string>('ALL')

  // Modals
  const [selectedPayrollId, setSelectedPayrollId] = useState<string>(payroll[0]?.id || '')
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Selected Bank for Batch Disbursement
  const [disburseBankId, setDisburseBankId] = useState<string>(bankAccounts[0]?.id || 'BANK-01')

  // Active selected record
  const selectedRecord = payroll.find((p) => p.id === selectedPayrollId) || payroll[0]

  // Form states for editing compensation (Salary Raise & Optional Bonus)
  const [editBaseSalary, setEditBaseSalary] = useState<number>(35000)
  const [editBonus, setEditBonus] = useState<number>(0)
  const [editRole, setEditRole] = useState('')
  const [editDepartment, setEditDepartment] = useState('')
  const [editBankName, setEditBankName] = useState('Commercial Bank of Ethiopia (CBE)')
  const [editBankAccountNo, setEditBankAccountNo] = useState('')
  const [editNotes, setEditNotes] = useState('')

  // Form states for adding new employee to payroll
  const [newEmpName, setNewEmpName] = useState('')
  const [newEmpRole, setNewEmpRole] = useState('Heavy Commercial Driver')
  const [newEmpDept, setNewEmpDept] = useState('Fleet & Highway Logistics')
  const [newEmpActivity, setNewEmpActivity] = useState<BusinessActivity>('Transport')
  const [newEmpBaseSalary, setNewEmpBaseSalary] = useState<number>(32000)
  const [newEmpBonus, setNewEmpBonus] = useState<number>(0)
  const [newEmpBank, setNewEmpBank] = useState('Commercial Bank of Ethiopia (CBE)')
  const [newEmpAccountNo, setNewEmpAccountNo] = useState('1000')

  // Distinct values
  const distinctMonths = Array.from(new Set(payroll.map((p) => p.month)))
  const distinctEmployees = Array.from(new Set(payroll.map((p) => p.employeeName)))

  // Helper to get total company deduction amount
  const getRecordTotal = (p: PayrollEntry) => {
    return p.totalPaidETB !== undefined ? p.totalPaidETB : (p.netPayETB || p.basicSalaryETB + (p.bonusETB || 0))
  }

  // =========================================================================
  // ZERO DUPLICATE ROWS: Unique Employee Roster for the Selected Cycle
  // Each employee appears exactly ONCE in the staff list.
  // Their full payment history across past periods is documented under them!
  // =========================================================================
  const uniqueEmployeeRoster = useMemo(() => {
    const activeMonth = selectedMonth === 'ALL' ? 'October 2026' : selectedMonth
    const map = new Map<string, PayrollEntry>()

    // 1. Pick record matching the selected active month
    payroll
      .filter((p) => p.month === activeMonth)
      .forEach((p) => {
        map.set(p.employeeName, p)
      })

    // 2. If an employee exists in data but not yet for this month, pull their profile
    payroll.forEach((p) => {
      if (!map.has(p.employeeName)) {
        map.set(p.employeeName, {
          ...p,
          id: `PAY-${p.employeeId || p.id}-${activeMonth.replace(/\s+/g, '')}`,
          month: activeMonth,
          bonusETB: 0,
          totalPaidETB: p.basicSalaryETB,
          netPayETB: p.basicSalaryETB,
          paymentStatus: 'Approved',
          isReconciled: false,
          reconciliationStatus: 'Pending Statement Match',
          paymentDate: undefined,
          disbursementRef: undefined,
        })
      }
    })

    return Array.from(map.values())
  }, [payroll, selectedMonth])

  // Filtered Roster (1 row per employee)
  const filteredRoster = uniqueEmployeeRoster.filter((p) => {
    const matchSearch =
      p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.employeeId && p.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.bankName && p.bankName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.bankAccountNumber && p.bankAccountNumber.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchDept = departmentFilter === 'ALL' || p.businessActivity === departmentFilter
    const matchStatus = statusFilter === 'ALL' || p.paymentStatus === statusFilter

    return matchSearch && matchDept && matchStatus
  })

  // Full Historical Disbursements (across all months for the reconciliation ledger)
  const allHistoricalPayments = useMemo(() => {
    return payroll.filter((p) => p.paymentStatus === 'Paid' || p.disbursementRef || p.paymentDate)
  }, [payroll])

  // Filtered Ledger
  const filteredLedger = allHistoricalPayments.filter((p) => {
    const matchSearch =
      p.employeeName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      p.role.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      (p.disbursementRef && p.disbursementRef.toLowerCase().includes(ledgerSearch.toLowerCase())) ||
      (p.bankAccountNumber && p.bankAccountNumber.toLowerCase().includes(ledgerSearch.toLowerCase())) ||
      (p.reconciledStatementRef && p.reconciledStatementRef.toLowerCase().includes(ledgerSearch.toLowerCase()))

    const matchEmployee = ledgerEmployeeFilter === 'ALL' || p.employeeName === ledgerEmployeeFilter
    const matchMonth = ledgerMonthFilter === 'ALL' || p.month === ledgerMonthFilter
    const matchReconciliation =
      ledgerReconciliationFilter === 'ALL' ||
      (ledgerReconciliationFilter === 'Reconciled' && p.isReconciled) ||
      (ledgerReconciliationFilter === 'Pending' && !p.isReconciled)

    return matchSearch && matchEmployee && matchMonth && matchReconciliation
  })

  // Current Cycle Metrics
  const totalDeductedFromCompany = uniqueEmployeeRoster.reduce((acc, p) => acc + getRecordTotal(p), 0)
  const totalBaseSalaries = uniqueEmployeeRoster.reduce((acc, p) => acc + p.basicSalaryETB, 0)
  const totalBonusesAwarded = uniqueEmployeeRoster.reduce((acc, p) => acc + (p.bonusETB || 0), 0)
  const pendingBatchList = uniqueEmployeeRoster.filter((p) => p.paymentStatus !== 'Paid')
  const pendingBatchTotal = pendingBatchList.reduce((acc, p) => acc + getRecordTotal(p), 0)
  const paidCount = uniqueEmployeeRoster.filter((p) => p.paymentStatus === 'Paid').length

  // Ledger Metrics
  const totalHistoricalDeducted = allHistoricalPayments.reduce((acc, p) => acc + getRecordTotal(p), 0)
  const reconciledHistory = allHistoricalPayments.filter((p) => p.isReconciled)
  const reconciledTotalETB = reconciledHistory.reduce((acc, p) => acc + getRecordTotal(p), 0)
  const pendingHistory = allHistoricalPayments.filter((p) => !p.isReconciled)
  const pendingTotalETB = pendingHistory.reduce((acc, p) => acc + getRecordTotal(p), 0)
  const reconciliationRate = allHistoricalPayments.length > 0 ? Math.round((reconciledHistory.length / allHistoricalPayments.length) * 100) : 0

  // Open Edit Modal with prefilled values
  const handleOpenEdit = (rec: PayrollEntry) => {
    setSelectedPayrollId(rec.id)
    setEditBaseSalary(rec.basicSalaryETB)
    setEditBonus(rec.bonusETB || 0)
    setEditRole(rec.role)
    setEditDepartment(rec.department || (rec.businessActivity === 'Transport' ? 'Fleet Logistics' : 'Operations'))
    setEditBankName(rec.bankName || 'Commercial Bank of Ethiopia (CBE)')
    setEditBankAccountNo(rec.bankAccountNumber || '1000' + rec.id.replace(/\D/g, ''))
    setEditNotes(rec.notes || '')
    setIsEditModalOpen(true)
  }

  // Open Detail Modal
  const handleOpenDetail = (rec: PayrollEntry) => {
    setSelectedPayrollId(rec.id)
    setIsDetailModalOpen(true)
  }

  // Save Salary Raise & Bonus Adjustment
  const handleSaveSalaryAdjustment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecord) return

    const base = Number(editBaseSalary) || 0
    const bonus = Number(editBonus) || 0
    const totalPaid = base + bonus

    updatePayrollEntry(selectedRecord.id, {
      basicSalaryETB: base,
      baseSalaryETB: base,
      bonusETB: bonus,
      totalPaidETB: totalPaid,
      netPayETB: totalPaid,
      perDiemETB: 0,
      deductionsETB: 0,
      allowancesETB: 0,
      role: editRole,
      department: editDepartment,
      bankName: editBankName,
      bankAccountNumber: editBankAccountNo,
      notes: editNotes,
    })

    setIsEditModalOpen(false)
    toast({
      title: 'Salary & Compensation Updated',
      description: `Updated ${selectedRecord.employeeName}: Base ETB ${formatCurrency(base, { hideDecimals: true })}${
        bonus > 0 ? ` + Bonus ETB ${formatCurrency(bonus, { hideDecimals: true })}` : ''
      }. Total company payout: ETB ${formatCurrency(totalPaid, { hideDecimals: true })}.`,
      type: 'success',
    })
  }

  // Pay and Tick an individual staff member directly
  const handlePayAndTickStaff = (p: PayrollEntry) => {
    const selectedBank = bankAccounts.find((b) => b.id === disburseBankId) || bankAccounts[0]
    const payAmount = getRecordTotal(p)
    const refNo = `CBE-PAY-2026-${Date.now().toString().slice(-6)}`

    updatePayrollEntry(p.id, {
      paymentStatus: 'Paid',
      paymentDate: new Date().toISOString(),
      disbursementRef: refNo,
      isReconciled: false,
      reconciliationStatus: 'Pending Statement Match',
    })

    if (selectedBank && payAmount > 0) {
      updateBankAccountBalance(selectedBank.id, selectedBank.balanceETB - payAmount)
      addTransaction({
        referenceNumber: refNo,
        date: new Date().toISOString().split('T')[0],
        type: 'Expense',
        category: 'Operating Expense',
        fromAccount: selectedBank.bankName,
        amountETB: payAmount,
        businessActivity: p.businessActivity,
        status: 'Cleared',
        notes: `Salary payout to ${p.employeeName} (${p.month}) via ${selectedBank.bankName}`,
      })
    }

    toast({
      title: 'Payment Ticked as Paid',
      description: `${p.employeeName} marked Paid: ETB ${formatCurrency(payAmount, { hideDecimals: true })} deducted from ${selectedBank.bankName}. Wire Ref: ${refNo}.`,
      type: 'success',
    })
  }

  // Handle Add New Employee to Payroll
  const handleAddEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmpName) {
      toast({ title: 'Validation Error', description: 'Employee name is required.', type: 'error' })
      return
    }

    const base = Number(newEmpBaseSalary) || 0
    const bonus = Number(newEmpBonus) || 0
    const totalPaid = base + bonus

    addPayrollEntry({
      month: selectedMonth === 'ALL' ? 'October 2026' : selectedMonth,
      employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      employeeName: newEmpName,
      role: newEmpRole,
      department: newEmpDept,
      bankName: newEmpBank,
      bankAccountNumber: newEmpAccountNo || `1000${Math.floor(100000000 + Math.random() * 900000000)}`,
      basicSalaryETB: base,
      baseSalaryETB: base,
      bonusETB: bonus,
      totalPaidETB: totalPaid,
      netPayETB: totalPaid,
      perDiemETB: 0,
      deductionsETB: 0,
      allowancesETB: 0,
      paymentStatus: 'Approved',
      businessActivity: newEmpActivity,
      notes: bonus > 0 ? `Base salary ETB ${base} + Initial bonus ETB ${bonus}` : 'Standard monthly compensation.',
    })

    setIsAddModalOpen(false)
    setNewEmpName('')
    setNewEmpBonus(0)
    toast({
      title: 'Employee Added to Payroll',
      description: `${newEmpName} enrolled for ${selectedMonth} with company payout ${formatCurrency(totalPaid)}.`,
      type: 'success',
    })
  }

  // Execute Batch Disbursement
  const handleConfirmDisbursement = () => {
    const selectedBank = bankAccounts.find((b) => b.id === disburseBankId) || bankAccounts[0]
    disbursePayrollBatch(disburseBankId, selectedMonth === 'ALL' ? undefined : selectedMonth)
    setIsDisburseModalOpen(false)
    toast({
      title: 'Payroll Batch Disbursed Successfully',
      description: `Disbursed ${formatCurrency(pendingBatchTotal)} to ${pendingBatchList.length} staff accounts from ${selectedBank.bankName}. All staff ticked as Paid and reconciliation references generated.`,
      type: 'success',
    })
  }

  // Toggle or confirm reconciliation of a payment against a bank statement
  const handleToggleReconciliation = (p: PayrollEntry) => {
    toggleReconcilePayrollPayment(p.id, 'CBE-STMT-2026-10')
    const willBeReconciled = !p.isReconciled
    toast({
      title: willBeReconciled ? 'Payment Reconciled' : 'Reconciliation Cleared',
      description: willBeReconciled
        ? `Verified ${p.employeeName} payment (#${p.disbursementRef || p.id}) against Bank Statement CBE-STMT-2026-10.`
        : `Marked payment for ${p.employeeName} as pending bank statement match.`,
      type: willBeReconciled ? 'success' : 'info',
    })
  }

  // Copy reference to clipboard
  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref)
    toast({
      title: 'Reference Copied',
      description: `Copied "${ref}" to clipboard for bank statement search.`,
      type: 'info',
    })
  }

  // Trigger Client-side CSV Download for Bank Batch
  const handleDownloadBankBatchCSV = () => {
    const targetItems = uniqueEmployeeRoster
    const headers = [
      'Beneficiary Full Name',
      'Employee ID',
      'Designation / Role',
      'Beneficiary Bank',
      'Account Number',
      'Base Monthly Salary (ETB)',
      'Bonus (ETB)',
      'Total Amount Deducted from Company Account (ETB)',
      'Payment Narration / Reference',
      'Payment Status',
    ]

    const rows = targetItems.map((p) => [
      `"${p.employeeName}"`,
      `"${p.employeeId || p.id}"`,
      `"${p.role}"`,
      `"${p.bankName || 'Commercial Bank of Ethiopia (CBE)'}"`,
      `"${p.bankAccountNumber || '1000' + p.id.replace(/\D/g, '')}"`,
      p.basicSalaryETB,
      p.bonusETB || 0,
      getRecordTotal(p),
      `"ZARIMA-SALARY-${(p.month || 'OCT2026').replace(/\s+/g, '')}-${p.employeeName.split(' ')[0]}"`,
      `"${p.paymentStatus}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `zarima_cbe_payroll_batch_${selectedMonth.toLowerCase().replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Bank Batch File Generated',
      description: `Exported ${targetItems.length} records totaling ${formatCurrency(totalDeductedFromCompany)} formatted for CBE / Awash bulk upload.`,
      type: 'info',
    })
  }

  // Trigger Client-side CSV Download for Payment Reconciliation Ledger
  const handleDownloadReconciliationAuditCSV = () => {
    const headers = [
      'Disbursement Date',
      'Payroll Period',
      'Employee Full Name',
      'Staff ID',
      'Bank Name',
      'Bank Account Number',
      'Disbursement Reference',
      'Total Amount Deducted from Company Account (ETB)',
      'Reconciliation Status',
      'Matched Statement Reference',
      'Reconciliation Date',
    ]

    const rows = filteredLedger.map((p) => [
      `"${p.paymentDate ? p.paymentDate.split('T')[0] : '2026-09-28'}"`,
      `"${p.month}"`,
      `"${p.employeeName}"`,
      `"${p.employeeId || p.id}"`,
      `"${p.bankName || 'CBE'}"`,
      `"${p.bankAccountNumber || ''}"`,
      `"${p.disbursementRef || `CBE-PAY-2026-${p.id}`}"`,
      getRecordTotal(p),
      `"${p.isReconciled ? 'Reconciled' : 'Pending Statement Match'}"`,
      `"${p.reconciledStatementRef || ''}"`,
      `"${p.reconciledDate ? p.reconciledDate.split('T')[0] : ''}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `zarima_staff_payment_reconciliation_audit_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Reconciliation Audit Log Exported',
      description: `Exported ${filteredLedger.length} staff payment records for bank reconciliation audit.`,
      type: 'info',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Payroll & Payment Reconciliation"
        description="Employee compensation, salary raises, bonuses, and tracking the gross amounts deducted from company accounts for bank statement reconciliation."
        breadcrumbs={[
          { label: 'Finance & Accounting', href: '/finance' },
          { label: 'Staff Payroll' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-surface border border-border hover:bg-surface-elevated text-foreground transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Add Staff</span>
            </button>

            {/* Export Bank Batch Action */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-surface border border-border hover:bg-surface-elevated text-foreground transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
              <span>Export Bank Batch</span>
            </button>

            {/* Disburse Batch Action */}
            <button
              onClick={() => setIsDisburseModalOpen(true)}
              disabled={pendingBatchList.length === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl transition-all shadow-md ${
                pendingBatchList.length === 0
                  ? 'bg-surface-elevated text-muted-foreground cursor-not-allowed opacity-60'
                  : 'bg-[#22C55E] hover:bg-[#16A34A] text-black shadow-[#22C55E]/30 hover:scale-[1.02] active:scale-95'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>
                {pendingBatchList.length === 0
                  ? 'Batch Disbursed'
                  : `Disburse Batch (${pendingBatchList.length})`}
              </span>
            </button>
          </div>
        }
      />

      {/* Main Tabs Header */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
            activeTab === 'roster'
              ? 'bg-forest text-white shadow-md'
              : 'bg-surface text-muted-foreground hover:text-foreground border border-border'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Roster &amp; Monthly Pay Run</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-current font-mono">
            {uniqueEmployeeRoster.length} Staff
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
            activeTab === 'ledger'
              ? 'bg-[#22C55E] text-black shadow-md'
              : 'bg-surface text-muted-foreground hover:text-foreground border border-border'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Bank Statement Reconciliation Ledger</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-current font-mono">
            {allHistoricalPayments.length} Payments
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: UNIQUE STAFF ROSTER & MONTHLY PAY RUN (1 ROW PER EMPLOYEE)         */}
      {/* ========================================================================= */}
      {activeTab === 'roster' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* KPI Stats Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Deducted from Company Account */}
            <div className="p-4 sm:p-5 rounded-3xl border border-[#22C55E]/30 bg-[#22C55E]/5 backdrop-blur-md shadow-card">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <span>Total Company Cash Outflow</span>
                <Wallet className="w-4 h-4 text-[#22C55E]" />
              </div>
              <div className="text-2xl font-black text-[#22C55E] font-mono">
                {formatCurrency(totalDeductedFromCompany)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                <span>{uniqueEmployeeRoster.length} staff enrolled</span>
                <span className="font-bold text-[#22C55E]">{paidCount} Ticked as Paid</span>
              </div>
            </div>

            {/* Base Salaries */}
            <div className="p-4 sm:p-5 rounded-3xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <span>Base Salary Commitments</span>
                <Users className="w-4 h-4 text-forest dark:text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-foreground font-mono">
                {formatCurrency(totalBaseSalaries)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Monthly fixed salary total
              </div>
            </div>

            {/* Bonuses Awarded */}
            <div className="p-4 sm:p-5 rounded-3xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <span>Bonuses Awarded</span>
                <Gift className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <div className="text-2xl font-black text-[#FF6B00] font-mono">
                {formatCurrency(totalBonusesAwarded)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Performance bonuses added this month
              </div>
            </div>

            {/* Reconciliation Rate */}
            <div className="p-4 sm:p-5 rounded-3xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <span>Bank Statement Match</span>
                <ShieldCheck className="w-4 h-4 text-forest dark:text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-foreground font-mono">
                {reconciliationRate}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Historical payouts matched with bank debits
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-3xl border border-border bg-surface/90 backdrop-blur-md shadow-card flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Month Selector */}
              <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-2xl border border-border text-xs">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold">Pay Period:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
                >
                  {distinctMonths.map((m) => (
                    <option key={m} value={m} className="bg-surface text-foreground">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-2xl border border-border text-xs">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold">Division:</span>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-surface text-foreground">All Divisions</option>
                  <option value="Transport" className="bg-surface text-foreground">Fleet / Highway Transport</option>
                  <option value="Cement" className="bg-surface text-foreground">Cement Depot Operations</option>
                  <option value="Shared" className="bg-surface text-foreground">Shared Administration</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-2xl border border-border text-xs">
                <span className="text-muted-foreground font-semibold">Payment Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-surface text-foreground">All Staff</option>
                  <option value="Paid" className="bg-surface text-foreground">Paid (Ticked)</option>
                  <option value="Approved" className="bg-surface text-foreground">Unpaid (Awaiting Payment)</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff name, role, bank account..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>

          {/* Main Roster Table: STRICTLY 1 ROW PER EMPLOYEE */}
          <div className="rounded-3xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
            {filteredRoster.length === 0 ? (
              <EmptyState
                title="No employees found"
                description="No staff match your search or filter criteria."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-elevated/70 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Employee Full Name</th>
                      <th className="py-3.5 px-4">Role &amp; Division</th>
                      <th className="py-3.5 px-4">Bank &amp; Account Number</th>
                      <th className="py-3.5 px-4 text-right">Base Monthly Salary</th>
                      <th className="py-3.5 px-4 text-right">Bonus (If Any)</th>
                      <th className="py-3.5 px-4 text-right">Total Deducted from Company</th>
                      <th className="py-3.5 px-4 text-center">Payment Status (Ticks When Paid)</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredRoster.map((p) => {
                      const totalPaid = getRecordTotal(p)
                      const bonus = p.bonusETB || 0
                      const isPaid = p.paymentStatus === 'Paid'

                      return (
                        <tr key={p.employeeName} className="hover:bg-surface-elevated/40 transition-colors group">
                          {/* Employee Name & Staff ID */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-foreground flex items-center gap-1.5">
                              <span>{p.employeeName}</span>
                              {p.employeeId && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-muted-foreground">
                                  {p.employeeId}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              Cycle: {selectedMonth}
                            </div>
                          </td>

                          {/* Role & Division */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-medium text-foreground">{p.role}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {p.department || p.businessActivity}
                            </div>
                          </td>

                          {/* Bank & Account */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-foreground font-medium flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-muted-foreground" />
                              <span>{p.bankName || 'CBE'}</span>
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              {p.bankAccountNumber || '1000' + p.id.replace(/\D/g, '')}
                            </div>
                          </td>

                          {/* Base Monthly Salary */}
                          <td className="py-3.5 px-4 text-right font-mono text-foreground font-medium whitespace-nowrap">
                            {formatCurrency(p.basicSalaryETB, { hideDecimals: true })}
                          </td>

                          {/* Bonus (If Any) */}
                          <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                            {bonus > 0 ? (
                              <span className="font-bold text-[#FF6B00]">
                                +{formatCurrency(bonus, { hideDecimals: true })}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </td>

                          {/* Total Deducted from Company Account */}
                          <td className="py-3.5 px-4 text-right font-mono font-black text-foreground whitespace-nowrap text-sm">
                            <span className="text-[#22C55E]">
                              {formatCurrency(totalPaid, { hideDecimals: true })}
                            </span>
                          </td>

                          {/* Payment Status: TICKS WHEN PAID */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {isPaid ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Paid</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handlePayAndTickStaff(p)}
                                title="Click to pay and tick this employee"
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/30 transition-all shadow-sm hover:scale-105 active:scale-95"
                              >
                                <Wallet className="w-3 h-3" />
                                <span>Pay &amp; Tick</span>
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Open Detail & Payment History Page */}
                              <button
                                onClick={() => handleOpenDetail(p)}
                                title="View Employee Details & All Payment History"
                                className="px-2.5 py-1 rounded-xl text-xs font-bold text-foreground bg-surface-elevated hover:bg-surface-elevated/80 border border-border transition-all flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>Details &amp; History</span>
                              </button>

                              {/* Edit Salary / Give Raise or Bonus */}
                              <button
                                onClick={() => handleOpenEdit(p)}
                                title="Give a raise or add a bonus"
                                className="px-2.5 py-1 rounded-xl text-xs font-bold text-forest dark:text-emerald-400 bg-surface-elevated hover:bg-surface-elevated/80 border border-border transition-all flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Raise / Bonus</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MASTER BANK STATEMENT RECONCILIATION LEDGER                        */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Ledger KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-3xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <span>Total Historical Disbursed</span>
                <Wallet className="w-4 h-4 text-forest dark:text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-foreground font-mono">
                {formatCurrency(totalHistoricalDeducted)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Across {allHistoricalPayments.length} staff disbursements
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl border border-[#22C55E]/30 bg-[#22C55E]/5 backdrop-blur-md shadow-card">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <span>Reconciled with Statements</span>
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              </div>
              <div className="text-2xl font-black text-[#22C55E] font-mono">
                {formatCurrency(reconciledTotalETB)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                <span>{reconciledHistory.length} reconciled</span>
                <span className="font-bold text-[#22C55E] font-mono">{reconciliationRate}% match</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md shadow-card">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <span>Pending Statement Match</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-500 font-mono">
                {formatCurrency(pendingTotalETB)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {pendingHistory.length} awaiting bank statement upload
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl border border-border bg-surface/90 backdrop-blur-md shadow-card flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Bank Audit Export
                </div>
                <div className="text-xs text-muted-foreground">
                  Export payment log with bank wire references for reconciliation audit.
                </div>
              </div>
              <button
                onClick={handleDownloadReconciliationAuditCSV}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
                <span>Export Audit CSV</span>
              </button>
            </div>
          </div>

          {/* Ledger Filters */}
          <div className="p-4 rounded-3xl border border-border bg-surface/90 backdrop-blur-md shadow-card flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter by Staff Member */}
              <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-2xl border border-border text-xs">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold">Staff:</span>
                <select
                  value={ledgerEmployeeFilter}
                  onChange={(e) => setLedgerEmployeeFilter(e.target.value)}
                  className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-surface text-foreground">All Employees</option>
                  {distinctEmployees.map((emp) => (
                    <option key={emp} value={emp} className="bg-surface text-foreground">
                      {emp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Pay Period */}
              <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-2xl border border-border text-xs">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold">Period:</span>
                <select
                  value={ledgerMonthFilter}
                  onChange={(e) => setLedgerMonthFilter(e.target.value)}
                  className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-surface text-foreground">All Periods</option>
                  {distinctMonths.map((m) => (
                    <option key={m} value={m} className="bg-surface text-foreground">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Reconciliation Status */}
              <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-2xl border border-border text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-semibold">Reconciliation:</span>
                <select
                  value={ledgerReconciliationFilter}
                  onChange={(e) => setLedgerReconciliationFilter(e.target.value)}
                  className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-surface text-foreground">All States</option>
                  <option value="Reconciled" className="bg-surface text-foreground">Reconciled with Statement</option>
                  <option value="Pending" className="bg-surface text-foreground">Pending Statement Match</option>
                </select>
              </div>
            </div>

            {/* Search History */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Search bank ref, staff name, statement ref..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>

          {/* Master Table */}
          <div className="rounded-3xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
            {filteredLedger.length === 0 ? (
              <EmptyState
                title="No historical payment records found"
                description="No historical disbursement entries match your search or filter query."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-elevated/70 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Period &amp; Date</th>
                      <th className="py-3.5 px-4">Employee Full Name</th>
                      <th className="py-3.5 px-4">Bank &amp; Account Number</th>
                      <th className="py-3.5 px-4">Bank Wire Reference</th>
                      <th className="py-3.5 px-4 text-right">Deducted from Company</th>
                      <th className="py-3.5 px-4 text-center">Bank Statement Status</th>
                      <th className="py-3.5 px-4 text-center">Reconciliation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredLedger.map((p) => {
                      const displayDate = p.paymentDate
                        ? formatDateTime(p.paymentDate).split(' ')[0]
                        : 'Sep 28, 2026'
                      const wireRef = p.disbursementRef || `CBE-PAY-2026-${p.id}`
                      const totalPaid = getRecordTotal(p)

                      return (
                        <tr key={p.id} className="hover:bg-surface-elevated/40 transition-colors group">
                          {/* Period & Payment Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                            <div className="font-bold text-foreground">{p.month}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 font-sans">
                              <Clock className="w-3 h-3" />
                              <span>{displayDate}</span>
                            </div>
                          </td>

                          {/* Employee Name */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-foreground">{p.employeeName}</div>
                            <div className="text-[10px] text-muted-foreground">{p.role}</div>
                          </td>

                          {/* Bank & Account */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-medium text-foreground">{p.bankName || 'CBE'}</div>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              {p.bankAccountNumber || '1000' + p.id.replace(/\D/g, '')}
                            </div>
                          </td>

                          {/* Wire Reference */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-foreground bg-surface-elevated px-2 py-0.5 rounded border border-border">
                                {wireRef}
                              </span>
                              <button
                                onClick={() => handleCopyReference(wireRef)}
                                title="Copy reference for bank search"
                                className="p-1 rounded hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-[9px] text-muted-foreground mt-0.5">
                              Matches bank debit narration
                            </div>
                          </td>

                          {/* Total Deducted from Company Account */}
                          <td className="py-3.5 px-4 text-right font-mono font-black text-foreground whitespace-nowrap">
                            <span className="text-[#22C55E]">
                              {formatCurrency(totalPaid, { hideDecimals: true })}
                            </span>
                          </td>

                          {/* Reconciliation Status Badge */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {p.isReconciled ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Reconciled</span>
                                </span>
                                {p.reconciledStatementRef && (
                                  <span className="text-[9px] font-mono text-muted-foreground mt-0.5">
                                    Stmt: {p.reconciledStatementRef}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                  <Clock className="w-3 h-3" />
                                  <span>Pending Statement Match</span>
                                </span>
                                <span className="text-[9px] text-muted-foreground mt-0.5">
                                  Awaiting bank file
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleToggleReconciliation(p)}
                                title={p.isReconciled ? 'Click to mark as unreconciled' : 'Click to verify reconciliation with statement'}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
                                  p.isReconciled
                                    ? 'bg-surface-elevated text-muted-foreground hover:bg-surface-elevated/80 border-border'
                                    : 'bg-[#22C55E] hover:bg-[#16A34A] text-black border-transparent shadow-sm'
                                }`}
                              >
                                {p.isReconciled ? (
                                  <>
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Unmatch</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Reconcile</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleOpenDetail(p)}
                                title="View Details"
                                className="px-2.5 py-1 rounded-xl text-xs font-bold text-foreground bg-surface-elevated hover:bg-surface-elevated/80 border border-border transition-all flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>Details</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EMPLOYEE DETAIL PAGE (ALL PAYMENT HISTORY DOCUMENTED HERE)       */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-3xl bg-surface border border-border p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-surface-elevated border border-border text-foreground">
                    {selectedRecord.employeeId || selectedRecord.id}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground font-mono">
                    {selectedRecord.month}
                  </span>
                  <StatusBadge status={selectedRecord.paymentStatus} />
                </div>
                <h3 className="text-xl font-black text-foreground mt-1.5 flex items-center gap-2">
                  <span>{selectedRecord.employeeName}</span>
                </h3>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                  <span>{selectedRecord.role}</span>
                  <span>&bull;</span>
                  <span>{selectedRecord.department || selectedRecord.businessActivity}</span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Period Payout Summary */}
            <div className="my-5 p-5 rounded-2xl bg-surface-elevated/60 border border-border">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/80 text-xs">
                <div>
                  <div className="font-extrabold text-foreground">Zarima Trading S.C.</div>
                  <div className="text-muted-foreground text-[10px]">Staff Compensation &amp; Bank Disbursement Record</div>
                </div>
                <div className="text-right font-mono text-[11px] text-muted-foreground">
                  <div>Cycle: {selectedRecord.month}</div>
                  <div>Account: {selectedRecord.bankAccountNumber || '1000' + selectedRecord.id.replace(/\D/g, '')}</div>
                </div>
              </div>

              {/* Company Account Deduction Breakdown */}
              <div className="p-4 rounded-2xl bg-surface border border-border/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                  Company Account Deduction for {selectedRecord.month}
                </span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-sans">Base Monthly Salary:</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(selectedRecord.basicSalaryETB)}
                    </span>
                  </div>

                  {(selectedRecord.bonusETB || 0) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-sans">Performance / Ad-Hoc Bonus:</span>
                      <span className="font-bold text-[#FF6B00]">
                        +{formatCurrency(selectedRecord.bonusETB || 0)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border font-bold text-sm">
                    <span className="text-foreground font-sans">Total Deducted from Company Account:</span>
                    <span className="text-[#22C55E] text-base font-black">
                      {formatCurrency(getRecordTotal(selectedRecord))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wire Details Banner */}
              <div className="mt-4 p-4 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">
                    Beneficiary Bank Account
                  </div>
                  <div className="text-sm font-bold text-foreground mt-0.5">
                    {selectedRecord.bankName || 'Commercial Bank of Ethiopia (CBE)'}
                  </div>
                  <div className="font-mono text-muted-foreground text-xs mt-0.5">
                    Acct: {selectedRecord.bankAccountNumber || '1000' + selectedRecord.id.replace(/\D/g, '')}
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="text-muted-foreground font-medium">Bank Wire Reference</div>
                  <div className="font-mono font-bold text-foreground bg-surface px-2.5 py-1 rounded-lg border border-border mt-0.5 inline-block">
                    {selectedRecord.disbursementRef || `CBE-PAY-2026-${selectedRecord.id}`}
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* COMPLETE PAYMENT HISTORY DOCUMENTED UNDER THIS EMPLOYEE                  */}
            {/* ========================================================================= */}
            <div className="mb-5 p-5 rounded-3xl bg-surface border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-forest dark:text-emerald-400" />
                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                    Past Payment History for {selectedRecord.employeeName}
                  </h4>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  All past company bank deductions
                </span>
              </div>

              {/* History List */}
              <div className="divide-y divide-border/60 text-xs font-mono">
                {payroll
                  .filter((p) => p.employeeName === selectedRecord.employeeName)
                  .map((historyItem) => {
                    const isPaid = historyItem.paymentStatus === 'Paid'
                    const totalDeducted = getRecordTotal(historyItem)
                    const wire = historyItem.disbursementRef || `CBE-PAY-2026-${historyItem.id}`

                    return (
                      <div
                        key={historyItem.id}
                        className="py-3 flex items-center justify-between hover:bg-surface-elevated/40 px-2 rounded-xl transition-colors"
                      >
                        <div>
                          <div className="font-bold text-foreground font-sans flex items-center gap-2">
                            <span>{historyItem.month}</span>
                            {historyItem.bonusETB ? (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                incl. +{formatCurrency(historyItem.bonusETB, { compact: true })} bonus
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1.5">
                            <span>Wire: {wire}</span>
                            <button
                              onClick={() => handleCopyReference(wire)}
                              className="text-muted-foreground hover:text-foreground"
                              title="Copy wire reference"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <span>&bull;</span>
                            <span>{historyItem.bankName || 'CBE'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-[#22C55E]">
                              {formatCurrency(totalDeducted, { hideDecimals: true })}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-sans">
                              {historyItem.paymentStatus}
                            </div>
                          </div>

                          {/* Reconciliation Toggle Button */}
                          <div>
                            {historyItem.isReconciled ? (
                              <button
                                onClick={() => handleToggleReconciliation(historyItem)}
                                title="Click to unmatch statement"
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Reconciled
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleReconciliation(historyItem)}
                                title="Click to verify reconciliation with statement"
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/30 flex items-center gap-1"
                              >
                                <Clock className="w-3 h-3" /> Verify Reconcile
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  window.print()
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground bg-surface-elevated hover:bg-surface-elevated/80 border border-border transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Print Statement</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false)
                    handleOpenEdit(selectedRecord)
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-forest hover:bg-forest-dark transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Adjust Salary / Bonus</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-surface-elevated text-foreground font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT SALARY / COMPENSATION (GIVE A RAISE / BONUS)               */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface border border-border p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  Adjust Salary &amp; Compensation
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update base salary for a raise or grant a bonus for{' '}
                  <span className="font-bold text-foreground">{selectedRecord.employeeName}</span> ({selectedRecord.role}).
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalaryAdjustment} className="mt-4 space-y-4 text-xs">
              {/* Base Salary (The Raise Field) */}
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Base Monthly Salary (ETB) <span className="text-[#22C55E]">*Raise</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editBaseSalary}
                  onChange={(e) => setEditBaseSalary(Number(e.target.value))}
                  className="w-full p-2.5 bg-surface border border-border rounded-xl text-foreground font-mono text-sm font-bold focus:ring-1 focus:ring-forest"
                />
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Previous: {formatCurrency(selectedRecord.basicSalaryETB, { hideDecimals: true })}
                </div>
              </div>

              {/* Bonus Field */}
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Discretionary Bonus (ETB) <span className="text-[#FF6B00]">*Optional</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={editBonus}
                  onChange={(e) => setEditBonus(Number(e.target.value))}
                  className="w-full p-2.5 bg-surface border border-border rounded-xl text-foreground font-mono text-sm focus:ring-1 focus:ring-forest"
                  placeholder="0"
                />
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Add bonus when applicable (leave 0 if none)
                </div>
              </div>

              {/* Live Total Deduction Box */}
              <div className="p-4 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">
                    Total Deducted from Company Account
                  </div>
                  <div className="text-xl font-black font-mono text-[#22C55E] mt-0.5">
                    {formatCurrency(Number(editBaseSalary || 0) + Number(editBonus || 0), { hideDecimals: true })}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono text-right">
                  <div>Base: {formatCurrency(Number(editBaseSalary || 0), { compact: true })}</div>
                  <div>Bonus: +{formatCurrency(Number(editBonus || 0), { compact: true })}</div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Beneficiary Bank
                  </label>
                  <select
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-foreground font-medium"
                  >
                    <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                    <option value="Awash Bank">Awash Bank</option>
                    <option value="Dashen Bank">Dashen Bank</option>
                    <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                    <option value="Cooperative Bank of Oromia">Cooperative Bank of Oromia</option>
                    <option value="Telebirr SuperApp Merchant">Telebirr SuperApp</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editBankAccountNo}
                    onChange={(e) => setEditBankAccountNo(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-foreground font-mono"
                  />
                </div>
              </div>

              {/* Adjustment Note */}
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Reason for Adjustment / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g., Annual salary raise, performance bonus"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-xl text-foreground"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-surface-elevated text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-extrabold shadow-md shadow-[#22C55E]/30 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                >
                  Save &amp; Apply Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EXPORT BANK BATCH (CBE / AWASH FORMAT)                          */}
      {/* ========================================================================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-3xl bg-surface border border-border p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-forest dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Corporate Electronic Banking
                  </span>
                </div>
                <h3 className="text-lg font-black text-foreground mt-1">
                  Export Bank Batch Salary File
                </h3>
                <p className="text-xs text-muted-foreground">
                  Generate the direct-deposit bulk payment file for Ethiopian Commercial Banks ({selectedMonth}).
                </p>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Batch Preview Table */}
            <div className="my-4 rounded-2xl border border-border overflow-hidden">
              <div className="bg-surface-elevated px-4 py-2.5 font-bold text-xs text-foreground flex items-center justify-between border-b border-border">
                <span>Batch Manifest Preview ({uniqueEmployeeRoster.length} Staff)</span>
                <span className="font-mono text-[#22C55E]">{formatCurrency(totalDeductedFromCompany)}</span>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-border/60 text-xs">
                {uniqueEmployeeRoster.map((item) => (
                  <div key={item.employeeName} className="p-2.5 px-4 flex items-center justify-between hover:bg-surface-elevated/30">
                    <div>
                      <span className="font-bold text-foreground">{item.employeeName}</span>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {item.bankName || 'CBE'} &bull; {item.bankAccountNumber || '1000' + item.id.replace(/\D/g, '')}
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-[#22C55E]">
                      {formatCurrency(getRecordTotal(item), { hideDecimals: true })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Format: UTF-8 Standard Bank CSV Manifest
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-surface-elevated text-foreground text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBankBatchCSV}
                  className="px-5 py-2.5 rounded-full bg-forest hover:bg-forest-dark text-white font-extrabold shadow-md flex items-center gap-2 text-xs hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Bank File (CSV)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DISBURSE BATCH CONFIRMATION                                     */}
      {/* ========================================================================= */}
      {isDisburseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-3xl bg-surface border border-border p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" /> Treasury Cash Execution
                  </span>
                </div>
                <h3 className="text-lg font-black text-foreground mt-1">
                  Authorize &amp; Disburse Payroll Batch
                </h3>
                <p className="text-xs text-muted-foreground">
                  Execute disbursement for {selectedMonth} and record bank ledger entries.
                </p>
              </div>
              <button
                onClick={() => setIsDisburseModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation of what Disburse Batch does */}
            <div className="my-4 p-4 rounded-2xl bg-surface-elevated/70 border border-border text-xs space-y-2">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                <span>What does "Disburse Batch" do?</span>
              </div>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                <li>Marks all <strong className="text-foreground">{pendingBatchList.length} staff records</strong> as <span className="font-bold text-[#22C55E]">Paid</span> with a verified disbursement timestamp and bank wire reference.</li>
                <li>Deducts <strong className="text-foreground">{formatCurrency(pendingBatchTotal)}</strong> from your selected company bank account in treasury.</li>
                <li>Automatically posts an official general ledger expense entry (<em className="text-foreground">Salaries &amp; Compensation Disbursement</em>) for complete financial audit compliance.</li>
              </ol>
            </div>

            {/* Bank Account Selector */}
            <div className="mb-4">
              <label className="block font-bold text-foreground text-xs mb-1.5">
                Select Company Source Bank Account for Outflow:
              </label>
              <select
                value={disburseBankId}
                onChange={(e) => setDisburseBankId(e.target.value)}
                className="w-full p-2.5 bg-surface border border-border rounded-xl text-foreground font-mono text-xs font-bold"
              >
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} — Available: {formatCurrency(b.balanceETB, { hideDecimals: true })}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-surface border border-border text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-sans">Staff to be Disbursed:</span>
                <span className="font-bold text-foreground">{pendingBatchList.length} Employees</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-sans">Total Company Outflow:</span>
                <span className="font-black text-[#22C55E] text-sm">
                  {formatCurrency(pendingBatchTotal)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsDisburseModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border hover:bg-surface-elevated text-foreground text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisbursement}
                className="px-5 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-black shadow-md shadow-[#22C55E]/30 hover:scale-[1.02] active:scale-95 transition-all text-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm &amp; Disburse Batch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD NEW EMPLOYEE TO PAYROLL                                     */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface border border-border p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  Enroll Employee into Payroll
                </h3>
                <p className="text-xs text-muted-foreground">
                  Add a new driver, depot worker, or administrator into the compensation register.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Employee Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawit Kebede"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-xl text-foreground font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Job Title / Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Division / Business Activity
                  </label>
                  <select
                    value={newEmpActivity}
                    onChange={(e) => setNewEmpActivity(e.target.value as BusinessActivity)}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-foreground font-medium"
                  >
                    <option value="Transport">Transport (Fleet / Highway)</option>
                    <option value="Cement">Cement (Depot Operations)</option>
                    <option value="Shared">Shared Administration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Base Monthly Salary (ETB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newEmpBaseSalary}
                    onChange={(e) => setNewEmpBaseSalary(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Initial Bonus (ETB, Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newEmpBonus}
                    onChange={(e) => setNewEmpBonus(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-foreground font-mono"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Bank Name
                  </label>
                  <select
                    value={newEmpBank}
                    onChange={(e) => setNewEmpBank(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-foreground font-medium"
                  >
                    <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                    <option value="Awash Bank">Awash Bank</option>
                    <option value="Dashen Bank">Dashen Bank</option>
                    <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                    <option value="Cooperative Bank of Oromia">Cooperative Bank of Oromia</option>
                    <option value="Telebirr SuperApp Merchant">Telebirr SuperApp</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpAccountNo}
                    onChange={(e) => setNewEmpAccountNo(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-surface-elevated text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-forest hover:bg-forest-dark text-white font-extrabold shadow-md hover:scale-[1.02] active:scale-95 transition-all text-xs"
                >
                  Enroll Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
