import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Boxes, Landmark, Truck } from 'lucide-react'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-[#22C55E] selection:text-[#060B08] font-sans transition-colors duration-200">
      {/* Clean Minimal Header */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="focus:outline-none">
          <BrandLogo />
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
          >
            <span>Control Tower</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="max-w-5xl w-full mx-auto px-6 py-6 flex-1 flex flex-col justify-center space-y-8">
        {/* Simple Editorial Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Freight Logistics &amp; <span className="text-[#22C55E]">Cement Supply</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Select an operational division to manage procurement, transport, and banking accounts.
          </p>
        </div>

        {/* 3 Cohesive Operational Portals (Engineered for both Light & Dark modes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* MENU 1: CEMENT TRADING */}
          <Link
            to="/cement"
            className="group relative rounded-3xl p-3.5 sm:p-4 bg-white/95 dark:bg-[#0E1712]/95 border border-[#D2EBDA] dark:border-[#1A3323] hover:border-[#22C55E] dark:hover:border-[#22C55E]/70 shadow-[0_4px_24px_rgba(34,197,94,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(34,197,94,0.16)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            {/* Framed Image Window */}
            <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-muted">
              <img
                src="/images/cement_depot.jpg"
                alt="Zarima Cement Trading Depot"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.95] dark:brightness-[0.80]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

              {/* Floating Top Left Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-[#22C55E] text-[10.5px] font-bold tracking-wider uppercase border border-[#22C55E]/30 flex items-center gap-1.5 shadow-sm">
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Depot Quotas</span>
                </span>
              </div>

              {/* Floating Top Right Arrow */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md text-[#17251D] dark:text-white border border-white/20 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#22C55E] group-hover:text-[#060B08] group-hover:border-transparent transition-all">
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>

            {/* Content Details Area */}
            <div className="pt-4 pb-1 px-1.5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#16A34A] dark:text-[#22C55E] mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span>Commodity Distribution</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-[#16A34A] dark:group-hover:text-[#22C55E] transition-colors">
                  Cement Trading
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  Factory quotas &amp; depot warehousing
                </p>
              </div>

              {/* Bottom Action Strip */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-[#16A34A] dark:text-[#22C55E] group-hover:text-foreground transition-colors">
                <span>Enter Cement Portal</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* MENU 2: TRANSPORT & FLEET */}
          <Link
            to="/fleet"
            className="group relative rounded-3xl p-3.5 sm:p-4 bg-white/95 dark:bg-[#0E1712]/95 border border-[#D2EBDA] dark:border-[#1A3323] hover:border-[#FF6B00] dark:hover:border-[#FF6B00]/70 shadow-[0_4px_24px_rgba(34,197,94,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(255,107,0,0.18)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            {/* Framed Image Window */}
            <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-muted">
              <img
                src="/images/fleet_transport.jpg"
                alt="Zarima Commercial Fleet Transport"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.95] dark:brightness-[0.80]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

              {/* Floating Top Left Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-[#FF6B00] text-[10.5px] font-bold tracking-wider uppercase border border-[#FF6B00]/30 flex items-center gap-1.5 shadow-sm">
                  <Truck className="w-3.5 h-3.5" />
                  <span>GPS Telemetry</span>
                </span>
              </div>

              {/* Floating Top Right Arrow */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md text-[#17251D] dark:text-white border border-white/20 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#FF6B00] group-hover:text-white group-hover:border-transparent transition-all">
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>

            {/* Content Details Area */}
            <div className="pt-4 pb-1 px-1.5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#FF6B00] mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                  <span>Corridor Telemetry</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-[#FF6B00] transition-colors">
                  Transport &amp; Fleet
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  42 heavy haulers &amp; live GPS radar
                </p>
              </div>

              {/* Bottom Action Strip */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-[#FF6B00] group-hover:text-foreground transition-colors">
                <span>Enter Fleet Portal</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* MENU 3: FINANCE & TREASURY */}
          <Link
            to="/finance"
            className="group relative rounded-3xl p-3.5 sm:p-4 bg-white/95 dark:bg-[#0E1712]/95 border border-[#D2EBDA] dark:border-[#1A3323] hover:border-[#22C55E] dark:hover:border-[#22C55E]/70 shadow-[0_4px_24px_rgba(34,197,94,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(34,197,94,0.16)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            {/* Framed Image Window */}
            <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-muted">
              <img
                src="/images/finance_treasury.jpg"
                alt="Zarima Corporate Banking & Financial Treasury"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.95] dark:brightness-[0.80]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

              {/* Floating Top Left Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-[#22C55E] text-[10.5px] font-bold tracking-wider uppercase border border-[#22C55E]/30 flex items-center gap-1.5 shadow-sm">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>10 Bank Feeds</span>
                </span>
              </div>

              {/* Floating Top Right Arrow */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md text-[#17251D] dark:text-white border border-white/20 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#22C55E] group-hover:text-[#060B08] group-hover:border-transparent transition-all">
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>

            {/* Content Details Area */}
            <div className="pt-4 pb-1 px-1.5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#16A34A] dark:text-[#22C55E] mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span>Corporate Treasury</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-[#16A34A] dark:group-hover:text-[#22C55E] transition-colors">
                  Finance &amp; Accounts
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  10 bank accounts, cash ledger &amp; payroll
                </p>
              </div>

              {/* Bottom Action Strip */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-[#16A34A] dark:text-[#22C55E] group-hover:text-foreground transition-colors">
                <span>Enter Finance Portal</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

        </div>

        {/* Clean 1-Line Control Tower Bar */}
        <div className="rounded-2xl p-4 sm:p-5 bg-white/90 dark:bg-[#0E1712]/90 border border-[#D2EBDA] dark:border-[#1A3323] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-ping" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Operations Control Tower
              </h3>
              <p className="text-xs text-muted-foreground">
                Unified live telemetry, hub heatmaps, and management overview.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 whitespace-nowrap transition-all"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-6 text-center text-xs text-muted-foreground">
        <span>Zarima Trading &amp; Logistics &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}
