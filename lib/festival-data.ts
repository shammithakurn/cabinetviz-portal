// lib/festival-data.ts
// Comprehensive festival database with country-specific targeting

import {
  calculateEasterDate,
  calculateChineseNewYear,
  calculateLanternFestival,
  calculateDiwaliDate,
  calculateHoliDate,
  calculateEidAlFitr,
  calculateEidAlAdha,
  calculateHanukkahStart,
  calculatePassoverStart,
  calculateMothersDayUS,
  calculateFathersDayUS,
  calculateThanksgivingUS,
  calculateMidAutumnFestival,
} from './festival-dates'

export type AnimationType =
  | 'snowfall'
  | 'fireworks'
  | 'confetti'
  | 'hearts'
  | 'diyas'
  | 'leaves'
  | 'lanterns'
  | 'stars'
  | 'halloween'
  | 'newyear'
  | 'valentine'
  | 'easter'
  | 'holi'
  | 'chinesenewyear'
  | 'eid'
  | 'hanukkah'
  | 'patriotic'
  | 'midautumn'
  | 'thanksgiving'
  | 'stpatricks'
  | 'diadelosmuertos'
  | 'mothersday'
  | 'earthday'
  | 'custom'

export type AnimationIntensity = 'low' | 'medium' | 'high'

export interface Festival {
  id: string
  name: string
  displayName: string

  // Date configuration - either fixed or calculated
  month?: number // 1-12 for fixed dates
  day?: number // 1-31 for fixed dates
  duration: number // days the festival runs
  calculateDate?: (year: number) => Date // For moveable festivals

  // Visual theme
  colors: {
    primary: string
    secondary: string
    accent: string
  }

  // Animation
  animation: AnimationType
  intensity: AnimationIntensity

  // Greeting
  greeting: string
  icon: string

  // Country targeting
  countries: string[] // ISO country codes or 'GLOBAL'
  priority: number // Higher = shown first when multiple festivals active (1-100)
}

// ============================================
// GLOBAL FESTIVALS (shown everywhere)
// ============================================

const globalFestivals: Festival[] = [
  {
    id: 'new-year',
    name: 'new-year',
    displayName: 'New Year',
    month: 1,
    day: 1,
    duration: 2,
    colors: {
      primary: '#FFD700',
      secondary: '#C0C0C0',
      accent: '#1a1a2e',
    },
    animation: 'newyear',
    intensity: 'high',
    greeting: 'Happy New Year!',
    icon: '🎆',
    countries: ['GLOBAL'],
    priority: 100,
  },
  {
    id: 'valentines-day',
    name: 'valentines-day',
    displayName: "Valentine's Day",
    month: 2,
    day: 14,
    duration: 1,
    colors: {
      primary: '#FF1493',
      secondary: '#FFB6C1',
      accent: '#DC143C',
    },
    animation: 'valentine',
    intensity: 'medium',
    greeting: "Happy Valentine's Day!",
    icon: '❤️',
    countries: ['GLOBAL'],
    priority: 80,
  },
  {
    id: 'earth-day',
    name: 'earth-day',
    displayName: 'Earth Day',
    month: 4,
    day: 22,
    duration: 1,
    colors: {
      primary: '#228B22',
      secondary: '#90EE90',
      accent: '#006400',
    },
    animation: 'earthday',
    intensity: 'medium',
    greeting: 'Happy Earth Day!',
    icon: '🌍',
    countries: ['GLOBAL'],
    priority: 50,
  },
]

// ============================================
// CHRISTMAS & WINTER HOLIDAYS
// ============================================

