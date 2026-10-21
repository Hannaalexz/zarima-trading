import React from 'react'
import { Link } from 'react-router-dom'
import {
  Truck,
  PackageCheck,
  Wrench,
  Fuel,
  TrendingUp,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { MetricCard } from '@/components/shared/MetricCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useStore } from '@/data/storeContext'
import { formatCurrency } from '@/lib/formatters'

export const FleetDashboard: React.FC = () => {
  const { trucks, deliveries, maintenance, fuelExpenses } = useStore()

  const totalTrucks = trucks.length
  const activeTrucks = trucks.filter((t) => t.operationalStatus === 'Active Trip').length
  const inMaintenanceTrucks = trucks.filter((t) => t.operationalStatus === 'In Maintenance').length
  const availableTrucks = trucks.filter((t) => t.operationalStatus === 'Available').length

  const activeDeliveries = deliveries.filter((d) => d.deliveryStatus === 'In Transit').length
  const totalFreightRevenue = deliveries.reduce((acc, d) => acc + d.freightChargeETB, 0)
  const totalFuelCost = fuelExpenses.reduce((acc, f) => acc + f.totalCostETB, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Logistics"
        description="Commercial haulage fleet operations, active corridor dispatches, and maintenance."
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/fleet/deliveries"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Dispatch Delivery</span>
            </Link>
            <Link
              to="/fleet/trucks"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface/90 border border-border hover:bg-surface-elevated text-foreground transition-colors shadow-subtle"
            >
              <Truck className="w-3.5 h-3.5 text-forest dark:text-forest-vibrant" />
              <span>Fleet Inventory</span>
            </Link>
          </div>
        }
      />

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Fleet On Road"
          value={`${activeTrucks} / ${totalTrucks}`}
          subtitle={`${availableTrucks} Ready &bull; ${inMaintenanceTrucks} Workshop`}
          trend={{ value: 16.7 }}
          icon={<Truck className="w-4 h-4" />}
        />
        <MetricCard
          title="Active Deliveries"
          value={activeDeliveries}
          subtitle="Waybills in transit"
          trend={{ value: 8.3 }}
          icon={<PackageCheck className="w-4 h-4" />}
        />
        <MetricCard
          title="Freight Revenue"
          value={formatCurrency(totalFreightRevenue, { compact: true })}
          subtitle="Haulage billing ledger"
          trend={{ value: 11.2 }}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          title="Diesel Expenses"
          value={formatCurrency(totalFuelCost, { compact: true })}
          subtitle="Fuel vouchers logged"
          trend={{ value: -2.4 }}
          icon={<Fuel className="w-4 h-4" />}
        />
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Trucks Status (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              Commercial Fleet Roster
            </h3>
            <Link
              to="/fleet/trucks"
              className="text-xs text-forest dark:text-forest-vibrant font-semibold hover:underline"
            >
              Manage Trucks
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="pb-2">Plate Number</th>
                  <th className="pb-2">Model &amp; Capacity</th>
                  <th className="pb-2">Driver</th>
                  <th className="pb-2 text-right">Odometer (km)</th>
                  <th className="pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {trucks.map((trk) => (
                  <tr key={trk.id} className="hover:bg-surface-elevated/40">
                    <td className="py-2.5 font-mono font-bold text-foreground">
                      {trk.plateNumber}
                    </td>
                    <td className="py-2.5">
                      <div className="font-semibold text-foreground">{trk.makeModel}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {trk.capacityQuintals} Qtl &bull; {trk.modelYear}
                      </div>
                    </td>
                    <td className="py-2.5 text-foreground whitespace-nowrap">
                      {trk.driverName}
                    </td>
                    <td className="py-2.5 text-right font-mono text-foreground">
                      {trk.mileageKm.toLocaleString()} km
                    </td>
                    <td className="py-2.5 text-center">
                      <StatusBadge status={trk.operationalStatus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance Log (1 col) */}
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Wrench className="w-4 h-4 text-forest dark:text-forest-vibrant" />
                <span>Service &amp; Maintenance</span>
              </h3>
              <Link
                to="/fleet/maintenance"
                className="text-xs text-forest dark:text-forest-vibrant font-semibold hover:underline"
              >
                Log History
              </Link>
            </div>

            <div className="space-y-3 mt-3">
              {maintenance.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-surface-elevated/70 border border-border/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground">
                      {m.truckPlate}
                    </span>
                    <StatusBadge status={m.status} size="sm" />
                  </div>
                  <div className="font-medium text-foreground truncate">
                    {m.serviceType}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>{m.workshopName}</span>
                    <span className="font-bold text-foreground font-mono">
                      {formatCurrency(m.costETB, { hideDecimals: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/fleet/maintenance"
            className="w-full py-2 text-center text-xs font-semibold rounded-xl bg-surface-elevated hover:bg-forest/10 dark:hover:bg-forest-light/20 text-forest dark:text-forest-vibrant border border-forest/20 transition-colors block"
          >
            All Service Records ({maintenance.length})
          </Link>
        </div>
      </div>
    </div>
  )
}
