// app/dashboard/messages/page.tsx
// Customer messages page - view all messages across jobs

import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function MessagesPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Get all messages for the user's jobs
  const messages = await prisma.message.findMany({
    where: {
      job: {
        userId: user.id,
      },
      isInternal: false, // Only show non-internal messages to customers
    },
    include: {
      job: {
        select: { title: true, jobNumber: true, id: true },
      },
      sender: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Count unread messages (messages not sent by the user that haven't been read)
  const unreadCount = messages.filter(
    (m) => m.senderId !== user.id && m.status !== 'READ'
  ).length

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text">Messages</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-accent text-white text-sm rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        <p className="text-text-light mt-1">
          View all messages from your projects
        </p>
      </div>

      {/* Messages List */}
      <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-text mb-2">
              No messages yet
            </h3>
            <p className="text-text-light mb-6">
              Messages from your projects will appear here
            </p>
            <Link
              href="/dashboard"
              className="btn btn-primary inline-flex"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((message) => {
              const isOwn = message.senderId === user.id
              const isUnread = !isOwn && message.status !== 'READ'

              return (
                <div
                  key={message.id}
                  className={`p-5 hover:bg-dark-elevated transition-colors ${
                    isUnread ? 'bg-accent/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-walnut/20 rounded-full flex items-center justify-center text-sm font-semibold text-walnut">
                      {message.sender.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-text">
                          {isOwn ? 'You' : message.sender.name}
                        </p>
                        {!isOwn && message.sender.role !== 'CUSTOMER' && (
                          <span className="text-xs bg-walnut/20 text-walnut px-2 py-0.5 rounded-full">
                            {message.sender.role === 'ADMIN' ? 'Admin' : 'Designer'}
                          </span>
                        )}
                        {isUnread && (
                          <span className="w-2 h-2 bg-accent rounded-full"></span>
                        )}
                        <span className="text-xs text-text-muted">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-text-light">{message.content}</p>
                      <Link
                        href={`/jobs/${message.job.id}`}
                        className="text-xs text-walnut hover:text-accent mt-2 inline-block"
                      >
                        {message.job.title} ({message.job.jobNumber}) →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
