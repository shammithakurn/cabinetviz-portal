// lib/claude-festival.ts
// Claude API integration for dynamic, personalized festival greetings

import Anthropic from '@anthropic-ai/sdk'
import type { Festival } from './festivals'

// Simple in-memory cache for greetings
const greetingCache = new Map<string, { greeting: string; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Generate a personalized, business-appropriate festival greeting using Claude
 */
export async function generateFestivalGreeting(
  festival: Festival,
  countryCode?: string
): Promise<string> {
  const cacheKey = `${festival.id}-${countryCode || 'global'}`

  // Check cache first
  const cached = greetingCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.greeting
  }

  // Check if API key is available
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return festival.greeting // Fallback to default greeting
  }

  try {
    const client = new Anthropic({
      apiKey,
    })

    const prompt = `Generate a warm, professional festival greeting for a cabinet visualization business website.

Festival: ${festival.displayName}
Default greeting: ${festival.greeting}
${countryCode ? `User's country: ${countryCode}` : ''}

Requirements:
- Keep it short (1-2 sentences max)
- Make it warm and welcoming
- Subtly relate to the business (cabinets, kitchens, home design) if possible
- Be culturally respectful and appropriate
- Do not use excessive exclamation marks
- Do not include hashtags or emojis

Just respond with the greeting text, nothing else.`

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract text from response
    const greeting =
      message.content[0].type === 'text' ? message.content[0].text.trim() : festival.greeting

    // Cache the result
    greetingCache.set(cacheKey, {
      greeting,
      timestamp: Date.now(),
    })

    return greeting
  } catch (error) {
    console.error('Failed to generate Claude greeting:', error)
    return festival.greeting // Fallback to default
  }
}

/**
 * Clear greeting cache (useful for testing)
 */
export function clearGreetingCache(): void {
  greetingCache.clear()
}

/**
 * Get cached greeting if available
 */
export function getCachedGreeting(festivalId: string, countryCode?: string): string | null {
  const cacheKey = `${festivalId}-${countryCode || 'global'}`
  const cached = greetingCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.greeting
  }
  return null
}
