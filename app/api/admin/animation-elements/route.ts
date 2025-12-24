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

// Animation properties type
interface AnimationProps {
  size: { min: number; max: number }
  speed: { min: number; max: number }
  rotation: boolean
  rotationSpeed: number
  fade: boolean
  fadeStart: number
  swing: boolean
  swingAmount: number
  density: number
  direction: 'down' | 'up'
}

// Default animation properties (fallback)
const DEFAULT_PROPS: AnimationProps = {
  size: { min: 20, max: 40 },
  speed: { min: 3, max: 8 },
  rotation: true,
  rotationSpeed: 2,
  fade: true,
  fadeStart: 0.8,
  swing: false,
  swingAmount: 20,
  density: 30,
  direction: 'down',
}

// Element-specific default properties based on real-world behavior
const ELEMENT_DEFAULTS: Record<string, AnimationProps> = {
  // === THINGS THAT FLOAT UP ===
  'Balloon': {
    size: { min: 30, max: 50 },
    speed: { min: 2, max: 4 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.2,
    swing: true,
    swingAmount: 30,
    density: 25,
    direction: 'up',
  },
  'Ghost': {
    size: { min: 25, max: 45 },
    speed: { min: 1.5, max: 3 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.3,
    swing: true,
    swingAmount: 40,
    density: 20,
    direction: 'up',
  },
  'Angel': {
    size: { min: 25, max: 40 },
    speed: { min: 1, max: 2.5 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.3,
    swing: true,
    swingAmount: 25,
    density: 15,
    direction: 'up',
  },

  // === THINGS THAT FALL WITH SWING (light, floaty) ===
  'Snowflake': {
    size: { min: 15, max: 30 },
    speed: { min: 1, max: 3 },
    rotation: true,
    rotationSpeed: 1,
    fade: true,
    fadeStart: 0.85,
    swing: true,
    swingAmount: 30,
    density: 40,
    direction: 'down',
  },
  'Autumn Leaf': {
    size: { min: 20, max: 35 },
    speed: { min: 1.5, max: 3.5 },
    rotation: true,
    rotationSpeed: 3,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 50,
    density: 30,
    direction: 'down',
  },
  'Maple Leaf': {
    size: { min: 20, max: 35 },
    speed: { min: 1.5, max: 3.5 },
    rotation: true,
    rotationSpeed: 3,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 50,
    density: 30,
    direction: 'down',
  },
  'Cherry Blossom': {
    size: { min: 15, max: 25 },
    speed: { min: 1, max: 2.5 },
    rotation: true,
    rotationSpeed: 2,
    fade: true,
    fadeStart: 0.85,
    swing: true,
    swingAmount: 40,
    density: 35,
    direction: 'down',
  },
  'Confetti Ball': {
    size: { min: 15, max: 25 },
    speed: { min: 2, max: 5 },
    rotation: true,
    rotationSpeed: 5,
    fade: true,
    fadeStart: 0.75,
    swing: true,
    swingAmount: 20,
    density: 50,
    direction: 'down',
  },
  'Ribbon': {
    size: { min: 18, max: 28 },
    speed: { min: 1.5, max: 3 },
    rotation: true,
    rotationSpeed: 2,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 35,
    density: 25,
    direction: 'down',
  },
  'Clover': {
    size: { min: 15, max: 25 },
    speed: { min: 1.5, max: 3 },
    rotation: true,
    rotationSpeed: 2,
    fade: true,
    fadeStart: 0.85,
    swing: true,
    swingAmount: 30,
    density: 30,
    direction: 'down',
  },
  'Four Leaf Clover': {
    size: { min: 15, max: 25 },
    speed: { min: 1.5, max: 3 },
    rotation: true,
    rotationSpeed: 2,
    fade: true,
    fadeStart: 0.85,
    swing: true,
    swingAmount: 30,
    density: 30,
    direction: 'down',
  },

  // === THINGS THAT FALL STRAIGHT (heavier) ===
  'Rain Drop': {
    size: { min: 10, max: 20 },
    speed: { min: 8, max: 15 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.9,
    swing: false,
    swingAmount: 0,
    density: 60,
    direction: 'down',
  },
  'Gift Box': {
    size: { min: 25, max: 40 },
    speed: { min: 3, max: 6 },
    rotation: true,
    rotationSpeed: 1,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 10,
    density: 20,
    direction: 'down',
  },
  'Candy Cane': {
    size: { min: 20, max: 35 },
    speed: { min: 2.5, max: 5 },
    rotation: true,
    rotationSpeed: 2,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 15,
    density: 25,
    direction: 'down',
  },
  'Easter Egg': {
    size: { min: 20, max: 35 },
    speed: { min: 3, max: 6 },
    rotation: true,
    rotationSpeed: 2,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 10,
    density: 25,
    direction: 'down',
  },
  'Cake': {
    size: { min: 25, max: 40 },
    speed: { min: 2, max: 4 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 0,
    density: 15,
    direction: 'down',
  },
  'Moon Cake': {
    size: { min: 25, max: 40 },
    speed: { min: 2, max: 4 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 0,
    density: 15,
    direction: 'down',
  },
  'Crown': {
    size: { min: 25, max: 40 },
    speed: { min: 2, max: 4 },
    rotation: true,
    rotationSpeed: 1,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 10,
    density: 15,
    direction: 'down',
  },
  'Trophy': {
    size: { min: 25, max: 40 },
    speed: { min: 2, max: 4 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 0,
    density: 15,
    direction: 'down',
  },

  // === HEARTS (float up gently) ===
  'Heart': {
    size: { min: 18, max: 35 },
    speed: { min: 1.5, max: 3 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.3,
    swing: true,
    swingAmount: 20,
    density: 30,
    direction: 'up',
  },
  'Pink Heart': {
    size: { min: 18, max: 35 },
    speed: { min: 1.5, max: 3 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.3,
    swing: true,
    swingAmount: 20,
    density: 30,
    direction: 'up',
  },
  'Sparkling Heart': {
    size: { min: 18, max: 35 },
    speed: { min: 1.5, max: 3 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.3,
    swing: true,
    swingAmount: 20,
    density: 30,
    direction: 'up',
  },

  // === STARS (twinkle, slow fall) ===
  'Star': {
    size: { min: 15, max: 30 },
    speed: { min: 1, max: 2.5 },
    rotation: true,
    rotationSpeed: 1,
    fade: true,
    fadeStart: 0.7,
    swing: true,
    swingAmount: 15,
    density: 35,
    direction: 'down',
  },
  'Glowing Star': {
    size: { min: 15, max: 30 },
    speed: { min: 1, max: 2.5 },
    rotation: true,
    rotationSpeed: 1,
    fade: true,
    fadeStart: 0.7,
    swing: true,
    swingAmount: 15,
    density: 35,
    direction: 'down',
  },
  'Shooting Star': {
    size: { min: 20, max: 35 },
    speed: { min: 8, max: 15 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.5,
    swing: false,
    swingAmount: 0,
    density: 10,
    direction: 'down',
  },

  // === LANTERNS & LIGHTS (float up slowly) ===
  'Lantern': {
    size: { min: 30, max: 45 },
    speed: { min: 1, max: 2 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.2,
    swing: true,
    swingAmount: 15,
    density: 20,
    direction: 'up',
  },
  'Diya': {
    size: { min: 25, max: 35 },
    speed: { min: 0.8, max: 1.5 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.3,
    swing: true,
    swingAmount: 10,
    density: 25,
    direction: 'up',
  },
  'Rangoli': {
    size: { min: 25, max: 40 },
    speed: { min: 1, max: 2 },
    rotation: true,
    rotationSpeed: 0.5,
    fade: true,
    fadeStart: 0.3,
    swing: true,
    swingAmount: 15,
    density: 20,
    direction: 'up',
  },

  // === FIREWORKS (burst up then fall) ===
  'Sparkler': {
    size: { min: 20, max: 35 },
    speed: { min: 4, max: 8 },
    rotation: true,
    rotationSpeed: 4,
    fade: true,
    fadeStart: 0.6,
    swing: false,
    swingAmount: 10,
    density: 30,
    direction: 'up',
  },
  'Firework': {
    size: { min: 25, max: 45 },
    speed: { min: 5, max: 10 },
    rotation: true,
    rotationSpeed: 3,
    fade: true,
    fadeStart: 0.5,
    swing: false,
    swingAmount: 0,
    density: 25,
    direction: 'up',
  },
  'Firecracker': {
    size: { min: 20, max: 35 },
    speed: { min: 6, max: 12 },
    rotation: true,
    rotationSpeed: 5,
    fade: true,
    fadeStart: 0.5,
    swing: false,
    swingAmount: 0,
    density: 30,
    direction: 'up',
  },

  // === PARTY ITEMS ===
  'Party Popper': {
    size: { min: 25, max: 40 },
    speed: { min: 3, max: 6 },
    rotation: true,
    rotationSpeed: 4,
    fade: true,
    fadeStart: 0.7,
    swing: true,
    swingAmount: 25,
    density: 30,
    direction: 'down',
  },
  'Champagne': {
    size: { min: 25, max: 40 },
    speed: { min: 2, max: 4 },
    rotation: true,
    rotationSpeed: 1,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 10,
    density: 15,
    direction: 'down',
  },
  'Wine Glass': {
    size: { min: 25, max: 40 },
    speed: { min: 2, max: 4 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 5,
    density: 15,
    direction: 'down',
  },

  // === FLOWERS (gentle fall) ===
  'Tulip': {
    size: { min: 20, max: 35 },
    speed: { min: 1.5, max: 3 },
    rotation: true,
    rotationSpeed: 1.5,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 25,
    density: 25,
    direction: 'down',
  },
  'Rose': {
    size: { min: 20, max: 35 },
    speed: { min: 1.5, max: 3 },
    rotation: true,
    rotationSpeed: 1.5,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 25,
    density: 25,
    direction: 'down',
  },
  'Sunflower': {
    size: { min: 25, max: 40 },
    speed: { min: 2, max: 4 },
    rotation: true,
    rotationSpeed: 1,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 20,
    density: 20,
    direction: 'down',
  },
  'Bouquet': {
    size: { min: 30, max: 45 },
    speed: { min: 2, max: 4 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 15,
    density: 15,
    direction: 'down',
  },

  // === FLYING CREATURES ===
  'Bat': {
    size: { min: 25, max: 40 },
    speed: { min: 3, max: 6 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.3,
    swing: true,
    swingAmount: 50,
    density: 20,
    direction: 'up',
  },
  'Bunny': {
    size: { min: 25, max: 40 },
    speed: { min: 2, max: 4 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 20,
    density: 20,
    direction: 'down',
  },
  'Spider': {
    size: { min: 20, max: 35 },
    speed: { min: 2, max: 4 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 10,
    density: 20,
    direction: 'down',
  },
  'Turkey': {
    size: { min: 30, max: 45 },
    speed: { min: 2, max: 4 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 15,
    density: 15,
    direction: 'down',
  },

  // === STATIONARY-ISH (slow, minimal movement) ===
  'Sun': {
    size: { min: 35, max: 55 },
    speed: { min: 0.5, max: 1.5 },
    rotation: true,
    rotationSpeed: 0.3,
    fade: true,
    fadeStart: 0.5,
    swing: false,
    swingAmount: 5,
    density: 8,
    direction: 'down',
  },
  'Cloud': {
    size: { min: 40, max: 60 },
    speed: { min: 0.5, max: 1.5 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.7,
    swing: false,
    swingAmount: 5,
    density: 10,
    direction: 'down',
  },
  'Crescent Moon': {
    size: { min: 30, max: 50 },
    speed: { min: 0.5, max: 1.5 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.5,
    swing: false,
    swingAmount: 5,
    density: 8,
    direction: 'down',
  },

  // === RELIGIOUS SYMBOLS (gentle, respectful) ===
  'Christmas Tree': {
    size: { min: 30, max: 50 },
    speed: { min: 1.5, max: 3 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 10,
    density: 15,
    direction: 'down',
  },
  'Star of David': {
    size: { min: 20, max: 35 },
    speed: { min: 1, max: 2.5 },
    rotation: true,
    rotationSpeed: 0.5,
    fade: true,
    fadeStart: 0.7,
    swing: true,
    swingAmount: 15,
    density: 20,
    direction: 'down',
  },
  'Menorah': {
    size: { min: 30, max: 45 },
    speed: { min: 1, max: 2 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 5,
    density: 12,
    direction: 'down',
  },
  'Om': {
    size: { min: 25, max: 40 },
    speed: { min: 1, max: 2 },
    rotation: true,
    rotationSpeed: 0.3,
    fade: true,
    fadeStart: 0.6,
    swing: true,
    swingAmount: 10,
    density: 15,
    direction: 'up',
  },
  'Cross': {
    size: { min: 25, max: 40 },
    speed: { min: 1, max: 2 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.7,
    swing: false,
    swingAmount: 5,
    density: 15,
    direction: 'down',
  },
  'Church': {
    size: { min: 35, max: 50 },
    speed: { min: 1, max: 2 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 0,
    density: 10,
    direction: 'down',
  },
  'Mosque': {
    size: { min: 35, max: 50 },
    speed: { min: 1, max: 2 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 0,
    density: 10,
    direction: 'down',
  },
  'Praying Hands': {
    size: { min: 25, max: 40 },
    speed: { min: 0.8, max: 1.5 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.5,
    swing: false,
    swingAmount: 5,
    density: 15,
    direction: 'up',
  },
  'Bell': {
    size: { min: 20, max: 35 },
    speed: { min: 2, max: 4 },
    rotation: true,
    rotationSpeed: 3,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 30,
    density: 25,
    direction: 'down',
  },

  // === HALLOWEEN (spooky vibes) ===
  'Pumpkin': {
    size: { min: 25, max: 45 },
    speed: { min: 2, max: 4 },
    rotation: true,
    rotationSpeed: 1,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 15,
    density: 20,
    direction: 'down',
  },
  'Skull': {
    size: { min: 25, max: 40 },
    speed: { min: 2, max: 4 },
    rotation: true,
    rotationSpeed: 1.5,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 20,
    density: 20,
    direction: 'down',
  },

  // === CHRISTMAS ===
  'Snowman': {
    size: { min: 30, max: 50 },
    speed: { min: 1.5, max: 3 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 10,
    density: 15,
    direction: 'down',
  },
  'Santa': {
    size: { min: 30, max: 50 },
    speed: { min: 1.5, max: 3 },
    rotation: false,
    rotationSpeed: 0,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 15,
    density: 15,
    direction: 'down',
  },
  'Red Envelope': {
    size: { min: 25, max: 40 },
    speed: { min: 2, max: 4 },
    rotation: true,
    rotationSpeed: 2,
    fade: true,
    fadeStart: 0.8,
    swing: true,
    swingAmount: 30,
    density: 25,
    direction: 'down',
  },
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

    // Prepare built-in elements with element-specific default props
    const builtInElements = BUILT_IN_ELEMENTS.map((e, i) => ({
      id: `builtin-${i}`,
      ...e,
      defaultProps: ELEMENT_DEFAULTS[e.name] || DEFAULT_PROPS,
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
