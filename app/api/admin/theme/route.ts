// app/api/admin/theme/route.ts
// API routes for theme settings management (includes IMAGES category)
// Version: 2.0.0 - Full IMAGES tab support with Vercel Blob storage

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// Default theme settings structure
const defaultSettings = [
  // ============================================
  // GENERAL
  // ============================================
  { key: 'site_name', value: 'CabinetViz', category: 'GENERAL', label: 'Site Name', type: 'TEXT', description: 'The name of your website' },
  { key: 'site_tagline', value: 'Professional 3D Cabinet Visualization', category: 'GENERAL', label: 'Site Tagline', type: 'TEXT', description: 'A short description or tagline' },
  { key: 'site_logo', value: '', category: 'GENERAL', label: 'Site Logo', type: 'IMAGE', description: 'Upload your logo (recommended: 200x50px)' },
  { key: 'favicon', value: '', category: 'GENERAL', label: 'Favicon', type: 'IMAGE', description: 'Upload favicon (32x32px)' },
  { key: 'contact_email', value: 'hello@cabinetviz.com', category: 'GENERAL', label: 'Contact Email', type: 'TEXT', description: 'Primary contact email' },
  { key: 'contact_phone', value: '+64 21 123 4567', category: 'GENERAL', label: 'Contact Phone', type: 'TEXT', description: 'Primary contact phone' },

  // ============================================
  // IMAGES
  // ============================================
  { key: 'image_logo', value: '/logo.svg', category: 'IMAGES', label: 'Website Logo', type: 'IMAGE', description: 'Main logo displayed in header (recommended: SVG or PNG, 200x50px)' },
  { key: 'image_logo_dark', value: '/logo.svg', category: 'IMAGES', label: 'Logo for Dark Background', type: 'IMAGE', description: 'Logo version for dark backgrounds' },
  { key: 'image_favicon', value: '/favicon.ico', category: 'IMAGES', label: 'Favicon', type: 'IMAGE', description: 'Browser tab icon (32x32px or 64x64px)' },
  { key: 'image_hero_background', value: '', category: 'IMAGES', label: 'Hero Background Image', type: 'IMAGE', description: 'Large background image for hero section (1920x1080px recommended)' },
  { key: 'image_hero_main', value: '', category: 'IMAGES', label: 'Hero Main Image', type: 'IMAGE', description: 'Main image/photo shown in hero section (800x600px recommended)' },
  { key: 'image_about', value: '', category: 'IMAGES', label: 'About Section Image', type: 'IMAGE', description: 'Image for about/profile section' },
  // Portfolio Before/After pairs
  { key: 'portfolio_1_before', value: '', category: 'IMAGES', label: 'Portfolio 1 - Before Image', type: 'IMAGE', description: 'Before image for first portfolio item (e.g., sketch, rough plan)' },
  { key: 'portfolio_1_after', value: '', category: 'IMAGES', label: 'Portfolio 1 - After Image', type: 'IMAGE', description: 'After image for first portfolio item (e.g., 3D render)' },
  { key: 'portfolio_1_title', value: 'Modern Kitchen Island', category: 'IMAGES', label: 'Portfolio 1 - Title', type: 'TEXT', description: 'Title for first portfolio item' },
  { key: 'portfolio_1_description', value: 'Transformed a rough measurement sketch into photorealistic 3D render with material options.', category: 'IMAGES', label: 'Portfolio 1 - Description', type: 'TEXT', description: 'Description for first portfolio item' },

  { key: 'portfolio_2_before', value: '', category: 'IMAGES', label: 'Portfolio 2 - Before Image', type: 'IMAGE', description: 'Before image for second portfolio item' },
  { key: 'portfolio_2_after', value: '', category: 'IMAGES', label: 'Portfolio 2 - After Image', type: 'IMAGE', description: 'After image for second portfolio item' },
  { key: 'portfolio_2_title', value: 'Walk-in Wardrobe', category: 'IMAGES', label: 'Portfolio 2 - Title', type: 'TEXT', description: 'Title for second portfolio item' },
  { key: 'portfolio_2_description', value: 'Client provided room dimensions. Delivered 3 design options with lighting simulation.', category: 'IMAGES', label: 'Portfolio 2 - Description', type: 'TEXT', description: 'Description for second portfolio item' },

  { key: 'portfolio_3_before', value: '', category: 'IMAGES', label: 'Portfolio 3 - Before Image', type: 'IMAGE', description: 'Before image for third portfolio item' },
  { key: 'portfolio_3_after', value: '', category: 'IMAGES', label: 'Portfolio 3 - After Image', type: 'IMAGE', description: 'After image for third portfolio item' },
  { key: 'portfolio_3_title', value: 'Entertainment Unit', category: 'IMAGES', label: 'Portfolio 3 - Title', type: 'TEXT', description: 'Title for third portfolio item' },
  { key: 'portfolio_3_description', value: 'Pinterest inspiration turned into custom design with cable management visualization.', category: 'IMAGES', label: 'Portfolio 3 - Description', type: 'TEXT', description: 'Description for third portfolio item' },

  { key: 'portfolio_4_before', value: '', category: 'IMAGES', label: 'Portfolio 4 - Before Image', type: 'IMAGE', description: 'Before image for fourth portfolio item' },
  { key: 'portfolio_4_after', value: '', category: 'IMAGES', label: 'Portfolio 4 - After Image', type: 'IMAGE', description: 'After image for fourth portfolio item' },
  { key: 'portfolio_4_title', value: 'Bathroom Vanity', category: 'IMAGES', label: 'Portfolio 4 - Title', type: 'TEXT', description: 'Title for fourth portfolio item' },
  { key: 'portfolio_4_description', value: 'Complex space with plumbing constraints visualized before production began.', category: 'IMAGES', label: 'Portfolio 4 - Description', type: 'TEXT', description: 'Description for fourth portfolio item' },
  { key: 'image_cta_background', value: '', category: 'IMAGES', label: 'CTA Background Image', type: 'IMAGE', description: 'Background for call-to-action section' },
  { key: 'image_testimonial_bg', value: '', category: 'IMAGES', label: 'Testimonials Background', type: 'IMAGE', description: 'Background for testimonials section' },
  { key: 'image_og_default', value: '/og-image.png', category: 'IMAGES', label: 'Social Share Image (OG)', type: 'IMAGE', description: 'Default image for social media sharing (1200x630px)' },

  // ============================================
  // COLORS
  // ============================================
  { key: 'color_primary', value: '#5D4E37', category: 'COLORS', label: 'Primary Color (Walnut)', type: 'COLOR', description: 'Main brand color' },
  { key: 'color_secondary', value: '#8B7355', category: 'COLORS', label: 'Secondary Color (Oak)', type: 'COLOR', description: 'Secondary accent color' },
  { key: 'color_accent', value: '#C4956A', category: 'COLORS', label: 'Accent Color', type: 'COLOR', description: 'Highlight/CTA color' },
  { key: 'color_background', value: '#FAF8F5', category: 'COLORS', label: 'Background Color', type: 'COLOR', description: 'Main background color' },
  { key: 'color_text', value: '#2D2A26', category: 'COLORS', label: 'Text Color', type: 'COLOR', description: 'Primary text color' },
  { key: 'color_text_light', value: '#6B6560', category: 'COLORS', label: 'Light Text Color', type: 'COLOR', description: 'Secondary text color' },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  { key: 'font_heading', value: 'Playfair Display', category: 'TYPOGRAPHY', label: 'Heading Font', type: 'SELECT', description: 'Font for headings', options: JSON.stringify(['Playfair Display', 'Merriweather', 'Lora', 'Cormorant Garamond', 'Libre Baskerville', 'Roboto Slab', 'Open Sans', 'Montserrat']) },
  { key: 'font_body', value: 'Inter', category: 'TYPOGRAPHY', label: 'Body Font', type: 'SELECT', description: 'Font for body text', options: JSON.stringify(['Inter', 'Open Sans', 'Roboto', 'Lato', 'Source Sans Pro', 'Nunito', 'Poppins', 'Work Sans']) },
  { key: 'font_size_base', value: '16', category: 'TYPOGRAPHY', label: 'Base Font Size (px)', type: 'NUMBER', description: 'Base font size in pixels' },

  // ============================================
  // HERO SECTION
  // ============================================
  { key: 'hero_badge_text', value: 'For Cabinet Makers & Joiners', category: 'HERO', label: 'Hero Badge Text', type: 'TEXT', description: 'Small badge above the headline' },
  { key: 'hero_badge_icon', value: '🎯', category: 'HERO', label: 'Hero Badge Icon', type: 'TEXT', description: 'Emoji icon for badge' },
  { key: 'hero_title_line1', value: 'Win More Jobs with', category: 'HERO', label: 'Hero Title Line 1', type: 'TEXT', description: 'First line of main headline' },
  { key: 'hero_title_highlight', value: 'Stunning 3D', category: 'HERO', label: 'Hero Title Highlight', type: 'TEXT', description: 'Highlighted text in headline' },
  { key: 'hero_title_line2', value: 'Cabinet Designs', category: 'HERO', label: 'Hero Title Line 2', type: 'TEXT', description: 'Last line of main headline' },
  { key: 'hero_description', value: 'Help your customers visualize their dream kitchens and wardrobes before a single cut is made. Professional 3D renders and technical drawings that close deals.', category: 'HERO', label: 'Hero Description', type: 'TEXTAREA', description: 'Paragraph under the headline' },
  { key: 'hero_cta_primary', value: 'Get Free Quote', category: 'HERO', label: 'Primary CTA Text', type: 'TEXT', description: 'Primary button text' },
  { key: 'hero_cta_secondary', value: 'View Portfolio', category: 'HERO', label: 'Secondary CTA Text', type: 'TEXT', description: 'Secondary button text' },
  { key: 'hero_image', value: '', category: 'HERO', label: 'Hero Image', type: 'IMAGE', description: 'Main hero image (recommended: 1200x900px)' },
  { key: 'hero_icon', value: '🏠', category: 'HERO', label: 'Hero Icon', type: 'TEXT', description: 'Large emoji icon if no image' },

  // ============================================
  // STATS
  // ============================================
  { key: 'stat_1_value', value: '500+', category: 'STATS', label: 'Stat 1 Value', type: 'TEXT', description: 'First statistic value' },
  { key: 'stat_1_label', value: 'Projects Delivered', category: 'STATS', label: 'Stat 1 Label', type: 'TEXT', description: 'First statistic label' },
  { key: 'stat_2_value', value: '48hr', category: 'STATS', label: 'Stat 2 Value', type: 'TEXT', description: 'Second statistic value' },
  { key: 'stat_2_label', value: 'Average Turnaround', category: 'STATS', label: 'Stat 2 Label', type: 'TEXT', description: 'Second statistic label' },
  { key: 'stat_3_value', value: '97%', category: 'STATS', label: 'Stat 3 Value', type: 'TEXT', description: 'Third statistic value' },
  { key: 'stat_3_label', value: 'Client Satisfaction', category: 'STATS', label: 'Stat 3 Label', type: 'TEXT', description: 'Third statistic label' },

  // ============================================
  // PROBLEM SECTION
  // ============================================
  { key: 'problem_section_subtitle', value: 'The Challenge', category: 'PROBLEM', label: 'Section Subtitle', type: 'TEXT', description: 'Small text above title' },
  { key: 'problem_section_title', value: 'Why Tradespeople Lose Jobs', category: 'PROBLEM', label: 'Section Title', type: 'TEXT', description: 'Main section title' },
  { key: 'problem_section_description', value: "Customers struggle to imagine the finished product. A sketch on paper just doesn't cut it anymore.", category: 'PROBLEM', label: 'Section Description', type: 'TEXTAREA', description: 'Paragraph under title' },
  { key: 'problem_cards', value: JSON.stringify([
    { icon: '😕', title: "Customers Can't Visualize", description: "Verbal descriptions and rough sketches leave customers uncertain. They often choose competitors with better presentations." },
    { icon: '💸', title: 'Lost Quotes & Revenue', description: "Without professional visuals, you're losing jobs to companies with fancy showrooms and 3D design tools." },
    { icon: '⏰', title: 'No Time to Learn 3D', description: "You're great at building cabinets, not spending hours learning complex design software." },
    { icon: '🔄', title: 'Costly Revisions', description: "Misunderstandings lead to expensive changes mid-project when customers see something different than expected." }
  ]), category: 'PROBLEM', label: 'Problem Cards', type: 'JSON', description: 'Cards showing customer pain points' },

  // ============================================
  // SERVICES SECTION
  // ============================================
  { key: 'services_section_subtitle', value: 'What I Offer', category: 'SERVICES', label: 'Section Subtitle', type: 'TEXT', description: 'Small text above title' },
  { key: 'services_section_title', value: 'Complete Design Services', category: 'SERVICES', label: 'Section Title', type: 'TEXT', description: 'Main section title' },
  { key: 'services_section_description', value: 'Everything you need to impress clients and streamline your workshop production.', category: 'SERVICES', label: 'Section Description', type: 'TEXTAREA', description: 'Paragraph under title' },
  { key: 'services_cards', value: JSON.stringify([
    { icon: '🎨', title: '3D Photorealistic Renders', description: 'Stunning visualizations that let customers see exactly what they\'re getting before you start building.', features: ['Multiple angle views', 'Material & color options', 'Realistic lighting', 'High-res for presentations'] },
    { icon: '📐', title: '2D Technical Drawings', description: 'Precise workshop drawings with all measurements, cut lists, and assembly details your team needs.', features: ['Detailed dimensions', 'Cut list optimization', 'Assembly instructions', 'Hardware specifications'] },
    { icon: '🔄', title: 'Revision Rounds', description: 'Quick turnaround on changes so you can show clients multiple options and close the deal faster.', features: ['Fast 24hr revisions', 'Material swaps', 'Layout adjustments', 'Color variations'] }
  ]), category: 'SERVICES', label: 'Service Cards', type: 'JSON', description: 'Cards showing services offered' },

  // ============================================
  // PRICING SECTION
  // ============================================
  { key: 'pricing_section_subtitle', value: 'Simple Pricing', category: 'PRICING', label: 'Section Subtitle', type: 'TEXT', description: 'Small text above title' },
  { key: 'pricing_section_title', value: 'Choose Your Package', category: 'PRICING', label: 'Section Title', type: 'TEXT', description: 'Main section title' },
  { key: 'pricing_section_description', value: 'Transparent pricing with no hidden fees. Pay per project or save with a monthly retainer.', category: 'PRICING', label: 'Section Description', type: 'TEXTAREA', description: 'Paragraph under title' },
  { key: 'pricing_packages', value: JSON.stringify([
    { name: 'Basic', subtitle: 'Perfect for simple jobs', price: '$79', period: '/project', featured: false, features: ['Single room/unit design', '2 photorealistic renders', 'Basic 2D drawing', '1 revision round', '72-hour delivery'] },
    { name: 'Professional', subtitle: 'Best for client presentations', price: '$149', period: '/project', featured: true, features: ['Complete room design', '5 photorealistic renders', 'Detailed technical drawings', '3 revision rounds', '48-hour delivery', 'Material options included'] },
    { name: 'Partner', subtitle: 'For regular workflow', price: '$399', period: '/month', featured: false, features: ['Up to 5 projects/month', 'Unlimited renders per project', 'Full technical package', 'Unlimited revisions', '24-hour priority delivery', 'Dedicated support line'] }
  ]), category: 'PRICING', label: 'Pricing Packages', type: 'JSON', description: 'Pricing cards configuration' },

  // ============================================
  // PROCESS SECTION
  // ============================================
  { key: 'process_section_subtitle', value: 'How It Works', category: 'PROCESS', label: 'Section Subtitle', type: 'TEXT', description: 'Small text above title' },
  { key: 'process_section_title', value: 'Simple 4-Step Process', category: 'PROCESS', label: 'Section Title', type: 'TEXT', description: 'Main section title' },
  { key: 'process_section_description', value: 'From your measurements to presentation-ready visuals in as little as 48 hours.', category: 'PROCESS', label: 'Section Description', type: 'TEXTAREA', description: 'Paragraph under title' },
  { key: 'process_steps', value: JSON.stringify([
    { title: 'Send Your Brief', description: "Share your measurements, sketches, photos of the space, and any inspiration images. Don't worry about being perfect – I'll work with whatever you have." },
    { title: 'Quick Consultation', description: "Brief call or message to clarify details, discuss material options, and understand your customer's style preferences. Usually takes 15 minutes." },
    { title: 'Receive Your Designs', description: 'Get your 3D renders and technical drawings delivered to your inbox. High-resolution files ready to share with your customer or send to the workshop.' },
    { title: 'Revise & Close the Deal', description: "Need changes? Quick turnaround on revisions. Show your customer the updated design and watch their confidence (and your conversion rate) soar." }
  ]), category: 'PROCESS', label: 'Process Steps', type: 'JSON', description: 'Steps configuration' },

  // ============================================
  // TESTIMONIALS SECTION
  // ============================================
  { key: 'testimonials_section_subtitle', value: 'Happy Clients', category: 'TESTIMONIALS', label: 'Section Subtitle', type: 'TEXT', description: 'Small text above title' },
  { key: 'testimonials_section_title', value: 'What Tradespeople Say', category: 'TESTIMONIALS', label: 'Section Title', type: 'TEXT', description: 'Main section title' },
  { key: 'testimonials_section_description', value: "Join hundreds of cabinet makers who've transformed their sales process.", category: 'TESTIMONIALS', label: 'Section Description', type: 'TEXTAREA', description: 'Paragraph under title' },
  { key: 'testimonials', value: JSON.stringify([
    { text: "Used to lose quotes because customers couldn't picture the finished product. Now I close 7 out of 10 jobs. The 3D renders pay for themselves on the first quote.", author: 'Mike Thompson', company: 'Thompson Joinery, Auckland', initials: 'MT' },
    { text: "The technical drawings are spot-on. My workshop team loves them – no more guessing or calling back for clarifications. Saves us hours every project.", author: 'Sarah Roberts', company: 'Custom Cabinets Co.', initials: 'SR' },
    { text: 'Fast, professional, and actually understands what cabinet makers need. The renders look better than what some big showrooms offer. Highly recommend.', author: 'James Davies', company: 'Davies Kitchen Fitters', initials: 'JD' }
  ]), category: 'TESTIMONIALS', label: 'Testimonials', type: 'JSON', description: 'Customer testimonials' },

  // ============================================
  // FAQ SECTION
  // ============================================
  { key: 'faq_section_subtitle', value: 'Questions?', category: 'FAQ', label: 'Section Subtitle', type: 'TEXT', description: 'Small text above title' },
  { key: 'faq_section_title', value: 'Frequently Asked Questions', category: 'FAQ', label: 'Section Title', type: 'TEXT', description: 'Main section title' },
  { key: 'faq_items', value: JSON.stringify([
    { question: 'What do I need to send you to get started?', answer: "Just send me what you have – rough sketches, measurements, photos of the space, and any inspiration images from Pinterest or magazines. I can work with hand-drawn sketches on paper, photos of napkin drawings, or even just dimensions in a text message." },
    { question: 'How long does delivery take?', answer: 'Standard delivery is 72 hours for Basic, 48 hours for Professional packages. Partner clients get 24-hour priority. Need it faster? Rush delivery is available for an additional fee.' },
    { question: 'Can I show the renders to my customers?', answer: "Absolutely – that's the whole point! You get full rights to use the renders in your customer presentations, quotes, and marketing. They're high-resolution files perfect for printing or showing on a tablet." },
    { question: 'What if I need changes after seeing the design?', answer: 'Every package includes revision rounds. Basic includes 1 round, Professional includes 3 rounds, and Partner gets unlimited revisions. A revision round covers things like material changes, color swaps, or minor layout adjustments.' },
    { question: 'Do you do other furniture besides cabinets?', answer: 'Yes! While I specialize in kitchens and wardrobes, I also design bathroom vanities, entertainment units, home offices, laundry rooms, and custom built-in furniture.' }
  ]), category: 'FAQ', label: 'FAQ Items', type: 'JSON', description: 'Frequently asked questions' },

  // ============================================
  // CTA SECTION
  // ============================================
  { key: 'cta_title', value: 'Ready to Win More Jobs?', category: 'CTA', label: 'CTA Title', type: 'TEXT', description: 'Call to action headline' },
  { key: 'cta_description', value: 'Stop losing quotes to competitors with fancy showrooms. Give your customers the confidence to say yes with professional 3D visualizations.', category: 'CTA', label: 'CTA Description', type: 'TEXTAREA', description: 'Call to action description' },
  { key: 'cta_button_text', value: 'Get Your Free Quote', category: 'CTA', label: 'CTA Button Text', type: 'TEXT', description: 'Button text' },

  // ============================================
  // FOOTER
  // ============================================
  { key: 'footer_description', value: 'Professional 3D visualization services for cabinet makers, joiners, and kitchen fitters.', category: 'FOOTER', label: 'Footer Description', type: 'TEXTAREA', description: 'Short description in footer' },
  { key: 'footer_copyright', value: '© 2025 CabinetViz. All rights reserved.', category: 'FOOTER', label: 'Copyright Text', type: 'TEXT', description: 'Copyright notice' },
  { key: 'social_facebook', value: '', category: 'FOOTER', label: 'Facebook URL', type: 'TEXT', description: 'Facebook page URL' },
  { key: 'social_instagram', value: '', category: 'FOOTER', label: 'Instagram URL', type: 'TEXT', description: 'Instagram profile URL' },
  { key: 'social_linkedin', value: '', category: 'FOOTER', label: 'LinkedIn URL', type: 'TEXT', description: 'LinkedIn page URL' },

  // ============================================
  // SEO
  // ============================================
  { key: 'seo_title', value: 'CabinetViz - Professional 3D Cabinet Visualization', category: 'SEO', label: 'SEO Title', type: 'TEXT', description: 'Page title for search engines' },
  { key: 'seo_description', value: 'Win more cabinet jobs with stunning 3D renders and technical drawings. Professional visualization services for cabinet makers, joiners, and kitchen fitters.', category: 'SEO', label: 'SEO Description', type: 'TEXTAREA', description: 'Meta description for search engines' },
  { key: 'seo_keywords', value: 'cabinet visualization, 3D kitchen design, cabinet maker, joinery, kitchen renders, wardrobe design', category: 'SEO', label: 'SEO Keywords', type: 'TEXT', description: 'Keywords separated by commas' },
]

