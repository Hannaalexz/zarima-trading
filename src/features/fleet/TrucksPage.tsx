import React, { useState } from 'react'
import { Plus, Filter, Truck, ShieldCheck, Wrench, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatQuantity, formatDate } from '@/lib/formatters'
import { Truck as TruckType, TruckStatus } from '@/types'

export const TrucksPage: React.FC = () => {
  const { trucks, addTruck, updateTruckStatus, drivers } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form
  const [plateNumber, setPlateNumber] = useState('')
  const [makeModel, setMakeModel] = useState('Sinotruk HOWO 371 6x4')
  const [modelYear, setModelYear] = useState<number>(2023)
  const [capacityQuintals, setCapacityQuintals] = useState<number>(750)
  const [driverName, setDriverName] = useState(drivers[0]?.fullName || '')
  const [mileageKm, setMileageKm] = useState<number>(45000)

  const filtered = trucks.filter((t) => {
    const matchSearch =
      t.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.makeModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || t.operationalStatus === statusFilter
    return matchSearch && matchStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!plateNumber) {
      toast({
        title: 'Validation Error',
        description: 'Commercial plate number is required.',
        type: 'error',
      })
      return
    }

    const matchedDriver = drivers.find((d) => d.fullName === driverName)

    addTruck({
      plateNumber,
      makeModel,
      modelYear: Number(modelYear),
      capacityQuintals: Number(capacityQuintals),
      driverId: matchedDriver?.id || 'DRV-001',
      driverName,
      operationalStatus: 'Available',
      mileageKm: Number(mileageKm),
      lastServiceDate: new Date().toISOString().split('T')[0],
    })

    toast({
      title: 'Truck Registered',
      description: `Truck ${plateNumber} enrolled into Zarima commercial haulage fleet.`,
      type: 'success',
    })

    setIsModalOpen(false)
    setPlateNumber('')
  }

  const handleStatusChange = (truckId: string, newStatus: TruckStatus) => {
    updateTruckStatus(truckId, newStatus)
    toast({
      title: 'Status Updated',
      description: `Truck status changed to ${newStatus}.`,
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Truck</span>
          </button>
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

              <div className="my-3 p-3 rounded-lg bg-surface-elevated/70 border border-border/80 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payload Capacity:</span>
                  <span className="font-bold text-foreground font-mono">
                    {formatQuantity(t.capacityQuintals, 'Qtl')} ({(t.capacityQuintals / 10).toFixed(0)} MT)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Odometer:</span>
                  <span className="font-mono">{t.mileageKm.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paired Driver:</span>
                  <span className="font-semibold text-foreground">{t.driverName}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">Last Serviced:</span>
                  <span className="font-mono text-[11px] text-foreground font-medium">
                    {t.lastServiceDate || '2026-02-15'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Toggles */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground">Quick Status:</span>
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
          </div>
        ))}
      </div>

      {/* Modal: Register Commercial Truck */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Register Commercial Hauler
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Add a heavy truck or tractor-trailer unit to Zarima's logistics fleet.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Commercial Plate Number (Ethiopian)
                </label>
                <input
                  type="text"
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono font-bold focus:ring-1 focus:ring-forest"
                  placeholder="e.g. 3-ET-G99120 AA"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Make &amp; Model
                  </label>
                  <select
                    value={makeModel}
                    onChange={(e) => setMakeModel(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    <option value="Sinotruk HOWO 371 6x4">Sinotruk HOWO 371 6x4</option>
                    <option value="Sinotruk HOWO 380 Bulk Tanker">Sinotruk HOWO 380 Tanker</option>
                    <option value="Mercedes-Benz Actros 3340">Mercedes Actros 3340</option>
                    <option value="Volvo FH440 Heavy Hauler">Volvo FH440 Hauler</option>
                    <option value="Isuzu FSR Forward 33">Isuzu FSR Forward 33</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Model Year
                  </label>
                  <input
                    type="number"
                    value={modelYear}
                    onChange={(e) => setModelYear(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Capacity (Quintals)
                  </label>
                  <input
                    type="number"
                    value={capacityQuintals}
                    onChange={(e) => setCapacityQuintals(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Current Odometer (km)
                  </label>
                  <input
                    type="number"
                    value={mileageKm}
                    onChange={(e) => setMileageKm(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Assign Heavy Driver
                </label>
                <select
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.fullName}>
                      {d.fullName} ({d.licenseGrade})
                    </option>
                  ))}
                </select>
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
                  Save Truck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
