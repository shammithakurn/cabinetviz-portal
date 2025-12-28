// types/database.ts
// Extended Prisma types and database-related types

import type {
  User,
  Job,
  JobFile,
  Message,
  Deliverable,
  Notification,
  Subscription,
  Payment,
  ThemeSetting,
} from '@prisma/client'

/**
 * User without sensitive fields (password)
 * This is the type returned by getCurrentUser()
 */
export type SafeUser = Omit<User, 'password'>

/**
 * User with related data
 */
export interface UserWithRelations extends User {
  jobs?: Job[]
  subscription?: Subscription | null
  notifications?: Notification[]
  payments?: Payment[]
}

/**
 * Job with all related data
 */
export interface JobWithRelations extends Job {
  user: Pick<User, 'id' | 'name' | 'email' | 'company'>
  files: JobFile[]
  messages: MessageWithSender[]
  deliverables: Deliverable[]
  statusHistory?: JobStatusHistory[]
}

/**
 * Message with sender info
 */
export interface MessageWithSender extends Message {
  sender: {
    id: string
    name: string
    role: string
  }
}

/**
 * Job status history entry
 */
export interface JobStatusHistory {
  id: string
  jobId: string
  status: string
  note?: string | null
  changedBy: string
  changedAt: Date
}

/**
 * Subscription with user
 */
export interface SubscriptionWithUser extends Subscription {
  user: Pick<User, 'id' | 'name' | 'email' | 'company'>
}

/**
 * Payment with relations
 */
export interface PaymentWithRelations extends Payment {
  user: Pick<User, 'id' | 'name' | 'email'>
  job?: Pick<Job, 'id' | 'jobNumber' | 'title'> | null
}

/**
 * Theme settings grouped by category
 */
export interface GroupedThemeSettings {
  [category: string]: ThemeSetting[]
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  totalRevenue: number
  monthlyRevenue: number
  activeSubscriptions: number
}

/**
 * Customer overview
 */
export interface CustomerOverview {
  user: UserWithRelations
  totalJobs: number
  activeJobs: number
  totalSpent: number
  hasSubscription: boolean
  lastActivity?: Date
}

/**
 * Job summary for lists
 */
export interface JobSummary {
  id: string
  jobNumber: string
  title: string
  status: string
  projectType: string
  package: string
  progress: number
  createdAt: Date
  updatedAt: Date
  user: {
    name: string
    email: string
  }
}

/**
 * Notification with read status
 */
export interface NotificationWithStatus extends Notification {
  isRead: boolean
}

/**
 * File upload metadata
 */
export interface FileMetadata {
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  category: string
  uploadedAt: Date
}

/**
 * Deliverable with download info
 */
export interface DeliverableWithDownload extends Deliverable {
  downloadUrl: string
  canDownload: boolean
}
