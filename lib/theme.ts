// lib/theme.ts
// Theme utilities for fetching and applying theme settings

import { prisma } from '@/lib/db'

export interface ThemeSettings {
  // General
  site_name: string
  site_tagline: string
  site_logo: string
  favicon: string
  contact_email: string
  contact_phone: string

  // Images (from IMAGES category)
  image_logo: string
  image_logo_dark: string
  image_favicon: string
  image_hero_background: string
  image_hero_main: string
  image_about: string
  image_cta_background: string
  image_testimonial_bg: string
  image_og_default: string

  // Portfolio Before/After
  portfolio_1_before: string
  portfolio_1_after: string
  portfolio_1_title: string
  portfolio_1_description: string
  portfolio_2_before: string
  portfolio_2_after: string
  portfolio_2_title: string
  portfolio_2_description: string
  portfolio_3_before: string
  portfolio_3_after: string
  portfolio_3_title: string
  portfolio_3_description: string
  portfolio_4_before: string
  portfolio_4_after: string
  portfolio_4_title: string
  portfolio_4_description: string

  // Colors
  color_primary: string
  color_secondary: string
  color_accent: string
  color_background: string
  color_text: string
  color_text_light: string

  // Typography
  font_heading: string
  font_body: string
  font_size_base: string

  // Hero
  hero_badge_text: string
  hero_badge_icon: string
  hero_title_line1: string
  hero_title_highlight: string
  hero_title_line2: string
  hero_description: string
  hero_cta_primary: string
  hero_cta_secondary: string
  hero_image: string
  hero_icon: string

  // Stats
  stat_1_value: string
  stat_1_label: string
  stat_2_value: string
  stat_2_label: string
  stat_3_value: string
  stat_3_label: string

  // Problem Section
  problem_section_subtitle: string
  problem_section_title: string
  problem_section_description: string
  problem_cards: string

  // Services Section
  services_section_subtitle: string
  services_section_title: string
  services_section_description: string
  services_cards: string

  // Pricing Section
  pricing_section_subtitle: string
  pricing_section_title: string
  pricing_section_description: string
  pricing_packages: string

  // Process Section
  process_section_subtitle: string
  process_section_title: string
  process_section_description: string
  process_steps: string

  // Testimonials Section
  testimonials_section_subtitle: string
  testimonials_section_title: string
  testimonials_section_description: string
  testimonials: string

  // FAQ Section
  faq_section_subtitle: string
  faq_section_title: string
  faq_items: string

  // CTA Section
  cta_title: string
  cta_description: string
  cta_button_text: string

  // Footer
  footer_description: string
  footer_copyright: string
  social_facebook: string
  social_instagram: string
  social_linkedin: string

  // SEO
  seo_title: string
  seo_description: string
  seo_keywords: string
}

