// app/page.tsx
// Dynamic landing page powered by theme settings

import { getSession, removeAuthCookie } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'
import { getThemeSettings, parseJsonSetting } from '@/lib/theme'
import { FestivalWrapper } from '@/components/festival'

async function signOut() {
  'use server'
  await removeAuthCookie()
  redirect('/')
}

export default async function HomePage() {
  const session = await getSession()
  const theme = await getThemeSettings()

  // Parse JSON settings
  const problemCards = parseJsonSetting<Array<{ icon: string; title: string; description: string }>>(
    theme.problem_cards, []
  )
  const servicesCards = parseJsonSetting<Array<{ icon: string; title: string; description: string; features: string[] }>>(
    theme.services_cards, []
  )
  const pricingPackages = parseJsonSetting<Array<{ name: string; subtitle: string; price: string; period: string; featured?: boolean; features: string[] }>>(
    theme.pricing_packages, []
  )
  const processSteps = parseJsonSetting<Array<{ title: string; description: string }>>(
    theme.process_steps, []
  )
  const testimonials = parseJsonSetting<Array<{ text: string; author: string; company: string; initials: string }>>(
    theme.testimonials, []
  )
  const faqItems = parseJsonSetting<Array<{ question: string; answer: string }>>(
    theme.faq_items, []
  )

  return (
    <div className="min-h-screen bg-warm-white overflow-x-hidden">
      {/* Festival Overlay - Automatic festive decorations */}
      <FestivalWrapper />

      {/* Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Navigation - offset by festival banner height when present */}
      <nav
        className="fixed left-0 right-0 px-[4%] py-5 flex justify-between items-center bg-warm-white/95 backdrop-blur-xl z-40 border-b border-border transition-all duration-300"
        style={{ top: 'var(--festival-banner-height, 0px)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          {theme.site_logo ? (
            <img src={theme.site_logo} alt={theme.site_name} className="h-9" />
          ) : (
            <>
              <img src="/logo-icon.svg" alt={theme.site_name} className="w-9 h-9" />
              <span className="text-xl font-bold text-walnut font-display">{theme.site_name}</span>
            </>
          )}
        </Link>
        <div className="hidden md:flex items-center gap-10">
          <a href="#services" className="nav-link">Services</a>
          <a href="#portfolio" className="nav-link">Portfolio</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#process" className="nav-link">Process</a>
          {session ? (
            <>
              <Link href={session.role === 'ADMIN' || session.role === 'DESIGNER' ? '/admin' : '/dashboard'} className="bg-walnut text-warm-white px-6 py-3 rounded-lg font-semibold hover:bg-accent transition-all hover:-translate-y-0.5">
                {session.role === 'ADMIN' || session.role === 'DESIGNER' ? 'Admin Dashboard' : 'Dashboard'}
              </Link>
              <form action={signOut} className="inline">
                <button type="submit" className="text-walnut hover:text-accent font-semibold transition-colors">
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="nav-link">Sign In</Link>
              <Link href="/auth/register" className="bg-walnut text-warm-white px-6 py-3 rounded-lg font-semibold hover:bg-accent transition-all hover:-translate-y-0.5">
                Get Started
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden flex flex-col gap-1.5 p-2">
          <span className="w-6 h-0.5 bg-walnut"></span>
          <span className="w-6 h-0.5 bg-walnut"></span>
          <span className="w-6 h-0.5 bg-walnut"></span>
        </button>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-32 pb-16 px-[4%] relative overflow-hidden">
        {/* Background Shape */}
        <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-br from-dark-elevated to-dark-surface z-0"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
        >
          <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] border-2 border-walnut/30 rounded-full opacity-30" />
          <div className="absolute bottom-[15%] right-[25%] w-[150px] h-[150px] bg-walnut opacity-10 rotate-45" />
        </div>

        {/* Hero Content */}
        <div className="max-w-[600px] relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-walnut/20 text-walnut px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span>{theme.hero_badge_icon}</span> {theme.hero_badge_text}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-charcoal mb-6 leading-tight">
            {theme.hero_title_line1}{' '}
            <span className="text-walnut relative">
              {theme.hero_title_highlight}
              <span className="absolute bottom-1 left-0 w-full h-2 bg-walnut/20 -z-10" />
            </span>{' '}
            {theme.hero_title_line2}
          </h1>
          <p className="text-lg text-text-light mb-8 max-w-[500px]">
            {theme.hero_description}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth/register" className="btn-hero-primary">
              {theme.hero_cta_primary} <span>→</span>
            </Link>
            <a href="#portfolio" className="btn-hero-secondary">
              {theme.hero_cta_secondary}
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-12 mt-14 pt-8 border-t border-border">
            <div>
              <div className="text-4xl font-display font-bold text-walnut">{theme.stat_1_value}</div>
              <div className="text-sm text-text-light">{theme.stat_1_label}</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-walnut">{theme.stat_2_value}</div>
              <div className="text-sm text-text-light">{theme.stat_2_label}</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-walnut">{theme.stat_3_value}</div>
              <div className="text-sm text-text-light">{theme.stat_3_label}</div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="absolute right-[6%] top-1/2 -translate-y-1/2 w-[45%] max-w-[600px] hidden lg:block animate-float">
          {theme.hero_image ? (
            <img src={theme.hero_image} alt="Hero" className="w-full rounded-3xl shadow-2xl" />
          ) : (
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-dark-elevated via-dark-surface to-cream rounded-3xl shadow-2xl flex items-center justify-center border border-border">
              <div className="text-8xl">{theme.hero_icon}</div>
            </div>
          )}
        </div>

        {/* 3D Element */}
        <div className="absolute bottom-[15%] right-[45%] w-[120px] h-[120px] bg-gradient-to-br from-walnut to-accent rounded-2xl -rotate-[15deg] shadow-xl hidden lg:flex items-center justify-center text-warm-white text-5xl animate-pulse-slow">
          📐
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-[4%] bg-cream">
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <span className="text-accent font-semibold text-sm tracking-widest uppercase">{theme.problem_section_subtitle}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-charcoal mt-4 mb-4">
            {theme.problem_section_title}
          </h2>
          <p className="text-text-light text-lg">
            {theme.problem_section_description}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {problemCards.map((card, i) => (
            <ProblemCard key={i} icon={card.icon} title={card.title} description={card.description} />
          ))}
        </div>
      </section>

      {/* Before/After Section */}
      <section id="portfolio" className="py-24 px-[4%] bg-dark-surface">
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <span className="text-accent font-semibold text-sm tracking-widest uppercase">The Transformation</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-charcoal mt-4 mb-4">
            From Sketch to Stunning 3D
          </h2>
          <p className="text-text-light text-lg">
            See how simple measurements and ideas transform into presentation-ready visuals that win jobs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <BeforeAfterSlider beforeIcon="📝" beforeLabel="Your Sketch" afterIcon="🍳" title="Modern Kitchen Island" description="Transformed a rough measurement sketch into photorealistic 3D render with material options." />
          <BeforeAfterSlider beforeIcon="📏" beforeLabel="Basic Dimensions" afterIcon="👔" title="Walk-in Wardrobe" description="Client provided room dimensions. Delivered 3 design options with lighting simulation." />
          <BeforeAfterSlider beforeIcon="✏️" beforeLabel="Rough Idea" afterIcon="📺" title="Entertainment Unit" description="Pinterest inspiration turned into custom design with cable management visualization." />
          <BeforeAfterSlider beforeIcon="📐" beforeLabel="Floor Plan" afterIcon="🚿" title="Bathroom Vanity" description="Complex space with plumbing constraints visualized before production began." />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-[4%] bg-gradient-to-b from-cream to-dark-surface">
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <span className="text-accent font-semibold text-sm tracking-widest uppercase">{theme.services_section_subtitle}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-charcoal mt-4 mb-4">
            {theme.services_section_title}
          </h2>
          <p className="text-text-light text-lg">
            {theme.services_section_description}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {servicesCards.map((card, i) => (
            <ServiceCard key={i} icon={card.icon} title={card.title} description={card.description} features={card.features} />
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-[4%] bg-dark-surface text-charcoal relative overflow-hidden">
        <div className="absolute -top-1/2 -right-[20%] w-[600px] h-[600px] bg-walnut rounded-full opacity-20 blur-3xl" />
        <div className="text-center max-w-[700px] mx-auto mb-16 relative z-10">
          <span className="text-walnut font-semibold text-sm tracking-widest uppercase">{theme.pricing_section_subtitle}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-charcoal mt-4 mb-4">
            {theme.pricing_section_title}
          </h2>
          <p className="text-text-light text-lg">
            {theme.pricing_section_description}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10">
          {pricingPackages.map((pkg, i) => (
            <PricingCard key={i} name={pkg.name} subtitle={pkg.subtitle} price={pkg.price} period={pkg.period} features={pkg.features} featured={pkg.featured} />
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 px-[4%] bg-dark-elevated">
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <span className="text-accent font-semibold text-sm tracking-widest uppercase">{theme.process_section_subtitle}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-charcoal mt-4 mb-4">
            {theme.process_section_title}
          </h2>
          <p className="text-text-light text-lg">
            {theme.process_section_description}
          </p>
        </div>
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-walnut to-walnut/20 hidden md:block" />
          {processSteps.map((step, i) => (
            <ProcessStep key={i} number={i + 1} title={step.title} description={step.description} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-[4%] bg-cream">
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <span className="text-accent font-semibold text-sm tracking-widest uppercase">{theme.testimonials_section_subtitle}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-charcoal mt-4 mb-4">
            {theme.testimonials_section_title}
          </h2>
          <p className="text-text-light text-lg">
            {theme.testimonials_section_description}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard key={i} text={testimonial.text} author={testimonial.author} company={testimonial.company} initials={testimonial.initials} />
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-[4%] bg-dark-surface">
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <span className="text-accent font-semibold text-sm tracking-widest uppercase">{theme.faq_section_subtitle}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-charcoal mt-4 mb-4">
            {theme.faq_section_title}
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, i) => (
            <FAQItem key={i} question={item.question} answer={item.answer} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-[4%] bg-gradient-to-br from-walnut-dark to-cream text-center relative overflow-hidden">
        <div className="absolute -top-[100px] -left-[100px] w-[400px] h-[400px] border-2 border-walnut/20 rounded-full" />
        <div className="absolute -bottom-[150px] -right-[100px] w-[500px] h-[500px] border-2 border-walnut/20 rounded-full" />
        <div className="max-w-[700px] mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-charcoal mb-4">
            {theme.cta_title}
          </h2>
          <p className="text-text-light text-lg mb-8">
            {theme.cta_description}
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-walnut text-warm-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-accent transition-all hover:-translate-y-1">
            {theme.cta_button_text} <span>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-warm-white text-charcoal py-16 px-[4%] border-t border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              {theme.site_logo ? (
                <img src={theme.site_logo} alt={theme.site_name} className="h-9" />
              ) : (
                <>
                  <img src="/logo-icon.svg" alt={theme.site_name} className="w-9 h-9" />
                  <span className="text-xl font-bold text-charcoal font-display">{theme.site_name}</span>
                </>
              )}
            </Link>
            <p className="text-text-light text-sm leading-relaxed">
              {theme.footer_description}
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-charcoal">Services</h4>
            <ul className="space-y-3">
              <li><a href="#services" className="text-text-light hover:text-walnut transition-colors">3D Renders</a></li>
              <li><a href="#services" className="text-text-light hover:text-walnut transition-colors">Technical Drawings</a></li>
              <li><a href="#pricing" className="text-text-light hover:text-walnut transition-colors">Pricing</a></li>
              <li><a href="#portfolio" className="text-text-light hover:text-walnut transition-colors">Portfolio</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-charcoal">Company</h4>
            <ul className="space-y-3">
              <li><a href="#process" className="text-text-light hover:text-walnut transition-colors">How It Works</a></li>
              <li><Link href="/auth/register" className="text-text-light hover:text-walnut transition-colors">Get Started</Link></li>
              <li><Link href="/auth/login" className="text-text-light hover:text-walnut transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-charcoal">Contact</h4>
            <ul className="space-y-3">
              <li className="text-text-light">{theme.contact_email}</li>
              <li className="text-text-light">{theme.contact_phone}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">{theme.footer_copyright}</p>
          <div className="flex gap-4">
            {theme.social_facebook && (
              <a href={theme.social_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-dark-elevated rounded-full flex items-center justify-center text-text-light hover:bg-walnut hover:text-warm-white transition-all hover:-translate-y-1">f</a>
            )}
            {theme.social_linkedin && (
              <a href={theme.social_linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-dark-elevated rounded-full flex items-center justify-center text-text-light hover:bg-walnut hover:text-warm-white transition-all hover:-translate-y-1">in</a>
            )}
            {theme.social_instagram && (
              <a href={theme.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-dark-elevated rounded-full flex items-center justify-center text-text-light hover:bg-walnut hover:text-warm-white transition-all hover:-translate-y-1">ig</a>
            )}
            {!theme.social_facebook && !theme.social_linkedin && !theme.social_instagram && (
              <>
                <a href="#" className="w-10 h-10 bg-dark-elevated rounded-full flex items-center justify-center text-text-light hover:bg-walnut hover:text-warm-white transition-all hover:-translate-y-1">f</a>
                <a href="#" className="w-10 h-10 bg-dark-elevated rounded-full flex items-center justify-center text-text-light hover:bg-walnut hover:text-warm-white transition-all hover:-translate-y-1">in</a>
                <a href="#" className="w-10 h-10 bg-dark-elevated rounded-full flex items-center justify-center text-text-light hover:bg-walnut hover:text-warm-white transition-all hover:-translate-y-1">ig</a>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

// Component: Problem Card
function ProblemCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-dark-surface p-8 rounded-2xl shadow-soft border border-border transition-all duration-300 hover:-translate-y-2 hover:shadow-medium hover:border-walnut/30">
      <div className="w-[60px] h-[60px] bg-gradient-to-br from-walnut/30 to-dark-elevated rounded-xl flex items-center justify-center text-3xl mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-display font-semibold text-charcoal mb-3">{title}</h3>
      <p className="text-text-light">{description}</p>
    </div>
  )
}

// Component: Service Card
function ServiceCard({ icon, title, description, features }: {
  icon: string; title: string; description: string; features: string[]
}) {
  return (
    <div className="bg-dark-surface rounded-3xl p-8 shadow-soft border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-medium relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-walnut to-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
      <div className="w-[70px] h-[70px] bg-gradient-to-br from-walnut/30 to-dark-elevated rounded-2xl flex items-center justify-center text-4xl mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-display font-semibold text-charcoal mb-4">{title}</h3>
      <p className="text-text-light mb-6">{description}</p>
      <ul className="space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-text">
            <span className="text-accent font-bold">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Component: Pricing Card
function PricingCard({ name, subtitle, price, period, features, featured = false }: {
  name: string; subtitle: string; price: string; period: string; features: string[]; featured?: boolean
}) {
  return (
    <div className={`rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 ${
      featured
        ? 'bg-walnut/20 text-charcoal scale-105 shadow-2xl border-2 border-walnut'
        : 'bg-dark-elevated backdrop-blur-sm border border-border hover:border-walnut/30'
    }`}>
      {featured && (
        <span className="inline-block bg-accent text-warm-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          Most Popular
        </span>
      )}
      <h3 className="text-2xl font-display font-semibold mb-1 text-charcoal">
        {name}
      </h3>
      <p className="text-sm mb-6 text-text-light">{subtitle}</p>
      <div className="text-5xl font-display font-bold mb-2 text-walnut">
        {price}<span className="text-lg font-normal opacity-70">{period}</span>
      </div>
      <ul className={`space-y-3 my-8 pt-8 border-t ${featured ? 'border-walnut/30' : 'border-border'}`}>
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-text">
            <span className="text-accent">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/auth/register" className={`block text-center py-4 rounded-lg font-semibold transition-all ${
        featured
          ? 'bg-walnut text-warm-white hover:bg-accent'
          : 'bg-walnut/80 text-warm-white hover:bg-walnut'
      }`}>
        Get Started
      </Link>
    </div>
  )
}

// Component: Process Step
function ProcessStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-8 mb-12 relative">
      <div className="w-20 h-20 bg-dark-surface border-[3px] border-walnut rounded-full flex items-center justify-center font-display text-3xl font-bold text-walnut flex-shrink-0 z-10">
        {number}
      </div>
      <div className="bg-dark-surface p-8 rounded-2xl shadow-soft border border-border flex-1">
        <h3 className="text-xl font-display font-semibold text-charcoal mb-3">{title}</h3>
        <p className="text-text-light">{description}</p>
      </div>
    </div>
  )
}

// Component: Testimonial Card
function TestimonialCard({ text, author, company, initials }: {
  text: string; author: string; company: string; initials: string
}) {
  return (
    <div className="bg-dark-surface p-8 rounded-3xl shadow-soft border border-border relative">
      <div className="absolute top-6 right-8 text-7xl font-display text-walnut/20 leading-none">"</div>
      <div className="text-accent text-xl mb-4">★★★★★</div>
      <p className="text-text mb-6 relative z-10 leading-relaxed">{text}</p>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-walnut to-accent rounded-full flex items-center justify-center text-warm-white font-bold text-lg">
          {initials}
        </div>
        <div>
          <h4 className="font-display font-semibold text-charcoal">{author}</h4>
          <p className="text-text-light text-sm">{company}</p>
        </div>
      </div>
    </div>
  )
}

// Component: FAQ Item
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="bg-dark-elevated rounded-2xl shadow-soft border border-border overflow-hidden group">
      <summary className="flex justify-between items-center p-6 cursor-pointer font-semibold text-charcoal hover:bg-dark-surface transition-colors list-none">
        {question}
        <span className="text-2xl text-walnut transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="px-6 pb-6 text-text-light leading-relaxed">
        {answer}
      </div>
    </details>
  )
}
