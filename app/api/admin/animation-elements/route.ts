// app/api/admin/animation-elements/route.ts
// API endpoint for animation elements library

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Built-in animation elements
const BUILT_IN_ELEMENTS = [
  // Festive Category
  { name: 'Lantern', category: 'FESTIVE', emoji: '🏮', description: 'Red paper lantern', tags: 'chinese,new year,festival' },
  { name: 'Diya', category: 'FESTIVE', emoji: '🪔', description: 'Oil lamp for Diwali', tags: 'diwali,indian,light' },
  { name: 'Firecracker', category: 'FESTIVE', emoji: '🧨', description: 'Celebration firecracker', tags: 'celebration,new year,festival' },
  { name: 'Sparkler', category: 'FESTIVE', emoji: '🎇', description: 'Sparkling firework', tags: 'celebration,light,night' },
  { name: 'Firework', category: 'FESTIVE', emoji: '🎆', description: 'Night sky firework', tags: 'celebration,new year,festival' },
  { name: 'Party Popper', category: 'FESTIVE', emoji: '🎉', description: 'Celebration popper', tags: 'party,celebration,birthday' },
  { name: 'Confetti Ball', category: 'FESTIVE', emoji: '🎊', description: 'Colorful confetti ball', tags: 'party,celebration,fun' },
  { name: 'Balloon', category: 'FESTIVE', emoji: '🎈', description: 'Party balloon', tags: 'party,birthday,celebration' },
  { name: 'Gift Box', category: 'FESTIVE', emoji: '🎁', description: 'Wrapped present', tags: 'christmas,birthday,gift' },
  { name: 'Red Envelope', category: 'FESTIVE', emoji: '🧧', description: 'Lucky red envelope', tags: 'chinese,new year,lucky' },

  // Nature Category
  { name: 'Snowflake', category: 'NATURE', emoji: '❄️', description: 'Winter snowflake', tags: 'winter,christmas,cold' },
  { name: 'Autumn Leaf', category: 'NATURE', emoji: '🍂', description: 'Fall autumn leaf', tags: 'autumn,fall,thanksgiving' },
  { name: 'Maple Leaf', category: 'NATURE', emoji: '🍁', description: 'Red maple leaf', tags: 'autumn,canada,fall' },
  { name: 'Cherry Blossom', category: 'NATURE', emoji: '🌸', description: 'Pink sakura flower', tags: 'spring,japan,flower' },
  { name: 'Tulip', category: 'NATURE', emoji: '🌷', description: 'Spring tulip', tags: 'spring,flower,easter' },
  { name: 'Sunflower', category: 'NATURE', emoji: '🌻', description: 'Bright sunflower', tags: 'summer,flower,happy' },
  { name: 'Rose', category: 'NATURE', emoji: '🌹', description: 'Red rose', tags: 'valentine,love,romance' },
  { name: 'Bouquet', category: 'NATURE', emoji: '💐', description: 'Flower bouquet', tags: 'mother,flower,gift' },
  { name: 'Sun', category: 'NATURE', emoji: '☀️', description: 'Bright sun', tags: 'summer,warm,happy' },
  { name: 'Cloud', category: 'NATURE', emoji: '☁️', description: 'White cloud', tags: 'sky,weather,soft' },
  { name: 'Rain Drop', category: 'NATURE', emoji: '💧', description: 'Water droplet', tags: 'rain,water,monsoon' },

  // Celebration Category
  { name: 'Heart', category: 'CELEBRATION', emoji: '❤️', description: 'Red love heart', tags: 'valentine,love,romance' },
  { name: 'Pink Heart', category: 'CELEBRATION', emoji: '💕', description: 'Two pink hearts', tags: 'valentine,love,cute' },
  { name: 'Sparkling Heart', category: 'CELEBRATION', emoji: '💖', description: 'Sparkling heart', tags: 'valentine,love,special' },
  { name: 'Star', category: 'CELEBRATION', emoji: '⭐', description: 'Golden star', tags: 'night,wish,gold' },
  { name: 'Glowing Star', category: 'CELEBRATION', emoji: '🌟', description: 'Glowing bright star', tags: 'night,christmas,bright' },
  { name: 'Crescent Moon', category: 'CELEBRATION', emoji: '🌙', description: 'Night moon', tags: 'night,eid,ramadan' },
  { name: 'Shooting Star', category: 'CELEBRATION', emoji: '🌠', description: 'Shooting star', tags: 'wish,night,magic' },
  { name: 'Ribbon', category: 'CELEBRATION', emoji: '🎀', description: 'Pink ribbon', tags: 'gift,decoration,cute' },
  { name: 'Crown', category: 'CELEBRATION', emoji: '👑', description: 'Royal crown', tags: 'king,queen,royal' },
  { name: 'Trophy', category: 'CELEBRATION', emoji: '🏆', description: 'Winner trophy', tags: 'win,success,achievement' },

  // Religious Category
  { name: 'Christmas Tree', category: 'RELIGIOUS', emoji: '🎄', description: 'Decorated tree', tags: 'christmas,holiday,winter' },
  { name: 'Star of David', category: 'RELIGIOUS', emoji: '✡️', description: 'Jewish star', tags: 'hanukkah,jewish,religious' },
  { name: 'Menorah', category: 'RELIGIOUS', emoji: '🕎', description: 'Hanukkah menorah', tags: 'hanukkah,jewish,light' },
  { name: 'Om', category: 'RELIGIOUS', emoji: '🕉️', description: 'Hindu Om symbol', tags: 'hindu,indian,spiritual' },
  { name: 'Cross', category: 'RELIGIOUS', emoji: '✝️', description: 'Christian cross', tags: 'christian,easter,religious' },
  { name: 'Church', category: 'RELIGIOUS', emoji: '⛪', description: 'Church building', tags: 'christian,wedding,religious' },
  { name: 'Mosque', category: 'RELIGIOUS', emoji: '🕌', description: 'Mosque building', tags: 'islamic,eid,ramadan' },
  { name: 'Praying Hands', category: 'RELIGIOUS', emoji: '🙏', description: 'Prayer hands', tags: 'prayer,thanks,spiritual' },
  { name: 'Angel', category: 'RELIGIOUS', emoji: '👼', description: 'Baby angel', tags: 'christmas,christian,cute' },
  { name: 'Bell', category: 'RELIGIOUS', emoji: '🔔', description: 'Ringing bell', tags: 'christmas,church,notification' },

  // Seasonal Category
  { name: 'Pumpkin', category: 'SEASONAL', emoji: '🎃', description: 'Halloween pumpkin', tags: 'halloween,october,spooky' },
  { name: 'Ghost', category: 'SEASONAL', emoji: '👻', description: 'Cute ghost', tags: 'halloween,spooky,fun' },
  { name: 'Skull', category: 'SEASONAL', emoji: '💀', description: 'Day of dead skull', tags: 'halloween,dia de muertos,spooky' },
  { name: 'Spider', category: 'SEASONAL', emoji: '🕷️', description: 'Creepy spider', tags: 'halloween,spooky,scary' },
  { name: 'Bat', category: 'SEASONAL', emoji: '🦇', description: 'Night bat', tags: 'halloween,night,spooky' },
  { name: 'Easter Egg', category: 'SEASONAL', emoji: '🥚', description: 'Decorated egg', tags: 'easter,spring,egg hunt' },
  { name: 'Bunny', category: 'SEASONAL', emoji: '🐰', description: 'Easter bunny', tags: 'easter,spring,cute' },
  { name: 'Turkey', category: 'SEASONAL', emoji: '🦃', description: 'Thanksgiving turkey', tags: 'thanksgiving,november,feast' },
  { name: 'Clover', category: 'SEASONAL', emoji: '☘️', description: 'Three leaf clover', tags: 'st patrick,irish,lucky' },
  { name: 'Four Leaf Clover', category: 'SEASONAL', emoji: '🍀', description: 'Lucky four leaf clover', tags: 'st patrick,irish,luck' },
  { name: 'Candy Cane', category: 'SEASONAL', emoji: '🍬', description: 'Christmas candy', tags: 'christmas,sweet,winter' },
  { name: 'Snowman', category: 'SEASONAL', emoji: '⛄', description: 'Winter snowman', tags: 'winter,christmas,cold' },
  { name: 'Santa', category: 'SEASONAL', emoji: '🎅', description: 'Santa Claus', tags: 'christmas,gift,winter' },

  // Food & Objects
  { name: 'Cake', category: 'CELEBRATION', emoji: '🎂', description: 'Birthday cake', tags: 'birthday,celebration,sweet' },
  { name: 'Champagne', category: 'CELEBRATION', emoji: '🍾', description: 'Celebration bottle', tags: 'new year,celebration,party' },
  { name: 'Wine Glass', category: 'CELEBRATION', emoji: '🥂', description: 'Toasting glasses', tags: 'celebration,cheers,party' },
  { name: 'Moon Cake', category: 'FESTIVE', emoji: '🥮', description: 'Mid-Autumn cake', tags: 'chinese,mid-autumn,festival' },
  { name: 'Rangoli', category: 'FESTIVE', emoji: '🪷', description: 'Lotus flower', tags: 'diwali,indian,decoration' },
]

