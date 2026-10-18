import React, { useState } from 'react'
import { UserCheck, Phone, ShieldCheck, Truck, Search } from 'lucide-react'
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
      d.assignedTruckPlate.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial Drivers"
        description="Licensed heavy truck operators and assigned vehicles."
        breadcrumbs={[
          { label: 'Transport & Fleet', href: '/fleet' },
          { label: 'Drivers' },
        ]}
      />

      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by driver name, license, or truck plate..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-muted-foreground font-semibold">
          {filtered.length} Enrolled Operator(s)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card hover:border-forest/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold text-sm shadow-subtle">
                    {d.fullName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {d.fullName}
                    </h3>
                    <div className="text-xs text-forest dark:text-forest-vibrant font-medium">
                      {d.licenseGrade}
                    </div>
                  </div>
                </div>
                <StatusBadge status={d.status} size="sm" />
              </div>

              <div className="my-3 p-3 rounded-lg bg-surface-elevated/70 border border-border/80 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Truck:</span>
                  <span className="font-mono font-bold text-foreground">
                    {d.assignedTruckPlate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">License Number:</span>
                  <span className="font-mono">{d.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed Haulage Trips:</span>
                  <span className="font-bold text-foreground">{d.tripCount} Trips</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 pt-1">
                <div className="flex justify-between">
                  <span>Direct Mobile:</span>
                  <span className="text-foreground">{d.phone}</span>
                </div>
                <div className="flex justify-between truncate">
                  <span>Emergency:</span>
                  <span className="text-foreground truncate max-w-[170px]">
                    {d.emergencyContact}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
