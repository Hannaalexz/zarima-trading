import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Phone,
  Building2,
  CreditCard,
  Search,
  ArrowUpRight,
  Star,
  Sparkles,
  FileBarChart,
  Boxes,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Download,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatQuantity, formatDate } from '@/lib/formatters'

export const CustomersPage: React.FC = () => {
  const { customers, sales } = useStore()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'directory' | 'report'>('directory')
  const [searchTerm, setSearchTerm] = useState('')
  const [customerFilter, setCustomerFilter] = useState<'ALL' | 'Usual' | 'New'>('ALL')

  // Directory filter
  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tinNumber.includes(searchTerm) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())

    const isUsualMatch =
      customerFilter === 'ALL' ||
      (customerFilter === 'Usual' && (c.isUsual ?? true)) ||
      (customerFilter === 'New' && c.isUsual === false)

    return matchesSearch && isUsualMatch
  })

  // Customer purchase summary report (aggregating from actual sales invoices)
  const customerPurchaseReport = useMemo(() => {
    const reportMap: Record<
      string,
      {
        customerName: string
        totalQuintals: number
        totalETB: number
        invoiceCount: number
        lastDate: string
        city: string
        isRegistered: boolean
      }
    > = {}

    sales.forEach((s) => {
      const name = s.customerName || 'Walk-in Customer'
      if (!reportMap[name]) {
        const isReg = customers.some((c) => c.company.toLowerCase() === name.toLowerCase())
        reportMap[name] = {
          customerName: name,
          totalQuintals: 0,
          totalETB: 0,
          invoiceCount: 0,
          lastDate: s.saleDate,
          city: s.destinationCity || 'Addis Ababa',
          isRegistered: isReg,
        }
      }
      reportMap[name].totalQuintals += s.quantityQuintals
      reportMap[name].totalETB += s.totalAmountETB
      reportMap[name].invoiceCount += 1
      if (new Date(s.saleDate) > new Date(reportMap[name].lastDate)) {
        reportMap[name].lastDate = s.saleDate
      }
    })

    return Object.values(reportMap)
      .filter((r) => r.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.totalETB - a.totalETB)
  }, [sales, customers, searchTerm])

  const totalReportRevenue = customerPurchaseReport.reduce((acc, r) => acc + r.totalETB, 0)
  const totalReportQuintals = customerPurchaseReport.reduce((acc, r) => acc + r.totalQuintals, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regular Customers"
        description="Directory of regularly returning customers registered for quick invoice dropdown selection. No long-term contracts required."
        breadcrumbs={[
          { label: 'Cement Trading', href: '/cement' },
          { label: 'Customers' },
        ]}
        actions={
          <Link
            to="/configuration?tab=partners"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Configure in Master Data</span>
          </Link>
        }
      />

      {/* Tab Switcher: Directory vs Purchases Summary Report */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('directory')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'directory'
              ? 'bg-forest text-white shadow-subtle'
              : 'bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Directory ({customers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'report'
              ? 'bg-[#FF6B00] text-white shadow-subtle'
              : 'bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileBarChart className="w-4 h-4" />
          <span>Customer Purchase Summary Report</span>
        </button>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by customer name, TIN, or city..."
              className="w-full sm:w-80"
            />

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                onClick={() => setCustomerFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  customerFilter === 'ALL'
                    ? 'bg-[#060B08] dark:bg-forest text-white shadow-subtle'
                    : 'bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/70'
                }`}
              >
                All Regular ({customers.length})
              </button>
              <button
                onClick={() => setCustomerFilter('Usual')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  customerFilter === 'Usual'
                    ? 'bg-forest text-white shadow-subtle'
                    : 'bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/70'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Usual Customers</span>
              </button>
              <button
                onClick={() => setCustomerFilter('New')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  customerFilter === 'New'
                    ? 'bg-amber-600 text-white shadow-subtle'
                    : 'bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/70'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Recent Buyers</span>
              </button>
            </div>
          </div>

          {/* Customer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => {
              const creditUsedRatio = (c.outstandingBalanceETB / (c.creditLimitETB || 1)) * 100
              const isUsualCust = c.isUsual ?? true
              const isWalkIn = c.id === 'CUST-WALKIN'
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card hover:border-forest/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-foreground">
                            {c.company}
                          </h3>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Contact: {c.name} &bull; {c.city}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <StatusBadge status={c.status} size="sm" />
                        {isWalkIn ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-500/25">
                            <span>Counter Walk-in</span>
                          </span>
                        ) : isUsualCust ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-forest/15 text-forest dark:text-forest-vibrant font-semibold text-[10px] border border-forest/25">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>Usual</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold text-[10px] border border-amber-500/25">
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                            <span>New</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="my-3 p-3 rounded-xl bg-surface-elevated/70 border border-border/80 text-xs space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Outstanding Balance:</span>
                        <span className="font-bold text-foreground font-mono">
                          {formatCurrency(c.outstandingBalanceETB)}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline text-[11px] text-muted-foreground">
                        <span>Invoice Payment Terms:</span>
                        <span className="font-semibold text-foreground">{c.paymentTerms}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Ethiopian TIN:</span>
                        <span className="font-mono text-foreground">{c.tinNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span className="text-foreground">{c.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border flex items-center justify-end">
                    <Link
                      to="/configuration?tab=partners"
                      className="text-xs text-muted-foreground hover:text-forest font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Edit in Master Data</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        /* ========================================================= */
        /* CUSTOMER PURCHASES SUMMARY REPORT */
        /* ========================================================= */
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface border border-border shadow-subtle">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Total Customer Sales Revenue</span>
              <div className="text-2xl font-black text-foreground font-mono mt-1">
                {formatCurrency(totalReportRevenue, { hideDecimals: true })}
              </div>
              <span className="text-[11px] text-muted-foreground">Aggregated across all sales invoices</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border shadow-subtle">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Total Volume Dispatched</span>
              <div className="text-2xl font-black text-forest dark:text-forest-vibrant font-mono mt-1">
                {formatQuantity(totalReportQuintals, 'Qtl')}
              </div>
              <span className="text-[11px] text-muted-foreground">Equivalent to {(totalReportQuintals / 10).toFixed(0)} Metric Tons</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border shadow-subtle">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Active Purchasing Clients</span>
              <div className="text-2xl font-black text-[#FF6B00] font-mono mt-1">
                {customerPurchaseReport.length} Accounts
              </div>
              <span className="text-[11px] text-muted-foreground">Regular and one-time cash buyers</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 border border-border shadow-card">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Filter purchase report by customer name..."
              className="w-full sm:w-80"
            />
            <button
              onClick={() => {
                toast({
                  title: 'Report Exported',
                  description: 'Customer purchase history ledger exported to CSV format.',
                  type: 'info',
                })
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border hover:bg-surface-elevated text-foreground"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Report Table */}
          <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Customer / Buyer Name</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Delivery Site / City</th>
                    <th className="py-3 px-4 text-center">Invoices</th>
                    <th className="py-3 px-4 text-right">Total Bought (Qtl)</th>
                    <th className="py-3 px-4 text-right">Total Amount (ETB)</th>
                    <th className="py-3 px-4 text-right">Last Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {customerPurchaseReport.map((r, idx) => (
                    <tr key={r.customerName} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-muted-foreground">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        {r.customerName}
                      </td>
                      <td className="py-3 px-4">
                        {r.customerName.toLowerCase().includes('walk-in') ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px]">
                            Walk-in Direct
                          </span>
                        ) : r.isRegistered ? (
                          <span className="px-2 py-0.5 rounded-full bg-forest/15 text-forest dark:text-forest-vibrant font-semibold text-[10px]">
                            Regular Client
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold text-[10px]">
                            One-Time Buyer
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {r.city}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-foreground">
                        {r.invoiceCount}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {formatQuantity(r.totalQuintals, 'Qtl')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-[#FF6B00]">
                        {formatCurrency(r.totalETB, { hideDecimals: true })}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground whitespace-nowrap">
                        {formatDate(r.lastDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
