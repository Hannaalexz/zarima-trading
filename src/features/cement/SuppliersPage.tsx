import React, { useState } from 'react'
import { Plus, Building2, MapPin, Phone, FileText } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency } from '@/lib/formatters'

export const SuppliersPage: React.FC = () => {
  const { suppliers, addSupplier } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form
  const [name, setName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [plantLocation, setPlantLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [tinNumber, setTinNumber] = useState('')

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.plantLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !plantLocation) {
      toast({
        title: 'Validation Error',
        description: 'Supplier name and plant location are required.',
        type: 'error',
      })
      return
    }

    addSupplier({
      name,
      contactPerson: contactPerson || 'Plant Dispatch Coordinator',
      tinNumber: tinNumber || `000${Math.floor(1000000 + Math.random() * 9000000)}`,
      phone: phone || '+251 11 000 0000',
      plantLocation,
      totalPurchasedYTD: 0,
      outstandingPayableETB: 0,
      status: 'Active',
    })

    toast({
      title: 'Supplier Added',
      description: `${name} registered as an approved cement manufacturing supplier.`,
      type: 'success',
    })

    setIsModalOpen(false)
    setName('')
    setContactPerson('')
    setPlantLocation('')
  }

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
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Supplier</span>
          </button>
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

              <div className="my-3 p-3 rounded-lg bg-surface-elevated/70 border border-border/80 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchased YTD:</span>
                  <span className="font-bold text-foreground font-mono">
                    {formatCurrency(s.totalPurchasedYTD, { compact: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding Payable:</span>
                  <span className="font-bold text-foreground font-mono">
                    {formatCurrency(s.outstandingPayableETB)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 pt-1">
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
          </div>
        ))}
      </div>

      {/* Modal: Add Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Add Cement Manufacturer
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Register an Ethiopian cement manufacturing company or clinker supplier.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Factory Enterprise Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:ring-1 focus:ring-brand-copper"
                  placeholder="e.g. Habesha Cement S.C."
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Plant / Quarry Location
                </label>
                <input
                  type="text"
                  required
                  value={plantLocation}
                  onChange={(e) => setPlantLocation(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="e.g. Holeta Plant, Oromia"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Direct Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                    placeholder="+251 11 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Factory Ethiopian TIN
                </label>
                <input
                  type="text"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                  placeholder="0003918274"
                />
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
                  className="px-4 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white font-semibold shadow-subtle dark:shadow-glow"
                >
                  Save Supplier
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
