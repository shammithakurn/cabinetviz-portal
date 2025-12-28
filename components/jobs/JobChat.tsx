// components/jobs/JobChat.tsx
// Real-time chat component for job communication

'use client'

import { useState, useEffect, useRef } from 'react'
import { useMessages, Message } from '@/lib/hooks/useMessages'
import { formatDistanceToNow } from 'date-fns'

interface CurrentUser {
  id: string
  name: string
  role: string
}

interface JobChatProps {
  jobId: string
  currentUser: CurrentUser
  showInternalToggle?: boolean // Only for admins/designers
}

export function JobChat({ jobId, currentUser, showInternalToggle = false }: JobChatProps) {
  const {
    messages,
    unreadCount,
    isLoading,
    error,
    sendMessage,
    isSending,
    markAsRead,
  } = useMessages(jobId)

  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark messages as read when viewing chat
  useEffect(() => {
    if (unreadCount > 0) {
      markAsRead()
    }
  }, [unreadCount, markAsRead])

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return

    const content = newMessage.trim()
    setNewMessage('')

    await sendMessage(content, showInternalToggle ? isInternal : false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Get role badge styles
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'DESIGNER':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  // Get status icon
  const getStatusIcon = (message: Message, isOwn: boolean) => {
    if (!isOwn) return null

    switch (message.status) {
      case 'SENT':
        return (
          <span className="text-gray-400 ml-1" title="Sending">
            ✓
          </span>
        )
      case 'DELIVERED':
        return (
          <span className="text-gray-400 ml-1" title="Delivered">
            ✓✓
          </span>
        )
      case 'READ':
        return (
          <span className="text-accent ml-1" title="Read">
            ✓✓
          </span>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💬</span>
          <h3 className="font-semibold">Messages</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💬</span>
          <h3 className="font-semibold">Messages</h3>
        </div>
        <div className="text-center py-8 text-red-500">
          <p>Failed to load messages</p>
          <p className="text-sm text-muted">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden flex flex-col" style={{ height: '500px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className="font-semibold">Messages</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-accent text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {showInternalToggle && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-muted">Internal note</span>
          </label>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/20">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUser.id
            const isInternalMessage = message.isInternal

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] ${
                    isOwn
                      ? 'bg-accent text-white'
                      : isInternalMessage
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700'
                      : 'bg-white dark:bg-gray-800 border border-border'
                  } rounded-lg p-3 shadow-sm`}
                >
                  {/* Sender info */}
                  {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.sender.name}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${getRoleBadge(
                          message.sender.role
                        )}`}
                      >
                        {message.sender.role}
                      </span>
                      {isInternalMessage && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                          Internal
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message content */}
                  <p className={`${isOwn ? 'text-white' : ''} whitespace-pre-wrap break-words`}>
                    {message.content}
                  </p>

                  {/* Timestamp and status */}
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                      isOwn ? 'text-white/70' : 'text-muted'
                    }`}
                  >
                    <span>
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {getStatusIcon(message, isOwn)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border bg-background">
        {isInternal && showInternalToggle && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-1">
            <span>⚠️</span>
            <span>This message will only be visible to staff members</span>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isInternal ? 'Type an internal note...' : 'Type a message...'
            }
            disabled={isSending}
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
