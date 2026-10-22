import React, { useState, useMemo } from 'react'
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileSpreadsheet,
  FileText,
  FileCheck,
  Lock,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Download,
  AlertCircle,
  Eye,
  RefreshCw,
  Clock,
  Landmark,
  XCircle,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Edit3,
  Save,
  ExternalLink,
  Check,
  X,
  FileDown,
  ChevronDown,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useStore } from '@/data/storeContext'
import { useAuth } from '@/data/authContext'
import { useToast } from '@/hooks/useToast'
import {
  AnnualBeginningBalance,
  BankAccount,
  BankStatement,
  BankStatementTransaction,
  BusinessActivity,
  ReconciliationMatchStatus,
} from '@/types'
import { downloadImportTemplate, IMPORT_TEMPLATES } from '@/lib/downloadTemplates'

export const ReconciliationPage: React.FC = () => {
  const {
    bankAccounts,
    annualBeginningBalances,
    updateAnnualBeginningBalance,
    addAnnualBeginningBalance,
    bankStatements,
    transactions,
    reconciliations,
    importBankStatement,
    reconcileStatementTransaction,
    postUnmatchedStatementTransaction,
    lockBankStatement,
    addTransaction,
  } = useStore()

  const { currentUser } = useAuth()
  const { addToast } = useToast()

  const normalizeBankId = (id?: string) => (id || '').replace(/^BA-/, 'BANK-')

  // View mode switcher: daily statements vs annual balances
  const [activeViewMode, setActiveViewMode] = useState<'daily_statements' | 'annual_balances'>('daily_statements')
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(2026)

  // Download Templates Modal
  const [isDownloadTemplatesModalOpen, setIsDownloadTemplatesModalOpen] = useState(false)

  // Editing Beginning Balance inline
  const [editingBalanceId, setEditingBalanceId] = useState<string | null>(null)
  const [editingBalanceVal, setEditingBalanceVal] = useState<string>('')
  const [editingBalanceNotes, setEditingBalanceNotes] = useState<string>('')

  // Add Beginning Balance Modal
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false)
  const [newBalanceBankId, setNewBalanceBankId] = useState<string>(bankAccounts[0]?.id || 'BANK-01')
  const [newBalanceYear, setNewBalanceYear] = useState<number>(2026)
  const [newBalanceAmount, setNewBalanceAmount] = useState<string>('5000000')
  const [newBalanceVoucher, setNewBalanceVoucher] = useState<string>('OPB-2026-NEW')
  const [newBalanceNotes, setNewBalanceNotes] = useState<string>('Audited opening balance carryforward')

  // Selected bank account tab
  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts[0]?.id || 'BANK-01')
  const [selectedStatementId, setSelectedStatementId] = useState<string>(
    bankStatements[0]?.id || ''
  )
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Statement Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadStep, setUploadStep] = useState<'select' | 'preview' | 'result'>('select')
  const [uploadBankId, setUploadBankId] = useState<string>(bankAccounts[0]?.id || 'BANK-01')
  const [periodStart, setPeriodStart] = useState('2026-10-01')
  const [periodEnd, setPeriodEnd] = useState('2026-10-15')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState('cbe_statement_oct2026.xlsx')
  const [fileFormat, setFileFormat] = useState<'xlsx' | 'xls' | 'pdf' | 'docx'>('xlsx')
  const [openingBalance, setOpeningBalance] = useState('12540000')
  const [closingBalance, setClosingBalance] = useState('14850230.50')

  // Sample extracted transactions preview
  const [previewTransactions, setPreviewTransactions] = useState<BankStatementTransaction[]>([])

  // Manual link modal
  const [manualLinkTx, setManualLinkTx] = useState<BankStatementTransaction | null>(null)
  const [selectedInternalTxId, setSelectedInternalTxId] = useState('')

  // Classify & Post Unmatched Modal
  const [classifyTx, setClassifyTx] = useState<BankStatementTransaction | null>(null)
  const [classifyCategory, setClassifyCategory] = useState('Bank Service Charges & Fees')
  const [classifyActivity, setClassifyActivity] = useState<BusinessActivity>('Shared')
  const [classifyNotes, setClassifyNotes] = useState('')

  // Active Bank Account (matches the selected tab)
  const activeBankAccount = useMemo(() => {
    return (
      bankAccounts.find((b) => normalizeBankId(b.id) === normalizeBankId(selectedBankId)) ||
      bankAccounts[0]
    )
  }, [bankAccounts, selectedBankId])

  // Active statement
  const activeStatement = useMemo(() => {
    // 1. Try to find statement matching the selected bank account
    const stmtsForBank = bankStatements.filter(
      (s) => normalizeBankId(s.bankAccountId || (s as any).accountId) === normalizeBankId(selectedBankId)
    )
    if (stmtsForBank.length > 0) {
      if (selectedStatementId) {
        const found = stmtsForBank.find((s) => s.id === selectedStatementId)
        if (found) return found
      }
      return stmtsForBank[0]
    }
    // 2. If user specifically selected a statement ID
    if (selectedStatementId) {
      const match = bankStatements.find((s) => s.id === selectedStatementId)
      if (match) return match
    }
    // 3. If selected bank has no statements, return null to show clear empty state
    return null
  }, [bankStatements, selectedStatementId, selectedBankId])

  // Filtered statement transactions
  const filteredStatementTransactions = useMemo(() => {
    if (!activeStatement || !activeStatement.transactions) return []
    return (activeStatement.transactions || []).filter((tx) => {
      const desc = (tx.description || '').toLowerCase()
      const ref = (tx.reference || (tx as any).referenceNumber || '').toLowerCase()
      const party = (tx.counterpartyName || '').toLowerCase()
      const q = searchQuery.toLowerCase()

      const matchesSearch = desc.includes(q) || ref.includes(q) || party.includes(q)
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [activeStatement, searchQuery, statusFilter])

  // Summary Metrics
  const summary = useMemo(() => {
    if (!activeStatement || !activeStatement.transactions) {
      return {
        matched: 0,
        needsReview: 0,
        unmatched: 0,
        total: 0,
        percent: 0,
      }
    }
    const txs = activeStatement.transactions || []
    const matched = txs.filter((t) => t.status === 'Matched').length
    const needsReview = txs.filter((t) => t.status === 'Needs Review').length
    const unmatched = txs.filter(
      (t) => t.status === 'Unmatched Bank Transaction' || t.status === 'Unmatched Internal Transaction'
    ).length
    const total = txs.length
    const percent = total > 0 ? Math.round((matched / total) * 100) : 0

    return { matched, needsReview, unmatched, total, percent }
  }, [activeStatement])

  // File Upload Handlers
  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls', 'pdf', 'docx', 'doc'].includes(ext || '')) {
      addToast({
        type: 'error',
        title: 'Unsupported File Format',
        description: 'Please upload an Excel (.xlsx, .xls), PDF (.pdf), or Word (.docx) statement.',
      })
      return
    }

    setUploadedFile(file)
    setUploadedFileName(file.name)
    setFileFormat(ext as typeof fileFormat)

    // Generate realistic parsed preview data based on uploaded bank
    const bank = bankAccounts.find((b) => b.id === uploadBankId) || bankAccounts[0]
    const parsedData: BankStatementTransaction[] = [
      {
        id: `STX-${Date.now()}-1`,
        statementId: '',
        transactionDate: '2026-10-18',
        description: 'FT INWARD SUNSHINE CONST CUST INV-2026-382',
        reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        creditETB: 1000000,
        runningBalanceETB: parseFloat(closingBalance) || 15850230.5,
        counterpartyName: 'Sunshine Construction Plc',
        fingerprint: `fp_${Date.now()}_1`,
        status: 'Needs Review',
        isReconciled: false,
      },
      {
        id: `STX-${Date.now()}-2`,
        statementId: '',
        transactionDate: '2026-10-17',
        description: 'DSH WIRE TRF FLEET FUEL OCT QUOTA NOC',
        reference: 'DSH-PAY-19284',
        debitETB: 350000,
        runningBalanceETB: parseFloat(closingBalance) - 350000,
        counterpartyName: 'National Oil Ethiopia (NOC)',
        fingerprint: `fp_${Date.now()}_2`,
        status: 'Matched',
        isReconciled: true,
      },
      {
        id: `STX-${Date.now()}-3`,
        statementId: '',
        transactionDate: '2026-10-16',
        description: 'MONTHLY ELECTRONIC BANKING TAX & CHARGES',
        reference: `FEE-${Math.floor(1000 + Math.random() * 9000)}`,
        debitETB: 1450,
        runningBalanceETB: parseFloat(closingBalance) - 351450,
        counterpartyName: bank.bankName,
        fingerprint: `fp_${Date.now()}_3`,
        status: 'Unmatched Bank Transaction',
        isReconciled: false,
      },
    ]

    setPreviewTransactions(parsedData)
    setUploadStep('preview')
  }

  // Preview Row Editing Handlers
  const handleUpdatePreviewRow = (id: string, field: keyof BankStatementTransaction, value: any) => {
    setPreviewTransactions((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  const handleDeletePreviewRow = (id: string) => {
    setPreviewTransactions((prev) => prev.filter((row) => row.id !== id))
  }

  const handleAddPreviewRow = () => {
    const newRow: BankStatementTransaction = {
      id: `STX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      statementId: '',
      transactionDate: periodEnd,
      description: 'Manual Statement Entry',
      reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      debitETB: 0,
      creditETB: 0,
      runningBalanceETB: parseFloat(closingBalance) || 0,
      counterpartyName: '',
      fingerprint: `fp_${Date.now()}`,
      status: 'Needs Review',
      isReconciled: false,
    }
    setPreviewTransactions((prev) => [...prev, newRow])
  }

  const handleConfirmImport = () => {
    if (previewTransactions.length === 0) {
      addToast({
        type: 'error',
        title: 'No Transactions',
        description: 'Please add or extract at least one statement transaction before importing.',
      })
      return
    }

    const bank = bankAccounts.find((b) => b.id === uploadBankId) || bankAccounts[0]
    const statementNum = `${bank.bankName.substring(0, 3).toUpperCase()}-STMT-${Date.now().toString().slice(-6)}`
    const totalDebits = previewTransactions.reduce((acc, t) => acc + (t.debitETB || 0), 0)
    const totalCredits = previewTransactions.reduce((acc, t) => acc + (t.creditETB || 0), 0)

    const newStatement: BankStatement = {
      id: `STMT-${Date.now()}`,
      statementNumber: statementNum,
      bankAccountId: bank.id,
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      periodStart,
      periodEnd,
      fileName: uploadedFileName,
      fileFormat,
      uploadDate: new Date().toISOString(),
      uploadedBy: 'Bethlehem Tsegaye (Finance Lead)',
      openingBalanceETB: parseFloat(openingBalance) || 12540000,
      closingBalanceETB: parseFloat(closingBalance) || 14850230.5,
      totalDebitsETB: totalDebits,
      totalCreditsETB: totalCredits,
      transactionCount: previewTransactions.length,
      matchedCount: 0,
      needsReviewCount: 0,
      unmatchedCount: 0,
      status: 'Needs Review',
      isLocked: false,
      transactions: previewTransactions,
    }

    const res = importBankStatement(newStatement)
    if (!res.success) {
      addToast({
        type: 'error',
        title: 'Import Prevented',
        description: res.message,
      })
      return
    }

    addToast({
      type: 'success',
      title: 'Statement Imported & Analyzed',
      description: res.message,
    })

    setSelectedStatementId(newStatement.id)
    setIsUploadModalOpen(false)
    setUploadStep('select')
  }

  // Handle Manual Match Candidates
  const manualLinkCandidates = useMemo(() => {
    if (!manualLinkTx) return []
    const amount = (manualLinkTx.creditETB || 0) + (manualLinkTx.debitETB || 0)
    const txDate = manualLinkTx.transactionDate || (manualLinkTx as any).date || '2026-10-15'
    return transactions.map((t) => {
      const isExactAmount = Math.abs(t.amountETB - amount) < 0.01
      const dateDiff = Math.abs((new Date(txDate).getTime() - new Date(t.date).getTime()) / (1000 * 3600 * 24))
      return {
        ...t,
        isExactAmount,
        dateDiff: isNaN(dateDiff) ? 0 : Math.round(dateDiff),
      }
    }).sort((a, b) => {
      if (a.isExactAmount && !b.isExactAmount) return -1
      if (!a.isExactAmount && b.isExactAmount) return 1
      return a.dateDiff - b.dateDiff
    })
  }, [manualLinkTx, transactions])

  const handleOpenManualMatch = (tx: BankStatementTransaction) => {
    setManualLinkTx(tx)
    const amount = (tx.creditETB || 0) + (tx.debitETB || 0)
    const exact = transactions.find((t) => Math.abs(t.amountETB - amount) < 0.01)
    setSelectedInternalTxId(exact?.id || transactions[0]?.id || '')
  }

  const handleConfirmManualMatch = () => {
    if (!activeStatement || !manualLinkTx || !selectedInternalTxId) return

    reconcileStatementTransaction(activeStatement.id, manualLinkTx.id, selectedInternalTxId, 'manual_match')
    addToast({
      type: 'success',
      title: 'Manual Match Confirmed',
      description: `Statement line ${manualLinkTx.reference} matched to internal transaction. Status updated to Matched.`,
    })
    setManualLinkTx(null)
  }

  // Handle Classify & Post for Unmatched Bank Lines (no duplicate accounting entry)
  const handleConfirmClassifyPost = () => {
    if (!activeStatement || !classifyTx) return

    postUnmatchedStatementTransaction(
      activeStatement.id,
      classifyTx.id,
      classifyCategory,
      classifyActivity,
      classifyNotes
    )

    addToast({
      type: 'success',
      title: 'Ledger Entry Created & Reconciled',
      description: `Recorded "${classifyCategory}" in ledger. Statement transaction marked as Reconciled.`,
    })
    setClassifyTx(null)
  }

  // Handle Lock Statement
  const handleLock = () => {
    if (!activeStatement) return
    lockBankStatement(activeStatement.id, 'Bethlehem Tsegaye (Chief Accountant)')
    addToast({
      type: 'success',
      title: 'Reconciliation Locked',
      description: 'Statement locked against accidental edits. Audit trail permanently preserved.',
    })
  }

  // Annual Beginning Balance calculations & helpers
  const fiscalYears = [2026, 2025, 2024]

  const filteredBalances = useMemo(() => {
    return annualBeginningBalances.filter((b) => b.fiscalYear === selectedFiscalYear)
  }, [annualBeginningBalances, selectedFiscalYear])

  const totalAnnualBeginningBalance = useMemo(() => {
    return filteredBalances.reduce((sum, b) => sum + b.beginningBalanceETB, 0)
  }, [filteredBalances])

  const auditedAccountsCount = useMemo(() => {
    return filteredBalances.filter((b) => b.status === 'Audited').length
  }, [filteredBalances])

  // Current bank account's annual beginning balance for the active year (2026)
  const activeBankBeginningBalance = useMemo(() => {
    if (!activeBankAccount) return null
    return annualBeginningBalances.find(
      (b) =>
        b.fiscalYear === 2026 &&
        (normalizeBankId(b.bankAccountId) === normalizeBankId(activeBankAccount.id) ||
          b.bankName.toLowerCase().includes(activeBankAccount.bankName.split('(')[0].trim().toLowerCase()))
    )
  }, [annualBeginningBalances, activeBankAccount])

  const handleStartEditBalance = (item: AnnualBeginningBalance) => {
    setEditingBalanceId(item.id)
    setEditingBalanceVal(item.beginningBalanceETB.toString())
    setEditingBalanceNotes(item.notes || '')
  }

  const handleSaveEditedBalance = (item: AnnualBeginningBalance) => {
    const parsed = parseFloat(editingBalanceVal)
    if (isNaN(parsed) || parsed < 0) {
      addToast({
        type: 'error',
        title: 'Invalid Amount',
        description: 'Please enter a valid non-negative beginning balance amount.',
      })
      return
    }
    updateAnnualBeginningBalance(item.id, parsed, editingBalanceNotes)
    addToast({
      type: 'success',
      title: 'Annual Beginning Balance Updated',
      description: `${item.bankName} (${item.fiscalYear}) updated to ETB ${parsed.toLocaleString()}.`,
    })
    setEditingBalanceId(null)
  }

  const handleAddNewBeginningBalance = () => {
    const bank = bankAccounts.find((b) => b.id === newBalanceBankId) || bankAccounts[0]
    const parsed = parseFloat(newBalanceAmount)
    if (isNaN(parsed) || parsed < 0) {
      addToast({
        type: 'error',
        title: 'Invalid Amount',
        description: 'Please enter a valid non-negative beginning balance amount.',
      })
      return
    }

    addAnnualBeginningBalance({
      fiscalYear: newBalanceYear,
      fiscalYearName: `FY ${newBalanceYear} (${newBalanceYear - 8} E.C.)`,
      startDate: `${newBalanceYear}-01-01`,
      bankAccountId: bank.id,
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      beginningBalanceETB: parsed,
      openingBalanceVoucherRef: newBalanceVoucher || `OPB-${newBalanceYear}-${bank.bankName.substring(0, 3).toUpperCase()}`,
      verifiedBy: currentUser?.name || 'Bethlehem Tefera (Finance Lead)',
      status: 'Audited',
      notes: newBalanceNotes || 'Annual opening ledger certified',
    })

    addToast({
      type: 'success',
      title: 'Beginning Balance Created',
      description: `Added opening balance for ${bank.bankName} (FY ${newBalanceYear}).`,
    })
    setIsAddBalanceModalOpen(false)
  }

  const handleDownloadAllTemplates = () => {
    const keys = Object.keys(IMPORT_TEMPLATES) as Array<keyof typeof IMPORT_TEMPLATES>
    keys.forEach((key, index) => {
      setTimeout(() => {
        downloadImportTemplate(key)
      }, index * 200)
    })
    addToast({
      type: 'success',
      title: 'Templates Downloading',
      description: 'Downloaded all 6 official Excel / CSV templates to your computer.',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Reconciliation & Annual Balances"
        description="Extract, normalize, and match official bank statements (.xlsx, .pdf, .docx) against company ledgers across all 10 corporate bank accounts, anchored by certified annual beginning balances."
        badgeText="Treasury Operations"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Switcher Tabs */}
            <div className="p-1 rounded-xl bg-surface border border-border flex items-center gap-1 shadow-xs">
              <button
                onClick={() => setActiveViewMode('daily_statements')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'daily_statements'
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Statements &amp; Auto-Reconcile</span>
              </button>
              <button
                onClick={() => setActiveViewMode('annual_balances')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'annual_balances'
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Annual Beginning Balances</span>
              </button>
            </div>

            {/* Download All Import Templates Button */}
            <button
              onClick={() => setIsDownloadTemplatesModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-forest/50 text-foreground font-bold text-xs shadow-xs transition-all active:scale-95"
              title="Download official CSV templates for bank statements, fleet odometers, cement purchases, payroll, etc."
            >
              <Download className="w-4 h-4 text-forest" />
              <span>Download Templates</span>
            </button>

            {/* Import Bank Statement Button */}
            <button
              onClick={() => {
                setUploadStep('select')
                setIsUploadModalOpen(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Import Statement</span>
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
              {currentUser?.role === 'accountant' ? 'Reconciliation Desk: Bethlehem Tefera' : 'Administrator: Dawit Tadesse'}
            </span>
            <span className="text-muted-foreground ml-2">
              Automated multi-bank reconciliation engine matching statement lines against internal transaction journals across 10 bank accounts.
            </span>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#16A34A] dark:text-[#22C55E] border border-[#22C55E]/30 flex-shrink-0">
          Reconciliation Desk
        </span>
      </div>

      {activeViewMode === 'annual_balances' ? (
        <div className="space-y-6">
          {/* Fiscal Year Selector Header */}
          <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-foreground text-sm uppercase tracking-wider">Company Fiscal Year Opening Balances</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-forest/15 text-forest border border-forest/30">
                  Audited Carryforward
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Statutory opening cash &amp; bank ledger positions for Zarima Trading across corporate accounts. Required anchor for all bank reconciliations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-surface-elevated p-1 rounded-xl border border-border">
                {fiscalYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedFiscalYear(year)
                      setEditingBalanceId(null)
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedFiscalYear === year
                        ? 'bg-forest text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    FY {year} ({year - 8} E.C.)
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setNewBalanceYear(selectedFiscalYear)
                  setIsAddBalanceModalOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Account Balance</span>
              </button>
            </div>
          </div>

          {/* Signature Dark Cards Metric Showcase for Annual Opening Balances */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Card 1: Total Corporate Opening Cash */}
            <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-forest/40 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-forest/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
                <span className="uppercase tracking-wider">Total Corporate Opening Balance</span>
                <Landmark className="w-4 h-4 text-forest" />
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                ETB {totalAnnualBeginningBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-forest mt-2 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Across all corporate bank accounts (FY {selectedFiscalYear})</span>
              </div>
            </div>

            {/* Card 2: Audited Accounts Verification */}
            <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-forest/30 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-28 h-28 bg-forest/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
                <span className="uppercase tracking-wider">Audit Certification</span>
                <ShieldCheck className="w-4 h-4 text-forest" />
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {auditedAccountsCount} / {filteredBalances.length} Accounts Certified
              </div>
              <div className="text-[11px] text-white/70 mt-2 flex items-center gap-1 font-semibold">
                <span>100% Verified with External Auditor Stamp</span>
              </div>
            </div>

            {/* Card 3: Fiscal Period Boundary */}
            <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-forest/30 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
                <span className="uppercase tracking-wider">Fiscal Effective Date</span>
                <Calendar className="w-4 h-4 text-forest" />
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                Jan 1, {selectedFiscalYear}
              </div>
              <div className="text-[11px] text-white/70 mt-2 flex items-center gap-1 font-semibold">
                <span>Hamle 1, {selectedFiscalYear - 8} E.C. (Ethiopian Calendar)</span>
              </div>
            </div>

            {/* Card 4: Primary Master Opening Voucher */}
            <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#FF6B00]/40 shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
                <span className="uppercase tracking-wider">Master Voucher Ref</span>
                <FileSpreadsheet className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <div className="text-xl font-black text-[#FF6B00] tracking-tight">
                OPB-{selectedFiscalYear}-ALL-ZARIMA
              </div>
              <div className="text-[11px] text-white/70 mt-2 flex items-center gap-1 font-semibold">
                <span>Certified by Bethlehem Tefera &amp; Lead Partner</span>
              </div>
            </div>
          </div>

          {/* Table of Account Beginning Balances */}
          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-elevated/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-forest/15 text-forest flex items-center justify-center font-bold">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">
                    Bank Accounts Opening Ledgers &bull; FY {selectedFiscalYear} ({selectedFiscalYear - 8} E.C.)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Inline editable beginning balances with opening journal voucher audit references.
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {filteredBalances.length} Registered Accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-surface-elevated text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 px-4 font-bold">Bank Name &amp; Account Number</th>
                    <th className="py-3 px-4 font-bold text-right">Annual Beginning Balance (ETB)</th>
                    <th className="py-3 px-4 font-bold">Opening Voucher Ref</th>
                    <th className="py-3 px-4 font-bold">Audit Status</th>
                    <th className="py-3 px-4 font-bold">Verified By &amp; Notes</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBalances.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No opening balances recorded for FY {selectedFiscalYear}. Click "Add Account Balance" above to set up this year.
                      </td>
                    </tr>
                  ) : (
                    filteredBalances.map((item) => {
                      const isEditing = editingBalanceId === item.id
                      return (
                        <tr key={item.id} className="hover:bg-surface-elevated/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-foreground">{item.bankName}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">
                              Acc: {item.accountNumber}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="font-mono text-[11px] text-muted-foreground">ETB</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editingBalanceVal}
                                  onChange={(e) => setEditingBalanceVal(e.target.value)}
                                  className="w-36 px-2.5 py-1 rounded-lg bg-surface border border-forest font-mono text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-forest"
                                />
                              </div>
                            ) : (
                              <div className="font-mono font-black text-sm text-foreground">
                                ETB {item.beginningBalanceETB.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-surface-elevated border border-border text-foreground font-semibold">
                              {item.openingBalanceVoucherRef}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-forest/15 text-forest border border-forest/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{item.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {isEditing ? (
                              <input
                                type="text"
                                placeholder="Audit note / reason for adjustment"
                                value={editingBalanceNotes}
                                onChange={(e) => setEditingBalanceNotes(e.target.value)}
                                className="w-full px-2 py-1 rounded-lg bg-surface border border-border text-[11px] focus:outline-none"
                              />
                            ) : (
                              <div>
                                <div className="font-semibold text-foreground text-[11px]">{item.verifiedBy}</div>
                                <div className="text-[10px] text-muted-foreground line-clamp-1">{item.notes}</div>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleSaveEditedBalance(item)}
                                  className="p-1.5 rounded-lg bg-forest hover:bg-forest-dark text-white shadow-xs transition-colors"
                                  title="Save Balance"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingBalanceId(null)}
                                  className="p-1.5 rounded-lg bg-surface-elevated hover:bg-border text-muted-foreground transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartEditBalance(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-forest/15 text-muted-foreground hover:text-forest text-[11px] font-bold border border-border hover:border-forest/40 transition-colors"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Adjust</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accounting Invariant Notice */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-forest/10 via-surface to-transparent border border-forest/30 text-xs flex items-start gap-3 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-forest shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-foreground">Statutory Carryforward Invariant</div>
              <div className="text-muted-foreground mt-0.5 leading-relaxed">
                Under Ethiopian corporate treasury standards, each fiscal year's ending reconciled balance forms the immutable opening balance for the subsequent year. Daily bank statement reconciliations bridge directly from this opening ledger using: 
                <span className="font-mono font-bold text-foreground ml-1">
                  Reconciled Balance = Annual Beginning Balance + Σ(Inflows) - Σ(Outflows)
                </span>.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Signature Dark Cards Metric Showcase (User Requested Style) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Bank Portfolio Balance */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#22C55E]/40 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#22C55E]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Book Ledger Balance</span>
            <Landmark className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ETB {activeBankAccount?.balanceETB.toLocaleString() || '0'}
          </div>
          <div className="text-[11px] text-[#22C55E] mt-2 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{activeBankAccount?.bankName}</span>
          </div>
        </div>

        {/* Card 2: Automated Match Rate */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#22C55E]/30 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#22C55E]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Matching Progress</span>
            <Scale className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {summary.percent}% Reconciled
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-[#22C55E] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${summary.percent}%` }}
            />
          </div>
        </div>

        {/* Card 3: Needs Review Queue */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#FF6B00]/50 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#FF6B00]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Review Queue</span>
            <AlertCircle className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="text-2xl font-black text-[#FF6B00] tracking-tight">
            {summary.needsReview} Lines Flagged
          </div>
          <div className="text-[11px] text-[#FF6B00] mt-2 flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Ambiguous matches awaiting approval</span>
          </div>
        </div>

        {/* Card 4: Unmatched Bank Lines */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#22C55E]/30 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Unmatched / Variances</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 tracking-tight">
            {summary.unmatched} Discrepancies
          </div>
          <div className="text-[11px] text-white/70 mt-2 flex items-center gap-1 font-semibold">
            <span>Bank fees, taxes or unposted wires</span>
          </div>
        </div>
      </div>

      {/* Annual Beginning Balance Anchor for Selected Account */}
      <div className="p-3.5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest/15 text-forest flex items-center justify-center font-bold shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground">FY 2026 Certified Beginning Balance:</span>
              <span className="font-extrabold text-forest font-mono">
                ETB {(activeBankBeginningBalance?.beginningBalanceETB || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest/15 text-forest font-bold border border-forest/30">
                {activeBankBeginningBalance?.openingBalanceVoucherRef || 'OPB-2026-CERTIFIED'}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Anchor for {activeBankAccount?.bankName}. Reconciled Balance = Beginning Balance + Inflows - Outflows.
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedFiscalYear(2026)
            setActiveViewMode('annual_balances')
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest font-bold text-xs transition-colors shrink-0 self-end sm:self-auto"
        >
          <span>View Annual Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 10 Bank Accounts Selector Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <span className="uppercase tracking-wider">Select Corporate Bank Portfolio (Up to 10 Accounts)</span>
          <span className="text-muted-foreground text-[11px]">10 Active Portfolios</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {bankAccounts.map((b) => {
            const isSelected = normalizeBankId(selectedBankId) === normalizeBankId(b.id)
            return (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBankId(b.id)
                  const stmt = bankStatements.find(
                    (s) => normalizeBankId(s.bankAccountId || (s as any).accountId) === normalizeBankId(b.id)
                  )
                  setSelectedStatementId(stmt ? stmt.id : '')
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#22C55E]/15 border-[#22C55E] text-foreground font-bold shadow-sm'
                    : 'bg-surface border-border hover:border-[#22C55E]/40 text-muted-foreground'
                }`}
              >
                <div className="text-[11px] font-bold line-clamp-1">{b.bankName.split('(')[0]}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{b.accountNumber.slice(-6)}</div>
                <div className="text-[11px] font-extrabold text-foreground mt-1">
                  ETB {(b.balanceETB / 1000000).toFixed(1)}M
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Statement Header Bar */}
      {activeStatement ? (
        <div className="rounded-2xl p-4 bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm">{activeStatement.statementNumber}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E]">
                  {(activeStatement.fileFormat || 'XLSX').toUpperCase()}
                </span>
                {(activeStatement.isLocked || (activeStatement as any).locked) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked Audit
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Period: {activeStatement.periodStart || '2026-10-01'} to {activeStatement.periodEnd || '2026-10-15'} • File: {activeStatement.fileName || `${activeStatement.statementNumber}.xlsx`}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-center">
              <span className="text-[10px] text-muted-foreground block">Statement Balance</span>
              <span className="font-bold text-foreground">ETB {(activeStatement.closingBalanceETB || 0).toLocaleString()}</span>
            </div>

            {!activeStatement.isLocked && !(activeStatement as any).locked ? (
              <button
                onClick={handleLock}
                className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-[#22C55E]/10 border border-border text-xs font-bold text-foreground flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Lock Reconciliation</span>
              </button>
            ) : (
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span>Locked by {activeStatement.lockedBy || 'Authorized Officer'}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-8 bg-surface border border-dashed border-border text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/10 text-[#16A34A] dark:text-[#22C55E] flex items-center justify-center mx-auto">
            <Landmark className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="text-sm font-bold text-foreground">
              No statement imported for {activeBankAccount?.bankName || 'this bank'}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Account: {activeBankAccount?.accountNumber} • Branch: {activeBankAccount?.branchName || 'Addis Ababa'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Upload an official bank statement (.xlsx, .pdf, .docx) to run automated matching against Zarima's internal books.
            </p>
          </div>
          <button
            onClick={() => {
              setUploadBankId(activeBankAccount?.id || selectedBankId)
              setUploadStep('select')
              setIsUploadModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#060B08] font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Import Statement for {activeBankAccount?.bankName.split('(')[0] || 'Account'}</span>
          </button>
        </div>
      )}

      {/* Reconciliation Transactions Table & Engine Filter */}
      {activeStatement && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-surface border border-border">
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search statement reference, counterparty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-surface-elevated border border-border focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  statusFilter === 'all' ? 'bg-[#22C55E] text-[#060B08]' : 'bg-surface-elevated text-muted-foreground'
                }`}
              >
                All Lines ({activeStatement.transactions.length})
              </button>
              <button
                onClick={() => setStatusFilter('Matched')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  statusFilter === 'Matched' ? 'bg-[#22C55E] text-[#060B08]' : 'bg-surface-elevated text-muted-foreground'
                }`}
              >
                Matched ({summary.matched})
              </button>
              <button
                onClick={() => setStatusFilter('Needs Review')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  statusFilter === 'Needs Review' ? 'bg-[#FF6B00] text-white' : 'bg-surface-elevated text-muted-foreground'
                }`}
              >
                Needs Review ({summary.needsReview})
              </button>
              <button
                onClick={() => setStatusFilter('Unmatched Bank Transaction')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  statusFilter === 'Unmatched Bank Transaction'
                    ? 'bg-amber-500 text-white'
                    : 'bg-surface-elevated text-muted-foreground'
                }`}
              >
                Unmatched ({summary.unmatched})
              </button>
            </div>
          </div>

          {/* Statement Lines Table */}
          <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Statement Reference</th>
                    <th className="py-3 px-4">Transaction Description</th>
                    <th className="py-3 px-4 text-right">Debit (Out)</th>
                    <th className="py-3 px-4 text-right">Credit (In)</th>
                    <th className="py-3 px-4">Matching Status &amp; Reason</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStatementTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-muted-foreground">{tx.transactionDate || (tx as any).date || '2026-10-15'}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">{tx.reference || (tx as any).referenceNumber || 'N/A'}</td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-foreground line-clamp-1">{tx.description || 'Statement Line'}</div>
                        {tx.counterpartyName && (
                          <div className="text-[11px] text-muted-foreground">Party: {tx.counterpartyName}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#FF6B00]">
                        {tx.debitETB ? `ETB ${Number(tx.debitETB).toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#16A34A] dark:text-[#22C55E]">
                        {tx.creditETB ? `ETB ${Number(tx.creditETB).toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.status === 'Matched'
                                ? 'bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] border border-[#22C55E]/30'
                                : tx.status === 'Needs Review'
                                ? 'bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30'
                                : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                            }`}
                          >
                            {tx.status} {tx.matchConfidence ? `(${tx.matchConfidence}%)` : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                          {tx.matchReason}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!activeStatement.isLocked && (
                          <div className="flex items-center justify-end gap-1.5">
                            {tx.status === 'Needs Review' && (
                              <>
                                <button
                                  onClick={() => handleOpenManualMatch(tx)}
                                  className="px-2.5 py-1 rounded-lg bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-[10.5px] transition-all"
                                  title="Manually link to an internal transaction"
                                >
                                  Link Match
                                </button>
                                <button
                                  onClick={() =>
                                    reconcileStatementTransaction(activeStatement.id, tx.id, undefined, 'confirm')
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-[#060B08] font-bold text-[10.5px] transition-all"
                                  title="Accept proposed match"
                                >
                                  Accept
                                </button>
                              </>
                            )}

                            {tx.status === 'Unmatched Bank Transaction' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setClassifyTx(tx)
                                    setClassifyCategory(tx.debitETB ? 'Bank Service Charges & Fees' : 'Interest Income & Bank Yields')
                                    setClassifyActivity('Shared')
                                    setClassifyNotes('')
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-[10.5px] transition-all"
                                  title="Classify bank transaction into ledger (0 duplicate entries)"
                                >
                                  Classify &amp; Post
                                </button>
                                <button
                                  onClick={() => handleOpenManualMatch(tx)}
                                  className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-border border border-border text-[10.5px] font-bold text-foreground transition-all"
                                  title="Link to an existing internal ledger entry"
                                >
                                  Link Match
                                </button>
                              </div>
                            )}

                            {tx.status === 'Matched' && (
                              <span className="text-[11px] text-[#16A34A] dark:text-[#22C55E] font-bold flex items-center gap-1 justify-end">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                              </span>
                            )}
                          </div>
                        )}
                        {(activeStatement.isLocked || (activeStatement as any).locked) && (
                          <span className="text-[11px] text-muted-foreground font-mono">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredStatementTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No statement lines match the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )}

      {/* IMPORT STATEMENT MODAL DIALOG (.xlsx, .pdf, .docx) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Import Bank Statement</h3>
                <p className="text-xs text-muted-foreground">
                  Upload official bank statement files (.xlsx, .xls, .pdf, .docx) for automated reconciliation.
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-elevated hover:bg-border flex items-center justify-center text-muted-foreground"
              >
                ✕
              </button>
            </div>

            {uploadStep === 'select' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Company Bank Account *</label>
                    <select
                      value={uploadBankId}
                      onChange={(e) => setUploadBankId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                    >
                      {bankAccounts.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} ({b.accountNumber.slice(-6)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Statement Format</label>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1.5 rounded-xl bg-surface-elevated border border-border font-bold">
                        Excel (.xlsx/.xls)
                      </span>
                      <span className="px-2.5 py-1.5 rounded-xl bg-surface-elevated border border-border font-bold">
                        PDF (.pdf)
                      </span>
                      <span className="px-2.5 py-1.5 rounded-xl bg-surface-elevated border border-border font-bold">
                        Word (.docx)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Period Start Date *</label>
                    <input
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Period End Date *</label>
                    <input
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Statement Opening Balance (ETB) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={openingBalance}
                      onChange={(e) => setOpeningBalance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Statement Closing Balance (ETB) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={closingBalance}
                      onChange={(e) => setClosingBalance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                    />
                  </div>
                </div>

                {/* Download Bank Statement Template Banner */}
                <div className="p-3.5 rounded-2xl bg-forest/10 border border-forest/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-5 h-5 text-forest shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">Need the Official Bank Statement Format?</div>
                      <div className="text-[11px] text-muted-foreground">Download pre-formatted Excel / CSV template with CBE, Awash, &amp; Dashen sample rows.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadImportTemplate('bankStatement')}
                    className="px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template</span>
                  </button>
                </div>

                {/* Upload Drag & Drop Area */}
                <div className="border-2 border-dashed border-border hover:border-[#22C55E]/60 rounded-3xl p-6 text-center space-y-2 bg-surface-elevated/40 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.pdf,.docx,.doc"
                    onChange={handleFileDrop}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    Drop your statement file here or <span className="text-[#FF6B00]">browse</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Supports Commercial Bank of Ethiopia (CBE), Awash, Dashen, Hibret electronic statements.
                  </p>
                </div>
              </div>
            )}

            {uploadStep === 'preview' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-5 h-5 text-[#22C55E]" />
                    <div>
                      <div className="font-bold text-foreground">{uploadedFileName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Extracted {previewTransactions.length} lines • Period: {periodStart} to {periodEnd}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadStep('select')}
                    className="text-xs font-semibold text-[#FF6B00] hover:underline"
                  >
                    Change File
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Extraction Verification &amp; Correction:</strong> Review parsed transaction lines below. You can edit dates, references, descriptions, or amounts, remove misparsed rows, or add missing lines before committing to the matching engine.
                </div>

                {/* Editable Preview Table */}
                <div className="rounded-2xl border border-border overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-surface-elevated text-muted-foreground sticky top-0 z-10">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Reference</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-right">Debit (ETB)</th>
                        <th className="py-2 px-3 text-right">Credit (ETB)</th>
                        <th className="py-2 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {previewTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-surface-elevated/40">
                          <td className="py-1.5 px-2">
                            <input
                              type="date"
                              value={tx.transactionDate}
                              onChange={(e) => handleUpdatePreviewRow(tx.id, 'transactionDate', e.target.value)}
                              className="px-2 py-1 rounded-lg bg-surface border border-border text-[11px] focus:outline-none"
                            />
                          </td>
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              value={tx.reference}
                              onChange={(e) => handleUpdatePreviewRow(tx.id, 'reference', e.target.value)}
                              className="w-28 px-2 py-1 rounded-lg bg-surface border border-border text-[11px] font-mono focus:outline-none"
                            />
                          </td>
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              value={tx.description}
                              onChange={(e) => handleUpdatePreviewRow(tx.id, 'description', e.target.value)}
                              className="w-full min-w-44 px-2 py-1 rounded-lg bg-surface border border-border text-[11px] focus:outline-none"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={tx.debitETB || ''}
                              placeholder="0.00"
                              onChange={(e) => handleUpdatePreviewRow(tx.id, 'debitETB', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 rounded-lg bg-surface border border-border text-[11px] text-right text-[#FF6B00] font-bold focus:outline-none"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={tx.creditETB || ''}
                              placeholder="0.00"
                              onChange={(e) => handleUpdatePreviewRow(tx.id, 'creditETB', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 rounded-lg bg-surface border border-border text-[11px] text-right text-[#16A34A] dark:text-[#22C55E] font-bold focus:outline-none"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeletePreviewRow(tx.id)}
                              className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors"
                              title="Remove row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={handleAddPreviewRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-[#22C55E]/10 border border-border text-foreground font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Add Missing Transaction Line</span>
                  </button>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>
                      Debits:{' '}
                      <strong className="text-[#FF6B00]">
                        ETB {previewTransactions.reduce((acc, t) => acc + (t.debitETB || 0), 0).toLocaleString()}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Credits:{' '}
                      <strong className="text-[#16A34A] dark:text-[#22C55E]">
                        ETB {previewTransactions.reduce((acc, t) => acc + (t.creditETB || 0), 0).toLocaleString()}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[11px] text-foreground">
                  <strong>Automated Validation Passed:</strong> Statement columns normalized. No duplicate statement detected for this account period.
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                  <button
                    onClick={() => setUploadStep('select')}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-surface-elevated font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    className="px-5 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#060B08] font-bold shadow-md active:scale-95 transition-all"
                  >
                    Confirm Import &amp; Run Matching Engine
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANUAL LINK MODAL */}
      {manualLinkTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Manual Match Transaction</h3>
                <p className="text-muted-foreground text-[11px]">
                  Link statement line to an internal ledger record (±3 days / strict threshold review).
                </p>
              </div>
              <button
                onClick={() => setManualLinkTx(null)}
                className="w-8 h-8 rounded-full bg-surface-elevated hover:bg-border flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1">
              <div className="font-bold text-foreground">{manualLinkTx.description}</div>
              <div className="text-muted-foreground flex items-center justify-between">
                <span>Date: {manualLinkTx.transactionDate} • Ref: {manualLinkTx.reference}</span>
                <span className="font-mono font-bold text-foreground">
                  ETB {((manualLinkTx.creditETB || 0) + (manualLinkTx.debitETB || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1.5">
                Select Matching Internal Transaction *
              </label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {manualLinkCandidates.map((tx) => {
                  const isSelected = selectedInternalTxId === tx.id
                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedInternalTxId(tx.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#22C55E]/15 border-[#22C55E] text-foreground font-semibold'
                          : 'bg-surface-elevated/60 border-border hover:border-[#22C55E]/40 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-foreground">{tx.referenceNumber}</span>
                        <div className="flex items-center gap-1.5">
                          {tx.isExactAmount && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/20 text-[#16A34A] dark:text-[#22C55E]">
                              Exact Amount
                            </span>
                          )}
                          <span className="font-bold text-foreground">ETB {tx.amountETB.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center justify-between">
                        <span>{tx.date} ({tx.dateDiff}d diff) • {tx.category}</span>
                        <span>{tx.businessActivity}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setManualLinkTx(null)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-surface-elevated font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmManualMatch}
                disabled={!selectedInternalTxId}
                className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                Confirm Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLASSIFY & POST UNMATCHED MODAL */}
      {classifyTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Classify &amp; Post Unmatched Transaction</h3>
                <p className="text-muted-foreground text-[11px]">
                  Post missing bank activity (e.g. fee, tax, unposted wire) to ledger with 0 duplication.
                </p>
              </div>
              <button
                onClick={() => setClassifyTx(null)}
                className="w-8 h-8 rounded-full bg-surface-elevated hover:bg-border flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1">
              <div className="font-bold text-foreground">{classifyTx.description}</div>
              <div className="text-muted-foreground flex items-center justify-between">
                <span>Date: {classifyTx.transactionDate} • Ref: {classifyTx.reference}</span>
                <span className={`font-mono font-bold ${classifyTx.debitETB ? 'text-[#FF6B00]' : 'text-[#16A34A] dark:text-[#22C55E]'}`}>
                  {classifyTx.debitETB ? `Debit ETB ${classifyTx.debitETB.toLocaleString()}` : `Credit ETB ${classifyTx.creditETB?.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Accounting Category *
                </label>
                <select
                  value={classifyCategory}
                  onChange={(e) => setClassifyCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                >
                  <option value="Bank Service Charges & Fees">Bank Service Charges & Fees</option>
                  <option value="Interest Income & Bank Yields">Interest Income & Bank Yields</option>
                  <option value="Statutory Taxes & Withholding">Statutory Taxes & Withholding</option>
                  <option value="Unposted Customer Freight Wire">Unposted Customer Freight Wire</option>
                  <option value="Fuel & Fleet Operational Debit">Fuel & Fleet Operational Debit</option>
                  <option value="Office & Administrative Shared Expense">Office & Administrative Shared Expense</option>
                  <option value="Miscellaneous General Expense">Miscellaneous General Expense</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Business Activity Allocation *
                </label>
                <select
                  value={classifyActivity}
                  onChange={(e) => setClassifyActivity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                >
                  <option value="Shared">Shared Overhead (Company Wide)</option>
                  <option value="Cement">Cement Division</option>
                  <option value="Transport">Transport Division</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Audit Notes &amp; Justification
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly corporate e-banking account maintenance charge"
                  value={classifyNotes}
                  onChange={(e) => setClassifyNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[11px] text-foreground">
              <strong>Invariant:</strong> This records a single verified transaction in the general ledger with status <code>Reconciled</code> and matches it to this statement line. No duplicated expenses.
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setClassifyTx(null)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-surface-elevated font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClassifyPost}
                className="px-5 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#060B08] font-bold shadow-md active:scale-95 transition-all"
              >
                Post to Ledger &amp; Reconcile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOWNLOADABLE IMPORT TEMPLATES MODAL */}
      {isDownloadTemplatesModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-4xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-forest/15 text-forest flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-lg">
                    Zarima ERP &bull; Official Downloadable Import Templates
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Pre-formatted CSV templates with UTF-8 BOM encoding for seamless 1-click opening in Microsoft Excel without character corruption.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDownloadTemplatesModalOpen(false)}
                className="p-2 rounded-xl hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Batch Download Header */}
            <div className="p-3.5 rounded-2xl bg-forest/10 border border-forest/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                <span className="font-semibold text-foreground">
                  Need all templates? Download the complete operational template suite for Zarima Trading.
                </span>
              </div>
              <button
                onClick={handleDownloadAllTemplates}
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All 6 Templates</span>
              </button>
            </div>

            {/* Grid of Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {Object.values(IMPORT_TEMPLATES).map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-4 rounded-2xl border border-border bg-surface-elevated/40 hover:border-forest/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-forest/15 text-forest border border-forest/30">
                        {tmpl.category}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">{tmpl.filename}</span>
                    </div>
                    <h4 className="font-bold text-foreground text-sm">{tmpl.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {tmpl.description}
                    </p>

                    <div className="mt-2.5">
                      <div className="text-[10px] font-bold text-foreground mb-1 uppercase tracking-wider">Columns ({tmpl.headers.length}):</div>
                      <div className="flex flex-wrap gap-1">
                        {tmpl.headers.map((h, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-muted-foreground font-mono">
                            {h.split('(')[0].trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {tmpl.sampleRows.length} sample rows included
                    </span>
                    <button
                      onClick={() => downloadImportTemplate(tmpl.id as any)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setIsDownloadTemplatesModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-surface-elevated hover:bg-border text-foreground font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ANNUAL BEGINNING BALANCE MODAL */}
      {isAddBalanceModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-foreground text-base">Add Annual Beginning Balance</h3>
                <p className="text-xs text-muted-foreground">Record audited opening balance for a corporate bank account.</p>
              </div>
              <button
                onClick={() => setIsAddBalanceModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Fiscal Year *</label>
                <select
                  value={newBalanceYear}
                  onChange={(e) => setNewBalanceYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border font-bold"
                >
                  <option value={2026}>FY 2026 (2018 E.C. - Active)</option>
                  <option value={2025}>FY 2025 (2017 E.C. - Audited)</option>
                  <option value={2024}>FY 2024 (2016 E.C. - Archived)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Bank Account *</label>
                <select
                  value={newBalanceBankId}
                  onChange={(e) => setNewBalanceBankId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} — Acc: {b.accountNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Beginning Balance (ETB) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newBalanceAmount}
                  onChange={(e) => setNewBalanceAmount(e.target.value)}
                  placeholder="e.g. 12540000"
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Opening Balance Voucher Ref *</label>
                <input
                  type="text"
                  value={newBalanceVoucher}
                  onChange={(e) => setNewBalanceVoucher(e.target.value)}
                  placeholder="e.g. OPB-2026-CBE-01"
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Auditor Notes</label>
                <input
                  type="text"
                  value={newBalanceNotes}
                  onChange={(e) => setNewBalanceNotes(e.target.value)}
                  placeholder="e.g. Verified by External Audit Partner"
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-border"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsAddBalanceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-surface-elevated font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewBeginningBalance}
                className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Save Beginning Balance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