// GET - Retrieve all theme settings
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all settings from database
    let settings = await prisma.themeSetting.findMany({
      orderBy: { category: 'asc' }
    })

    // If no settings exist, initialize with defaults
    if (settings.length === 0) {
      await prisma.themeSetting.createMany({
        data: defaultSettings.map(s => ({
          ...s,
          updatedBy: user.id
        }))
      })
      settings = await prisma.themeSetting.findMany({
        orderBy: { category: 'asc' }
      })
    } else {
      // Check for missing settings and add them (for new categories like IMAGES)
      const existingKeys = new Set(settings.map(s => s.key))
      const missingSettings = defaultSettings.filter(d => !existingKeys.has(d.key))

      if (missingSettings.length > 0) {
        await prisma.themeSetting.createMany({
          data: missingSettings.map(s => ({
            ...s,
            updatedBy: user.id
          }))
        })
        // Refresh settings after adding missing ones
        settings = await prisma.themeSetting.findMany({
          orderBy: { category: 'asc' }
        })
      }
    }

    // Group settings by category
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    }, {} as Record<string, typeof settings>)

    return NextResponse.json({ settings: grouped })
  } catch (error) {
    console.error('Error fetching theme settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT - Update theme settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body as { settings: { key: string; value: string }[] }

    // Update each setting
    for (const setting of settings) {
      await prisma.themeSetting.update({
        where: { key: setting.key },
        data: {
          value: setting.value,
          updatedBy: user.id
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating theme settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

// POST - Reset to defaults
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'reset') {
      // Delete all existing settings
      await prisma.themeSetting.deleteMany()

      // Re-create with defaults
      await prisma.themeSetting.createMany({
        data: defaultSettings.map(s => ({
          ...s,
          updatedBy: user.id
        }))
      })

      return NextResponse.json({ success: true, message: 'Settings reset to defaults' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error resetting theme settings:', error)
    return NextResponse.json({ error: 'Failed to reset settings' }, { status: 500 })
  }
}
