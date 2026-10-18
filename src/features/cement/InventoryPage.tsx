import React, { useState } from 'react'
import { Boxes, AlertTriangle, RefreshCw, Plus, ArrowUpRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatQuantity, formatDate } from '@/lib/formatters'
import { CementInventoryItem } from '@/types'

export const InventoryPage: React.FC = () => {
  const { inventory, updateStock } = useStore()
  const { toast } = useToast()

  const [selectedItem, setSelectedItem] = useState<CementInventoryItem | null>(null)
  const [newStockInput, setNewStockInput] = useState<number>(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const totalValue = inventory.reduce((acc, i) => acc + i.totalValueETB, 0)
  const totalQuintals = inventory.reduce((acc, i) => acc + i.currentStockQuintals, 0)

  const handleOpenAdjust = (item: CementInventoryItem) => {
    setSelectedItem(item)
    setNewStockInput(item.currentStockQuintals)
    setIsModalOpen(true)
  }

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    updateStock(selectedItem.id, Number(newStockInput))
    toast({
      title: 'Inventory Stock Updated',
      description: `${selectedItem.warehouseLocation} (${selectedItem.cementType}) updated to ${newStockInput} Qtl.`,
      type: 'success',
    })
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Depot Inventory"
        description="Warehouse stock levels and buffer thresholds across regional depots."
        breadcrumbs={[
          { label: 'Cement Trading', href: '/cement' },
          { label: 'Inventory' },
        ]}
      />


      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-surface shadow-subtle">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Total Cement Valuation
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Based on landed factory unit purchase costs
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-surface shadow-subtle">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Total Stored Quintals
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatQuantity(totalQuintals, 'Qtl')}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Equivalent to {(totalQuintals / 10).toFixed(0)} Metric Tons
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Depot Locations Active
          </div>
          <div className="text-2xl font-bold text-forest dark:text-forest-vibrant">
            4 Operational Yards
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Addis Ababa (Kality), Adama, Mojo, Hawassa
          </div>
        </div>
      </div>

      {/* Inventory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {inventory.map((item) => {
          const ratio = (item.currentStockQuintals / item.minThresholdQuintals) * 100
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card hover:border-forest/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.cementType}
                    </span>
                    <h3 className="text-base font-bold text-foreground leading-tight">
                      {item.warehouseLocation}
                    </h3>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <div className="mt-4 mb-3 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-foreground font-mono">
                      {formatQuantity(item.currentStockQuintals, 'Qtl')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Min Buffer: {formatQuantity(item.minThresholdQuintals, 'Qtl')}
                    </span>
                  </div>

                  {/* Stock progress indicator */}
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.status === 'Critical'
                          ? 'bg-rose-600'
                          : item.status === 'Low Stock'
                          ? 'bg-[#FF6B00]'
                          : 'bg-forest'
                      }`}
                      style={{
                        width: `${Math.min(100, (item.currentStockQuintals / (item.minThresholdQuintals * 2)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 text-xs space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Depot Valuation:</span>
                    <span className="font-semibold text-foreground font-mono">
                      {formatCurrency(item.totalValueETB, { hideDecimals: true })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unit Valuation Rate:</span>
                    <span>{item.unitCostETB} ETB/Qtl</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Stock Audit:</span>
                    <span>{formatDate(item.lastRestockedDate)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-end">
                <button
                  onClick={() => handleOpenAdjust(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-elevated hover:bg-[#FF6B00] hover:text-white hover:border-[#FF6B00] text-foreground border border-border transition-colors shadow-subtle"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Adjust Stock Balance</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stock Adjustment Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Adjust Physical Depot Stock
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Update physical quintals after yard tally for{' '}
              <strong className="text-foreground">{selectedItem.warehouseLocation}</strong>.
            </p>

            <form onSubmit={handleSaveStock} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Cement Product
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedItem.cementType}
                  className="w-full p-2 bg-surface-elevated border border-border rounded-lg text-muted-foreground"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Current Counted Quantity (Quintals)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStockInput}
                  onChange={(e) => setNewStockInput(Number(e.target.value))}
                  className="w-full p-2.5 bg-surface border border-border rounded-lg text-foreground text-sm font-mono font-bold focus:ring-1 focus:ring-forest"
                  autoFocus
                />
              </div>

              <div className="p-3 rounded-lg bg-surface-elevated border border-border/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Threshold Buffer:</span>
                  <span className="font-mono">{selectedItem.minThresholdQuintals} Qtl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Total Valuation:</span>
                  <span className="font-mono font-bold text-foreground">
                    {formatCurrency(newStockInput * selectedItem.unitCostETB)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-surface-elevated text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white font-extrabold shadow-md shadow-[#FF6B00]/30 hover:scale-105 active:scale-95 transition-all text-xs"
                >
                  Apply Stock Audit
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
