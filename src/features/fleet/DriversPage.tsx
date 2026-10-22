import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SlidersHorizontal,
  UserCheck,
  Phone,
  ShieldCheck,
  Truck,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'

export const DriversPage: React.FC = () => {
  const { drivers } = useStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = drivers.filter(
    (d) =>
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.assignedTruckPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial Drivers"
        description="Driver operational roster, license grades, and active assignments."
        breadcrumbs={[
          { label: 'Transport & Fleet', href: '/fleet' },
          { label: 'Drivers' },
        ]}
        actions={
          <Link
            to="/configuration?tab=staff"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Configure Staff in Master Data</span>
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by driver name, license, phone, or truck plate..."
          className="w-full sm:w-80"
        />
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground font-semibold">
            {filtered.length} Active Driver{filtered.length === 1 ? '' : 's'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-forest" />
          <span className="text-forest font-medium">
            {drivers.filter((d) => d.status === 'On Duty').length} On Duty
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card hover:border-forest/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forest to-forest-dark text-white flex items-center justify-center font-bold text-sm shadow-subtle">
                    {d.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-forest transition-colors">
                      {d.fullName}
                    </h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-forest" />
                      <span>{d.licenseGrade}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={d.status} size="sm" />
              </div>

              <div className="space-y-2 py-3 border-y border-border/60 text-xs text-muted-foreground">
                <div className="flex justify-between items-center">
                  <span>License No:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {d.licenseNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Direct Contact:</span>
                  <a
                    href={`tel:${d.phone}`}
                    className="flex items-center gap-1 text-forest hover:underline font-mono font-medium"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{d.phone}</span>
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span>Assigned Truck:</span>
                  <span className="font-mono font-semibold text-foreground flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-forest" />
                    {d.assignedTruckPlate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Completed Trips:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {d.tripCount} Dispatched Trips
                  </span>
                </div>
                <div className="flex justify-between items-center truncate">
                  <span>Emergency:</span>
                  <span className="text-foreground truncate max-w-[170px] text-[11px]">
                    {d.emergencyContact}
                  </span>
                </div>
              </div>
            </div>

            {/* Link to Master Data Configuration */}
            <div className="pt-3.5 mt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Master Data Record:</span>
              <Link
                to="/configuration?tab=staff"
                className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline transition-colors"
                title="Configure in Master Data"
              >
                <span>Edit in Master Data</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
