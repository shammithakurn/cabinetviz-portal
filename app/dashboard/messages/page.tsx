// app/dashboard/messages/page.tsx
// Customer messages page - view all comments/messages across jobs

import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function MessagesPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Get all comments for the user's jobs
  // Note: Comment model stores authorName and authorRole directly, not a user relation
  const comments = await prisma.comment.findMany({
    where: {
      job: {
        userId: user.id,
      },
      isInternal: false, // Only show non-internal comments to customers
    },
    include: {
      job: {
        select: { title: true, jobNumber: true, id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Messages</h1>
        <p className="text-text-light mt-1">
          View all comments and messages from your projects
        </p>
      </div>

      {/* Messages List */}
      <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
        {comments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-text mb-2">
              No messages yet
            </h3>
            <p className="text-text-light mb-6">
              Comments and messages from your projects will appear here
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
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-5 hover:bg-dark-elevated transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-walnut/20 rounded-full flex items-center justify-center text-sm font-semibold text-walnut">
                    {comment.authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-text">{comment.authorName}</p>
                      {comment.authorRole !== 'CUSTOMER' && (
                        <span className="text-xs bg-walnut/20 text-walnut px-2 py-0.5 rounded-full">
                          {comment.authorRole === 'ADMIN' ? 'Admin' : 'Designer'}
                        </span>
                      )}
                      <span className="text-xs text-text-muted">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-text-light">{comment.content}</p>
                    <Link
                      href={`/jobs/${comment.job.id}`}
                      className="text-xs text-walnut hover:text-accent mt-2 inline-block"
                    >
                      {comment.job.title} ({comment.job.jobNumber}) →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
