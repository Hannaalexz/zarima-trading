import React from 'react'
import { Link } from 'react-router-dom'
import {
  Boxes,
  Truck,
  Plus,
  TrendingUp,
  Landmark,
  Scale,
  Users,
  Wallet,
  ArrowRight,
  ShieldCheck,
  FileBarChart,
  ShoppingBag,
  DollarSign,
  Fuel,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
  PackageCheck,
} from 'lucide-react'
import { useStore } from '@/data/storeContext'
import { useAuth } from '@/data/authContext'
import { formatCurrency, formatQuantity } from '@/lib/formatters'

export const MainDashboard: React.FC = () => {
  const {
    inventory,
    purchases,
    sales,
    trucks,
    deliveries,
    fuelExpenses,
    maintenance,
    bankAccounts,
    memberExpenses,
  } = useStore()
  const { currentUser } = useAuth()

  // 1. CEMENT MANAGEMENT FINANCIALS & INVENTORY
  // Single inventory depot in Addis Ababa (Kality)
  const addisInventory = inventory.filter(
    (i) => i.warehouseLocation.includes('Addis') || i.warehouseLocation.includes('Kality')
  )
  const totalAddisStockQuintals = addisInventory.length > 0
    ? addisInventory.reduce((sum, i) => sum + i.currentStockQuintals, 0)
    : inventory.reduce((sum, i) => sum + i.currentStockQuintals, 0)
  
  const totalAddisStockValue = addisInventory.length > 0
    ? addisInventory.reduce((sum, i) => sum + i.totalValueETB, 0)
    : inventory.reduce((sum, i) => sum + i.totalValueETB, 0)

  const cementRevenue = sales.reduce((sum, s) => sum + s.totalAmountETB, 0)
  const cementCOGS = purchases.reduce((sum, p) => sum + p.totalAmountETB, 0)
  const cementGrossProfit = cementRevenue - cementCOGS
  const cementGrossMarginPct = cementRevenue > 0 ? (cementGrossProfit / cementRevenue) * 100 : 0
  const walkinSalesCount = sales.filter((s) => s.customerName.toLowerCase().includes('walk') || s.customerType === 'New').length

  // 2. TRUCK MANAGEMENT FINANCIALS & FLEET
  const totalTrucks = trucks.length
  const inTransitTrucks = trucks.filter((t) => t.operationalStatus === 'Active Trip').length
  const availableTrucks = trucks.filter((t) => t.operationalStatus === 'Available').length
  const workshopTrucks = trucks.filter((t) => t.operationalStatus === 'In Maintenance').length

  const truckFreightRevenue = deliveries.reduce((sum, d) => sum + d.freightChargeETB, 0)
  const directFuelCost = fuelExpenses.reduce((sum, f) => sum + f.totalCostETB, 0)
  const truckGrossProfit = truckFreightRevenue - directFuelCost
  const truckGrossMarginPct = truckFreightRevenue > 0 ? (truckGrossProfit / truckFreightRevenue) * 100 : 0
  const maintenanceCost = maintenance.reduce((sum, m) => sum + m.costETB, 0)

  // 3. OVERALL FINANCE & TREASURY
  const totalBankLiquidity = bankAccounts.reduce((sum, b) => sum + b.balanceETB, 0)
  const totalMemberOwed = memberExpenses.reduce((sum, m) => sum + m.remainingOwedETB, 0)
  const combinedOperatingGross = cementGrossProfit + truckGrossProfit

  return (
    <div className="space-y-6">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP WELCOME & PERSONA HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-[#22C55E] via-[#24CB63] to-[#16A34A] text-[#060B08] shadow-[0_14px_45px_rgba(34,197,94,0.30)] border border-[#22C55E] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -top-12 -left-12 w-56 h-56 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#060B08]/15 text-[#060B08] text-xs font-black uppercase tracking-wider backdrop-blur-sm shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#060B08] animate-ping" />
              <span>{currentUser?.role === 'accountant' ? 'Bethlehem Tefera' : 'Dawit Tadesse'}</span>
            </span>
            <span className="text-xs font-bold text-[#060B08]/80 tracking-tight border-l border-[#060B08]/20 pl-2.5">
              {currentUser?.roleTitle || 'Managing Partner & Systems Administrator'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#060B08] font-sans">
            Operations &amp; Financial Control Tower
          </h1>

          <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#060B08]/15 font-black text-xs text-[#060B08] shadow-xs">
              <Boxes className="w-3.5 h-3.5 text-[#060B08]" />
              <span>Single Inventory: Addis Ababa Central Depot</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00] text-white font-extrabold text-xs shadow-md shadow-[#FF6B00]/30">
              <Truck className="w-3.5 h-3.5" />
              <span>42 Heavy Haulers Fleet</span>
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="relative z-10 flex items-center gap-3 flex-wrap flex-shrink-0 self-start md:self-center">
          <Link
            to="/cement/sales"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-full bg-[#060B08] hover:bg-black text-white transition-all shadow-xl shadow-black/30 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>+ Walk-in Sales Invoice</span>
          </Link>
          <Link
            to="/cement/purchases"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full bg-white/95 hover:bg-white dark:bg-[#060B08] text-[#060B08] dark:text-[#22C55E] transition-all shadow-md border border-white/80 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ Purchases Invoice</span>
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* THE TWO CORE MANAGEMENT PILLARS (CEMENT & TRUCK) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ========================================================= */}
        {/* PILLAR 1: CEMENT MANAGEMENT */}
        {/* ========================================================= */}
        <div className="rounded-3xl border-2 border-[#22C55E]/40 hover:border-[#22C55E] bg-white/95 dark:bg-[#0E1712]/95 backdrop-blur-xl p-6 shadow-card transition-all flex flex-col justify-between space-y-6 group">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border/80">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] border border-[#22C55E]/30">
                  <Boxes className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#16A34A] dark:text-[#22C55E]">
                    Primary Commodity Trading
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-[#16A34A] dark:group-hover:text-[#22C55E] transition-colors">
                    Cement Management
                  </h2>
                  <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                    Central Storage: <strong>Addis Ababa Central Depot (Kality Yard)</strong>
                  </div>
                </div>
              </div>
              <Link
                to="/cement"
                className="px-3 py-1 rounded-full bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] text-xs font-bold hover:bg-[#22C55E] hover:text-[#060B08] transition-all flex items-center gap-1"
              >
                <span>Enter</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Inventory Status (Single Addis Inventory) */}
            <div className="mt-4 p-4 rounded-2xl bg-surface-elevated border border-border/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  <span>Addis Central Stock: {formatQuantity(totalAddisStockQuintals, 'Qtl')}</span>
                </span>
                <span className="font-mono font-bold text-[#16A34A] dark:text-[#22C55E]">
                  Valuation: {formatCurrency(totalAddisStockValue, { compact: true })}
                </span>
              </div>

              {/* Cement Grades In Stock */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded-xl bg-surface border border-border">
                  <div className="text-[10px] text-muted-foreground font-semibold">OPC 42.5N</div>
                  <div className="text-sm font-black text-foreground font-mono">4,850 Qtl</div>
                </div>
                <div className="p-2 rounded-xl bg-surface border border-border">
                  <div className="text-[10px] text-muted-foreground font-semibold">PPC 32.5R</div>
                  <div className="text-sm font-black text-foreground font-mono">1,420 Qtl</div>
                </div>
                <div className="p-2 rounded-xl bg-surface border border-border">
                  <div className="text-[10px] text-muted-foreground font-semibold">Bulk Cement</div>
                  <div className="text-sm font-black text-foreground font-mono">800 Qtl</div>
                </div>
              </div>
            </div>

            {/* Cement Related Financial Performance */}
            <div className="mt-4 space-y-2">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Cement Financials &amp; Margin</span>
                <Link
                  to="/finance/reports?report=cement_pnl"
                  className="text-[#16A34A] dark:text-[#22C55E] text-[11px] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Cement P&amp;L Report</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-muted-foreground text-[11px] block">Cement Sales Revenue</span>
                  <span className="font-mono font-black text-base text-foreground">
                    {formatCurrency(cementRevenue, { compact: true })}
                  </span>
                  <span className="text-[10px] text-[#22C55E] block font-semibold">
                    {walkinSalesCount} Walk-in customer invoices
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-muted-foreground text-[11px] block">Procurement (COGS)</span>
                  <span className="font-mono font-black text-base text-foreground">
                    {formatCurrency(cementCOGS, { compact: true })}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Dangote, Derba, Mugher
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-muted-foreground text-[11px] block">Cement Gross Profit</span>
                  <span className="font-mono font-black text-base text-[#16A34A] dark:text-[#22C55E]">
                    {formatCurrency(cementGrossProfit, { compact: true })}
                  </span>
                  <span className="text-[10px] text-muted-foreground block font-bold">
                    Margin: {cementGrossMarginPct.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-muted-foreground text-[11px] block">Customer Receivables</span>
                  <span className="font-mono font-black text-base text-[#FF6B00]">
                    ETB 5.16M
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Immediate / Short cycle
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-2 flex-wrap">
            <Link
              to="/cement/sales"
              className="px-3.5 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#060B08] font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Sales Invoices (Walk-in)</span>
            </Link>
            <Link
              to="/cement/purchases"
              className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-foreground font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Purchases Invoices</span>
            </Link>
            <Link
              to="/cement/inventory"
              className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-foreground font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Boxes className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Addis Stock</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PILLAR 2: TRUCK MANAGEMENT */}
        {/* ========================================================= */}
        <div className="rounded-3xl border-2 border-[#FF6B00]/40 hover:border-[#FF6B00] bg-white/95 dark:bg-[#0E1712]/95 backdrop-blur-xl p-6 shadow-card transition-all flex flex-col justify-between space-y-6 group">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border/80">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF6B00]">
                    Corridor Logistics &amp; Haulage
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-[#FF6B00] transition-colors">
                    Truck Management
                  </h2>
                  <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                    Fleet Size: <strong>42 Heavy Commercial Haulers</strong> (700–800 Qtl)
                  </div>
                </div>
              </div>
              <Link
                to="/fleet"
                className="px-3 py-1 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] text-xs font-bold hover:bg-[#FF6B00] hover:text-white transition-all flex items-center gap-1"
              >
                <span>Enter</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Fleet Status Summary */}
            <div className="mt-4 p-4 rounded-2xl bg-surface-elevated border border-border/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                  <span>Haulage Road Status: {totalTrucks} Commercial Haulers</span>
                </span>
                <span className="font-mono font-bold text-[#FF6B00]">
                  42 Drivers Assigned
                </span>
              </div>

              {/* Truck Fleet Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded-xl bg-surface border border-border">
                  <div className="text-[10px] text-muted-foreground font-semibold">In Transit</div>
                  <div className="text-sm font-black text-[#FF6B00] font-mono">{inTransitTrucks || 24} Trucks</div>
                </div>
                <div className="p-2 rounded-xl bg-surface border border-border">
                  <div className="text-[10px] text-muted-foreground font-semibold">Available</div>
                  <div className="text-sm font-black text-[#16A34A] dark:text-[#22C55E] font-mono">{availableTrucks || 12} Trucks</div>
                </div>
                <div className="p-2 rounded-xl bg-surface border border-border">
                  <div className="text-[10px] text-muted-foreground font-semibold">In Workshop</div>
                  <div className="text-sm font-black text-muted-foreground font-mono">{workshopTrucks || 6} Trucks</div>
                </div>
              </div>
            </div>

            {/* Truck Related Financial Performance */}
            <div className="mt-4 space-y-2">
              <div className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Truck Financials &amp; Freight Margin</span>
                <Link
                  to="/finance/reports?report=transport_pnl"
                  className="text-[#FF6B00] text-[11px] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Truck P&amp;L Report</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-muted-foreground text-[11px] block">Freight Haulage Revenue</span>
                  <span className="font-mono font-black text-base text-foreground">
                    {formatCurrency(truckFreightRevenue, { compact: true })}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Full load &amp; co-loading
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-muted-foreground text-[11px] block">Direct Fuel Expenses</span>
                  <span className="font-mono font-black text-base text-foreground">
                    {formatCurrency(directFuelCost, { compact: true })}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Total bulk diesel outlays
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-muted-foreground text-[11px] block">Truck Gross Margin</span>
                  <span className="font-mono font-black text-base text-[#FF6B00]">
                    {formatCurrency(truckGrossProfit, { compact: true })}
                  </span>
                  <span className="text-[10px] text-muted-foreground block font-bold">
                    Margin: {truckGrossMarginPct.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-muted-foreground text-[11px] block">Workshop Maintenance</span>
                  <span className="font-mono font-black text-base text-foreground">
                    {formatCurrency(maintenanceCost, { compact: true })}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Tires, lubricants, service
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-2 flex-wrap">
            <Link
              to="/fleet/deliveries"
              className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Active Deliveries</span>
            </Link>
            <Link
              to="/fleet/trucks"
              className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-foreground font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>42 Trucks Fleet</span>
            </Link>
            <Link
              to="/fleet/fuel"
              className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-foreground font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Fuel className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Fuel Outlays</span>
            </Link>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* OVERALL CORPORATE FINANCE & TREASURY */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl border border-border bg-white/95 dark:bg-[#0E1712]/95 backdrop-blur-xl p-6 sm:p-7 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-surface-elevated border border-border text-foreground">
              <Landmark className="w-6 h-6 text-[#22C55E]" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Consolidated Corporate Treasury
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                Overall Corporate Finance
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Consolidated 10 commercial bank portfolios, automated reconciliation, and combined P&amp;L roll-up.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/finance/reconciliation"
              className="px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#060B08] font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Reconciliation Desk</span>
            </Link>
            <Link
              to="/finance/reports?report=combined_pnl"
              className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <FileBarChart className="w-3.5 h-3.5" />
              <span>Combined P&amp;L</span>
            </Link>
          </div>
        </div>

        {/* 4 Key Overall Finance Stat Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border/80 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              10 Bank Portfolios
            </span>
            <div className="text-2xl font-black text-foreground font-mono">
              {formatCurrency(totalBankLiquidity, { compact: true })}
            </div>
            <div className="text-[11px] text-[#16A34A] dark:text-[#22C55E] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>CBE, Awash, Abyssinia, Dashen</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border/80 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Reconciliation Health
            </span>
            <div className="text-2xl font-black text-[#16A34A] dark:text-[#22C55E] font-mono">
              94.2% Match
            </div>
            <div className="text-[11px] text-muted-foreground">
              Multi-bank statement automated engine
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border/80 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Due to Members
            </span>
            <div className="text-2xl font-black text-[#FF6B00] font-mono">
              {formatCurrency(totalMemberOwed, { compact: true })}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Partner outlays (zero P&amp;L double-count)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-elevated border border-border/80 space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Combined Gross Margin
            </span>
            <div className="text-2xl font-black text-foreground font-mono">
              {formatCurrency(combinedOperatingGross, { compact: true })}
            </div>
            <div className="text-[11px] text-[#22C55E] font-semibold">
              Cement + Truck direct margins
            </div>
          </div>

        </div>

        {/* Bottom Fast Links */}
        <div className="pt-2 flex items-center justify-between border-t border-border/70 text-xs text-muted-foreground">
          <div className="flex items-center gap-4 flex-wrap">
            <Link to="/finance/banks" className="hover:text-foreground font-semibold flex items-center gap-1">
              <Landmark className="w-3 h-3 text-[#22C55E]" />
              <span>Bank Accounts</span>
            </Link>
            <Link to="/finance/transactions" className="hover:text-foreground font-semibold flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-[#22C55E]" />
              <span>Transaction Journal</span>
            </Link>
            <Link to="/finance/member-expenses" className="hover:text-foreground font-semibold flex items-center gap-1">
              <Users className="w-3 h-3 text-[#FF6B00]" />
              <span>Member Reimbursements</span>
            </Link>
          </div>
          <Link
            to="/finance/reports"
            className="text-foreground hover:text-[#22C55E] font-bold inline-flex items-center gap-1"
          >
            <span>Open Financial Reports →</span>
          </Link>
        </div>
      </div>

    </div>
  )
}
