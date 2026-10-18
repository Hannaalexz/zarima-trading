import React, { useState } from 'react'
import {
  MapPin,
  Truck,
  Compass,
  Activity,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useStore } from '@/data/storeContext'
import { useToast } from '@/hooks/useToast'
import { GPSTrackingPoint } from '@/types'

export const GPSTrackingPage: React.FC = () => {
  const { gpsLocations } = useStore()
  const { toast } = useToast()
  const [selectedTruck, setSelectedTruck] = useState<GPSTrackingPoint>(gpsLocations[0])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshPings = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: 'Satellite Telemetry Refreshed',
        description: 'Updated GPS pings from 5 on-board vehicle units.',
        type: 'info',
      })
    }, 700)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet GPS Telemetry"
        description="Satellite tracking along Ethiopian transport corridors."
        breadcrumbs={[
          { label: 'Transport & Fleet', href: '/fleet' },
          { label: 'GPS Tracking' },
        ]}
        actions={
          <button
            onClick={handleRefreshPings}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-surface/90 border border-border hover:bg-surface-elevated text-foreground transition-colors shadow-subtle"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-forest dark:text-forest-vibrant ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Pings</span>
          </button>
        }
      />

      {/* Corridor Status Bar */}
      <div className="px-4 py-3 rounded-2xl border border-border bg-surface/90 backdrop-blur-md flex items-center justify-between text-xs shadow-card">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-ping" />
          <span className="font-bold text-foreground">Highway Corridor Tracking Active</span>
          <span className="text-muted-foreground hidden sm:inline">&mdash; Real-time telemetry monitoring.</span>
        </div>
        <span className="text-[11px] font-mono text-[#FF6B00] bg-[#FF6B00]/15 px-2.5 py-0.5 rounded-full border border-[#FF6B00]/30 font-extrabold">5 Units Online</span>
      </div>

      {/* Main Map & Telemetry Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Truck Telemetry Feed */}
        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FF6B00]" />
              <span>Transponder Feed</span>
            </h3>
            <span className="text-xs font-mono text-muted-foreground">
              {gpsLocations.length} Units Online
            </span>
          </div>

          <div className="space-y-2.5">
            {gpsLocations.map((t) => {
              const isSelected = selectedTruck.id === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTruck(t)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FF6B00]/10 border-[#FF6B00] text-foreground shadow-sm shadow-[#FF6B00]/20'
                      : 'bg-surface-elevated/60 border-border/70 hover:border-[#FF6B00]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground">
                      {t.plateNumber}
                    </span>
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                  <div className="text-muted-foreground mt-1 truncate">
                    {t.currentTown}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 mt-1 border-t border-border/40">
                    <span className="font-bold text-[#FF6B00]">{t.speedKmH} km/h</span>
                    <span>Ping: {t.lastPingTime}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right 2 columns: Visual Highway Node Map & Telemetry Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Simulated Highway Radar / Map Box (Image 2 style) */}
          <div className="relative rounded-3xl border border-[#1A2E22] bg-[#080F0B] p-6 text-white min-h-[380px] flex flex-col justify-between overflow-hidden shadow-xl dark:shadow-glow">
            {/* Background grid lines */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#22C55E 1px, transparent 1px), radial-gradient(#1A3323 1px, #080F0B 1px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px',
              }}
            />

            {/* Glowing route vector SVG (Image 2 style) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6 opacity-85">
              <svg viewBox="0 0 500 240" className="w-full h-full overflow-visible">
                <defs>
                  <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Secondary highway lines */}
                <path d="M 40 180 Q 180 160 250 110 T 450 60" fill="none" stroke="#173022" strokeWidth="6" strokeLinecap="round" />
                <path d="M 90 220 Q 220 180 280 80" fill="none" stroke="#12251B" strokeWidth="3" strokeDasharray="5 5" />

                {/* Active glowing green route track */}
                <path
                  d="M 60 180 C 140 160, 200 150, 250 110 C 300 70, 360 80, 440 60"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter="url(#radar-glow)"
                />

                {/* Origin Pin */}
                <circle cx="60" cy="180" r="12" fill="#22C55E" fillOpacity="0.25" />
                <circle cx="60" cy="180" r="6" fill="#22C55E" />
                <text x="60" y="205" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                  {selectedTruck.route.split(' to ')[0]}
                </text>

                {/* Mid-route Waypoint (Green Beacon Arrow) */}
                <circle cx="250" cy="110" r="14" fill="#22C55E" fillOpacity="0.35" />
                <polygon points="250,104 256,116 244,116" fill="#22C55E" />
                <text x="250" y="90" fill="#22C55E" fontSize="12" fontWeight="bold" textAnchor="middle">
                  {selectedTruck.currentTown}
                </text>

                {/* Destination Pin */}
                <circle cx="440" cy="60" r="14" fill="#EF4444" fillOpacity="0.25" />
                <circle cx="440" cy="60" r="6" fill="#EF4444" />
                <text x="440" y="45" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                  {selectedTruck.destinationTown}
                </text>

                {/* Transponder radar dots */}
                <circle cx="150" cy="90" r="4" fill="#F59E0B" fillOpacity="0.75" />
                <circle cx="340" cy="140" r="4" fill="#F59E0B" fillOpacity="0.75" />
              </svg>
            </div>

            <div className="relative z-10 flex items-center justify-between border-b border-[#1A2E22] pb-4">
              <div>
                <div className="text-xs font-semibold text-[#22C55E] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Highway Waypoint Corridor &bull; Active Telemetry</span>
                </div>
                <h4 className="text-xl font-bold font-mono tracking-tight mt-0.5 text-white">
                  {selectedTruck.plateNumber}
                </h4>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-[#22C55E]">
                  {selectedTruck.speedKmH} <span className="text-xs font-normal text-emerald-200/60">km/h</span>
                </div>
                <div className="text-[11px] text-emerald-300/70">{selectedTruck.status}</div>
              </div>
            </div>

            {/* Bottom telemetry coords & Order ID pill (Image 2 style) */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1A2E22] text-xs font-mono text-emerald-100/80">
              <div className="flex items-center gap-4">
                <span>LAT: {selectedTruck.latitude.toFixed(4)}&deg; N</span>
                <span>LON: {selectedTruck.longitude.toFixed(4)}&deg; E</span>
                <span className="hidden sm:inline">Heading: {selectedTruck.heading}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-white">Order ID - #WB-2026-ET</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F59E0B] text-black">
                  ON THE WAY
                </span>
              </div>
            </div>
          </div>

          {/* Selected Truck Detail Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card space-y-1">
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-forest dark:text-forest-vibrant" />
                <span>Cargo Payload</span>
              </div>
              <div className="font-bold text-sm text-foreground">
                {selectedTruck.cargo}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card space-y-1">
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-forest dark:text-forest-vibrant" />
                <span>Assigned Operator</span>
              </div>
              <div className="font-bold text-sm text-foreground">
                {selectedTruck.driverName}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-surface/90 backdrop-blur-md shadow-card space-y-1">
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-forest dark:text-forest-vibrant" />
                <span>Last Telemetry Sync</span>
              </div>
              <div className="font-bold text-sm text-foreground">
                {selectedTruck.lastPingTime}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
