import React, { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label?: string
    isPositiveGood?: boolean
  }
  icon?: ReactNode
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  className = '',
}) => {
  const isPositive = trend && trend.value > 0
  const isNegative = trend && trend.value < 0
  const isGood =
    trend &&
    (trend.isPositiveGood !== false ? isPositive : isNegative)

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-surface/90 backdrop-blur-md p-5 transition-all duration-200 hover:border-[#FF6B00]/50 hover:shadow-[0_8px_24px_rgba(255,107,0,0.10)] shadow-card flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E] border border-[#22C55E]/20 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 flex-wrap">
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-semibold ${
                  isGood
                    ? 'bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E]'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : isNegative ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                <span>
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}%
                </span>
              </span>
            )}
            {subtitle && <span className="truncate text-[11px]">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
