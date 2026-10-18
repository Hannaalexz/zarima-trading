import React, { useState } from 'react'
import { Plus, Fuel, Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatDate } from '@/lib/formatters'

export const FuelExpensesPage: React.FC = () => {
  const { fuelExpenses, addFuelExpense, trucks, drivers } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form
  const [truckPlate, setTruckPlate] = useState(trucks[0]?.plateNumber || '')
  const [driverName, setDriverName] = useState(drivers[0]?.fullName || '')
  const [fuelLiters, setFuelLiters] = useState<number>(300)
  const [pricePerLiterETB, setPricePerLiterETB] = useState<number>(104.5)
  const [stationName, setStationName] = useState('NOC Kality Industrial Depot')
  const [currentOdometerKm, setCurrentOdometerKm] = useState<number>(145000)
  const [receiptNo, setReceiptNo] = useState('')

  const filtered = fuelExpenses.filter(
    (f) =>
      f.truckPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.receiptNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalFuelLiters = fuelExpenses.reduce((acc, f) => acc + f.fuelLiters, 0)
  const totalFuelCost = fuelExpenses.reduce((acc, f) => acc + f.totalCostETB, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!truckPlate || fuelLiters <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide valid vehicle and fuel volume.',
        type: 'error',
      })
      return
    }

    addFuelExpense({
      truckPlate,
      driverName,
      date: new Date().toISOString().split('T')[0],
      fuelLiters: Number(fuelLiters),
      pricePerLiterETB: Number(pricePerLiterETB),
      totalCostETB: Number(fuelLiters) * Number(pricePerLiterETB),
      stationName,
      currentOdometerKm: Number(currentOdometerKm),
      receiptNo: receiptNo || `REC-${Math.floor(10000 + Math.random() * 90000)}`,
    })

    toast({
      title: 'Fuel Purchase Logged',
      description: `${fuelLiters} Liters diesel recorded for ${truckPlate} at ${stationName}.`,
      type: 'success',
    })

    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fuel Expenses"
        description="Audit heavy vehicle fuel disbursement vouchers and fuel economy."
        breadcrumbs={[
          { label: 'Transport & Fleet', href: '/fleet' },
          { label: 'Fuel Expenses' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast({
                  title: 'Fuel Report Exported',
                  description: 'Diesel fuel audit records downloaded as CSV.',
                  type: 'info',
                })
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-surface border border-border hover:bg-surface-elevated text-foreground transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Fuel Purchase</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Total Fuel Expenditure
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatCurrency(totalFuelCost)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Corporate commercial fleet accounts
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Total Volume Disbursed
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {totalFuelLiters.toLocaleString()} Liters
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Heavy haulage grade diesel fuel
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Average Official Tariff
          </div>
          <div className="text-2xl font-bold text-forest dark:text-forest-vibrant font-mono">
            104.50 ETB / Liter
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            National petroleum authority benchmark
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by plate, driver, fuel station, receipt..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-muted-foreground font-semibold">
          {filtered.length} Disbursed Voucher(s)
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-elevated border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Truck Plate</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Fuel Station &amp; Depot</th>
                <th className="py-3 px-4 text-right">Volume (Liters)</th>
                <th className="py-3 px-4 text-right">Total Cost (ETB)</th>
                <th className="py-3 px-4 text-right">Odometer (km)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(f.date)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    {f.receiptNo}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    {f.truckPlate}
                  </td>
                  <td className="py-3 px-4 text-foreground whitespace-nowrap">
                    {f.driverName}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {f.stationName}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                    {f.fuelLiters} L
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-foreground whitespace-nowrap">
                    {formatCurrency(f.totalCostETB, { hideDecimals: true })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                    {f.currentOdometerKm.toLocaleString()} km
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Fuel Purchase */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Log Diesel Fuel Purchase
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Enter official station receipt for heavy vehicle fuel voucher reconciliation.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Truck Plate
                  </label>
                  <select
                    value={truckPlate}
                    onChange={(e) => {
                      setTruckPlate(e.target.value)
                      const trk = trucks.find((t) => t.plateNumber === e.target.value)
                      if (trk) setDriverName(trk.driverName)
                    }}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                  >
                    {trucks.map((t) => (
                      <option key={t.id} value={t.plateNumber}>
                        {t.plateNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Operator / Driver
                  </label>
                  <select
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.fullName}>
                        {d.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Fuel Station Facility
                </label>
                <select
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                >
                  <option value="NOC Kality Industrial Depot">NOC Kality Industrial Depot</option>
                  <option value="TotalEnergies Mojo Bypass">TotalEnergies Mojo Bypass</option>
                  <option value="OiLibya Awash Junction Station">OiLibya Awash Junction Station</option>
                  <option value="Yetenbi Adama Expressway Entry">Yetenbi Adama Expressway Entry</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Fuel Volume (Liters)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Rate (ETB / Liter)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={pricePerLiterETB}
                    onChange={(e) => setPricePerLiterETB(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-elevated border border-border/80 flex items-center justify-between">
                <span className="font-medium text-muted-foreground">Calculated Cost:</span>
                <span className="text-sm font-bold text-foreground font-mono">
                  {formatCurrency(fuelLiters * pricePerLiterETB)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Receipt / Voucher Number
                  </label>
                  <input
                    type="text"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                    placeholder="e.g. NOC-2026-9901"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Odometer at Pump (km)
                  </label>
                  <input
                    type="number"
                    value={currentOdometerKm}
                    onChange={(e) => setCurrentOdometerKm(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                  />
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
                  className="px-4 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white font-semibold shadow-subtle dark:shadow-glow"
                >
                  Save Fuel Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
