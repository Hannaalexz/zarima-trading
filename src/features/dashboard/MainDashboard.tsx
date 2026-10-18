import React from 'react'
import { Link } from 'react-router-dom'
import {
  Boxes,
  Truck,
  Plus,
  CheckCircle2,
  Download,
  Activity,
} from 'lucide-react'
import { useStore } from '@/data/storeContext'

export const MainDashboard: React.FC = () => {
  const { deliveries } = useStore()

  // Hub load days for heatmap (Image 1 style)
  const hubDays = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
  const hubRows = [
    { code: 'KHI', name: 'Addis Ababa Central Depot', loads: ['heavy', 'steady', 'heavy', 'heavy', 'capacity', 'steady', 'steady', 'heavy', 'heavy', 'capacity', 'steady', 'capacity'] },
    { code: 'LHE', name: 'Adama Express Freight Yard', loads: ['steady', 'steady', 'capacity', 'steady', 'light', 'heavy', 'steady', 'steady', 'heavy', 'steady', 'light', 'steady'] },
    { code: 'DXB', name: 'Mojo Dry Port Cross-dock', loads: ['light', 'capacity', 'heavy', 'heavy', 'steady', 'heavy', 'capacity', 'steady', 'heavy', 'capacity', 'heavy', 'steady'] },
    { code: 'RTM', name: 'Awash Arba Transit Hub', loads: ['heavy', 'steady', 'steady', 'capacity', 'steady', 'steady', 'heavy', 'steady', 'steady', 'heavy', 'capacity', 'heavy'] },
    { code: 'SIN', name: 'Dire Dawa Distribution Depot', loads: ['capacity', 'steady', 'heavy', 'capacity', 'steady', 'heavy', 'steady', 'heavy', 'capacity', 'heavy', 'steady', 'capacity'] },
  ]

  const getHeatmapColor = (type: string) => {
    switch (type) {
      case 'light':
        return 'bg-[#22C55E]/15 dark:bg-[#FF6B00]/15 text-[#16A34A] dark:text-[#FF6B00] border border-[#22C55E]/25 dark:border-[#FF6B00]/30'
      case 'steady':
        return 'bg-[#22C55E]/35 dark:bg-[#FF6B00]/35 text-[#16A34A] dark:text-[#FF6B00]'
      case 'heavy':
        return 'bg-[#22C55E]/70 dark:bg-[#FF6B00]/70 text-[#060B08] dark:text-white font-semibold'
      case 'capacity':
        return 'bg-[#22C55E] dark:bg-[#FF6B00] text-[#060B08] dark:text-white font-bold shadow-[0_0_10px_rgba(34,197,94,0.4)] dark:shadow-[0_0_12px_rgba(255,107,0,0.6)]'
      default:
        return 'bg-surface-elevated'
    }
  }

  return (
    <div className="space-y-6">
      {/* Light Green Welcome Bar */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-[#22C55E] via-[#24CB63] to-[#16A34A] text-[#060B08] shadow-[0_14px_45px_rgba(34,197,94,0.30)] border border-[#22C55E] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Subtle glass glow orbs */}
        <div className="absolute -top-12 -left-12 w-56 h-56 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2 flex-1">
          {/* Hi, Dawit! & Managing Partner */}
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#060B08]/15 text-[#060B08] text-xs font-black uppercase tracking-wider backdrop-blur-sm shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#060B08] animate-ping" />
              Hi, Dawit!
            </span>
            <span className="text-xs font-bold text-[#060B08]/80 tracking-tight border-l border-[#060B08]/20 pl-2.5">
              Managing Partner
            </span>
          </div>

          {/* Clean bold heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#060B08] font-sans">
            Everything moving today?
          </h1>

          {/* Clean status chips with Electric Orange Priority accent */}
          <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#060B08]/15 font-black text-xs text-[#060B08] shadow-xs">
              <Activity className="w-3.5 h-3.5 animate-pulse text-[#060B08]" />
              Live telemetry active
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00] text-white font-extrabold text-xs shadow-md shadow-[#FF6B00]/30 hover:scale-105 transition-transform">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              Express Corridor Priority
            </span>
          </div>
        </div>

        {/* Action Buttons on the Light Green Bar */}
        <div className="relative z-10 flex items-center gap-3 flex-wrap flex-shrink-0 self-start md:self-center">
          <button
            onClick={() => {
              window.print()
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full bg-white/95 hover:bg-white dark:bg-[#060B08] dark:hover:bg-black text-[#060B08] dark:text-[#FF6B00] transition-all shadow-md border border-white/80 dark:border-[#FF6B00]/40 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-current" />
            <span>Export report</span>
          </button>

          <Link
            to="/fleet/deliveries"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black rounded-full bg-[#060B08] hover:bg-black text-white transition-all shadow-xl shadow-black/30 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-[#22C55E]" />
            <span>+ New shipment</span>
          </Link>
        </div>
      </div>

      {/* Top 3 Cards Grid (Exactly matching Screenshot 1 layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Shipments KPI & Minimalist Vertical Bar Chart (3 cols)
            On dark theme: Electric Orange accents on borders, tooltip, active bar, and badges */}
        <div className="lg:col-span-3 rounded-3xl border border-[#22C55E]/30 dark:border-[#FF6B00]/40 dark:hover:border-[#FF6B00] bg-white/90 dark:bg-gradient-to-b dark:from-[#17120D] dark:to-[#0B130E] backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.06)] dark:shadow-[0_8px_32px_rgba(255,107,0,0.10)] flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <div className="p-1.5 rounded-xl bg-[#22C55E]/15 text-[#16A34A] dark:bg-[#FF6B00]/20 dark:text-[#FF6B00] dark:border dark:border-[#FF6B00]/40">
                  <Truck className="w-4 h-4" />
                </div>
                <span>Shipments</span>
              </div>
              <Link
                to="/fleet/deliveries"
                className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#22C55E]/10 dark:bg-[#FF6B00]/15 border border-[#22C55E]/30 dark:border-[#FF6B00]/40 text-[#16A34A] dark:text-[#FF6B00] hover:bg-[#22C55E]/20 dark:hover:bg-[#FF6B00]/25 transition-all"
              >
                View all
              </Link>
            </div>

            <div className="mt-3">
              <div className="text-3xl font-extrabold tracking-tight text-foreground font-sans flex items-baseline gap-2">
                24,318
                <span className="text-xs font-bold text-[#16A34A] dark:text-[#FF6B00] bg-[#22C55E]/15 dark:bg-[#FF6B00]/20 px-2 py-0.5 rounded-full border border-[#22C55E]/30 dark:border-[#FF6B00]/40">
                  +14.2%
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                In transit across all corridors
              </div>
            </div>
          </div>

          {/* Minimalist Bar Chart: In dark theme, active bar and highlights use Electric Orange */}
          <div className="pt-6">
            <div className="relative h-28 flex items-end justify-between gap-2 px-1">
              {/* Tooltip pill above bar 4 */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-white dark:bg-[#060B08] text-foreground dark:text-[#FF6B00] text-[10px] font-mono font-bold shadow-lg flex items-center gap-1 z-10 border border-[#22C55E]/40 dark:border-[#FF6B00]/60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-ping" />
                <span>Cross-dock 412</span>
              </div>

              {/* 7 Vertical Bars */}
              {[42, 65, 38, 88, 55, 76, 60].map((h, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    style={{ height: `${h}%` }}
                    className={`w-full rounded-t-lg transition-all ${
                      idx === 3
                        ? 'bg-gradient-to-t from-[#16A34A] via-[#22C55E] to-[#FF6B00] dark:from-[#FF6B00] dark:to-[#FFA04D] shadow-[0_0_14px_rgba(255,107,0,0.6)]'
                        : 'bg-[#22C55E]/20 hover:bg-[#22C55E]/40 dark:bg-[#FF6B00]/15 dark:hover:bg-[#FF6B00]/35 border-t border-[#22C55E]/40 dark:border-t-[#FF6B00]/50'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Bottom percentage breakdown */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/50 text-[10px] font-bold text-muted-foreground tracking-wider uppercase font-mono">
              <span className="text-foreground dark:text-[#FF6B00]">ROAD 71%</span>
              <span>RAIL 18%</span>
              <span>AIR 11%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Hero Fleet Intelligence Card (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-[#22C55E]/40 bg-white/90 dark:bg-[#0B130E] text-foreground dark:text-white p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#22C55E]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#16A34A] dark:text-[#22C55E] uppercase">
                PREDICTIVE NETWORK
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 font-extrabold text-[9px] uppercase">
                AI Dispatch
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-foreground dark:text-white">
              Fleet Intelligence
            </h2>
            <p className="text-xs text-muted-foreground dark:text-white/70 mt-1 max-w-sm leading-relaxed">
              ETA forecasting and dynamic re-routing across 42 corridors, refreshed every 90 seconds.
            </p>
          </div>

          {/* Cargo Dispatch Illustration with Light Green bar and Electric Orange accent */}
          <div className="my-3 py-2 flex items-center justify-center relative z-10">
            <div className="relative flex items-center justify-center w-full max-w-md py-4">
              <div className="flex items-center gap-4 bg-[#22C55E]/10 border border-[#22C55E]/30 p-3.5 rounded-2xl backdrop-blur-md w-full">
                <div className="p-3 rounded-2xl bg-[#22C55E]/20 border border-[#22C55E]/50 text-[#16A34A] dark:text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.3)] flex-shrink-0">
                  <Truck className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground dark:text-white">Active Corridor Transit</span>
                    <span className="text-[#16A34A] dark:text-[#22C55E] font-mono font-bold">98.6% On-Time</span>
                  </div>
                  <div className="w-full bg-[#22C55E]/15 dark:bg-white/10 rounded-full h-2 mt-2 overflow-hidden border border-[#22C55E]/20">
                    <div className="bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#FF6B00] h-full rounded-full w-[78%] shadow-[0_0_12px_rgba(255,107,0,0.6)]" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground dark:text-white/60 mt-1.5 font-mono">
                    <span>Muger Plant &rarr; Kality Depot</span>
                    <span className="text-[#FF6B00] font-black bg-[#FF6B00]/15 px-2 py-0.5 rounded-md border border-[#FF6B00]/30">ETA: 42 mins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Pills in Light Green & Electric Orange */}
          <div className="flex items-center gap-2.5 relative z-10 pt-2">
            <Link
              to="/fleet/gps"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#22C55E]/15 hover:bg-[#22C55E] hover:text-black text-[#16A34A] dark:text-[#22C55E] text-xs font-bold backdrop-blur-md border border-[#22C55E]/40 transition-all shadow-sm"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Open control tower</span>
            </Link>
            <Link
              to="/fleet/deliveries"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-white/10 hover:bg-[#FF6B00] hover:text-white text-foreground dark:text-white text-xs font-bold backdrop-blur-md border border-[#FF6B00]/30 hover:border-[#FF6B00] transition-all shadow-xs"
            >
              <span>Simulate delay</span>
            </Link>
          </div>
        </div>

        {/* Card 3: Calendar & Dispatch Agenda Card (3 cols)
            On dark theme: Electric Orange accents on borders, active day, tasks, and button */}
        <div className="lg:col-span-3 rounded-3xl border border-[#22C55E]/30 dark:border-[#FF6B00]/40 dark:hover:border-[#FF6B00] bg-white/90 dark:bg-gradient-to-b dark:from-[#17120D] dark:to-[#0B130E] backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.06)] dark:shadow-[0_8px_32px_rgba(255,107,0,0.10)] flex flex-col justify-between transition-all">
          <div>
            {/* Month Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/50 text-xs font-bold text-foreground">
              <button className="p-1.5 rounded-lg hover:bg-[#22C55E]/15 dark:hover:bg-[#FF6B00]/20 text-muted-foreground hover:text-[#16A34A] dark:hover:text-[#FF6B00] transition-colors">
                &larr;
              </button>
              <span className="font-extrabold text-foreground">August 2026</span>
              <button className="p-1.5 rounded-lg hover:bg-[#22C55E]/15 dark:hover:bg-[#FF6B00]/20 text-muted-foreground hover:text-[#16A34A] dark:hover:text-[#FF6B00] transition-colors">
                &rarr;
              </button>
            </div>

            {/* Horizontal Week Strip: Day 14 active pill uses Electric Orange in dark theme */}
            <div className="grid grid-cols-7 gap-1 py-3 text-center text-[10px] border-b border-border/50">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                <div key={d} className="text-muted-foreground font-bold">
                  {d}
                </div>
              ))}
              {[10, 11, 12, 13, 14, 15, 16].map((day) => {
                const isActive = day === 14
                return (
                  <div
                    key={day}
                    className={`py-1.5 rounded-xl font-bold transition-all ${
                      isActive
                        ? 'bg-[#22C55E] dark:bg-[#FF6B00] text-black dark:text-white shadow-[0_0_14px_rgba(34,197,94,0.45)] dark:shadow-[0_0_16px_rgba(255,107,0,0.6)]'
                        : 'text-foreground hover:bg-[#22C55E]/15 dark:hover:bg-[#FF6B00]/20 hover:text-[#16A34A] dark:hover:text-[#FF6B00]'
                    }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>

            {/* Agenda Tasks */}
            <div className="space-y-2.5 mt-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/95 dark:bg-[#1A140F]/80 border border-[#FF6B00]/40 border-l-4 border-l-[#FF6B00] shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-foreground">Customs clearance review</div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#FF6B00] bg-[#FF6B00]/20 px-2 py-0.5 rounded-full border border-[#FF6B00]/40">
                    Urgent
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Port paperwork pending for 3 loads
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 font-mono">
                  <span className="font-bold text-[#FF6B00] bg-[#FF6B00]/15 px-2 py-0.5 rounded-md">Modjo Terminal</span>
                  <span className="font-semibold">09:00 AM</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/95 dark:bg-[#1A140F]/80 border border-[#22C55E]/30 dark:border-[#FF6B00]/30 border-l-4 border-l-[#22C55E] dark:border-l-[#FF6B00] shadow-sm">
                <div className="font-bold text-foreground">Depot capacity audit</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Yard 4 walkthrough with ops leads
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 font-mono">
                  <span className="font-bold text-[#16A34A] dark:text-[#FF6B00] bg-[#22C55E]/15 dark:bg-[#FF6B00]/15 px-2 py-0.5 rounded-md border border-[#22C55E]/20 dark:border-[#FF6B00]/25">
                    Kality Central
                  </span>
                  <span className="font-semibold">10:45 AM</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/fleet/deliveries"
            className="w-full mt-3 py-2.5 rounded-2xl bg-[#22C55E] dark:bg-[#FF6B00] text-[#060B08] dark:text-white text-center text-xs font-extrabold hover:bg-[#16A34A] dark:hover:bg-[#EA580C] transition-all shadow-md shadow-[#22C55E]/25 dark:shadow-[0_4px_20px_rgba(255,107,0,0.45)] block"
          >
            + Schedule dispatch
          </Link>
        </div>
      </div>

      {/* Bottom Row (Matching Screenshot 1): Left 2x2 Mini KPI Cards + Right Hub Load Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 cols: 2x2 Grid of the 4 Mini KPI Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Deliveries */}
          <div className="rounded-3xl border border-[#22C55E]/30 dark:border-[#FF6B00]/40 dark:hover:border-[#FF6B00] bg-white/90 dark:bg-gradient-to-b dark:from-[#17120D] dark:to-[#0B130E] backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.05)] dark:shadow-[0_8px_30px_rgba(255,107,0,0.08)] flex flex-col justify-between transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <div className="p-1.5 rounded-xl bg-[#22C55E]/15 text-[#16A34A] dark:bg-[#FF6B00]/20 dark:text-[#FF6B00] dark:border dark:border-[#FF6B00]/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Deliveries</span>
              </div>
              <Link to="/fleet/deliveries" className="text-[11px] font-bold text-[#16A34A] dark:text-[#FF6B00] hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-sans">
                6,412
              </div>
              <div className="text-[11px] text-[#16A34A] dark:text-[#FF6B00] font-bold mt-1.5 inline-flex items-center gap-1 bg-[#22C55E]/15 dark:bg-[#FF6B00]/20 px-2.5 py-0.5 rounded-full border border-[#22C55E]/30 dark:border-[#FF6B00]/40">
                +12.4% vs previous period
              </div>
            </div>
          </div>

          {/* On-time rate */}
          <div className="rounded-3xl border border-[#22C55E]/30 dark:border-[#FF6B00]/40 dark:hover:border-[#FF6B00] bg-white/90 dark:bg-gradient-to-b dark:from-[#17120D] dark:to-[#0B130E] backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.05)] dark:shadow-[0_8px_30px_rgba(255,107,0,0.08)] flex flex-col justify-between transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <div className="p-1.5 rounded-xl bg-[#22C55E]/15 text-[#16A34A] dark:bg-[#FF6B00]/20 dark:text-[#FF6B00] dark:border dark:border-[#FF6B00]/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>On-time rate</span>
              </div>
              <Link to="/fleet/deliveries" className="text-[11px] font-bold text-[#16A34A] dark:text-[#FF6B00] hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-sans">
                98.6%
              </div>
              <div className="text-[11px] text-[#16A34A] dark:text-[#FF6B00] font-bold mt-1.5 inline-flex items-center gap-1 bg-[#22C55E]/15 dark:bg-[#FF6B00]/20 px-2.5 py-0.5 rounded-full border border-[#22C55E]/30 dark:border-[#FF6B00]/40">
                +1.8% vs previous period
              </div>
            </div>
          </div>

          {/* Avg transit */}
          <div className="rounded-3xl border border-[#22C55E]/30 dark:border-[#FF6B00]/40 dark:hover:border-[#FF6B00] bg-white/90 dark:bg-gradient-to-b dark:from-[#17120D] dark:to-[#0B130E] backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.05)] dark:shadow-[0_8px_30px_rgba(255,107,0,0.08)] flex flex-col justify-between transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <div className="p-1.5 rounded-xl bg-[#22C55E]/15 text-[#16A34A] dark:bg-[#FF6B00]/20 dark:text-[#FF6B00] dark:border dark:border-[#FF6B00]/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Avg transit</span>
              </div>
              <Link to="/fleet/deliveries" className="text-[11px] font-bold text-[#16A34A] dark:text-[#FF6B00] hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-sans">
                2.4d
              </div>
              <div className="text-[11px] text-[#16A34A] dark:text-[#FF6B00] font-bold mt-1.5 inline-flex items-center gap-1 bg-[#22C55E]/15 dark:bg-[#FF6B00]/20 px-2.5 py-0.5 rounded-full border border-[#22C55E]/30 dark:border-[#FF6B00]/40">
                -6.1% faster than target
              </div>
            </div>
          </div>

          {/* Fleet usage */}
          <div className="rounded-3xl border border-[#22C55E]/30 dark:border-[#FF6B00]/40 dark:hover:border-[#FF6B00] bg-white/90 dark:bg-gradient-to-b dark:from-[#17120D] dark:to-[#0B130E] backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.05)] dark:shadow-[0_8px_30px_rgba(255,107,0,0.08)] flex flex-col justify-between transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <div className="p-1.5 rounded-xl bg-[#22C55E]/15 text-[#16A34A] dark:bg-[#FF6B00]/20 dark:text-[#FF6B00] dark:border dark:border-[#FF6B00]/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Fleet usage</span>
              </div>
              <Link to="/fleet/trucks" className="text-[11px] font-bold text-[#16A34A] dark:text-[#FF6B00] hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-sans">
                93%
              </div>
              <div className="text-[11px] text-[#16A34A] dark:text-[#FF6B00] font-bold mt-1.5 inline-flex items-center gap-1 bg-[#22C55E]/15 dark:bg-[#FF6B00]/20 px-2.5 py-0.5 rounded-full border border-[#22C55E]/30 dark:border-[#FF6B00]/40">
                +3.9% vs previous period
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Hub load by day Heatmap (Image 1 style) */}
        <div className="lg:col-span-5 rounded-3xl border border-[#22C55E]/30 dark:border-[#FF6B00]/40 dark:hover:border-[#FF6B00] bg-white/90 dark:bg-gradient-to-b dark:from-[#17120D] dark:to-[#0B130E] backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.06)] dark:shadow-[0_8px_30px_rgba(255,107,0,0.08)] flex flex-col justify-between space-y-3 transition-all">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <div className="p-1.5 rounded-xl bg-[#22C55E]/15 text-[#16A34A] dark:bg-[#FF6B00]/20 dark:text-[#FF6B00] dark:border dark:border-[#FF6B00]/40">
                  <Boxes className="w-4 h-4" />
                </div>
                <span>Hub load by day</span>
              </div>
              <Link
                to="/fleet/gps"
                className="text-[11px] font-bold text-[#16A34A] dark:text-[#FF6B00] hover:underline"
              >
                View all
              </Link>
            </div>

            {/* Legend pills in luminous Light Green & Electric Orange in dark theme */}
            <div className="flex items-center gap-2.5 py-2.5 text-[10px] text-muted-foreground font-semibold flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]/20 dark:bg-[#FF6B00]/20 border border-[#22C55E]/30 dark:border-[#FF6B00]/40" /> Light
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]/40 dark:bg-[#FF6B00]/40" /> Steady
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]/70 dark:bg-[#FF6B00]/70" /> Heavy
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] dark:bg-[#FF6B00] shadow-sm dark:shadow-[0_0_8px_rgba(255,107,0,0.6)]" /> At capacity
              </span>
            </div>

            {/* Matrix Grid */}
            <div className="space-y-2 mt-1">
              {hubRows.map((hub) => (
                <div key={hub.code} className="flex items-center gap-2 text-xs">
                  <span className="w-8 font-mono font-bold text-muted-foreground text-[10px]">
                    {hub.code}
                  </span>
                  <div className="grid grid-cols-12 gap-1 flex-1">
                    {hub.loads.map((load, idx) => (
                      <div
                        key={idx}
                        className={`h-5 rounded-md transition-all ${getHeatmapColor(load)} hover:scale-105`}
                        title={`${hub.name} — Day ${hubDays[idx]}: ${load.toUpperCase()}`}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Day numbers */}
              <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground pt-1">
                <span className="w-8" />
                <div className="grid grid-cols-12 gap-1 flex-1 text-center font-bold">
                  {hubDays.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/fleet/gps"
            className="w-full py-2.5 text-center text-xs font-bold rounded-2xl bg-[#22C55E]/15 hover:bg-[#22C55E] text-[#16A34A] hover:text-[#060B08] dark:bg-[#FF6B00]/15 dark:hover:bg-[#FF6B00] dark:text-[#FF6B00] dark:hover:text-white border border-[#22C55E]/40 dark:border-[#FF6B00]/40 transition-all block font-mono shadow-sm"
          >
            Open Logistics Corridor Radar
          </Link>
        </div>
      </div>

      {/* Slim 1-Line Quick Access Portal Strip */}
      <div className="rounded-2xl p-3 px-4 bg-white/75 dark:bg-[#0E1712]/75 border border-[#22C55E]/20 dark:border-white/10 backdrop-blur-md flex items-center justify-between flex-wrap gap-3 text-xs font-bold text-muted-foreground">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-foreground">
          Quick Access Portals:
        </span>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/fleet/deliveries"
            className="px-3 py-1 rounded-full bg-surface hover:bg-[#22C55E]/15 dark:hover:bg-[#FF6B00]/15 hover:text-[#16A34A] dark:hover:text-[#FF6B00] border border-border transition-colors"
          >
            Corridor Waybills &rarr;
          </Link>
          <Link
            to="/fleet/gps"
            className="px-3 py-1 rounded-full bg-surface hover:bg-[#22C55E]/15 dark:hover:bg-[#FF6B00]/15 hover:text-[#16A34A] dark:hover:text-[#FF6B00] border border-border transition-colors"
          >
            Live GPS Radar &rarr;
          </Link>
          <Link
            to="/finance/banks"
            className="px-3 py-1 rounded-full bg-surface hover:bg-[#22C55E]/15 dark:hover:bg-[#FF6B00]/15 hover:text-[#16A34A] dark:hover:text-[#FF6B00] border border-border transition-colors"
          >
            10 Bank Accounts &rarr;
          </Link>
          <Link
            to="/finance/transactions"
            className="px-3 py-1 rounded-full bg-surface hover:bg-[#22C55E]/15 dark:hover:bg-[#FF6B00]/15 hover:text-[#16A34A] dark:hover:text-[#FF6B00] border border-border transition-colors"
          >
            Member Claims &rarr;
          </Link>
          <Link
            to="/finance/reports"
            className="px-3 py-1 rounded-full bg-surface hover:bg-[#22C55E]/15 dark:hover:bg-[#FF6B00]/15 hover:text-[#16A34A] dark:hover:text-[#FF6B00] border border-border transition-colors"
          >
            P&amp;L Reports &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
