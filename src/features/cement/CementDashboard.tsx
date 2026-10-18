import React from 'react'
import { Link } from 'react-router-dom'
import {
  Boxes,
  ShoppingBag,
  TrendingUp,
  Building2,
  Users,
  Plus,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { MetricCard } from '@/components/shared/MetricCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useStore } from '@/data/storeContext'
import { formatCurrency, formatQuantity } from '@/lib/formatters'

export const CementDashboard: React.FC = () => {
  const { purchases, sales, inventory, suppliers, customers } = useStore()

  const totalInventoryValue = inventory.reduce((acc, i) => acc + i.totalValueETB, 0)
  const totalStockQuintals = inventory.reduce((acc, i) => acc + i.currentStockQuintals, 0)
  const totalPurchasesYTD = purchases.reduce((acc, p) => acc + p.totalAmountETB, 0)
  const totalCustomerReceivables = customers.reduce((acc, c) => acc + c.outstandingBalanceETB, 0)
  const totalSupplierPayables = suppliers.reduce((acc, s) => acc + s.outstandingPayableETB, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cement Trading"
        description="Factory procurement quotas, depot inventory balances, and contractor sales distribution."
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/cement/purchases"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Purchase Order</span>
            </Link>
            <Link
              to="/cement/sales"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface/90 border border-border hover:bg-surface-elevated text-foreground transition-colors shadow-subtle"
            >
              <TrendingUp className="w-3.5 h-3.5 text-forest dark:text-forest-vibrant" />
              <span>Sales Invoice</span>
            </Link>
          </div>
        }
      />

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Stock Valuation"
          value={formatCurrency(totalInventoryValue, { compact: true })}
          subtitle={`${formatQuantity(totalStockQuintals, 'Qtl')} stored`}
          trend={{ value: 5.6 }}
          icon={<Boxes className="w-4 h-4" />}
        />
        <MetricCard
          title="Factory Procurement"
          value={formatCurrency(totalPurchasesYTD, { compact: true })}
          subtitle={`${purchases.length} Active orders`}
          trend={{ value: 14.2 }}
          icon={<ShoppingBag className="w-4 h-4" />}
        />
        <MetricCard
          title="Contractor Credit"
          value={formatCurrency(totalCustomerReceivables, { compact: true })}
          subtitle="Trade receivables"
          trend={{ value: 2.1, isPositiveGood: false }}
          icon={<Users className="w-4 h-4" />}
        />
        <MetricCard
          title="Factory Payables"
          value={formatCurrency(totalSupplierPayables, { compact: true })}
          subtitle="Manufacturer commitments"
          trend={{ value: -6.4 }}
          icon={<Building2 className="w-4 h-4" />}
        />
      </div>

      {/* Depot Inventory & Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Depot Levels (1 col) */}
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              Depot Stock Levels
            </h3>
            <Link
              to="/cement/inventory"
              className="text-xs text-forest dark:text-forest-vibrant font-semibold hover:underline"
            >
              All Depots
            </Link>
          </div>

          <div className="space-y-3">
            {inventory.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-surface-elevated/70 border border-border/80 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground truncate max-w-[170px]">
                    {item.warehouseLocation}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.cementType}</span>
                  <span className="font-bold text-foreground font-mono">
                    {formatQuantity(item.currentStockQuintals, 'Qtl')}
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.status === 'Critical'
                        ? 'bg-rose-600'
                        : item.status === 'Low Stock'
                        ? 'bg-amber-500'
                        : 'bg-forest'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (item.currentStockQuintals / (item.minThresholdQuintals * 2)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchases (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              Recent Factory Purchases
            </h3>
            <Link
              to="/cement/purchases"
              className="text-xs text-forest dark:text-forest-vibrant font-semibold hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="pb-2">PO #</th>
                  <th className="pb-2">Supplier Plant</th>
                  <th className="pb-2">Grade</th>
                  <th className="pb-2">Qty (Qtl)</th>
                  <th className="pb-2 text-right">Total (ETB)</th>
                  <th className="pb-2 text-center">Delivery</th>
                  <th className="pb-2 text-center">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {purchases.map((po) => (
                  <tr key={po.id} className="hover:bg-surface-elevated/40">
                    <td className="py-2.5 font-mono font-semibold text-foreground">
                      {po.purchaseOrderNo}
                    </td>
                    <td className="py-2.5 text-foreground font-medium truncate max-w-[150px]">
                      {po.supplierName}
                    </td>
                    <td className="py-2.5 text-muted-foreground whitespace-nowrap">
                      {po.cementType}
                    </td>
                    <td className="py-2.5 font-mono text-foreground">
                      {po.quantityQuintals}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-foreground">
                      {formatCurrency(po.totalAmountETB, { hideDecimals: true })}
                    </td>
                    <td className="py-2.5 text-center">
                      <StatusBadge status={po.deliveryStatus} size="sm" />
                    </td>
                    <td className="py-2.5 text-center">
                      <StatusBadge status={po.paymentStatus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
