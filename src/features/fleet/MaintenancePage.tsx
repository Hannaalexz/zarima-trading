import React, { useState } from 'react'
import { Plus, Wrench, AlertTriangle, ArrowUpDown } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/formatters'

export const MaintenancePage: React.FC = () => {
  const { maintenance, addMaintenance, trucks } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form
  const [truckPlate, setTruckPlate] = useState(trucks[0]?.plateNumber || '')
  const [serviceType, setServiceType] = useState('Full Engine Oil & Filter Service')
  const [workshopName, setWorkshopName] = useState('Kality Heavy Duty Automotive Workshop')
  const [costETB, setCostETB] = useState<number>(45000)
  const [nextServiceDueKm, setNextServiceDueKm] = useState<number>(180000)
  const [notes, setNotes] = useState('')

  const filtered = maintenance.filter(
    (m) =>
      m.truckPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.workshopName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!truckPlate || costETB <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please specify truck plate and service cost.',
        type: 'error',
      })
      return
    }

    addMaintenance({
      truckPlate,
      serviceType,
      date: new Date().toISOString().split('T')[0],
      workshopName,
      costETB: Number(costETB),
      status: 'Completed',
      nextServiceDueKm: Number(nextServiceDueKm),
      notes,
    })

    toast({
      title: 'Service Record Logged',
      description: `Maintenance recorded for ${truckPlate} (${formatCurrency(costETB)}).`,
      type: 'success',
    })

    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Maintenance"
        description="Preventive servicing, overhaul logs, and workshop expenditure tracking."
        breadcrumbs={[
          { label: 'Transport & Fleet', href: '/fleet' },
          { label: 'Maintenance' },
        ]}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Service</span>
          </button>
        }
      />

      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by truck plate, workshop, or repair type..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-muted-foreground font-semibold">
          {filtered.length} Recorded Service Event(s)
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Truck Plate</th>
                <th className="py-3 px-4">Service Description</th>
                <th className="py-3 px-4">Workshop Facility</th>
                <th className="py-3 px-4 text-right">Cost (ETB)</th>
                <th className="py-3 px-4 text-right">Next Due (km)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(m.date)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    {m.truckPlate}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground">{m.serviceType}</div>
                    {m.notes && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">{m.notes}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {m.workshopName}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                    {formatCurrency(m.costETB, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                    {m.nextServiceDueKm.toLocaleString()} km
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={m.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Service Record */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Log Maintenance Record
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Enter vehicle overhaul, routine fluid maintenance, or mechanical repair.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Commercial Truck Plate
                </label>
                <select
                  value={truckPlate}
                  onChange={(e) => setTruckPlate(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                >
                  {trucks.map((t) => (
                    <option key={t.id} value={t.plateNumber}>
                      {t.plateNumber} — {t.makeModel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Service Description
                </label>
                <input
                  type="text"
                  required
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="e.g. Brake Lining Overhaul & Hub Seals"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Workshop Facility
                  </label>
                  <input
                    type="text"
                    required
                    value={workshopName}
                    onChange={(e) => setWorkshopName(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Total Cost (ETB)
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={costETB}
                    onChange={(e) => setCostETB(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Next Service Odometer Due (km)
                </label>
                <input
                  type="number"
                  value={nextServiceDueKm}
                  onChange={(e) => setNextServiceDueKm(Number(e.target.value))}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Technical Notes &amp; Warranty
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  placeholder="Warranty period, parts batch numbers..."
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
                  Save Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
