import { format, parseISO, isValid } from 'date-fns'

/**
 * Formats a numeric value into Ethiopian Birr (ETB) currency display.
 * Example: 1500000 -> "ETB 1,500,000.00" or short format "ETB 1.5M"
 */
export function formatCurrency(amount: number, options?: { compact?: boolean; hideDecimals?: boolean }): string {
  if (isNaN(amount)) return 'ETB 0.00'

  if (options?.compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `ETB ${(amount / 1_000_000).toFixed(1)}M`
    }
    if (Math.abs(amount) >= 1_000) {
      return `ETB ${(amount / 1_000).toFixed(1)}k`
    }
    return `ETB ${amount.toFixed(0)}`
  }

  const formatted = new Intl.NumberFormat('en-ET', {
    minimumFractionDigits: options?.hideDecimals ? 0 : 2,
    maximumFractionDigits: options?.hideDecimals ? 0 : 2,
  }).format(amount)

  return `ETB ${formatted}`
}

/**
 * Formats quantity with unit (Quintals, Bags, Metric Tons, Liters).
 */
export function formatQuantity(quantity: number, unit: 'Qtl' | 'Tons' | 'Bags' | 'Liters' | 'Units' = 'Qtl'): string {
  const formatted = new Intl.NumberFormat('en-US').format(quantity)
  return `${formatted} ${unit}`
}

/**
 * Formats an ISO date string or Date object.
 */
export function formatDate(dateInput: string | Date | undefined | null, formatStr = 'dd MMM yyyy'): string {
  if (!dateInput) return '—'
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput
  if (!isValid(date)) return '—'
  return format(date, formatStr)
}

/**
 * Formats date and time.
 */
export function formatDateTime(dateInput: string | Date | undefined | null): string {
  return formatDate(dateInput, 'dd MMM yyyy, HH:mm')
}

/**
 * Formats percentages.
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}
