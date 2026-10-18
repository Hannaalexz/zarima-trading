import React, { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  badgeText?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  badgeText,
}) => {
  return (
    <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-[#22C55E] via-[#24CB63] to-[#16A34A] text-[#060B08] shadow-[0_14px_45px_rgba(34,197,94,0.30)] border border-[#22C55E] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
      {/* Subtle glass glow orbs */}
      <div className="absolute -top-12 -left-12 w-56 h-56 bg-white/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-1.5 flex-1">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-[#060B08]/75 mb-1 font-semibold">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="hover:text-[#060B08] underline decoration-[#060B08]/40 hover:decoration-[#060B08] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#060B08] font-bold">{crumb.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#060B08]/50" />
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title & Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#060B08] font-sans">
            {title}
          </h1>
          {badgeText && (
            <span className="text-[10px] font-mono font-black px-3 py-1 rounded-full bg-[#FF6B00] text-white uppercase shadow-md shadow-[#FF6B00]/30 tracking-wider">
              {badgeText}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-[#060B08]/85 max-w-2xl font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Actions Bar: Primary buttons turn Electric Orange on light green header */}
      {actions && (
        <div className="relative z-10 flex items-center gap-2.5 flex-wrap flex-shrink-0 self-start md:self-center [&_button]:rounded-full [&_button]:px-5 [&_button]:py-2.5 [&_button]:font-black [&_button]:text-xs [&_button]:transition-all [&_button]:shadow-sm [&_a]:rounded-full [&_a]:px-5 [&_a]:py-2.5 [&_a]:font-black [&_a]:text-xs [&_a]:transition-all [&_a]:shadow-sm [&_.bg-forest]:!bg-[#FF6B00] [&_.bg-forest]:!text-white hover:[&_.bg-forest]:!bg-[#EA580C] [&_.bg-forest]:!shadow-md [&_.bg-forest]:!shadow-[#FF6B00]/30 hover:[&_.bg-forest]:!scale-105 active:[&_.bg-forest]:!scale-95 [&_.bg-surface]:!bg-white/95 [&_.bg-surface]:!text-[#060B08] hover:[&_.bg-surface]:!bg-white hover:[&_.bg-surface]:!text-[#FF6B00] [&_.bg-surface\\/90]:!bg-white/95 [&_.bg-surface\\/90]:!text-[#060B08] hover:[&_.bg-surface\\/90]:!bg-white hover:[&_.bg-surface\\/90]:!text-[#FF6B00]">
          {actions}
        </div>
      )}
    </div>
  )
}
