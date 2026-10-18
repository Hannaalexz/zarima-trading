import React, { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-surface-elevated/40 ${className}`}
    >
      <div className="p-3 rounded-full bg-surface border border-border text-muted-foreground mb-3">
        {icon || <Inbox className="w-6 h-6 stroke-[1.5]" />}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-forest text-white hover:bg-forest-dark transition-colors shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
