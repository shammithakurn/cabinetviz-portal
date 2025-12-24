// scripts/generate-icons.mjs
// Generate all required icon sizes from SVG using sharp

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

// SVG icon optimized for small sizes (favicon) with rounded background
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8BC4A"/>
      <stop offset="50%" stop-color="#D4A72C"/>
      <stop offset="100%" stop-color="#C4A77D"/>
    </linearGradient>
    <linearGradient id="leftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B7355"/>
      <stop offset="100%" stop-color="#5D4E37"/>
    </linearGradient>
    <linearGradient id="rightGrad" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#C4A77D"/>
      <stop offset="100%" stop-color="#9A8565"/>
    </linearGradient>
    <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1C1A"/>
      <stop offset="100%" stop-color="#121110"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="12" fill="#121110"/>
  <g transform="translate(32, 32)">
    <polygon points="0,-18 15,-9 0,0 -15,-9" fill="url(#topGrad)"/>
    <polygon points="-15,-9 0,0 0,18 -15,9" fill="url(#leftGrad)"/>
    <polygon points="0,0 15,-9 15,9 0,18" fill="url(#rightGrad)"/>
    <polygon points="0,-12 10,-6 0,0 -10,-6" fill="url(#innerGrad)"/>
    <polygon points="-10,-6 0,0 0,12 -10,5" fill="#121110"/>
    <polygon points="0,0 10,-6 10,5 0,12" fill="#1A1816"/>
    <circle cx="11" cy="4" r="1.5" fill="#D4A72C"/>
    <line x1="0" y1="-18" x2="15" y2="-9" stroke="#E8E4DD" stroke-width="0.5" opacity="0.5"/>
    <line x1="0" y1="-18" x2="-15" y2="-9" stroke="#E8E4DD" stroke-width="0.5" opacity="0.4"/>
  </g>
</svg>`

// OG Image SVG (1200x630) with logo and text
const ogImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#121110"/>
      <stop offset="100%" stop-color="#1E1C1A"/>
    </linearGradient>
    <linearGradient id="topGradOG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8BC4A"/>
      <stop offset="50%" stop-color="#D4A72C"/>
      <stop offset="100%" stop-color="#C4A77D"/>
    </linearGradient>
    <linearGradient id="leftGradOG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B7355"/>
      <stop offset="100%" stop-color="#5D4E37"/>
    </linearGradient>
    <linearGradient id="rightGradOG" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#C4A77D"/>
      <stop offset="100%" stop-color="#9A8565"/>
    </linearGradient>
    <linearGradient id="innerGradOG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1C1A"/>
      <stop offset="100%" stop-color="#121110"/>
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C4A77D"/>
      <stop offset="100%" stop-color="#D4A72C"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- Decorative grid pattern -->
  <g opacity="0.03">
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C4A77D" stroke-width="1"/>
    </pattern>
    <rect width="1200" height="630" fill="url(#grid)"/>
  </g>

  <!-- 3D Cabinet Logo - Centered -->
  <g transform="translate(600, 260)">
    <g transform="scale(1.5)">
      <polygon points="0,-70 60,-35 0,0 -60,-35" fill="url(#topGradOG)"/>
      <polygon points="-60,-35 0,0 0,70 -60,35" fill="url(#leftGradOG)"/>
      <polygon points="0,0 60,-35 60,35 0,70" fill="url(#rightGradOG)"/>
      <polygon points="0,-50 40,-25 0,-5 -40,-25" fill="url(#innerGradOG)"/>
      <polygon points="-40,-25 0,-5 0,45 -40,20" fill="#121110"/>
      <polygon points="0,-5 40,-25 40,20 0,45" fill="#1A1816"/>
      <circle cx="44" cy="17" r="4" fill="#D4A72C"/>
      <line x1="0" y1="-70" x2="60" y2="-35" stroke="#E8E4DD" stroke-width="1" opacity="0.5"/>
      <line x1="0" y1="-70" x2="-60" y2="-35" stroke="#E8E4DD" stroke-width="1" opacity="0.4"/>
    </g>
  </g>

  <!-- Text -->
  <text x="600" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="url(#textGrad)">CabinetViz</text>
  <text x="600" y="530" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#A09890">Professional 3D Cabinet Visualization</text>

  <!-- Corner accents -->
  <rect x="40" y="40" width="60" height="4" rx="2" fill="#C4A77D" opacity="0.6"/>
  <rect x="40" y="40" width="4" height="60" rx="2" fill="#C4A77D" opacity="0.6"/>
  <rect x="1100" y="586" width="60" height="4" rx="2" fill="#C4A77D" opacity="0.6"/>
  <rect x="1156" y="530" width="4" height="60" rx="2" fill="#C4A77D" opacity="0.6"/>
</svg>`

async function generateIcons() {
  console.log('Generating icons...\n')

  // Save SVG files
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg)
  console.log('Created: public/favicon.svg')

  fs.writeFileSync(path.join(publicDir, 'og-image.svg'), ogImageSvg)
  console.log('Created: public/og-image.svg')

  // Generate PNG favicons
  const faviconBuffer = Buffer.from(faviconSvg)

  // 16x16 favicon
  await sharp(faviconBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'))
  console.log('Created: public/favicon-16x16.png')

  // 32x32 favicon
  await sharp(faviconBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'))
  console.log('Created: public/favicon-32x32.png')

  // 48x48 for ICO
  await sharp(faviconBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon-48x48.png'))
  console.log('Created: public/favicon-48x48.png')

  // Apple touch icon 180x180
  await sharp(faviconBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'))
  console.log('Created: public/apple-touch-icon.png')

  // Android/PWA icon 192x192
  await sharp(faviconBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'))
  console.log('Created: public/icon-192.png')

  // Android/PWA icon 512x512
  await sharp(faviconBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'))
  console.log('Created: public/icon-512.png')

  // OG Image 1200x630
  const ogBuffer = Buffer.from(ogImageSvg)
  await sharp(ogBuffer)
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'))
  console.log('Created: public/og-image.png')

  // Create ICO file (simple approach - copy 32x32 as .ico)
  // For proper multi-resolution ICO, we'd need a specialized library
  const ico32 = await sharp(faviconBuffer)
    .resize(32, 32)
    .png()
    .toBuffer()

  // Write as favicon.ico (browsers will accept PNG in .ico)
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32)
  console.log('Created: public/favicon.ico')

  console.log('\nAll icons generated successfully!')
}

generateIcons().catch(console.error)
