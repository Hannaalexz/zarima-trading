import React, { useState, useMemo } from 'react'
import {
  FileBarChart,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Layers,
  Truck,
  Building2,
  Users,
  Wallet,
  Scale,
  ArrowRight,
  Filter,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Share2,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { BusinessActivity } from '@/types'

export const ReportsPage: React.FC = () => {
  const {
    sales,
    purchases,
    deliveries,
    fuelExpenses,
    maintenance,
    payroll,
    transactions,
    bankAccounts,
    memberExpenses,
    receivables,
    payables,
    trucks,
  } = useStore()

  const { addToast } = useToast()
  const [searchParams] = useSearchParams()
  const queryReport = searchParams.get('report')

  // State Filters
  const [selectedReport, setSelectedReport] = useState<
    'combined_pnl' | 'cement_pnl' | 'transport_pnl' | 'member_expenses' | 'bank_cash' | 'ar_ap' | 'truck_profit'
  >((queryReport as any) || 'combined_pnl')

  React.useEffect(() => {
    if (
      queryReport &&
      ['combined_pnl', 'cement_pnl', 'transport_pnl', 'member_expenses', 'bank_cash', 'ar_ap', 'truck_profit'].includes(
        queryReport
      )
    ) {
      setSelectedReport(queryReport as any)
    }
  }, [queryReport])

  const [dateRange, setDateRange] = useState('October 2026')
  const [sharedAllocationMethod, setSharedAllocationMethod] = useState<'50_50' | '60_40' | 'unallocated'>('60_40')

  // Real Data Financial Calculations
  // 1. CEMENT REVENUE & COGS
  const cementRevenue = useMemo(() => {
    return sales.reduce((sum, s) => sum + s.totalAmountETB, 0)
  }, [sales])

  const cementCOGS = useMemo(() => {
    return purchases.reduce((sum, p) => sum + p.totalAmountETB, 0)
  }, [purchases])

  const cementGrossProfit = cementRevenue - cementCOGS

  // 2. TRANSPORT REVENUE & COSTS
  // Note: Only Zarima's share of shared truckload revenue is counted!
  const transportRevenue = useMemo(() => {
    return deliveries.reduce((sum, d) => {
      if (d.isSharedTruckload && d.zarimaShareETB) {
        return sum + d.zarimaShareETB
      }
      return sum + d.freightChargeETB
    }, 0)
  }, [deliveries])

  const transportFuelCosts = useMemo(() => {
    return fuelExpenses.reduce((sum, f) => sum + f.totalCostETB, 0)
  }, [fuelExpenses])

  const transportMaintenanceCosts = useMemo(() => {
    return maintenance.reduce((sum, m) => sum + m.costETB, 0)
  }, [maintenance])

  const transportDriverPayroll = useMemo(() => {
    return payroll
      .filter((p) => p.businessActivity === 'Transport')
      .reduce((sum, p) => sum + p.netPayETB, 0)
  }, [payroll])

  const transportDirectCosts = transportFuelCosts + transportMaintenanceCosts + transportDriverPayroll
  const transportGrossProfit = transportRevenue - transportDirectCosts

  // 3. SHARED OVERHEAD & MEMBER OUTLAYS
  const sharedOverheadTotal = useMemo(() => {
    const regularSharedTx = transactions
      .filter((tx) => tx.businessActivity === 'Shared' && tx.type === 'Expense')
      .reduce((sum, tx) => sum + tx.amountETB, 0)

    const sharedMemberExp = memberExpenses
      .filter((m) => m.businessActivity === 'Shared' && m.approvalStatus === 'Approved')
      .reduce((sum, m) => sum + m.amountETB, 0)

    return regularSharedTx + sharedMemberExp
  }, [transactions, memberExpenses])

  // Shared allocation split
  const sharedSplit = useMemo(() => {
    if (sharedAllocationMethod === '50_50') {
      return {
        cement: sharedOverheadTotal * 0.5,
        transport: sharedOverheadTotal * 0.5,
      }
    } else if (sharedAllocationMethod === '60_40') {
      return {
        cement: sharedOverheadTotal * 0.6,
        transport: sharedOverheadTotal * 0.4,
      }
    }
    return { cement: 0, transport: 0 }
  }, [sharedOverheadTotal, sharedAllocationMethod])

  // Operating Expenses per Activity (Member expenses recognized without double count)
  const cementOperatingExpenses = useMemo(() => {
    return memberExpenses
      .filter((m) => m.businessActivity === 'Cement' && m.approvalStatus === 'Approved')
      .reduce((sum, m) => sum + m.amountETB, 0)
  }, [memberExpenses])

  const transportOtherOperatingExpenses = useMemo(() => {
    return memberExpenses
      .filter((m) => m.businessActivity === 'Transport' && m.category !== 'Fuel' && m.approvalStatus === 'Approved')
      .reduce((sum, m) => sum + m.amountETB, 0)
  }, [memberExpenses])

  // Net Profits
  const cementNetProfit = cementGrossProfit - cementOperatingExpenses - sharedSplit.cement
  const transportNetProfit = transportGrossProfit - transportOtherOperatingExpenses - sharedSplit.transport

  const combinedRevenue = cementRevenue + transportRevenue
  const combinedCOGS = cementCOGS + transportDirectCosts
  const combinedGrossProfit = combinedRevenue - combinedCOGS
  const combinedOperatingExpenses = cementOperatingExpenses + transportOtherOperatingExpenses + sharedOverheadTotal
  const combinedNetProfit = combinedGrossProfit - (cementOperatingExpenses + transportOtherOperatingExpenses + sharedOverheadTotal)

  // Truck Profitability Data
  const truckProfitability = useMemo(() => {
    return trucks.map((truck) => {
      const truckDeliveries = deliveries.filter((d) => d.truckId === truck.id || d.plateNumber === truck.plateNumber)
      const truckRevenue = truckDeliveries.reduce((sum, d) => {
        if (d.isSharedTruckload && d.zarimaShareETB) return sum + d.zarimaShareETB
        return sum + d.freightChargeETB
      }, 0)

      const truckFuel = fuelExpenses
        .filter((f) => f.truckPlate === truck.plateNumber)
        .reduce((sum, f) => sum + f.totalCostETB, 0)

      const truckMnt = maintenance
        .filter((m) => m.truckPlate === truck.plateNumber)
        .reduce((sum, m) => sum + m.costETB, 0)

      const directCost = truckFuel + truckMnt
      const netProfit = truckRevenue - directCost
      const margin = truckRevenue > 0 ? (netProfit / truckRevenue) * 100 : 0

      return {
        ...truck,
        totalTrips: truckDeliveries.length,
        revenue: truckRevenue,
        fuel: truckFuel,
        maintenance: truckMnt,
        directCost,
        netProfit,
        margin: Math.round(margin),
      }
    })
  }, [trucks, deliveries, fuelExpenses, maintenance])

  const handleExport = (format: 'pdf' | 'excel') => {
    addToast({
      type: 'success',
      title: `Export ${format.toUpperCase()} Generated`,
      description: `Downloaded audited ${selectedReport.replace('_', ' ').toUpperCase()} report for ${dateRange}.`,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Statements &amp; Business Intelligence"
        description="Audited financial reporting with independent Cement Trading, Transport Haulage, and Combined Company-Wide Profit &amp; Loss statements."
        badgeText="Executive Reporting"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('excel')}
              className="px-3.5 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-elevated font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        }
      />

      {/* Signature Dark Cards Metric Showcase (User Requested Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Combined Revenue */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#22C55E]/40 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#22C55E]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Gross Operating Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ETB {(combinedRevenue / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-[#22C55E] mt-2 flex items-center gap-1 font-semibold">
            <span>Cement + Zarima Haulage Net</span>
          </div>
        </div>

        {/* Card 2: Combined Net Profit */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#22C55E]/40 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#22C55E]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Net Operating Profit</span>
            <DollarSign className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ETB {(combinedNetProfit / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-[#22C55E] mt-2 flex items-center gap-1 font-semibold">
            <span>{((combinedNetProfit / combinedRevenue) * 100).toFixed(1)}% Operating Margin</span>
          </div>
        </div>

        {/* Card 3: Cement Net vs Transport Net */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#22C55E]/30 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Division Profit Split</span>
            <Layers className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between items-center text-white/90">
              <span className="flex items-center gap-1 text-[11px]">
                <Building2 className="w-3 h-3 text-[#22C55E]" /> Cement Trading:
              </span>
              <span className="font-bold">ETB {(cementNetProfit / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between items-center text-white/90">
              <span className="flex items-center gap-1 text-[11px]">
                <Truck className="w-3 h-3 text-[#FF6B00]" /> Transport Fleet:
              </span>
              <span className="font-bold">ETB {(transportNetProfit / 1000000).toFixed(2)}M</span>
            </div>
          </div>
        </div>

        {/* Card 4: Member Liability Owed (Electric Orange Highlight) */}
        <div className="rounded-2xl p-5 bg-[#0E1712] text-white border border-[#FF6B00]/50 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#FF6B00]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span className="uppercase tracking-wider">Member Capital Liabilities</span>
            <Users className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="text-2xl font-black text-[#FF6B00] tracking-tight">
            ETB{' '}
            {memberExpenses
              .reduce((sum, e) => sum + e.remainingOwedETB, 0)
              .toLocaleString()}
          </div>
          <div className="text-[11px] text-[#FF6B00] mt-2 flex items-center gap-1 font-semibold">
            <span>Owed to partners; not an extra P&amp;L expense</span>
          </div>
        </div>
      </div>

      {/* Report Filter & Switcher Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-surface border border-border text-xs">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedReport('combined_pnl')}
            className={`px-3 py-2 rounded-xl font-bold transition-all ${
              selectedReport === 'combined_pnl'
                ? 'bg-[#22C55E] text-[#060B08]'
                : 'text-muted-foreground hover:bg-surface-elevated'
            }`}
          >
            Company-Wide P&amp;L
          </button>
          <button
            onClick={() => setSelectedReport('cement_pnl')}
            className={`px-3 py-2 rounded-xl font-bold transition-all ${
              selectedReport === 'cement_pnl'
                ? 'bg-[#22C55E] text-[#060B08]'
                : 'text-muted-foreground hover:bg-surface-elevated'
            }`}
          >
            Cement Trading P&amp;L
          </button>
          <button
            onClick={() => setSelectedReport('transport_pnl')}
            className={`px-3 py-2 rounded-xl font-bold transition-all ${
              selectedReport === 'transport_pnl'
                ? 'bg-[#22C55E] text-[#060B08]'
                : 'text-muted-foreground hover:bg-surface-elevated'
            }`}
          >
            Transport P&amp;L
          </button>
          <button
            onClick={() => setSelectedReport('truck_profit')}
            className={`px-3 py-2 rounded-xl font-bold transition-all ${
              selectedReport === 'truck_profit'
                ? 'bg-[#FF6B00] text-white'
                : 'text-muted-foreground hover:bg-surface-elevated'
            }`}
          >
            Truck Profitability
          </button>
          <button
            onClick={() => setSelectedReport('member_expenses')}
            className={`px-3 py-2 rounded-xl font-bold transition-all ${
              selectedReport === 'member_expenses'
                ? 'bg-[#22C55E] text-[#060B08]'
                : 'text-muted-foreground hover:bg-surface-elevated'
            }`}
          >
            Member Outlays
          </button>
          <button
            onClick={() => setSelectedReport('bank_cash')}
            className={`px-3 py-2 rounded-xl font-bold transition-all ${
              selectedReport === 'bank_cash'
                ? 'bg-[#22C55E] text-[#060B08]'
                : 'text-muted-foreground hover:bg-surface-elevated'
            }`}
          >
            Bank &amp; Cash Report
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-muted-foreground font-semibold">Period:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-foreground font-semibold focus:outline-none"
          >
            <option value="October 2026">October 2026 (Current Cycle)</option>
            <option value="September 2026">September 2026</option>
            <option value="Q3 2026">Q3 2026 (July - Sept)</option>
            <option value="YTD 2026">Full Year 2026 (YTD)</option>
          </select>

          <span className="text-muted-foreground font-semibold ml-2">Overhead Split:</span>
          <select
            value={sharedAllocationMethod}
            onChange={(e) => setSharedAllocationMethod(e.target.value as typeof sharedAllocationMethod)}
            className="px-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-foreground font-semibold focus:outline-none"
          >
            <option value="60_40">60% Cement / 40% Transport</option>
            <option value="50_50">50% Cement / 50% Transport</option>
            <option value="unallocated">Unallocated General Overhead</option>
          </select>
        </div>
      </div>

      {/* REPORT VIEW 1: COMBINED PROFIT & LOSS */}
      {selectedReport === 'combined_pnl' && (
        <div className="rounded-3xl border border-border bg-surface shadow-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Zarima Trading &amp; Logistics — Statement of Profit &amp; Loss</h2>
              <p className="text-xs text-muted-foreground">Reporting Period: {dateRange} • Currency: Ethiopian Birr (ETB)</p>
            </div>
            <div className="text-xs px-3 py-1 rounded-full bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] font-bold border border-[#22C55E]/30">
              Audit Status: Verified
            </div>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Revenue Section */}
            <div className="space-y-2">
              <div className="font-sans font-black text-xs text-[#22C55E] uppercase tracking-wider">
                1. Operating Revenue
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-surface-elevated">
                <span>Cement Trading Commercial Invoices</span>
                <span className="font-bold text-foreground">ETB {cementRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-surface-elevated">
                <span>Transport Haulage Freight (Zarima Net Share)</span>
                <span className="font-bold text-foreground">ETB {transportRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 px-3 border-t border-border font-bold text-foreground text-sm">
                <span>TOTAL REVENUE</span>
                <span className="text-[#22C55E]">ETB {combinedRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* Cost of Goods & Direct Operating Costs */}
            <div className="space-y-2">
              <div className="font-sans font-black text-xs text-[#FF6B00] uppercase tracking-wider">
                2. Cost of Goods Sold &amp; Direct Operating Costs
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-surface-elevated">
                <span>Factory Cement Purchases (Dangote, Derba, National)</span>
                <span className="text-foreground">ETB {cementCOGS.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-surface-elevated">
                <span>Direct Fleet Diesel Fuel Expenses</span>
                <span className="text-foreground">ETB {transportFuelCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-surface-elevated">
                <span>Fleet Maintenance &amp; Mechanical Overhaul</span>
                <span className="text-foreground">ETB {transportMaintenanceCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-surface-elevated">
                <span>Heavy Driver Payroll &amp; Per Diem Allowances</span>
                <span className="text-foreground">ETB {transportDriverPayroll.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 px-3 border-t border-border font-bold text-foreground text-sm">
                <span>TOTAL COST OF SALES</span>
                <span className="text-[#FF6B00]">ETB {combinedCOGS.toLocaleString()}</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="p-4 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex justify-between items-center text-sm font-black text-foreground">
              <span>GROSS PROFIT</span>
              <span className="text-[#16A34A] dark:text-[#22C55E]">
                ETB {combinedGrossProfit.toLocaleString()} ({((combinedGrossProfit / combinedRevenue) * 100).toFixed(1)}%)
              </span>
            </div>

            {/* Operating Expenses & Shared Overhead */}
            <div className="space-y-2">
              <div className="font-sans font-black text-xs text-muted-foreground uppercase tracking-wider">
                3. Operating Expenses &amp; General Overhead
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-surface-elevated">
                <span>Cement Depot Rent &amp; Storage Overhead (Member Outlays Included)</span>
                <span className="text-foreground">ETB {cementOperatingExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-surface-elevated">
                <span>Transport Auxiliary Operating Expenses</span>
                <span className="text-foreground">ETB {transportOtherOperatingExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-surface-elevated">
                <span>HQ Corporate Rent &amp; Shared IT Overhead</span>
                <span className="text-foreground">ETB {sharedOverheadTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 px-3 border-t border-border font-bold text-foreground">
                <span>TOTAL OPERATING EXPENSES</span>
                <span className="text-[#FF6B00]">ETB {combinedOperatingExpenses.toLocaleString()}</span>
              </div>
            </div>

            {/* Final Net Profit */}
            <div className="p-4 rounded-2xl bg-[#0E1712] text-white border border-[#22C55E] flex justify-between items-center text-base font-black">
              <span>NET OPERATING PROFIT</span>
              <span className="text-[#22C55E]">
                ETB {combinedNetProfit.toLocaleString()} ({((combinedNetProfit / combinedRevenue) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT VIEW 2: CEMENT TRADING P&L */}
      {selectedReport === 'cement_pnl' && (
        <div className="rounded-3xl border border-border bg-surface shadow-card p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#22C55E]" />
                <span>Cement Trading Division — Profit &amp; Loss</span>
              </h2>
              <p className="text-xs text-muted-foreground">Purchases, commercial distribution sales, and depot carrying costs.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] font-bold text-xs">
              Division: Cement
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-2 px-3 rounded-xl bg-surface-elevated font-semibold">
              <span>Cement Commercial Sales Revenue</span>
              <span className="font-bold text-foreground">ETB {cementRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-xl bg-surface-elevated font-semibold">
              <span>Less: Factory Procurement Costs (COGS)</span>
              <span className="font-bold text-[#FF6B00]">- ETB {cementCOGS.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 px-3 border-t border-border font-bold text-sm">
              <span>Cement Gross Margin</span>
              <span className="text-[#22C55E]">ETB {cementGrossProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-xl bg-surface-elevated">
              <span>Cement-Specific Operating Expenses</span>
              <span>- ETB {cementOperatingExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-xl bg-surface-elevated">
              <span>Allocated Shared Headquarters Overhead ({sharedAllocationMethod === '60_40' ? '60%' : '50%'})</span>
              <span>- ETB {sharedSplit.cement.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0E1712] text-white border border-[#22C55E] flex justify-between font-black text-sm">
              <span>CEMENT DIVISION NET PROFIT</span>
              <span className="text-[#22C55E]">ETB {cementNetProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT VIEW 3: TRANSPORT & FLEET P&L */}
      {selectedReport === 'transport_pnl' && (
        <div className="rounded-3xl border border-border bg-surface shadow-card p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#FF6B00]" />
                <span>Transport &amp; Haulage Division — Profit &amp; Loss</span>
              </h2>
              <p className="text-xs text-muted-foreground">Commercial freight revenue, fuel telemetry accounting, and maintenance.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] font-bold text-xs">
              Division: Transport
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-2 px-3 rounded-xl bg-surface-elevated font-semibold">
              <span>Gross Freight Revenue (Zarima Net Share)</span>
              <span className="font-bold text-foreground">ETB {transportRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-xl bg-surface-elevated">
              <span>Less: Direct Fleet Fuel (Diesel Outlays)</span>
              <span className="text-[#FF6B00]">- ETB {transportFuelCosts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-xl bg-surface-elevated">
              <span>Less: Fleet Maintenance &amp; Parts Replacement</span>
              <span className="text-[#FF6B00]">- ETB {transportMaintenanceCosts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-xl bg-surface-elevated">
              <span>Less: Heavy Driver Payroll &amp; Per Diem Allowances</span>
              <span className="text-[#FF6B00]">- ETB {transportDriverPayroll.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 px-3 border-t border-border font-bold text-sm">
              <span>Transport Gross Profit</span>
              <span className="text-[#22C55E]">ETB {transportGrossProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 px-3 rounded-xl bg-surface-elevated">
              <span>Allocated Shared Headquarters Overhead ({sharedAllocationMethod === '60_40' ? '40%' : '50%'})</span>
              <span>- ETB {sharedSplit.transport.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0E1712] text-white border border-[#FF6B00] flex justify-between font-black text-sm">
              <span>TRANSPORT DIVISION NET PROFIT</span>
              <span className="text-[#FF6B00]">ETB {transportNetProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT VIEW 4: TRUCK PROFITABILITY */}
      {selectedReport === 'truck_profit' && (
        <div className="rounded-3xl border border-border bg-surface shadow-card p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Unit Fleet &amp; Truck Profitability</h2>
              <p className="text-xs text-muted-foreground">Revenue generated vs direct costs (fuel, repairs) per heavy commercial hauler.</p>
            </div>
            <span className="text-xs text-muted-foreground">{truckProfitability.length} Units Tracked</span>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-elevated text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Truck Plate</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4 text-center">Completed Trips</th>
                  <th className="py-3 px-4 text-right">Freight Revenue</th>
                  <th className="py-3 px-4 text-right">Fuel Cost</th>
                  <th className="py-3 px-4 text-right">Maintenance Cost</th>
                  <th className="py-3 px-4 text-right">Net Operating Profit</th>
                  <th className="py-3 px-4 text-center">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {truckProfitability.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">{t.plateNumber}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{t.driverName}</td>
                    <td className="py-3.5 px-4 text-center font-bold">{t.totalTrips}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-foreground">ETB {t.revenue.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right text-[#FF6B00]">ETB {t.fuel.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right text-[#FF6B00]">ETB {t.maintenance.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-black text-[#16A34A] dark:text-[#22C55E]">
                      ETB {t.netProfit.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-foreground">{t.margin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT VIEW 5: MEMBER EXPENSES */}
      {selectedReport === 'member_expenses' && (
        <div className="rounded-3xl border border-border bg-surface shadow-card p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Member-Funded Outlays Audit Report</h2>
              <p className="text-xs text-muted-foreground">Liabilities owed to company partners, reimbursements disbursed, and net balances.</p>
            </div>
            <span className="text-xs font-bold text-[#FF6B00]">
              Total Liability Owed: ETB{' '}
              {memberExpenses.reduce((sum, e) => sum + e.remainingOwedETB, 0).toLocaleString()}
            </span>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-elevated text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Ref &amp; Date</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4 text-right">Funded Amount</th>
                  <th className="py-3 px-4 text-right">Reimbursed</th>
                  <th className="py-3 px-4 text-right">Remaining Owed</th>
                  <th className="py-3 px-4">Reimbursement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {memberExpenses.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">{m.expenseNumber}</td>
                    <td className="py-3 px-4 font-bold text-foreground">{m.memberName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{m.category}</td>
                    <td className="py-3 px-4 font-semibold">{m.businessActivity}</td>
                    <td className="py-3 px-4 text-right font-bold text-foreground">ETB {m.amountETB.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-[#16A34A] dark:text-[#22C55E]">
                      ETB {m.amountReimbursedETB.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#FF6B00]">
                      ETB {m.remainingOwedETB.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.reimbursementStatus === 'Fully Reimbursed'
                            ? 'bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E]'
                            : m.reimbursementStatus === 'Partially Reimbursed'
                            ? 'bg-[#FF6B00]/15 text-[#FF6B00]'
                            : 'bg-amber-500/15 text-amber-600'
                        }`}
                      >
                        {m.reimbursementStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT VIEW 6: BANK & CASH REPORT */}
      {selectedReport === 'bank_cash' && (
        <div className="rounded-3xl border border-border bg-surface shadow-card p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Bank &amp; Cash Treasury Audit Report</h2>
              <p className="text-xs text-muted-foreground">Ledger balances, reconciliation statuses, and verified bank statements.</p>
            </div>
            <span className="text-xs font-bold text-[#22C55E]">
              Total Corporate Liquidity: ETB{' '}
              {bankAccounts.reduce((sum, b) => sum + b.balanceETB, 0).toLocaleString()}
            </span>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-elevated text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Bank Name</th>
                  <th className="py-3 px-4">Account Number</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4 text-right">Available Book Balance</th>
                  <th className="py-3 px-4">Last Reconciled</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bankAccounts.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">{b.bankName}</td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{b.accountNumber}</td>
                    <td className="py-3 px-4 text-muted-foreground">{b.branchName}</td>
                    <td className="py-3 px-4 font-medium">{b.accountType}</td>
                    <td className="py-3 px-4 text-right font-black text-foreground">
                      ETB {b.balanceETB.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{b.lastReconciledDate}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E]">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
