// lib/utils.ts
// Utility functions for the application

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate job number
export function generateJobNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `JOB-${year}-${random}`
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(amount)
}

// Format date
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(date)
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    QUOTED: 'bg-purple-100 text-purple-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    REVIEW: 'bg-indigo-100 text-indigo-700',
    REVISION: 'bg-orange-100 text-orange-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

// Get status label
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pending Review',
    QUOTED: 'Quote Sent',
    IN_PROGRESS: 'In Progress',
    REVIEW: 'Ready for Review',
    REVISION: 'Revision Requested',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }
  return labels[status] || status
}

// Get project type label
export function getProjectTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    KITCHEN: 'Kitchen',
    WARDROBE: 'Wardrobe',
    BATHROOM_VANITY: 'Bathroom Vanity',
    ENTERTAINMENT_UNIT: 'Entertainment Unit',
    HOME_OFFICE: 'Home Office',
    LAUNDRY: 'Laundry',
    CUSTOM: 'Custom',
  }
  return labels[type] || type
}

// Get project type icon
export function getProjectTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    KITCHEN: '🍳',
    WARDROBE: '👔',
    BATHROOM_VANITY: '🚿',
    ENTERTAINMENT_UNIT: '📺',
    HOME_OFFICE: '💼',
    LAUNDRY: '🧺',
    CUSTOM: '🔧',
  }
  return icons[type] || '📦'
}

// Slugify text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