const christmasFestivals: Festival[] = [
  {
    id: 'christmas',
    name: 'christmas',
    displayName: 'Christmas',
    month: 12,
    day: 25,
    duration: 1,
    colors: {
      primary: '#C41E3A',
      secondary: '#228B22',
      accent: '#FFD700',
    },
    animation: 'snowfall',
    intensity: 'high',
    greeting: 'Merry Christmas!',
    icon: '🎄',
    countries: [
      'GLOBAL',
      'US',
      'UK',
      'CA',
      'AU',
      'NZ',
      'DE',
      'FR',
      'IT',
      'ES',
      'PT',
      'NL',
      'BE',
      'BR',
      'MX',
      'AR',
      'PH',
      'ZA',
    ],
    priority: 95,
  },
  {
    id: 'christmas-eve',
    name: 'christmas-eve',
    displayName: 'Christmas Eve',
    month: 12,
    day: 24,
    duration: 1,
    colors: {
      primary: '#C41E3A',
      secondary: '#228B22',
      accent: '#FFD700',
    },
    animation: 'snowfall',
    intensity: 'medium',
    greeting: 'Merry Christmas Eve!',
    icon: '🎄',
    countries: ['US', 'UK', 'CA', 'AU', 'NZ', 'DE', 'FR', 'IT', 'ES'],
    priority: 90,
  },
  {
    id: 'boxing-day',
    name: 'boxing-day',
    displayName: 'Boxing Day',
    month: 12,
    day: 26,
    duration: 1,
    colors: {
      primary: '#C41E3A',
      secondary: '#228B22',
      accent: '#FFD700',
    },
    animation: 'snowfall',
    intensity: 'low',
    greeting: 'Happy Boxing Day!',
    icon: '🎁',
    countries: ['UK', 'CA', 'AU', 'NZ', 'ZA', 'NG', 'KE'],
    priority: 70,
  },
]

// ============================================
// EASTER & SPRING HOLIDAYS
// ============================================

const easterFestivals: Festival[] = [
  {
    id: 'easter',
    name: 'easter',
    displayName: 'Easter',
    duration: 2,
    calculateDate: calculateEasterDate,
    colors: {
      primary: '#FFB6C1',
      secondary: '#98FB98',
      accent: '#DDA0DD',
    },
    animation: 'easter',
    intensity: 'medium',
    greeting: 'Happy Easter!',
    icon: '🐰',
    countries: [
      'US',
      'UK',
      'CA',
      'AU',
      'NZ',
      'DE',
      'FR',
      'IT',
      'ES',
      'PT',
      'NL',
      'BE',
      'BR',
      'MX',
      'AR',
      'PH',
    ],
    priority: 85,
  },
]

// ============================================
// HINDU FESTIVALS
// ============================================

const hinduFestivals: Festival[] = [
  {
    id: 'diwali',
    name: 'diwali',
    displayName: 'Diwali',
    duration: 5,
    calculateDate: calculateDiwaliDate,
    colors: {
      primary: '#FF8C00',
      secondary: '#FFD700',
      accent: '#8B008B',
    },
    animation: 'diyas',
    intensity: 'high',
    greeting: 'Happy Diwali!',
    icon: '🪔',
    countries: ['IN', 'NP', 'BD', 'SG', 'MY', 'FJ', 'GY', 'SR', 'TT', 'ZA', 'KE', 'MU'],
    priority: 95,
  },
  {
    id: 'holi',
    name: 'holi',
    displayName: 'Holi',
    duration: 2,
    calculateDate: calculateHoliDate,
    colors: {
      primary: '#FF1493',
      secondary: '#00FF00',
      accent: '#FFD700',
    },
    animation: 'holi',
    intensity: 'high',
    greeting: 'Happy Holi!',
    icon: '🎨',
    countries: ['IN', 'NP', 'BD', 'FJ', 'GY', 'SR', 'TT'],
    priority: 90,
  },
  {
    id: 'raksha-bandhan',
    name: 'raksha-bandhan',
    displayName: 'Raksha Bandhan',
    month: 8,
    day: 19, // Approximate - varies each year
    duration: 1,
    colors: {
      primary: '#FF69B4',
      secondary: '#FFD700',
      accent: '#FF1493',
    },
    animation: 'confetti',
    intensity: 'medium',
    greeting: 'Happy Raksha Bandhan!',
    icon: '🎀',
    countries: ['IN', 'NP'],
    priority: 75,
  },
]

