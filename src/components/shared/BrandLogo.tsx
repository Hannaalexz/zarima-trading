import React from 'react'

interface BrandLogoProps {
  className?: string
  collapsed?: boolean
  variant?: 'light' | 'dark' | 'auto'
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  collapsed = false,
  variant = 'auto',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Vivid Light Green Monogram */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[#22C55E] text-[#060B08] shadow-sm border border-[#22C55E]/60 flex-shrink-0">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
        >
          {/* Geometric faceted prism: structural cement & logistics nodes */}
          <path
            d="M16 4L26 9.8V22.2L16 28L6 22.2V9.8L16 4Z"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#060B08]"
          />
          <path
            d="M10 14L16 17.5L22 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#060B08]"
          />
          <path
            d="M16 17.5V25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-[#060B08]"
          />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col tracking-tight leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold text-base tracking-wider font-sans ${
                variant === 'dark'
                  ? 'text-white'
                  : variant === 'light'
                  ? 'text-forest-dark'
                  : 'text-foreground'
              }`}
            >
              ZARIMA
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shadow-[0_0_6px_rgba(255,107,0,0.8)]" />
          </div>
          <span
            className={`text-[8.5px] font-semibold tracking-[0.22em] uppercase mt-0.5 ${
              variant === 'dark'
                ? 'text-white/60'
                : variant === 'light'
                ? 'text-muted-foreground'
                : 'text-muted-foreground'
            }`}
          >
            Trading &amp; Logistics
          </span>
        </div>
      )}
    </div>
  )
}
