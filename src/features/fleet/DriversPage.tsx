import React, { useState } from 'react'
import { Plus, UserCheck, Phone, ShieldCheck, Truck, Search, Trash2, Edit2, AlertCircle, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { Driver } from '@/types'

export const DriversPage: React.FC = () => {
  const { drivers, addDriver, updateDriver, deleteDriver, trucks } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null)

  // Form State
  const [fullName, setFullName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseGrade, setLicenseGrade] = useState('Grade 5 (Heavy Truck-Trailer)')
  const [phone, setPhone] = useState('+251 9')
  const [assignedTruckPlate, setAssignedTruckPlate] = useState(trucks[0]?.plateNumber || 'Unassigned')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [status, setStatus] = useState<'On Duty' | 'Off Duty' | 'On Leave'>('On Duty')

  const resetForm = () => {
    setFullName('')
    setLicenseNumber('')
    setLicenseGrade('Grade 5 (Heavy Truck-Trailer)')
    setPhone('+251 9')
    setAssignedTruckPlate(trucks[0]?.plateNumber || 'Unassigned')
    setEmergencyContact('')
    setStatus('On Duty')
    setEditingDriver(null)
  }

  const handleOpenAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const handleOpenEditModal = (driver: Driver) => {
    setEditingDriver(driver)
    setFullName(driver.fullName)
    setLicenseNumber(driver.licenseNumber)
    setLicenseGrade(driver.licenseGrade)
    setPhone(driver.phone)
    setAssignedTruckPlate(driver.assignedTruckPlate)
    setEmergencyContact(driver.emergencyContact)
    setStatus(driver.status)
    setIsAddModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !licenseNumber.trim() || !phone.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in driver name, license number, and direct phone.',
        type: 'error',
      })
      return
    }

    if (editingDriver) {
      updateDriver(editingDriver.id, {
        fullName: fullName.trim(),
        licenseNumber: licenseNumber.trim(),
        licenseGrade,
        phone: phone.trim(),
        assignedTruckPlate,
        emergencyContact: emergencyContact.trim() || 'Not specified',
        status,
      })
      toast({
        title: 'Driver Updated',
        description: `Profile for ${fullName} updated successfully.`,
        type: 'success',
      })
    } else {
      addDriver({
        fullName: fullName.trim(),
        licenseNumber: licenseNumber.trim(),
        licenseGrade,
        phone: phone.trim(),
        assignedTruckPlate,
        emergencyContact: emergencyContact.trim() || 'Not specified',
        status,
        tripCount: 0,
      })
      toast({
        title: 'Driver Enrolled',
        description: `New commercial driver ${fullName} enrolled into fleet roster.`,
        type: 'success',
      })
    }

    setIsAddModalOpen(false)
    resetForm()
  }

  const handleConfirmDelete = () => {
    if (!driverToDelete) return
    const name = driverToDelete.fullName
    deleteDriver(driverToDelete.id)
    toast({
      title: 'Driver Removed',
      description: `Operator ${name} removed from fleet system.`,
      type: 'info',
    })
    setDriverToDelete(null)
  }

  const filtered = drivers.filter(
    (d) =>
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.assignedTruckPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial Drivers"
        description="Licensed heavy truck operators, license qualifications, and vehicle assignments."
        breadcrumbs={[
          { label: 'Transport & Fleet', href: '/fleet' },
          { label: 'Drivers' },
        ]}
        actions={
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enroll New Driver</span>
          </button>
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
                    <div className="text-xs text-forest dark:text-forest-vibrant font-medium">
                      {d.licenseGrade}
                    </div>
                  </div>
                </div>
                <StatusBadge status={d.status} size="sm" />
              </div>

              <div className="my-3 p-3 rounded-xl bg-surface-elevated/70 border border-border/80 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-forest" />
                    Assigned Truck:
                  </span>
                  <span className="font-mono font-bold text-foreground px-2 py-0.5 rounded bg-surface border border-border">
                    {d.assignedTruckPlate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                    License No:
                  </span>
                  <span className="font-mono text-foreground font-semibold">{d.licenseNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Haulage Logged:</span>
                  <span className="font-bold text-forest">{d.tripCount} Completed Trips</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1.5 pt-1 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Mobile:
                  </span>
                  <span className="text-foreground font-medium">{d.phone}</span>
                </div>
                <div className="flex justify-between items-center truncate">
                  <span>Emergency:</span>
                  <span className="text-foreground truncate max-w-[170px] text-[11px]">
                    {d.emergencyContact}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Edit & Remove */}
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleOpenEditModal(d)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-surface-elevated hover:text-forest text-muted-foreground text-xs font-semibold transition-colors"
                title="Edit Driver Details"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setDriverToDelete(d)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-500 text-xs font-semibold transition-colors"
                title="Remove Driver"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Enroll / Edit Driver */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {editingDriver ? 'Edit Commercial Driver' : 'Enroll Commercial Driver'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {editingDriver
                    ? `Updating credentials for ${editingDriver.fullName}`
                    : 'Add a verified heavy combination truck driver to the Zarima roster.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false)
                  resetForm()
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-forest"
                  placeholder="e.g. Alula Gebregziabher"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Direct Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-forest"
                    placeholder="+251 911 234567"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-forest"
                    placeholder="ETH-DRV-90812"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    License Qualification Grade
                  </label>
                  <select
                    value={licenseGrade}
                    onChange={(e) => setLicenseGrade(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-forest"
                  >
                    <option value="Grade 5 (Heavy Truck-Trailer)">Grade 5 (Truck-Trailer)</option>
                    <option value="Grade 4 (Heavy Commercial)">Grade 4 (Heavy Commercial)</option>
                    <option value="Grade 3 (Medium Cargo)">Grade 3 (Medium Cargo)</option>
                    <option value="Special Mechanical Equipment">Special Mechanical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Duty Operational Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-forest"
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Assigned Heavy Truck
                </label>
                <select
                  value={assignedTruckPlate}
                  onChange={(e) => setAssignedTruckPlate(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono focus:outline-none focus:border-forest"
                >
                  <option value="Unassigned">-- Unassigned / Relief Driver --</option>
                  {trucks.map((t) => (
                    <option key={t.id} value={t.plateNumber}>
                      {t.plateNumber} ({t.makeModel}) — {t.capacityQuintals} Qtl payload
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Emergency Contact / Next of Kin
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-forest"
                  placeholder="e.g. Spouse: +251 922 445566"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    resetForm()
                  }}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-surface-elevated text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-forest hover:bg-forest-dark text-white font-semibold shadow-subtle dark:shadow-glow"
                >
                  {editingDriver ? 'Save Changes' : 'Enroll Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Remove Driver */}
      {driverToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl bg-surface border border-red-500/30 p-6 shadow-dropdown animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">
              Remove Commercial Driver?
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              Are you sure you want to remove <strong className="text-foreground">{driverToDelete.fullName}</strong> ({driverToDelete.licenseNumber}) from the driver roster?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDriverToDelete(null)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-surface-elevated text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-subtle"
              >
                Yes, Remove Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