// ============================================
// CHINESE FESTIVALS
// ============================================

const chineseFestivals: Festival[] = [
  {
    id: 'chinese-new-year',
    name: 'chinese-new-year',
    displayName: 'Chinese New Year',
    duration: 15,
    calculateDate: calculateChineseNewYear,
    colors: {
      primary: '#FF0000',
      secondary: '#FFD700',
      accent: '#8B0000',
    },
    animation: 'chinesenewyear',
    intensity: 'high',
    greeting: 'Happy Chinese New Year!',
    icon: '🧧',
    countries: ['CN', 'TW', 'HK', 'SG', 'MY', 'TH', 'ID', 'PH', 'VN'],
    priority: 95,
  },
  {
    id: 'lantern-festival',
    name: 'lantern-festival',
    displayName: 'Lantern Festival',
    duration: 1,
    calculateDate: calculateLanternFestival,
    colors: {
      primary: '#FF4500',
      secondary: '#FFD700',
      accent: '#FF0000',
    },
    animation: 'lanterns',
    intensity: 'medium',
    greeting: 'Happy Lantern Festival!',
    icon: '🏮',
    countries: ['CN', 'TW', 'HK', 'SG', 'MY'],
    priority: 80,
  },
  {
    id: 'mid-autumn-festival',
    name: 'mid-autumn-festival',
    displayName: 'Mid-Autumn Festival',
    duration: 3,
    calculateDate: calculateMidAutumnFestival,
    colors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#8B4513',
    },
    animation: 'midautumn',
    intensity: 'medium',
    greeting: 'Happy Mid-Autumn Festival!',
    icon: '🥮',
    countries: ['CN', 'TW', 'HK', 'SG', 'MY', 'VN'],
    priority: 85,
  },
]

// ============================================
// ISLAMIC FESTIVALS
// ============================================

const islamicFestivals: Festival[] = [
  {
    id: 'eid-al-fitr',
    name: 'eid-al-fitr',
    displayName: 'Eid al-Fitr',
    duration: 3,
    calculateDate: calculateEidAlFitr,
    colors: {
      primary: '#006400',
      secondary: '#FFD700',
      accent: '#FFFFFF',
    },
    animation: 'eid',
    intensity: 'high',
    greeting: 'Eid Mubarak!',
    icon: '🌙',
    countries: ['SA', 'AE', 'EG', 'PK', 'BD', 'ID', 'MY', 'TR', 'NG', 'IN', 'UK', 'US', 'CA', 'AU'],
    priority: 95,
  },
  {
    id: 'eid-al-adha',
    name: 'eid-al-adha',
    displayName: 'Eid al-Adha',
    duration: 4,
    calculateDate: calculateEidAlAdha,
    colors: {
      primary: '#006400',
      secondary: '#FFD700',
      accent: '#FFFFFF',
    },
    animation: 'eid',
    intensity: 'high',
    greeting: 'Eid Mubarak!',
    icon: '🐑',
    countries: ['SA', 'AE', 'EG', 'PK', 'BD', 'ID', 'MY', 'TR', 'NG', 'IN'],
    priority: 95,
  },
]

// ============================================
// JEWISH FESTIVALS
// ============================================

const jewishFestivals: Festival[] = [
  {
    id: 'hanukkah',
    name: 'hanukkah',
    displayName: 'Hanukkah',
    duration: 8,
    calculateDate: calculateHanukkahStart,
    colors: {
      primary: '#0038b8',
      secondary: '#FFFFFF',
      accent: '#FFD700',
    },
    animation: 'hanukkah',
    intensity: 'medium',
    greeting: 'Happy Hanukkah!',
    icon: '🕎',
    countries: ['IL', 'US', 'UK', 'FR', 'CA', 'AU', 'DE'],
    priority: 85,
  },
  {
    id: 'passover',
    name: 'passover',
    displayName: 'Passover',
    duration: 8,
    calculateDate: calculatePassoverStart,
    colors: {
      primary: '#0038b8',
      secondary: '#FFFFFF',
      accent: '#FFD700',
    },
    animation: 'stars',
    intensity: 'medium',
    greeting: 'Happy Passover!',
    icon: '🍷',
    countries: ['IL', 'US', 'UK', 'FR', 'CA', 'AU'],
    priority: 80,
  },
]

