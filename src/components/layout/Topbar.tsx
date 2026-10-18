import React, { useState } from 'react'
import {
  Menu,
  Bell,
  Search,
  User,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'
import { ThemeToggle } from '../shared/ThemeToggle'
import { Link, useNavigate } from 'react-router-dom'

interface TopbarProps {
  onToggleMobileMenu: () => void
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu }) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const notifications = [
    {
      id: 1,
      title: 'Low Stock: Adama Depot',
      description: 'Bulk Cement level at 680 Qtl.',
      time: '15m ago',
      type: 'warning',
      link: '/cement/inventory',
    },
    {
      id: 2,
      title: '3-ET-A41920 Highway Ping',
      description: 'Kassahun hauling 700 Qtl to Kality Depot.',
      time: '45m ago',
      type: 'info',
      link: '/fleet/gps',
    },
    {
      id: 3,
      title: 'Partner Outlay Logged',
      description: 'ETB 84,500 emergency spare parts.',
      time: '2h ago',
      type: 'success',
      link: '/finance/transactions',
    },
  ]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const q = searchQuery.toLowerCase()
    if (q.includes('cement') || q.includes('purchase') || q.includes('stock')) {
      navigate('/cement')
    } else if (q.includes('truck') || q.includes('fleet') || q.includes('driver')) {
      navigate('/fleet')
    } else if (q.includes('bank') || q.includes('pay') || q.includes('tax') || q.includes('finance')) {
      navigate('/finance')
    } else {
      navigate('/dashboard')
    }
    setSearchQuery('')
  }

  return (
    <header className="h-16 border-b border-border/40 bg-surface/60 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 transition-colors">
      {/* Left Area: Mobile menu button & long pill search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Pill Bar (Image 1 & 2 style) */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shipments, orders, drivers, or lane IDs..."
            className="w-full pl-11 pr-4 py-2 text-xs bg-white/85 dark:bg-white/[0.05] border border-[#22C55E]/30 dark:border-white/[0.1] rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#22C55E]/50 focus:border-[#22C55E] transition-all shadow-sm"
          />
        </form>
      </div>

      {/* Right Area: Timeframe pill, Theme toggle, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Monthly Selector Pill (Image 1 style) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/85 dark:bg-white/[0.05] border border-[#22C55E]/30 dark:border-white/[0.1] text-xs font-bold text-foreground shadow-sm">
          <span>Monthly</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#22C55E]" />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full bg-white/85 dark:bg-white/[0.05] border border-[#22C55E]/30 dark:border-white/[0.1] text-muted-foreground hover:text-[#16A34A] dark:hover:text-[#22C55E] hover:border-[#22C55E] transition-all shadow-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-surface border border-border shadow-dropdown p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-border">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Operational Alerts
                </span>
                <span className="text-[10px] font-black text-[#FF6B00] bg-[#FF6B00]/15 px-2 py-0.5 rounded-full border border-[#FF6B00]/30 shadow-xs">
                  3 Unread
                </span>
              </div>

              <div className="divide-y divide-border/60 max-h-64 overflow-y-auto mt-1">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link}
                    onClick={() => setShowNotifications(false)}
                    className="py-2.5 flex items-start gap-2.5 hover:bg-surface-elevated/60 px-2 rounded-lg transition-colors group block"
                  >
                    <div className="flex-1 text-xs">
                      <div className="font-semibold text-foreground group-hover:text-[#FF6B00] flex items-center justify-between">
                        <span>{n.title}</span>
                        <span className="text-[10px] font-normal text-muted-foreground">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 leading-snug text-[11px]">
                        {n.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-border text-center">
                <Link
                  to="/settings"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-[#FF6B00] font-bold hover:underline inline-flex items-center gap-1"
                >
                  Configure Notifications <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Popover */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white/85 dark:bg-white/[0.05] border border-[#22C55E]/35 dark:border-white/[0.1] hover:border-[#22C55E] text-foreground transition-all shadow-sm"
          >
            <div className="w-7 h-7 rounded-full bg-[#22C55E] text-[#060B08] flex items-center justify-center font-extrabold text-xs shadow-sm ring-2 ring-[#22C55E]/40">
              DT
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                Dawit Tadesse
              </span>
              <span className="text-[10px] text-muted-foreground">
                Managing Partner
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#16A34A] dark:text-[#22C55E] hidden md:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-surface border border-border shadow-dropdown p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
              <div className="px-3 py-2 border-b border-border mb-1">
                <div className="font-bold text-foreground">Dawit Tadesse</div>
                <div className="text-muted-foreground text-[11px]">
                  Managing Partner
                </div>
              </div>
              <Link
                to="/settings"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-surface-elevated"
              >
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                System Settings
              </Link>
              <Link
                to="/"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-surface-elevated"
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                Landing Page
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
