import React, { useState } from 'react'
import { Plus, Users, Phone, Building2, CreditCard, Search, ArrowUpRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchBar } from '@/components/shared/SearchBar'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { formatCurrency } from '@/lib/formatters'

export const CustomersPage: React.FC = () => {
  const { customers, addCustomer } = useStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [tinNumber, setTinNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Addis Ababa')
  const [creditLimitETB, setCreditLimitETB] = useState<number>(5000000)
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days')

  const filtered = customers.filter(
    (c) =>
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tinNumber.includes(searchTerm) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!company || !name) {
      toast({
        title: 'Validation Error',
        description: 'Company name and contact person are required.',
        type: 'error',
      })
      return
    }

    addCustomer({
      name,
      company,
      tinNumber: tinNumber || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      phone: phone || '+251 91 100 0000',
      city,
      creditLimitETB: Number(creditLimitETB),
      outstandingBalanceETB: 0,
      paymentTerms,
      status: 'Active',
    })

    toast({
      title: 'Customer Added',
      description: `${company} enrolled into contractor client directory.`,
      type: 'success',
    })

    setIsModalOpen(false)
    setName('')
    setCompany('')
    setTinNumber('')
    setPhone('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contractor Accounts"
        description="Client directory and approved credit limits."
        breadcrumbs={[
          { label: 'Cement Trading', href: '/cement' },
          { label: 'Customers' },
        ]}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-forest hover:bg-forest-dark text-white transition-all shadow-subtle dark:shadow-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contractor</span>
          </button>
        }
      />


      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border shadow-card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by company, TIN, or contact person..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-muted-foreground font-semibold">
          Showing {filtered.length} client account(s)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c) => {
          const creditUsedRatio = (c.outstandingBalanceETB / c.creditLimitETB) * 100
          return (
            <div
              key={c.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-card hover:border-brand-copper/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {c.company}
                    </h3>
                    <div className="text-xs text-muted-foreground">
                      Contact: {c.name} &bull; {c.city}
                    </div>
                  </div>
                  <StatusBadge status={c.status} size="sm" />
                </div>

                <div className="my-3 p-3 rounded-lg bg-surface-elevated/70 border border-border/80 text-xs space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Outstanding Balance:</span>
                    <span className="font-bold text-foreground font-mono">
                      {formatCurrency(c.outstandingBalanceETB)}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-[11px] text-muted-foreground">
                    <span>Approved Credit Limit:</span>
                    <span>{formatCurrency(c.creditLimitETB, { compact: true })}</span>
                  </div>

                  {/* Credit utilization bar */}
                  <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        creditUsedRatio > 80
                          ? 'bg-[#8F343A]'
                          : creditUsedRatio > 50
                          ? 'bg-brand-copper'
                          : 'bg-[#2C6E49]'
                      }`}
                      style={{ width: `${Math.min(100, creditUsedRatio)}%` }}
                    />

                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Ethiopian TIN:</span>
                    <span className="font-mono text-foreground">{c.tinNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="text-foreground">{c.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Terms:</span>
                    <span>{c.paymentTerms}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal: Add Customer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl bg-surface border border-border p-6 shadow-dropdown animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Enroll New Contractor Client
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Register commercial contractor for cement purchase contracts and credit facility.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full p-2 bg-surface border border-border rounded-lg text-foreground focus:ring-1 focus:ring-brand-copper"
                  placeholder="e.g. Afrotsion Construction Plc"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                    placeholder="e.g. Eng. Yohannes"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    City / Regional Hub
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Ethiopian TIN (10 digits)
                  </label>
                  <input
                    type="text"
                    value={tinNumber}
                    onChange={(e) => setTinNumber(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                    placeholder="0012948190"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                    placeholder="+251 91 123 4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Credit Limit (ETB)
                  </label>
                  <input
                    type="number"
                    value={creditLimitETB}
                    onChange={(e) => setCreditLimitETB(Number(e.target.value))}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Default Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-foreground"
                  >
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
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
                  className="px-5 py-2.5 rounded-full bg-[#FF6B00] hover:bg-[#EA580C] text-white font-extrabold shadow-md shadow-[#FF6B00]/30 hover:scale-105 active:scale-95 transition-all text-xs"
                >
                  Save Contractor
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