// ============================================
// US HOLIDAYS
// ============================================

const usFestivals: Festival[] = [
  {
    id: 'independence-day-us',
    name: 'independence-day-us',
    displayName: 'Independence Day',
    month: 7,
    day: 4,
    duration: 1,
    colors: {
      primary: '#B22234',
      secondary: '#FFFFFF',
      accent: '#3C3B6E',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: 'Happy 4th of July!',
    icon: '🇺🇸',
    countries: ['US'],
    priority: 95,
  },
  {
    id: 'thanksgiving-us',
    name: 'thanksgiving-us',
    displayName: 'Thanksgiving',
    duration: 1,
    calculateDate: calculateThanksgivingUS,
    colors: {
      primary: '#D2691E',
      secondary: '#8B4513',
      accent: '#FFD700',
    },
    animation: 'thanksgiving',
    intensity: 'medium',
    greeting: 'Happy Thanksgiving!',
    icon: '🦃',
    countries: ['US'],
    priority: 90,
  },
  {
    id: 'halloween',
    name: 'halloween',
    displayName: 'Halloween',
    month: 10,
    day: 31,
    duration: 1,
    colors: {
      primary: '#FF6600',
      secondary: '#000000',
      accent: '#8B008B',
    },
    animation: 'halloween',
    intensity: 'medium',
    greeting: 'Happy Halloween!',
    icon: '🎃',
    countries: ['US', 'UK', 'CA', 'AU', 'IE'],
    priority: 85,
  },
  {
    id: 'memorial-day',
    name: 'memorial-day',
    displayName: 'Memorial Day',
    month: 5,
    day: 27, // Last Monday of May - approximate
    duration: 1,
    colors: {
      primary: '#B22234',
      secondary: '#FFFFFF',
      accent: '#3C3B6E',
    },
    animation: 'confetti',
    intensity: 'low',
    greeting: 'Memorial Day',
    icon: '🇺🇸',
    countries: ['US'],
    priority: 70,
  },
  {
    id: 'labor-day-us',
    name: 'labor-day-us',
    displayName: 'Labor Day',
    month: 9,
    day: 2, // First Monday of September - approximate
    duration: 1,
    colors: {
      primary: '#B22234',
      secondary: '#FFFFFF',
      accent: '#3C3B6E',
    },
    animation: 'confetti',
    intensity: 'low',
    greeting: 'Happy Labor Day!',
    icon: '👷',
    countries: ['US'],
    priority: 65,
  },
]

// ============================================
// INDIA HOLIDAYS
// ============================================

const indiaFestivals: Festival[] = [
  {
    id: 'independence-day-india',
    name: 'independence-day-india',
    displayName: 'Independence Day',
    month: 8,
    day: 15,
    duration: 1,
    colors: {
      primary: '#FF9933',
      secondary: '#FFFFFF',
      accent: '#138808',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: 'Happy Independence Day!',
    icon: '🇮🇳',
    countries: ['IN'],
    priority: 95,
  },
  {
    id: 'republic-day-india',
    name: 'republic-day-india',
    displayName: 'Republic Day',
    month: 1,
    day: 26,
    duration: 1,
    colors: {
      primary: '#FF9933',
      secondary: '#FFFFFF',
      accent: '#138808',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: 'Happy Republic Day!',
    icon: '🇮🇳',
    countries: ['IN'],
    priority: 95,
  },
  {
    id: 'gandhi-jayanti',
    name: 'gandhi-jayanti',
    displayName: 'Gandhi Jayanti',
    month: 10,
    day: 2,
    duration: 1,
    colors: {
      primary: '#FF9933',
      secondary: '#FFFFFF',
      accent: '#138808',
    },
    animation: 'confetti',
    intensity: 'low',
    greeting: 'Gandhi Jayanti',
    icon: '🕊️',
    countries: ['IN'],
    priority: 80,
  },
]

// ============================================
// UK HOLIDAYS
// ============================================

const ukFestivals: Festival[] = [
  {
    id: 'guy-fawkes',
    name: 'guy-fawkes',
    displayName: 'Guy Fawkes Night',
    month: 11,
    day: 5,
    duration: 1,
    colors: {
      primary: '#FF4500',
      secondary: '#FFD700',
      accent: '#8B0000',
    },
    animation: 'fireworks',
    intensity: 'high',
    greeting: 'Happy Bonfire Night!',
    icon: '🎆',
    countries: ['UK'],
    priority: 85,
  },
  {
    id: 'st-georges-day',
    name: 'st-georges-day',
    displayName: "St. George's Day",
    month: 4,
    day: 23,
    duration: 1,
    colors: {
      primary: '#FF0000',
      secondary: '#FFFFFF',
      accent: '#FF0000',
    },
    animation: 'confetti',
    intensity: 'low',
    greeting: "Happy St. George's Day!",
    icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    countries: ['UK'],
    priority: 60,
  },
]

// ============================================
// CANADA HOLIDAYS
// ============================================

const canadaFestivals: Festival[] = [
  {
    id: 'canada-day',
    name: 'canada-day',
    displayName: 'Canada Day',
    month: 7,
    day: 1,
    duration: 1,
    colors: {
      primary: '#FF0000',
      secondary: '#FFFFFF',
      accent: '#FF0000',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: 'Happy Canada Day!',
    icon: '🇨🇦',
    countries: ['CA'],
    priority: 95,
  },
  {
    id: 'thanksgiving-canada',
    name: 'thanksgiving-canada',
    displayName: 'Thanksgiving',
    month: 10,
    day: 14, // Second Monday of October - approximate
    duration: 1,
    colors: {
      primary: '#D2691E',
      secondary: '#8B4513',
      accent: '#FFD700',
    },
    animation: 'thanksgiving',
    intensity: 'medium',
    greeting: 'Happy Thanksgiving!',
    icon: '🍁',
    countries: ['CA'],
    priority: 85,
  },
]

// ============================================
// AUSTRALIA HOLIDAYS
// ============================================

const australiaFestivals: Festival[] = [
  {
    id: 'australia-day',
    name: 'australia-day',
    displayName: 'Australia Day',
    month: 1,
    day: 26,
    duration: 1,
    colors: {
      primary: '#00008B',
      secondary: '#FFFFFF',
      accent: '#FF0000',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: 'Happy Australia Day!',
    icon: '🇦🇺',
    countries: ['AU'],
    priority: 95,
  },
  {
    id: 'anzac-day',
    name: 'anzac-day',
    displayName: 'ANZAC Day',
    month: 4,
    day: 25,
    duration: 1,
    colors: {
      primary: '#8B0000',
      secondary: '#006400',
      accent: '#FFD700',
    },
    animation: 'confetti',
    intensity: 'low',
    greeting: 'Lest We Forget',
    icon: '🌺',
    countries: ['AU', 'NZ'],
    priority: 80,
  },
]

// ============================================
// EUROPEAN HOLIDAYS
// ============================================

const europeanFestivals: Festival[] = [
  {
    id: 'bastille-day',
    name: 'bastille-day',
    displayName: 'Bastille Day',
    month: 7,
    day: 14,
    duration: 1,
    colors: {
      primary: '#0055A4',
      secondary: '#FFFFFF',
      accent: '#EF4135',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: 'Joyeux 14 Juillet!',
    icon: '🇫🇷',
    countries: ['FR'],
    priority: 95,
  },
  {
    id: 'german-unity-day',
    name: 'german-unity-day',
    displayName: 'German Unity Day',
    month: 10,
    day: 3,
    duration: 1,
    colors: {
      primary: '#000000',
      secondary: '#DD0000',
      accent: '#FFCC00',
    },
    animation: 'patriotic',
    intensity: 'medium',
    greeting: 'Tag der Deutschen Einheit!',
    icon: '🇩🇪',
    countries: ['DE'],
    priority: 90,
  },
  {
    id: 'st-patricks-day',
    name: 'st-patricks-day',
    displayName: "St. Patrick's Day",
    month: 3,
    day: 17,
    duration: 1,
    colors: {
      primary: '#009A49',
      secondary: '#FFFFFF',
      accent: '#FFD700',
    },
    animation: 'stpatricks',
    intensity: 'medium',
    greeting: "Happy St. Patrick's Day!",
    icon: '☘️',
    countries: ['IE', 'US', 'UK', 'CA', 'AU'],
    priority: 85,
  },
]

// ============================================
// LATIN AMERICAN HOLIDAYS
// ============================================

const latinAmericanFestivals: Festival[] = [
  {
    id: 'dia-de-los-muertos',
    name: 'dia-de-los-muertos',
    displayName: 'Día de los Muertos',
    month: 11,
    day: 1,
    duration: 2,
    colors: {
      primary: '#FF6600',
      secondary: '#8B008B',
      accent: '#FFD700',
    },
    animation: 'diadelosmuertos',
    intensity: 'medium',
    greeting: 'Día de los Muertos',
    icon: '💀',
    countries: ['MX'],
    priority: 90,
  },
  {
    id: 'independence-day-mexico',
    name: 'independence-day-mexico',
    displayName: 'Independence Day',
    month: 9,
    day: 16,
    duration: 1,
    colors: {
      primary: '#006847',
      secondary: '#FFFFFF',
      accent: '#CE1126',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: '¡Viva México!',
    icon: '🇲🇽',
    countries: ['MX'],
    priority: 95,
  },
  {
    id: 'independence-day-brazil',
    name: 'independence-day-brazil',
    displayName: 'Independence Day',
    month: 9,
    day: 7,
    duration: 1,
    colors: {
      primary: '#009B3A',
      secondary: '#FEDF00',
      accent: '#002776',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: 'Feliz Dia da Independência!',
    icon: '🇧🇷',
    countries: ['BR'],
    priority: 95,
  },
]

// ============================================
// ASIAN HOLIDAYS
// ============================================

const asianFestivals: Festival[] = [
  {
    id: 'national-day-china',
    name: 'national-day-china',
    displayName: 'National Day',
    month: 10,
    day: 1,
    duration: 7,
    colors: {
      primary: '#FF0000',
      secondary: '#FFD700',
      accent: '#DE2910',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: 'Happy National Day!',
    icon: '🇨🇳',
    countries: ['CN'],
    priority: 95,
  },
  {
    id: 'golden-week-japan',
    name: 'golden-week-japan',
    displayName: 'Golden Week',
    month: 5,
    day: 3,
    duration: 5,
    colors: {
      primary: '#BC002D',
      secondary: '#FFFFFF',
      accent: '#FFD700',
    },
    animation: 'confetti',
    intensity: 'medium',
    greeting: 'Happy Golden Week!',
    icon: '🇯🇵',
    countries: ['JP'],
    priority: 85,
  },
  {
    id: 'independence-day-south-korea',
    name: 'independence-day-south-korea',
    displayName: 'Liberation Day',
    month: 8,
    day: 15,
    duration: 1,
    colors: {
      primary: '#003478',
      secondary: '#FFFFFF',
      accent: '#C60C30',
    },
    animation: 'confetti',
    intensity: 'medium',
    greeting: '광복절 축하합니다!',
    icon: '🇰🇷',
    countries: ['KR'],
    priority: 90,
  },
]

// ============================================
// MIDDLE EAST HOLIDAYS
// ============================================

const middleEastFestivals: Festival[] = [
  {
    id: 'national-day-uae',
    name: 'national-day-uae',
    displayName: 'UAE National Day',
    month: 12,
    day: 2,
    duration: 1,
    colors: {
      primary: '#00732F',
      secondary: '#FFFFFF',
      accent: '#FF0000',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: 'Happy National Day!',
    icon: '🇦🇪',
    countries: ['AE'],
    priority: 95,
  },
  {
    id: 'national-day-saudi',
    name: 'national-day-saudi',
    displayName: 'Saudi National Day',
    month: 9,
    day: 23,
    duration: 1,
    colors: {
      primary: '#006C35',
      secondary: '#FFFFFF',
      accent: '#006C35',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: 'Happy National Day!',
    icon: '🇸🇦',
    countries: ['SA'],
    priority: 95,
  },
]

// ============================================
// AFRICAN HOLIDAYS
// ============================================

const africanFestivals: Festival[] = [
  {
    id: 'freedom-day-south-africa',
    name: 'freedom-day-south-africa',
    displayName: 'Freedom Day',
    month: 4,
    day: 27,
    duration: 1,
    colors: {
      primary: '#007749',
      secondary: '#FFB81C',
      accent: '#000000',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: 'Happy Freedom Day!',
    icon: '🇿🇦',
    countries: ['ZA'],
    priority: 95,
  },
  {
    id: 'independence-day-nigeria',
    name: 'independence-day-nigeria',
    displayName: 'Independence Day',
    month: 10,
    day: 1,
    duration: 1,
    colors: {
      primary: '#008751',
      secondary: '#FFFFFF',
      accent: '#008751',
    },
    animation: 'patriotic',
    intensity: 'high',
    greeting: 'Happy Independence Day!',
    icon: '🇳🇬',
    countries: ['NG'],
    priority: 95,
  },
]

// ============================================
// MOTHERS & FATHERS DAY (varies by country)
// ============================================

const parentsFestivals: Festival[] = [
  {
    id: 'mothers-day-us',
    name: 'mothers-day',
    displayName: "Mother's Day",
    duration: 1,
    calculateDate: calculateMothersDayUS,
    colors: {
      primary: '#FF69B4',
      secondary: '#FFB6C1',
      accent: '#FF1493',
    },
    animation: 'mothersday',
    intensity: 'medium',
    greeting: "Happy Mother's Day!",
    icon: '💐',
    countries: ['US', 'CA', 'AU', 'NZ', 'IN', 'SG', 'MY', 'ZA', 'BR'],
    priority: 85,
  },
  {
    id: 'fathers-day-us',
    name: 'fathers-day',
    displayName: "Father's Day",
    duration: 1,
    calculateDate: calculateFathersDayUS,
    colors: {
      primary: '#4169E1',
      secondary: '#87CEEB',
      accent: '#FFD700',
    },
    animation: 'confetti',
    intensity: 'medium',
    greeting: "Happy Father's Day!",
    icon: '👔',
    countries: ['US', 'CA', 'UK', 'AU', 'NZ', 'IN', 'SG', 'ZA'],
    priority: 85,
  },
]

// ============================================
// COMBINE ALL FESTIVALS
// ============================================

export const allFestivals: Festival[] = [
  ...globalFestivals,
  ...christmasFestivals,
  ...easterFestivals,
  ...hinduFestivals,
  ...chineseFestivals,
  ...islamicFestivals,
  ...jewishFestivals,
  ...usFestivals,
  ...indiaFestivals,
  ...ukFestivals,
  ...canadaFestivals,
  ...australiaFestivals,
  ...europeanFestivals,
  ...latinAmericanFestivals,
  ...asianFestivals,
  ...middleEastFestivals,
  ...africanFestivals,
  ...parentsFestivals,
]

// Export festival count for reference
export const TOTAL_FESTIVALS = allFestivals.length
