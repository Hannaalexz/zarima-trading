import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Layers,
  ShoppingBag,
  TrendingUp,
  Boxes,
  Users,
  Building2,
  Truck,
  PackageCheck,
  UserCheck,
  Wrench,
  Fuel,
  Navigation,
  Landmark,
  Receipt,
  Scale,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  FileBarChart,
  Settings,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Gauge,
} from 'lucide-react'
import { BrandLogo } from '../shared/BrandLogo'
import { useAuth } from '@/data/authContext'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const { currentUser } = useAuth()

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Main Operations Hub', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'CEMENT MANAGEMENT',
      items: [
        { label: 'Cement Overview', href: '/cement', icon: Layers },
        {
          label: 'Purchases Invoices',
          href: '/cement/purchases',
          icon: ShoppingBag,
          badge: currentUser?.role === 'accountant' ? 'Stock In' : undefined,
        },
        {
          label: 'Sales Invoices',
          href: '/cement/sales',
          icon: TrendingUp,
          badge: currentUser?.role === 'accountant' ? 'Billing' : undefined,
        },
        { label: 'Addis Inventory Stock', href: '/cement/inventory', icon: Boxes },
        { label: 'Walk-in & Regular Clients', href: '/cement/customers', icon: Users },
        { label: 'Factory Suppliers', href: '/cement/suppliers', icon: Building2 },
        {
          label: 'Cement Finance & P&L',
          href: '/finance/reports?report=cement_pnl',
          icon: FileBarChart,
          badge: 'Cement P&L',
        },
      ],
    },
    {
      title: 'TRUCK MANAGEMENT',
      items: [
        { label: 'Truck Fleet Overview', href: '/fleet', icon: Truck },
        { label: '42 Haulage Trucks', href: '/fleet/trucks', icon: Truck },
        { label: 'Active Deliveries', href: '/fleet/deliveries', icon: PackageCheck },
        { label: 'Heavy Drivers', href: '/fleet/drivers', icon: UserCheck },
        { label: 'Scheduled Service (10k)', href: '/fleet/service', icon: Gauge },
        { label: 'Maintenance & Repairs', href: '/fleet/maintenance', icon: Wrench },
        { label: 'Fuel Expenses', href: '/fleet/fuel', icon: Fuel },
        {
          label: 'Truck Finance & P&L',
          href: '/finance/reports?report=transport_pnl',
          icon: FileBarChart,
          badge: 'Truck P&L',
        },
      ],
    },
    {
      title: 'OVERALL FINANCE',
      items: [
        { label: 'Consolidated Treasury', href: '/finance', icon: Landmark },
        { label: '10 Bank Portfolios', href: '/finance/banks', icon: Landmark },
        { label: 'Transaction Journal', href: '/finance/transactions', icon: Receipt },
        {
          label: 'Bank Reconciliation',
          href: '/finance/reconciliation',
          icon: Scale,
          badge: currentUser?.role === 'accountant' ? 'Reconcile' : undefined,
        },
        {
          label: 'Member Expenses',
          href: '/finance/member-expenses',
          icon: Users,
          badge: currentUser?.role === 'accountant' ? 'Admin Sign-off' : undefined,
        },
        { label: 'Staff Payroll', href: '/finance/payroll', icon: Wallet },
        { label: 'Master Consolidated P&L', href: '/finance/reports?report=combined_pnl', icon: FileBarChart },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        {
          label: 'Master Configuration',
          href: '/configuration',
          icon: SlidersHorizontal,
          badge: 'Master Data',
        },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        {
          label: 'System Settings',
          href: '/settings',
          icon: Settings,
          badge: currentUser?.role === 'accountant' ? 'Admin Only' : undefined,
        },
      ],
    },
  ]

  return (
    <aside
      className={`relative flex flex-col bg-sidebar text-sidebar-foreground border border-[#22C55E]/30 dark:border-[#22C55E]/40 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      } h-[calc(100vh-1.75rem)] my-auto ml-3.5 rounded-3xl flex-shrink-0 backdrop-blur-2xl shadow-[0_10px_35px_rgba(34,197,94,0.08)] dark:shadow-[0_10px_35px_rgba(34,197,94,0.20)] overflow-hidden`}
    >
      {/* Subtle ambient light green glow orbs */}
      <div className="absolute -top-16 -left-16 w-44 h-44 bg-[#22C55E]/20 dark:bg-[#22C55E]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-[#22C55E]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#22C55E]/25 flex-shrink-0 relative z-10">
        <Link to="/" onClick={onCloseMobile} className="focus:outline-none">
          <BrandLogo collapsed={collapsed} />
        </Link>
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-xl text-sidebar-muted hover:text-[#16A34A] dark:hover:text-[#22C55E] hover:bg-[#22C55E]/15 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role & Telemetry Pill */}
      {!collapsed ? (
        <div className="mx-3 mt-3 space-y-2 relative z-10">
          {/* Active Persona Pill */}
          <div
            className="px-3 py-1.5 rounded-2xl border text-xs shadow-xs flex items-center justify-between"
            style={{
              backgroundColor: `${currentUser?.badgeColor || '#22C55E'}15`,
              borderColor: `${currentUser?.badgeColor || '#22C55E'}40`,
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-5 h-5 rounded-full text-[#060B08] flex items-center justify-center font-black text-[9.5px] flex-shrink-0"
                style={{ backgroundColor: currentUser?.badgeColor || '#22C55E' }}
              >
                {currentUser?.avatarInitials || 'DT'}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-foreground truncate">
                  {currentUser?.name || 'Dawit Tadesse'}
                </div>
                <div
                  className="text-[9.5px] font-semibold truncate"
                  style={{ color: currentUser?.badgeColor || '#22C55E' }}
                >
                  {currentUser?.role === 'accountant' ? 'Invoices & Reconciliation' : 'Full System Control'}
                </div>
              </div>
            </div>
            <span
              className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs ml-1 flex-shrink-0"
              style={{
                backgroundColor: currentUser?.badgeColor || '#22C55E',
                color: currentUser?.role === 'admin' ? '#FFFFFF' : '#060B08',
              }}
            >
              {currentUser?.role || 'Admin'}
            </span>
          </div>

          {/* Telemetry Indicator */}
          <div className="px-3 py-1 rounded-xl bg-surface-elevated/60 border border-border/60 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-ping" />
              Telemetry Live
            </span>
            <span className="font-mono text-[9.5px] text-[#22C55E] font-bold">
              42 Trucks Active
            </span>
          </div>
        </div>
      ) : (
        <div className="my-2 flex justify-center relative z-10">
          <div
            className="w-8 h-8 rounded-full text-[#060B08] flex items-center justify-center font-black text-xs ring-2 ring-border shadow-xs"
            style={{ backgroundColor: currentUser?.badgeColor || '#22C55E' }}
            title={`${currentUser?.name} (${currentUser?.roleTitle})`}
          >
            {currentUser?.avatarInitials || 'DT'}
          </div>
        </div>
      )}

      {/* Nav List with custom scrollbar */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-4 relative z-10">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed ? (
              <div className="px-3 text-[10px] font-extrabold tracking-[0.16em] text-[#16A34A] dark:text-[#22C55E] uppercase mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                {section.title}
              </div>
            ) : (
              <div className="w-full h-px bg-[#22C55E]/30 my-2" />
            )}

            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={
                    item.href === '/dashboard' ||
                    item.href === '/cement' ||
                    item.href === '/fleet' ||
                    item.href === '/finance'
                  }
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs transition-all group relative ${
                      isActive
                        ? 'bg-[#22C55E] text-[#060B08] font-black shadow-[0_4px_16px_rgba(34,197,94,0.38)] border border-[#22C55E] scale-[1.02]'
                        : 'text-sidebar-foreground/85 dark:text-sidebar-muted hover:text-[#16A34A] dark:hover:text-[#22C55E] hover:bg-[#22C55E]/15 font-semibold'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${
                          isActive
                            ? 'text-[#060B08] scale-110'
                            : 'text-[#16A34A] dark:text-[#22C55E] group-hover:scale-110'
                        }`}
                      />
                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate tracking-tight">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-1 flex-shrink-0 ${
                                isActive
                                  ? 'bg-[#060B08]/20 text-[#060B08]'
                                  : 'bg-[#22C55E]/20 text-[#16A34A] dark:text-[#22C55E] border border-[#22C55E]/30'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                      {collapsed && (
                        <span className="sr-only">{item.label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </div>

      {/* Bottom Widget: Route Optimizer Card */}
      {!collapsed ? (
        <div className="p-3 border-t border-[#22C55E]/25 relative z-10">
          <Link
            to="/fleet/deliveries"
            className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-[#22C55E]/15 via-white/90 to-[#FF6B00]/10 dark:from-[#22C55E]/20 dark:via-[#0E1712] dark:to-[#0E1712] text-foreground dark:text-white border border-[#22C55E]/40 hover:border-[#FF6B00] transition-all shadow-sm group block"
          >
            <div className="p-2 rounded-xl bg-[#FF6B00] text-white group-hover:scale-110 transition-transform flex-shrink-0 shadow-md shadow-[#FF6B00]/30 font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black truncate text-[#16A34A] dark:text-[#22C55E] group-hover:text-[#FF6B00] transition-colors">
                Route optimizer
              </div>
              <div className="text-[10px] text-muted-foreground dark:text-white/70 font-semibold truncate">
                Cut 6% empty miles
              </div>
            </div>
          </Link>
        </div>
      ) : (
        <div className="p-2 border-t border-[#22C55E]/25 flex justify-center relative z-10">
          <Link
            to="/fleet/deliveries"
            className="p-2.5 rounded-xl bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30 hover:scale-105 transition-transform"
            title="Route optimizer — Cut 6% empty miles"
          >
            <TrendingUp className="w-4 h-4" />
          </Link>
        </div>
      )}
    </aside>
  )
}
