import React, { useState } from 'react'

interface BrandLogoProps {
  className?: string
  collapsed?: boolean
  variant?: 'light' | 'dark' | 'auto'
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  collapsed = false,
  variant = 'auto',
  size = 'md',
  showBadge = true,
}) => {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Zarima Brand Emblem */}
      <div
        className={`relative flex items-center justify-center ${sizeClasses[size]} rounded-xl overflow-hidden bg-[#0A1324] border border-[#FF6B00]/40 shadow-sm flex-shrink-0 transition-transform duration-200 hover:scale-105`}
      >
        {!imageError ? (
          <img
            src="/images/zarima_logo.jpg"
            alt="Zarima Trading PLC Official Logo"
            className="w-full h-full object-cover object-center"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#070F1E] text-[#FF6B00] font-black text-xs">
            ZT
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="flex flex-col tracking-tight leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-wider text-base font-sans ${
                variant === 'dark'
                  ? 'text-white'
                  : variant === 'light'
                  ? 'text-[#0F172A]'
                  : 'text-foreground'
              }`}
            >
              ZARIMA
            </span>
            {showBadge && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
            )}
          </div>
          <span
            className={`text-[9px] font-bold tracking-[0.24em] uppercase mt-0.5 ${
              variant === 'dark'
                ? 'text-[#FF6B00]'
                : variant === 'light'
                ? 'text-[#EA580C]'
                : 'text-[#FF6B00]'
            }`}
          >
            TRADING PLC
          </span>
        </div>
      )}
    </div>
  )
}
