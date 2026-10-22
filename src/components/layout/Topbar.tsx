import React, { useState } from 'react'
import {
  Menu,
  Bell,
  Search,
  User,
  ExternalLink,
  ChevronDown,
  LogOut,
  RefreshCw,
  Receipt,
  Crown,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { ThemeToggle } from '../shared/ThemeToggle'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/data/authContext'
import { useToast } from '@/hooks/useToast'

import { useStore } from '@/data/storeContext'

interface TopbarProps {
  onToggleMobileMenu: () => void
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu }) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { currentUser, switchRole, logout } = useAuth()
  const { addToast } = useToast()
  const { trucks } = useStore()

  // Calculate Fleet Service Due Overdue Alerts
  const serviceDueTrucks = trucks.filter((t) => {
    const isKmDue = t.nextServiceDueKm ? t.mileageKm >= t.nextServiceDueKm : false
    const isDateDue = t.nextServiceDueDate ? new Date(t.nextServiceDueDate) <= new Date() : false
    return isKmDue || isDateDue
  })

  const handleRoleSwitch = (newRole: 'admin' | 'accountant') => {
    switchRole(newRole)
    setShowProfile(false)
    addToast({
      title: `Switched to ${newRole === 'admin' ? 'Administrator' : 'Accountant'}`,
      description: `Active role updated. Permissions and controls adjusted.`,
      type: 'info',
    })
  }

  const handleLogout = () => {
    setShowProfile(false)
    logout()
    addToast({
      title: 'Signed Out',
      description: 'You have returned to the public portal.',
      type: 'info',
    })
    navigate('/login')
  }

  const notifications = [
    ...serviceDueTrucks.map((t, idx) => ({
      id: `service-${t.id}-${idx}`,
      title: `Service Due: ${t.plateNumber}`,
      description: `${t.makeModel} odometer ${t.mileageKm.toLocaleString()} km exceeded service interval.`,
      time: 'Immediate',
      type: 'warning' as const,
      link: '/fleet/service',
    })),
    {
      id: 'notif-1',
      title: 'Depot Stock Health',
      description: 'Central Depot Addis Ababa (Kality) operational.',
      time: '15m ago',
      type: 'info' as const,
      link: '/cement/inventory',
    },
    {
      id: 'notif-2',
      title: 'Commercial Haulage Roster',
      description: 'Heavy fleet actively hauling Mugher & Dangote lines.',
      time: '45m ago',
      type: 'info' as const,
      link: '/fleet/deliveries',
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
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white/85 dark:bg-white/[0.05] border border-[#22C55E]/35 dark:border-white/[0.1] hover:border-[#22C55E] text-foreground transition-all shadow-sm group"
          >
            <div
              className="w-7 h-7 rounded-full text-[#060B08] flex items-center justify-center font-black text-xs shadow-sm ring-2 ring-[#22C55E]/40"
              style={{ backgroundColor: currentUser?.badgeColor || '#22C55E' }}
            >
              {currentUser?.avatarInitials || 'DT'}
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-foreground truncate max-w-[130px]">
                {currentUser?.name || 'Dawit Tadesse'}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                {currentUser?.role === 'accountant' ? (
                  <span className="text-[#16A34A] dark:text-[#22C55E]">💼 Accountant</span>
                ) : (
                  <span className="text-[#FF6B00]">👑 Administrator</span>
                )}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#16A34A] dark:text-[#22C55E] hidden md:block group-hover:translate-y-0.5 transition-transform" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-surface border border-border shadow-dropdown p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs space-y-2.5">
              {/* Header Profile Info */}
              <div className="p-2.5 rounded-xl bg-surface-elevated border border-border/80 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl text-[#060B08] flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0"
                  style={{ backgroundColor: currentUser?.badgeColor || '#22C55E' }}
                >
                  {currentUser?.avatarInitials || 'DT'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-foreground truncate">
                    {currentUser?.name || 'Dawit Tadesse'}
                  </div>
                  <div className="text-muted-foreground text-[10.5px] truncate">
                    {currentUser?.email || 'admin@zarima-trading.et'}
                  </div>
                  <div className="mt-1">
                    <span
                      className="inline-block px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${currentUser?.badgeColor || '#22C55E'}25`,
                        color: currentUser?.badgeColor || '#22C55E',
                      }}
                    >
                      {currentUser?.role === 'accountant'
                        ? 'Accountant (Invoices & Reconciliation)'
                        : 'Administrator (Controls Everything)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fast Role Switcher */}
              <div className="pt-1 border-t border-border/70">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
                  Quick Switch Role
                </div>
                {currentUser?.role === 'accountant' ? (
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 border border-[#FF6B00]/30 text-foreground transition-all group"
                  >
                    <div className="flex items-center gap-2 text-left">
                      <Crown className="w-4 h-4 text-[#FF6B00]" />
                      <div>
                        <div className="font-bold text-[11px] text-[#FF6B00]">
                          Switch to Administrator
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Dawit (Controls Everything)
                        </div>
                      </div>
                    </div>
                    <RefreshCw className="w-3.5 h-3.5 text-[#FF6B00] group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleRoleSwitch('accountant')}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 text-foreground transition-all group"
                  >
                    <div className="flex items-center gap-2 text-left">
                      <Receipt className="w-4 h-4 text-[#22C55E]" />
                      <div>
                        <div className="font-bold text-[11px] text-[#16A34A] dark:text-[#22C55E]">
                          Switch to Accountant
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Bethlehem (Invoices &amp; Reconciliation)
                        </div>
                      </div>
                    </div>
                    <RefreshCw className="w-3.5 h-3.5 text-[#22C55E] group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                )}
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 pt-1 border-t border-border/70">
                <Link
                  to="/configuration"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-surface-elevated transition-colors font-medium"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-forest" />
                  <span>Master Configuration</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-surface-elevated transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>System Settings</span>
                </Link>
                <Link
                  to="/"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-surface-elevated transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Public Company Website</span>
                </Link>
              </div>

              {/* Logout Button */}
              <div className="pt-1 border-t border-border/70">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors font-bold text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Lock Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
