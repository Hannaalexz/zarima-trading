import React, { useState } from 'react'
import {
  Settings,
  Building,
  Moon,
  Sun,
  Bell,
  Database,
  Check,
  Shield,
  RotateCcw,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [companyName, setCompanyName] = useState('Zarima Trading & Logistics Plc')
  const [tinNumber, setTinNumber] = useState('0019283741')
  const [hqAddress, setHqAddress] = useState('Bole Sub-city, Africa Avenue, Addis Ababa, Ethiopia')
  const [depotAddress, setDepotAddress] = useState('Kality Industrial Zone, Yard 4, Addis Ababa')
  const [notifyLowStock, setNotifyLowStock] = useState(true)
  const [notifyTruckDeparture, setNotifyTruckDeparture] = useState(true)
  const [notifyDiscrepancy, setNotifyDiscrepancy] = useState(true)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Settings Saved',
      description: 'Enterprise system configuration updated successfully.',
      type: 'success',
    })
  }

  const handleResetDemoData = () => {
    toast({
      title: 'Demo Environment Reset',
      description: 'Local session mock data re-synchronized to initial baseline.',
      type: 'info',
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="System Settings"
        description="Company profile, theme appearance, and notification thresholds."
        breadcrumbs={[{ label: 'System Settings' }]}
      />

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Company Identity */}
        <div className="p-6 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Building className="w-4 h-4 text-forest dark:text-forest-vibrant" />
            <h3 className="text-sm font-bold text-foreground">
              Corporate Legal Entity &amp; Registration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-foreground mb-1">
                Registered Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 bg-surface-elevated border border-border rounded-lg text-foreground font-semibold focus:ring-1 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">
                Federal Ethiopian TIN Number
              </label>
              <input
                type="text"
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
                className="w-full p-2.5 bg-surface-elevated border border-border rounded-lg text-foreground font-mono focus:ring-1 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">
                Headquarters Address
              </label>
              <input
                type="text"
                value={hqAddress}
                onChange={(e) => setHqAddress(e.target.value)}
                className="w-full p-2.5 bg-surface-elevated border border-border rounded-lg text-foreground focus:ring-1 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">
                Primary Central Depot
              </label>
              <input
                type="text"
                value={depotAddress}
                onChange={(e) => setDepotAddress(e.target.value)}
                className="w-full p-2.5 bg-surface-elevated border border-border rounded-lg text-foreground focus:ring-1 focus:ring-forest"
              />
            </div>
          </div>
        </div>

        {/* Theme Preferences */}
        <div className="p-6 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Moon className="w-4 h-4 text-forest dark:text-forest-vibrant" />
            <h3 className="text-sm font-bold text-foreground">
              Independent Appearance &amp; Color Theme
            </h3>
          </div>

          <p className="text-muted-foreground">
            Zarima features two complete, polished themes: Forest Green Light with soft ambient atmospheric shadows and Deep Near-Black &amp; Forest Green Dark with vibrant logistics styling.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                theme === 'light'
                  ? 'border-forest bg-[#F8FAF8] text-foreground shadow-card'
                  : 'border-border bg-surface-elevated text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Sun className="w-4 h-4 text-[#22C55E]" />
                  <span>Ambient Light Theme (Luminous Light Green)</span>
                </div>
                {theme === 'light' && (
                  <span className="p-1 rounded-full bg-[#22C55E] text-black font-bold">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Soft atmospheric shadow gradients (light green, cool gray, subtle dusty rose) with translucent cards and #22C55E luminous light green accents.
              </p>
            </div>

            <div
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'border-[#22C55E] bg-[#0E1712] text-white shadow-glow'
                  : 'border-border bg-surface-elevated text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Moon className="w-4 h-4 text-[#22C55E]" />
                  <span>Deep Near-Black &amp; Light Green Dark Theme</span>
                </div>
                {theme === 'dark' && (
                  <span className="p-1 rounded-full bg-[#22C55E] text-black font-bold">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-200/70">
                #060B08 deep near-black background with #0E1712 surfaces and radiant #22C55E Light Green accents across radar telemetry and live tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Operational Notifications */}
        <div className="p-6 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Bell className="w-4 h-4 text-forest dark:text-forest-vibrant" />
            <h3 className="text-sm font-bold text-foreground">
              Operational Alert Thresholds
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/70 border border-border/80 cursor-pointer">
              <div>
                <span className="font-semibold text-foreground block">
                  Depot Inventory Low-Stock Threshold Trigger
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Alert dispatchers when warehouse stock falls below minimum safety buffer.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyLowStock}
                onChange={(e) => setNotifyLowStock(e.target.checked)}
                className="w-4 h-4 rounded accent-forest"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/70 border border-border/80 cursor-pointer">
              <div>
                <span className="font-semibold text-foreground block">
                  Truck Waypoint &amp; Corridor Events
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Send notifications when commercial trucks depart factory loading terminals.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyTruckDeparture}
                onChange={(e) => setNotifyTruckDeparture(e.target.checked)}
                className="w-4 h-4 rounded accent-forest"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated/70 border border-border/80 cursor-pointer">
              <div>
                <span className="font-semibold text-foreground block">
                  Bank Reconciliation Variance Alerts
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Trigger alerts for unreconciled differences exceeding ETB 10,000.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyDiscrepancy}
                onChange={(e) => setNotifyDiscrepancy(e.target.checked)}
                className="w-4 h-4 rounded accent-forest"
              />
            </label>
          </div>
        </div>

        {/* Demo Data Management */}
        <div className="p-6 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <Database className="w-4 h-4 text-forest dark:text-forest-vibrant" />
            <h3 className="text-sm font-bold text-foreground">
              Demo Environment Controls
            </h3>
          </div>

          <p className="text-muted-foreground">
            All records created or edited during this browser session are persisted in state. You can reset mock data back to defaults at any time.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetDemoData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border hover:bg-surface-elevated text-foreground font-semibold shadow-subtle"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Reset Session Demo Data</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-forest hover:bg-forest-dark text-white font-bold shadow-subtle dark:shadow-glow transition-all"
          >
            Save All Preferences
          </button>
        </div>
      </form>
    </div>
  )
}
