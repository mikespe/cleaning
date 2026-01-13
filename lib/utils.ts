import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Format time for display
 */
export function formatTime(time: string | null): string {
  if (!time) return 'TBD'
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

/**
 * Format square footage with commas
 */
export function formatSqFt(sqft: number | null): string {
  if (!sqft) return 'N/A'
  return `${sqft.toLocaleString()} sq ft`
}

/**
 * Get Google Maps URL for address
 */
export function getGoogleMapsUrl(address: string, city: string, state: string = 'NJ'): string {
  const query = encodeURIComponent(`${address}, ${city}, ${state}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

/**
 * Get phase display label
 */
export function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    rough: 'Rough Clean',
    final: 'Final Clean',
    punch: 'Punch List',
    turnover: 'Turnover',
  }
  return labels[phase] || phase
}

// Alias for backward compatibility
export const formatPhase = getPhaseLabel

/**
 * Get status badge color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Project status
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_progress: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    // Lead status
    new: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    contacted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    quoted: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    won: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    lost: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    // Assignment status
    no_show: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
