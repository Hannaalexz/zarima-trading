import React from 'react'

interface StatusBadgeProps {
  status: string
  className?: string
  size?: 'sm' | 'md'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const getStatusStyles = (statusText: string) => {
    const s = statusText.toLowerCase()

    // Positive / Operational / Cleared / Available / Active
    if (
      s.includes('active') ||
      s.includes('received') ||
      s.includes('delivered') ||
      s.includes('paid') ||
      s.includes('adequate') ||
      s.includes('balanced') ||
      s.includes('cleared') ||
      s.includes('online') ||
      s.includes('available') ||
      s.includes('preferred') ||
      s.includes('current')
    ) {
      return 'bg-forest/10 text-forest dark:bg-forest-vibrant/10 dark:text-forest-vibrant border-forest/20 dark:border-forest-vibrant/30'
    }

    // Pending / In Transit / Warning / Low Stock / Scheduled
    if (
      s.includes('transit') ||
      s.includes('partial') ||
      s.includes('low') ||
      s.includes('pending') ||
      s.includes('progress') ||
      s.includes('moving') ||
      s.includes('standby') ||
      s.includes('review') ||
      s.includes('scheduled')
    ) {
      return 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30 font-bold shadow-xs'
    }

    // Critical / Overdue / Maintenance / Blocked / Delayed
    if (
      s.includes('critical') ||
      s.includes('overdue') ||
      s.includes('maintenance') ||
      s.includes('discrepancy') ||
      s.includes('blocked') ||
      s.includes('delayed') ||
      s.includes('danger')
    ) {
      return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25'
    }

    // Neutral / Idle / Transfer
    return 'bg-muted/80 text-muted-foreground border-border'
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] leading-tight font-medium'
      : 'px-2.5 py-1 text-xs font-semibold leading-tight'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide select-none ${sizeClasses} ${getStatusStyles(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  )
}
