import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SlidersHorizontal,
  Filter,
  Truck,
  ShieldCheck,
  Wrench,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatQuantity, formatDate } from '@/lib/formatters'
import { TruckStatus } from '@/types'

export const TrucksPage: React.FC = () => {
  const { trucks, updateTruckStatus } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const filtered = trucks.filter((t) => {
    const matchSearch =
      t.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.makeModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || t.operationalStatus === statusFilter
    return matchSearch && matchStatus
  })

  const handleStatusChange = (truckId: string, newStatus: TruckStatus) => {
    updateTruckStatus(truckId, newStatus)
    toast({
      title: 'Status Updated',
      description: `Truck operational status changed to ${newStatus}.`,
      type: 'info',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Truck Fleet"
        description="Heavy-duty Sinotruk HOWO, Actros, and Volvo bulk carriers."
        breadcrumbs={[
          { label: 'Transport & Fleet', href: '/fleet' },
          { label: 'Truck Fleet' },
        ]}
        actions={
          <Link
            to="/configuration?tab=trucks"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Configure Trucks in Master Data</span>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by plate number, make, or driver..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'Active Trip', 'Available', 'In Maintenance'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? st === 'In Maintenance'
                    ? 'bg-[#FF6B00] text-white shadow-sm'
                    : 'bg-[#060B08] dark:bg-forest text-white shadow-subtle'
                  : 'bg-surface-elevated text-muted-foreground hover:text-foreground border border-border/70 hover:border-[#FF6B00]/40'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Trucks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card hover:border-forest/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-mono text-base font-extrabold text-foreground tracking-wide">
                    {t.plateNumber}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t.makeModel} &bull; {t.modelYear}
                  </div>
                </div>
                <StatusBadge status={t.operationalStatus} size="sm" />
              </div>

              <div className="space-y-2 py-3 border-y border-border/60 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Assigned Driver:</span>
                  <span className="font-semibold text-foreground">{t.driverName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payload Capacity:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {formatQuantity(t.capacityQuintals)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Odometer:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {t.mileageKm?.toLocaleString() || 0} km
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Service Interval:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {(t.serviceIntervalKm || 10000).toLocaleString()} km
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Service Date:</span>
                  <span className="text-foreground">{formatDate(t.lastServiceDate)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3.5 mt-3 border-t border-border flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground">Operational Status:</span>
                <div className="flex items-center gap-1.5">
                  {t.operationalStatus !== 'Available' && (
                    <button
                      onClick={() => handleStatusChange(t.id, 'Available')}
                      className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold hover:bg-emerald-500/20"
                    >
                      Set Available
                    </button>
                  )}
                  {t.operationalStatus !== 'Active Trip' && (
                    <button
                      onClick={() => handleStatusChange(t.id, 'Active Trip')}
                      className="px-2 py-1 rounded bg-forest/10 text-forest dark:text-forest-vibrant text-[10px] font-semibold hover:bg-forest/20"
                    >
                      Set Active
                    </button>
                  )}
                  {t.operationalStatus !== 'In Maintenance' && (
                    <button
                      onClick={() => handleStatusChange(t.id, 'In Maintenance')}
                      className="px-2 py-1 rounded bg-rose-500/10 text-rose-600 text-[10px] font-semibold hover:bg-rose-500/20"
                    >
                      Workshop
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end pt-1">
                <Link
                  to="/configuration?tab=trucks"
                  className="text-xs text-muted-foreground hover:text-forest font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Edit in Master Data</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