// Default theme settings
export const defaultThemeSettings: ThemeSettings = {
  // General
  site_name: 'CabinetViz',
  site_tagline: 'Professional 3D Cabinet Visualization',
  site_logo: '',
  favicon: '',
  contact_email: 'hello@cabinetviz.com',
  contact_phone: '+64 21 123 4567',

  // Images
  image_logo: '/logo.svg',
  image_logo_dark: '/logo.svg',
  image_favicon: '/favicon.ico',
  image_hero_background: '',
  image_hero_main: '',
  image_about: '',
  image_cta_background: '',
  image_testimonial_bg: '',
  image_og_default: '/og-image.png',

  // Portfolio Before/After
  portfolio_1_before: '',
  portfolio_1_after: '',
  portfolio_1_title: 'Modern Kitchen Island',
  portfolio_1_description: 'Transformed a rough measurement sketch into photorealistic 3D render with material options.',
  portfolio_2_before: '',
  portfolio_2_after: '',
  portfolio_2_title: 'Walk-in Wardrobe',
  portfolio_2_description: 'Client provided room dimensions. Delivered 3 design options with lighting simulation.',
  portfolio_3_before: '',
  portfolio_3_after: '',
  portfolio_3_title: 'Entertainment Unit',
  portfolio_3_description: 'Pinterest inspiration turned into custom design with cable management visualization.',
  portfolio_4_before: '',
  portfolio_4_after: '',
  portfolio_4_title: 'Bathroom Vanity',
  portfolio_4_description: 'Complex space with plumbing constraints visualized before production began.',

  // Colors
  color_primary: '#5D4E37',
  color_secondary: '#8B7355',
  color_accent: '#C4956A',
  color_background: '#FAF8F5',
  color_text: '#2D2A26',
  color_text_light: '#6B6560',

  // Typography
  font_heading: 'Playfair Display',
  font_body: 'Inter',
  font_size_base: '16',

  // Hero
  hero_badge_text: 'For Cabinet Makers & Joiners',
  hero_badge_icon: '🎯',
  hero_title_line1: 'Win More Jobs with',
  hero_title_highlight: 'Stunning 3D',
  hero_title_line2: 'Cabinet Designs',
  hero_description: 'Help your customers visualize their dream kitchens and wardrobes before a single cut is made. Professional 3D renders and technical drawings that close deals.',
  hero_cta_primary: 'Get Free Quote',
  hero_cta_secondary: 'View Portfolio',
  hero_image: '',
  hero_icon: '🏠',

  // Stats
  stat_1_value: '500+',
  stat_1_label: 'Projects Delivered',
  stat_2_value: '48hr',
  stat_2_label: 'Average Turnaround',
  stat_3_value: '97%',
  stat_3_label: 'Client Satisfaction',

  // Problem Section
  problem_section_subtitle: 'The Challenge',
  problem_section_title: 'Why Tradespeople Lose Jobs',
  problem_section_description: "Customers struggle to imagine the finished product. A sketch on paper just doesn't cut it anymore.",
  problem_cards: JSON.stringify([
    { icon: '😕', title: "Customers Can't Visualize", description: "Verbal descriptions and rough sketches leave customers uncertain. They often choose competitors with better presentations." },
    { icon: '💸', title: 'Lost Quotes & Revenue', description: "Without professional visuals, you're losing jobs to companies with fancy showrooms and 3D design tools." },
    { icon: '⏰', title: 'No Time to Learn 3D', description: "You're great at building cabinets, not spending hours learning complex design software." },
    { icon: '🔄', title: 'Costly Revisions', description: "Misunderstandings lead to expensive changes mid-project when customers see something different than expected." }
  ]),

  // Services Section
  services_section_subtitle: 'What I Offer',
  services_section_title: 'Complete Design Services',
  services_section_description: 'Everything you need to impress clients and streamline your workshop production.',
  services_cards: JSON.stringify([
    { icon: '🎨', title: '3D Photorealistic Renders', description: 'Stunning visualizations that let customers see exactly what they\'re getting before you start building.', features: ['Multiple angle views', 'Material & color options', 'Realistic lighting', 'High-res for presentations'] },
    { icon: '📐', title: '2D Technical Drawings', description: 'Precise workshop drawings with all measurements, cut lists, and assembly details your team needs.', features: ['Detailed dimensions', 'Cut list optimization', 'Assembly instructions', 'Hardware specifications'] },
    { icon: '🔄', title: 'Revision Rounds', description: 'Quick turnaround on changes so you can show clients multiple options and close the deal faster.', features: ['Fast 24hr revisions', 'Material swaps', 'Layout adjustments', 'Color variations'] }
  ]),

  // Pricing Section
  pricing_section_subtitle: 'Simple Pricing',
  pricing_section_title: 'Choose Your Package',
  pricing_section_description: 'Transparent pricing with no hidden fees. Pay per project or save with a monthly retainer.',
  pricing_packages: JSON.stringify([
    { name: 'Basic', subtitle: 'Perfect for simple jobs', price: '$99', period: '/project', featured: false, features: ['Single room/unit design', '2 photorealistic renders', 'Basic 2D drawing', '1 revision round', '72-hour delivery'] },
    { name: 'Professional', subtitle: 'Best for client presentations', price: '$199', period: '/project', featured: true, features: ['Complete room design', '5 photorealistic renders', 'Detailed technical drawings', '3 revision rounds', '48-hour delivery', 'Material options included'] },
    { name: 'Partner', subtitle: 'For regular workflow', price: '$499', period: '/month', featured: false, features: ['Up to 5 projects/month', 'Unlimited renders per project', 'Full technical package', 'Unlimited revisions', '24-hour priority delivery', 'Dedicated support line'] }
  ]),

  // Process Section
  process_section_subtitle: 'How It Works',
  process_section_title: 'Simple 4-Step Process',
  process_section_description: 'From your measurements to presentation-ready visuals in as little as 48 hours.',
  process_steps: JSON.stringify([
    { title: 'Send Your Brief', description: "Share your measurements, sketches, photos of the space, and any inspiration images. Don't worry about being perfect – I'll work with whatever you have." },
    { title: 'Quick Consultation', description: "Brief call or message to clarify details, discuss material options, and understand your customer's style preferences. Usually takes 15 minutes." },
    { title: 'Receive Your Designs', description: 'Get your 3D renders and technical drawings delivered to your inbox. High-resolution files ready to share with your customer or send to the workshop.' },
    { title: 'Revise & Close the Deal', description: "Need changes? Quick turnaround on revisions. Show your customer the updated design and watch their confidence (and your conversion rate) soar." }
  ]),

  // Testimonials Section
  testimonials_section_subtitle: 'Happy Clients',
  testimonials_section_title: 'What Tradespeople Say',
  testimonials_section_description: "Join hundreds of cabinet makers who've transformed their sales process.",
  testimonials: JSON.stringify([
    { text: "Used to lose quotes because customers couldn't picture the finished product. Now I close 7 out of 10 jobs. The 3D renders pay for themselves on the first quote.", author: 'Mike Thompson', company: 'Thompson Joinery, Auckland', initials: 'MT' },
    { text: "The technical drawings are spot-on. My workshop team loves them – no more guessing or calling back for clarifications. Saves us hours every project.", author: 'Sarah Roberts', company: 'Custom Cabinets Co.', initials: 'SR' },
    { text: 'Fast, professional, and actually understands what cabinet makers need. The renders look better than what some big showrooms offer. Highly recommend.', author: 'James Davies', company: 'Davies Kitchen Fitters', initials: 'JD' }
  ]),

  // FAQ Section
  faq_section_subtitle: 'Questions?',
  faq_section_title: 'Frequently Asked Questions',
  faq_items: JSON.stringify([
    { question: 'What do I need to send you to get started?', answer: "Just send me what you have – rough sketches, measurements, photos of the space, and any inspiration images from Pinterest or magazines. I can work with hand-drawn sketches on paper, photos of napkin drawings, or even just dimensions in a text message." },
    { question: 'How long does delivery take?', answer: 'Standard delivery is 72 hours for Basic, 48 hours for Professional packages. Partner clients get 24-hour priority. Need it faster? Rush delivery is available for an additional fee.' },
    { question: 'Can I show the renders to my customers?', answer: "Absolutely – that's the whole point! You get full rights to use the renders in your customer presentations, quotes, and marketing. They're high-resolution files perfect for printing or showing on a tablet." },
    { question: 'What if I need changes after seeing the design?', answer: 'Every package includes revision rounds. Basic includes 1 round, Professional includes 3 rounds, and Partner gets unlimited revisions. A revision round covers things like material changes, color swaps, or minor layout adjustments.' },
    { question: 'Do you do other furniture besides cabinets?', answer: 'Yes! While I specialize in kitchens and wardrobes, I also design bathroom vanities, entertainment units, home offices, laundry rooms, and custom built-in furniture.' }
  ]),

  // CTA Section
  cta_title: 'Ready to Win More Jobs?',
  cta_description: 'Stop losing quotes to competitors with fancy showrooms. Give your customers the confidence to say yes with professional 3D visualizations.',
  cta_button_text: 'Get Your Free Quote',

  // Footer
  footer_description: 'Professional 3D visualization services for cabinet makers, joiners, and kitchen fitters.',
  footer_copyright: '© 2025 CabinetViz. All rights reserved.',
  social_facebook: '',
  social_instagram: '',
  social_linkedin: '',

  // SEO
  seo_title: 'CabinetViz - Professional 3D Cabinet Visualization',
  seo_description: 'Win more cabinet jobs with stunning 3D renders and technical drawings. Professional visualization services for cabinet makers, joiners, and kitchen fitters.',
  seo_keywords: 'cabinet visualization, 3D kitchen design, cabinet maker, joinery, kitchen renders, wardrobe design',
}

// Fetch theme settings from database
export async function getThemeSettings(): Promise<ThemeSettings> {
  try {
    const settings = await prisma.themeSetting.findMany()

    if (settings.length === 0) {
      return defaultThemeSettings
    }

    // Convert array to object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key as keyof ThemeSettings] = setting.value
      return acc
    }, {} as Record<string, string>)

    // Merge with defaults to ensure all keys exist
    return {
      ...defaultThemeSettings,
      ...settingsObj,
    } as ThemeSettings
  } catch (error) {
    console.error('Error fetching theme settings:', error)
    return defaultThemeSettings
  }
}

// Parse JSON setting safely
export function parseJsonSetting<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}
