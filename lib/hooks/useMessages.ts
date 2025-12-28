// lib/hooks/useMessages.ts
// Custom hook for real-time message polling

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface MessageSender {
  id: string
  name: string
  role: string
}

export interface Message {
  id: string
  content: string
  senderId: string
  sender: MessageSender
  jobId: string
  status: 'SENT' | 'DELIVERED' | 'READ'
  readAt: string | null
  isInternal: boolean
  createdAt: string
  updatedAt: string
}

interface UseMessagesOptions {
  pollingInterval?: number // in milliseconds
  enabled?: boolean
}

interface UseMessagesReturn {
  messages: Message[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  sendMessage: (content: string, isInternal?: boolean) => Promise<Message | null>
  isSending: boolean
  markAsRead: () => Promise<void>
  refresh: () => Promise<void>
}

export function useMessages(
  jobId: string,
  options: UseMessagesOptions = {}
): UseMessagesReturn {
  const { pollingInterval = 3000, enabled = true } = options

  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  // Track if component is mounted
  const isMountedRef = useRef(true)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    if (!jobId || !enabled) return

    try {
      const response = await fetch(`/api/jobs/${jobId}/messages`)

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()

      if (isMountedRef.current) {
        setMessages(data.messages || [])
        setUnreadCount(data.unreadCount || 0)
        setError(null)
        setIsLoading(false)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch messages')
        setIsLoading(false)
      }
    }
  }, [jobId, enabled])

  // Send a new message
  const sendMessage = useCallback(
    async (content: string, isInternal = false): Promise<Message | null> => {
      if (!jobId || !content.trim()) return null

      setIsSending(true)

      // Optimistic update - add message with SENT status
      const optimisticId = `optimistic-${Date.now()}`
      const optimisticMessage: Message = {
        id: optimisticId,
        content: content.trim(),
        senderId: '', // Will be filled by response
        sender: { id: '', name: 'You', role: '' },
        jobId,
        status: 'SENT',
        readAt: null,
        isInternal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, optimisticMessage])

      try {
        const response = await fetch(`/api/jobs/${jobId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, isInternal }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const data = await response.json()
        const newMessage: Message = data.message

        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((msg) => (msg.id === optimisticId ? newMessage : msg))
        )

        setIsSending(false)
        return newMessage
      } catch (err) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId))
        setError(err instanceof Error ? err.message : 'Failed to send message')
        setIsSending(false)
        return null
      }
    },
    [jobId]
  )

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!jobId || unreadCount === 0) return

    try {
      await fetch(`/api/jobs/${jobId}/messages/read`, {
        method: 'POST',
      })

      // Update local state
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          status: 'READ' as const,
          readAt: msg.readAt || new Date().toISOString(),
        }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark messages as read:', err)
    }
  }, [jobId, unreadCount])

  // Manual refresh
  const refresh = useCallback(async () => {
    await fetchMessages()
  }, [fetchMessages])

  // Initial fetch and polling setup
  useEffect(() => {
    isMountedRef.current = true

    if (enabled && jobId) {
      // Initial fetch
      fetchMessages()

      // Set up polling
      pollingRef.current = setInterval(fetchMessages, pollingInterval)
    }

    return () => {
      isMountedRef.current = false
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [jobId, pollingInterval, enabled, fetchMessages])

  return {
    messages,
    unreadCount,
    isLoading,
    error,
    sendMessage,
    isSending,
    markAsRead,
    refresh,
  }
}
