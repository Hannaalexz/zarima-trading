import React, { useState, useMemo } from 'react'
import {
  Users,
  Wallet,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  FileText,
  DollarSign,
  AlertCircle,
  Building2,
  Truck,
  Layers,
  ArrowDownRight,
  ShieldCheck,
  Search,
  Filter,
  Receipt,
  Download,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useStore } from '@/data/storeContext'
import { useAuth } from '@/data/authContext'
import { useToast } from '@/hooks/useToast'
import { BusinessActivity, MemberFundedExpense } from '@/types'

export const MemberExpensesPage: React.FC = () => {
  const {
    members,
    memberExpenses,
    reimbursements,
    bankAccounts,
    addMemberExpense,
    reimburseMemberExpense,
    approveMemberExpense,
  } = useStore()

  const { currentUser } = useAuth()
  const { addToast } = useToast()

  // State filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [selectedActivity, setSelectedActivity] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'expenses' | 'members' | 'reimbursements'>('expenses')

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [isReimburseModalOpen, setIsReimburseModalOpen] = useState(false)
  const [reimbursingExpense, setReimbursingExpense] = useState<MemberFundedExpense | null>(null)

  // Form State for Record Expense
  const [formData, setFormData] = useState({
    memberId: members[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    amountETB: '',
    category: 'Fuel',
    businessActivity: 'Transport' as BusinessActivity,
    description: '',
    businessPurpose: '',
    supplierOrPayee: '',
    relatedEntityType: 'Truck' as 'Truck' | 'Delivery' | 'Purchase' | 'Shared Overhead',
    relatedEntityId: 'TRK-01',
    paymentMethod: 'Personal Bank Transfer' as const,
    receiptAttachmentName: 'fuel_receipt_scan.jpg',
    cementPercentage: 60,
    transportPercentage: 40,
    approvalStatus: 'Approved' as const,
  })

  // Form State for Reimburse
  const [reimburseForm, setReimburseForm] = useState({
    bankAccountId: bankAccounts[0]?.id || '',
    amountETB: '',
    bankReference: '',
    paymentMethod: 'Bank Transfer' as const,
    approvedBy: 'Bethlehem Tsegaye (Finance Lead)',
    notes: '',
  })

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return memberExpenses.filter((exp) => {
      const matchesSearch =
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.expenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.supplierOrPayee && exp.supplierOrPayee.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesMember = selectedMember === 'all' || exp.memberId === selectedMember
      const matchesActivity = selectedActivity === 'all' || exp.businessActivity === selectedActivity
      const matchesStatus = selectedStatus === 'all' || exp.reimbursementStatus === selectedStatus

      return matchesSearch && matchesMember && matchesActivity && matchesStatus
    })
  }, [memberExpenses, searchQuery, selectedMember, selectedActivity, selectedStatus])

  // Summary Metrics
  const totalFunded = useMemo(() => {
    return memberExpenses.reduce((sum, e) => (e.approvalStatus === 'Approved' ? sum + e.amountETB : sum), 0)
  }, [memberExpenses])

  const totalReimbursed = useMemo(() => {
    return memberExpenses.reduce((sum, e) => sum + e.amountReimbursedETB, 0)
  }, [memberExpenses])

  const totalOutstanding = useMemo(() => {
    return Math.max(0, totalFunded - totalReimbursed)
  }, [totalFunded, totalReimbursed])

  // Activity breakdown
  const activityBreakdown = useMemo(() => {
    let cement = 0
    let transport = 0
    let shared = 0

    memberExpenses.forEach((e) => {
      if (e.approvalStatus !== 'Approved') return
      if (e.businessActivity === 'Cement') cement += e.amountETB
      else if (e.businessActivity === 'Transport') transport += e.amountETB
      else if (e.businessActivity === 'Shared') {
        if (e.sharedAllocation) {
          cement += e.sharedAllocation.allocatedCementETB
          transport += e.sharedAllocation.allocatedTransportETB
        } else {
          shared += e.amountETB
        }
      }
    })

    return { cement, transport, shared }
  }, [memberExpenses])

  // Handle Form Submit: Record Member Expense
  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(formData.amountETB)
    if (!amount || amount <= 0) {
      addToast({ type: 'error', title: 'Invalid Amount', description: 'Please enter a valid expense amount.' })
      return
    }

    const member = members.find((m) => m.id === formData.memberId)
    if (!member) {
      addToast({ type: 'error', title: 'Member Required', description: 'Please select a company member.' })
      return
    }

    let sharedAllocation = undefined
    if (formData.businessActivity === 'Shared') {
      const cementAmt = (amount * formData.cementPercentage) / 100
      const transportAmt = (amount * formData.transportPercentage) / 100
      sharedAllocation = {
        cementPercentage: formData.cementPercentage,
        transportPercentage: formData.transportPercentage,
        allocatedCementETB: cementAmt,
        allocatedTransportETB: transportAmt,
      }
    }

    addMemberExpense({
      memberId: member.id,
      memberName: member.name,
      date: formData.date,
      amountETB: amount,
      currency: 'ETB',
      category: formData.category,
      businessActivity: formData.businessActivity,
      description: formData.description || `Member expense funded by ${member.name}`,
      businessPurpose: formData.businessPurpose || 'Operational emergency outlay',
      supplierOrPayee: formData.supplierOrPayee,
      relatedEntityType: formData.relatedEntityType,
      relatedEntityId: formData.relatedEntityId,
      paymentMethod: formData.paymentMethod,
      receiptAttachmentName: formData.receiptAttachmentName,
      approvalStatus: formData.approvalStatus,
      approvedBy: formData.approvalStatus === 'Approved' ? 'Bethlehem Tsegaye (Finance Lead)' : undefined,
      approvedAt: formData.approvalStatus === 'Approved' ? new Date().toISOString() : undefined,
      createdBy: member.name,
      sharedAllocation,
      notes: `Recorded via Member-Funded Expense Portal. Liability recognized against company. No bank deduction.`,
    })

    addToast({
      type: 'success',
      title: 'Expense Recognized',
      description: `ETB ${amount.toLocaleString()} recorded for ${formData.businessActivity}. Company owes ${member.name} ETB ${amount.toLocaleString()}. Bank balance unchanged.`,
    })

    setIsRecordModalOpen(false)
    setFormData({
      memberId: members[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      amountETB: '',
      category: 'Fuel',
      businessActivity: 'Transport',
      description: '',
      businessPurpose: '',
      supplierOrPayee: '',
      relatedEntityType: 'Truck',
      relatedEntityId: 'TRK-01',
      paymentMethod: 'Personal Bank Transfer',
      receiptAttachmentName: 'fuel_receipt_scan.jpg',
      cementPercentage: 60,
      transportPercentage: 40,
      approvalStatus: 'Approved',
    })
  }

  // Handle Reimbursement
  const openReimburseModal = (expense: MemberFundedExpense) => {
    setReimbursingExpense(expense)
    setReimburseForm({
      bankAccountId: bankAccounts[0]?.id || '',
      amountETB: String(expense.remainingOwedETB),
      bankReference: `CBE-FT-REIMB-${Math.floor(10000 + Math.random() * 90000)}`,
      paymentMethod: 'Bank Transfer',
      approvedBy:
        currentUser?.role === 'admin'
          ? `${currentUser.name} (Managing Partner & Admin)`
          : 'Dawit Tadesse (Admin Authorization)',
      notes: `Settlement for ${expense.expenseNumber} (${expense.category})`,
    })
    setIsReimburseModalOpen(true)
  }

  const handleReimburseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reimbursingExpense) return

    const amount = parseFloat(reimburseForm.amountETB)
    if (!amount || amount <= 0) {
      addToast({ type: 'error', title: 'Invalid Amount', description: 'Please enter a valid reimbursement amount.' })
      return
    }

    const res = reimburseMemberExpense({
      expenseId: reimbursingExpense.id,
      amountETB: amount,
      bankAccountId: reimburseForm.bankAccountId,
      bankReference: reimburseForm.bankReference || `TRX-REIMB-${Date.now()}`,
      paymentMethod: reimburseForm.paymentMethod,
      approvedBy: reimburseForm.approvedBy,
      notes: reimburseForm.notes,
    })

    if (!res.success) {
      addToast({ type: 'error', title: 'Reimbursement Failed', description: res.message })
      return
    }

    addToast({
      type: 'success',
      title: 'Reimbursement Recorded',
      description: `ETB ${amount.toLocaleString()} paid to ${reimbursingExpense.memberName}. Bank balance updated. Liability reduced. P&L expense not duplicated.`,
    })

    setIsReimburseModalOpen(false)
    setReimbursingExpense(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member-Funded Expenses"
        description="Accounting for out-of-pocket expenses funded personally by PLC members. Tracks liability, prevents false bank deductions, and handles structured reimbursements."
        badgeText="Capital & Liabilities"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record Member Expense</span>
            </button>
          </div>
        }
      />

      {/* Active Persona & Governance Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B00]/15 via-surface to-transparent border border-[#FF6B00]/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center font-black text-xs">
            {currentUser?.avatarInitials || 'DT'}
          </div>
          <div>
            <span className="font-bold text-foreground">
              {currentUser?.role === 'admin' ? 'Executive Governance: Dawit Tadesse (Admin)' : 'Accounting View: Bethlehem Tefera'}
            </span>
            <span className="text-muted-foreground ml-2">
              {currentUser?.role === 'admin'
                ? 'Full administrative control to approve member expenses and disburse partial reimbursements across all 10 bank accounts.'
                : 'Accounting review active. All member outlay recognition debits balance sheet liability; cash reimbursement payouts are executed under Admin governance.'}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 flex-shrink-0">
          {currentUser?.role === 'admin' ? 'Admin Full Control' : 'Admin Sign-off Required'}
        </span>
      </div>

      {/* Signature Dark Cards Metric Showcase (User Requested Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Total Funded */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#22C55E]/40 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#22C55E]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Total Member Funded</span>
            <Users className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ETB {totalFunded.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#22C55E] mt-2 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Recognized in P&amp;L; no bank drain</span>
          </div>
        </div>

        {/* Card 2: Total Reimbursed */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#22C55E]/30 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#22C55E]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Settled &amp; Reimbursed</span>
            <Wallet className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ETB {totalReimbursed.toLocaleString()}
          </div>
          <div className="text-[11px] text-white/70 mt-2 flex items-center gap-1 font-semibold">
            <ArrowDownRight className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Paid from company bank accounts</span>
          </div>
        </div>

        {/* Card 3: Outstanding Liability (Electric Orange highlight) */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#FF6B00]/50 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#FF6B00]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Outstanding Member Debt</span>
            <AlertCircle className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="text-2xl font-black text-[#FF6B00] tracking-tight">
            ETB {totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#FF6B00] mt-2 flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Company balance sheet liability</span>
          </div>
        </div>

        {/* Card 4: Operating Activity Split */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#22C55E]/30 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Activity Allocation</span>
            <Layers className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between items-center text-white/90">
              <span className="flex items-center gap-1 text-[11px]">
                <Truck className="w-3 h-3 text-[#FF6B00]" /> Transport:
              </span>
              <span className="font-bold">ETB {activityBreakdown.transport.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-white/90">
              <span className="flex items-center gap-1 text-[11px]">
                <Building2 className="w-3 h-3 text-[#22C55E]" /> Cement:
              </span>
              <span className="font-bold">ETB {activityBreakdown.cement.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accounting Compliance Banner */}
      <div className="rounded-2xl p-4 bg-surface-elevated border border-[#22C55E]/30 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-foreground block">
              Accounting Safeguard Active: Clean Balance Sheet &amp; P&amp;L Integrity
            </span>
            <span className="text-muted-foreground text-[11px]">
              Operating expenses are debited at recognition without false bank withdrawals. Reimbursements reduce bank balances and member liability without double-counting expenses in P&amp;L.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] border border-[#22C55E]/30">
            3 Active Partners
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expenses'
              ? 'bg-[#22C55E] text-[#060B08] shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
          }`}
        >
          All Member Expenses ({memberExpenses.length})
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'members'
              ? 'bg-[#22C55E] text-[#060B08] shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
          }`}
        >
          Partner Balances &amp; Ledgers ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('reimbursements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reimbursements'
              ? 'bg-[#22C55E] text-[#060B08] shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
          }`}
        >
          Reimbursement Audit History ({reimbursements.length})
        </button>
      </div>

      {/* TAB 1: ALL MEMBER EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-surface border border-border">
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search expense, member, purpose..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-surface-elevated border border-border focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-surface-elevated border border-border focus:outline-none"
              >
                <option value="all">All Members</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-surface-elevated border border-border focus:outline-none"
              >
                <option value="all">All Activities</option>
                <option value="Transport">Transport &amp; Fleet</option>
                <option value="Cement">Cement Trading</option>
                <option value="Shared">Shared Overhead</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-surface-elevated border border-border focus:outline-none"
              >
                <option value="all">All Settlement Statuses</option>
                <option value="Unreimbursed">Unreimbursed</option>
                <option value="Partially Reimbursed">Partially Reimbursed</option>
                <option value="Fully Reimbursed">Fully Reimbursed</option>
              </select>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Ref &amp; Date</th>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Category &amp; Purpose</th>
                    <th className="py-3 px-4">Activity</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Reimbursed</th>
                    <th className="py-3 px-4">Outstanding Owed</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-foreground">{exp.expenseNumber}</div>
                        <div className="text-[11px] text-muted-foreground">{exp.date}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground">{exp.memberName}</div>
                        <div className="text-[10px] text-muted-foreground">{exp.paymentMethod}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-foreground line-clamp-1">{exp.description}</div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          {exp.supplierOrPayee || exp.businessPurpose}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            exp.businessActivity === 'Transport'
                              ? 'bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30'
                              : exp.businessActivity === 'Cement'
                              ? 'bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] border border-[#22C55E]/30'
                              : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {exp.businessActivity}
                        </span>
                        {exp.sharedAllocation && (
                          <div className="text-[9.5px] text-muted-foreground mt-0.5">
                            {exp.sharedAllocation.cementPercentage}% C / {exp.sharedAllocation.transportPercentage}% T
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        ETB {exp.amountETB.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#16A34A] dark:text-[#22C55E]">
                        ETB {exp.amountReimbursedETB.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#FF6B00]">
                        ETB {exp.remainingOwedETB.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={exp.reimbursementStatus}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {exp.remainingOwedETB > 0.01 && exp.approvalStatus === 'Approved' ? (
                          <button
                            onClick={() => openReimburseModal(exp)}
                            className="px-3 py-1.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#060B08] font-bold text-[11px] shadow-xs transition-all active:scale-95 inline-flex items-center gap-1"
                          >
                            <span>Reimburse</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-medium">Fully Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-muted-foreground">
                        No member-funded expenses match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERS & LIABILITIES LEDGER */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {members.map((member) => (
            <div
              key={member.id}
              className="rounded-3xl p-5 bg-surface border border-border hover:border-[#22C55E]/50 shadow-card transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-foreground">{member.name}</h3>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] flex items-center justify-center font-bold">
                  {member.name.charAt(0)}
                </div>
              </div>

              <div className="space-y-2 py-3 border-y border-border/70 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Funded Outlay:</span>
                  <span className="font-bold text-foreground">ETB {member.totalFundedETB.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Reimbursed:</span>
                  <span className="font-bold text-[#16A34A] dark:text-[#22C55E]">
                    ETB {member.totalReimbursedETB.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border/50 text-sm">
                  <span className="font-bold text-foreground">Company Liability Owed:</span>
                  <span className="font-black text-[#FF6B00]">ETB {member.outstandingBalanceETB.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground">
                <div>Phone: {member.phone}</div>
                <div>Email: {member.email}</div>
              </div>

              <button
                onClick={() => {
                  setSelectedMember(member.id)
                  setActiveTab('expenses')
                }}
                className="w-full py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Member Outlays</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: REIMBURSEMENT AUDIT HISTORY */}
      {activeTab === 'reimbursements' && (
        <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-elevated text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Reimbursement Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Member Credited</th>
                  <th className="py-3 px-4">Source Company Bank</th>
                  <th className="py-3 px-4">Bank Ref</th>
                  <th className="py-3 px-4">Amount Reimbursed</th>
                  <th className="py-3 px-4">Approved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reimbursements.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">{r.reimbursementNumber}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.date}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{r.memberName}</td>
                    <td className="py-3 px-4 text-foreground">{r.companyBankName}</td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{r.bankReference}</td>
                    <td className="py-3 px-4 font-bold text-[#16A34A] dark:text-[#22C55E]">
                      ETB {r.amountETB.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{r.approvedBy}</td>
                  </tr>
                ))}
                {reimbursements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No member reimbursements recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD MEMBER EXPENSE MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Record Member-Funded Expense</h3>
                <p className="text-xs text-muted-foreground">
                  Recognizes operating expense and credits company liability to the member. Does not touch bank accounts.
                </p>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-elevated hover:bg-border flex items-center justify-center text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Company Member *</label>
                  <select
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                    required
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Expense Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Amount (ETB) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 20000"
                    value={formData.amountETB}
                    onChange={(e) => setFormData({ ...formData, amountETB: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Expense Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                  >
                    <option value="Fuel">Fuel (Diesel Outlay)</option>
                    <option value="Truck Maintenance">Truck Maintenance &amp; Repairs</option>
                    <option value="Toll Fees">Highway Tolls &amp; Weighbridge</option>
                    <option value="Spare Parts">Vehicle Spare Parts</option>
                    <option value="Depot Rent">Depot Yard Rent &amp; Storage</option>
                    <option value="Office Supplies">Office &amp; IT Connectivity</option>
                    <option value="General Overhead">General Operating Overhead</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Business Activity *</label>
                  <select
                    value={formData.businessActivity}
                    onChange={(e) =>
                      setFormData({ ...formData, businessActivity: e.target.value as BusinessActivity })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                  >
                    <option value="Transport">Transport &amp; Fleet</option>
                    <option value="Cement">Cement Trading</option>
                    <option value="Shared">Shared / General Overhead</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Supplier / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. NOC Sululta Expressway Station"
                    value={formData.supplierOrPayee}
                    onChange={(e) => setFormData({ ...formData, supplierOrPayee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                  />
                </div>
              </div>

              {/* Shared Allocation percentage slider if Shared */}
              {formData.businessActivity === 'Shared' && (
                <div className="p-3 rounded-2xl bg-surface-elevated border border-border space-y-2">
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Shared Expense Allocation Split</span>
                    <span className="text-[#22C55E]">
                      {formData.cementPercentage}% Cement / {formData.transportPercentage}% Transport
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.cementPercentage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      setFormData({
                        ...formData,
                        cementPercentage: val,
                        transportPercentage: 100 - val,
                      })
                    }}
                    className="w-full accent-[#22C55E]"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-foreground mb-1">Description &amp; Purpose *</label>
                <textarea
                  rows={2}
                  placeholder="Explain why the member paid out-of-pocket and the business justification..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Member Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as typeof formData.paymentMethod })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                  >
                    <option value="Personal Bank Transfer">Personal Bank Transfer</option>
                    <option value="Cash">Cash (Out-of-Pocket)</option>
                    <option value="Telebirr">Telebirr Wallet</option>
                    <option value="Personal Card">Personal Debit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Supporting Receipt / Attachment</label>
                  <div className="px-3 py-2 rounded-xl bg-surface-elevated border border-border flex items-center justify-between text-muted-foreground">
                    <span className="truncate">{formData.receiptAttachmentName}</span>
                    <Receipt className="w-4 h-4 text-[#22C55E]" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-surface-elevated font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Record &amp; Recognize Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REIMBURSE MEMBER MODAL */}
      {isReimburseModalOpen && reimbursingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Reimburse Member Liability</h3>
                <p className="text-xs text-muted-foreground">
                  Settles liability owed to {reimbursingExpense.memberName} from company treasury.
                </p>
              </div>
              <button
                onClick={() => setIsReimburseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-elevated hover:bg-border flex items-center justify-center text-muted-foreground"
              >
                ✕
              </button>
            </div>

            {/* Expense details review card */}
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span>{reimbursingExpense.expenseNumber}: {reimbursingExpense.category}</span>
                <span className="text-[#FF6B00]">ETB {reimbursingExpense.amountETB.toLocaleString()}</span>
              </div>
              <div className="text-muted-foreground">{reimbursingExpense.description}</div>
              <div className="flex justify-between pt-1 border-t border-border/60 text-[11px]">
                <span>Already Reimbursed: ETB {reimbursingExpense.amountReimbursedETB.toLocaleString()}</span>
                <span className="font-bold text-[#FF6B00]">
                  Max Allowed Now: ETB {reimbursingExpense.remainingOwedETB.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleReimburseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Company Bank Account to Pay From *</label>
                <select
                  value={reimburseForm.bankAccountId}
                  onChange={(e) => setReimburseForm({ ...reimburseForm, bankAccountId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                  required
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} ({b.accountNumber}) — Bal: ETB {b.balanceETB.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Reimbursement Amount (ETB) *</label>
                  <input
                    type="number"
                    step="0.01"
                    max={reimbursingExpense.remainingOwedETB}
                    value={reimburseForm.amountETB}
                    onChange={(e) => setReimburseForm({ ...reimburseForm, amountETB: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Bank Wire Reference *</label>
                  <input
                    type="text"
                    value={reimburseForm.bankReference}
                    onChange={(e) => setReimburseForm({ ...reimburseForm, bankReference: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Payment Method</label>
                  <select
                    value={reimburseForm.paymentMethod}
                    onChange={(e) =>
                      setReimburseForm({ ...reimburseForm, paymentMethod: e.target.value as typeof reimburseForm.paymentMethod })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                  >
                    <option value="Bank Transfer">Direct Wire Transfer</option>
                    <option value="Cheque">Company Cheque</option>
                    <option value="Cash">Cash Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Approved By</label>
                  <input
                    type="text"
                    value={reimburseForm.approvedBy}
                    onChange={(e) => setReimburseForm({ ...reimburseForm, approvedBy: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[11px] text-foreground space-y-1">
                <span className="font-bold flex items-center gap-1 text-[#16A34A] dark:text-[#22C55E]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accounting Verification
                </span>
                <p className="text-muted-foreground">
                  Debits Member Liability. Credits Company Bank Account. Generates a bank reconciliation entry. Will NOT duplicate expense in Profit &amp; Loss.
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReimburseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-surface-elevated font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#060B08] font-bold shadow-md active:scale-95 transition-all"
                >
                  Confirm &amp; Disburse Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