// Default animation properties
const DEFAULT_PROPS = {
  size: { min: 20, max: 40 },
  speed: { min: 3, max: 8 },
  rotation: true,
  rotationSpeed: 2,
  fade: true,
  fadeStart: 0.8,
  swing: false,
  swingAmount: 20,
  density: 30,
}

// GET - Fetch all animation elements
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get custom elements from database
    const customElements = await prisma.animationElement.findMany({
      orderBy: { name: 'asc' },
    })

    // Parse custom elements
    const parsedCustom = customElements.map(e => ({
      ...e,
      defaultProps: JSON.parse(e.defaultProps),
      tags: e.tags?.split(',').map(t => t.trim()) || [],
      isBuiltIn: e.isBuiltIn,
    }))

    // Prepare built-in elements with default props
    const builtInElements = BUILT_IN_ELEMENTS.map((e, i) => ({
      id: `builtin-${i}`,
      ...e,
      defaultProps: DEFAULT_PROPS,
      tags: e.tags.split(','),
      isBuiltIn: true,
    }))

    return NextResponse.json({
      success: true,
      elements: [...builtInElements, ...parsedCustom],
      categories: ['FESTIVE', 'NATURE', 'CELEBRATION', 'RELIGIOUS', 'SEASONAL', 'CUSTOM'],
    })
  } catch (error) {
    console.error('Animation elements fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch animation elements' },
      { status: 500 }
    )
  }
}

// POST - Create a custom animation element
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, emoji, svgPath, imageUrl, defaultProps, description, tags } = body

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category required' }, { status: 400 })
    }

    const element = await prisma.animationElement.create({
      data: {
        name,
        category: category || 'CUSTOM',
        emoji,
        svgPath,
        imageUrl,
        defaultProps: JSON.stringify(defaultProps || DEFAULT_PROPS),
        description,
        tags: Array.isArray(tags) ? tags.join(',') : tags,
        isBuiltIn: false,
      },
    })

    return NextResponse.json({
      success: true,
      element: {
        ...element,
        defaultProps: JSON.parse(element.defaultProps),
        tags: element.tags?.split(',') || [],
      },
    })
  } catch (error) {
    console.error('Animation element create error:', error)
    return NextResponse.json(
      { error: 'Failed to create animation element' },
      { status: 500 }
    )
  }
}
