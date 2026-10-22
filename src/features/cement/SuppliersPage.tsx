import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MapPin, Phone, FileText, SlidersHorizontal, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { formatCurrency } from '@/lib/formatters'

export const SuppliersPage: React.FC = () => {
  const { suppliers } = useStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.plantLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factory Suppliers"
        description="Manufacturing plants and procurement commitments."
        breadcrumbs={[
          { label: 'Cement Trading', href: '/cement' },
          { label: 'Factory Suppliers' },
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

      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by factory, plant, or contact..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-muted-foreground font-semibold">
          {filtered.length} Manufacturing Plant(s)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-border bg-surface p-5 shadow-card hover:border-brand-copper/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-surface-elevated text-brand-copper">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {s.name}
                    </h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-brand-copper" />
                      <span>{s.plantLocation}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={s.status} size="sm" />
              </div>

              <div className="space-y-2 py-3 border-y border-border text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Purchased YTD:</span>
                  <span className="font-bold text-foreground font-mono">
                    {formatCurrency(s.totalPurchasedYTD)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Outstanding Payable:</span>
                  <span className="font-bold text-foreground font-mono">
                    {formatCurrency(s.outstandingPayableETB)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <div className="flex justify-between">
                  <span>Factory Contact:</span>
                  <span className="text-foreground">{s.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="text-foreground">{s.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>TIN Number:</span>
                  <span className="font-mono">{s.tinNumber}</span>
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
        ))}
      </div>
    </div>
  )
}
