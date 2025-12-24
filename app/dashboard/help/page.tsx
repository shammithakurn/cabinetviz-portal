// app/dashboard/help/page.tsx
// Customer help and support page

import Link from 'next/link'

export default function HelpPage() {
  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Help & Support</h1>
        <p className="text-text-light mt-1">
          Find answers to common questions and get in touch with our team
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* FAQ Section */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>❓</span> Frequently Asked Questions
              </h2>
            </div>
            <div className="divide-y divide-border">
              <FAQItem
                question="How do I submit a new job?"
                answer="Click the 'New Job' button in the sidebar or dashboard. Fill in your project details, upload your sketches and measurements, then submit. We'll review your request and provide a quote within 24-48 hours."
              />
              <FAQItem
                question="What file formats can I upload?"
                answer="We accept JPG, PNG, PDF, DXF, and DWG files. For best results, include clear photos of the space, hand-drawn sketches with measurements, and any reference images."
              />
              <FAQItem
                question="How long does it take to get my renders?"
                answer="Standard turnaround is 2-3 business days after quote approval. Rush orders can be completed within 24 hours for an additional fee."
              />
              <FAQItem
                question="Can I request revisions?"
                answer="Yes! Each package includes revision rounds. Simply use the comment feature on your job to request changes, and we'll update your renders accordingly."
              />
              <FAQItem
                question="What's included in the deliverables?"
                answer="Depending on your package, you'll receive 3D renders from multiple angles, 2D elevation drawings, cut lists, and assembly guides. All files are downloadable from your dashboard."
              />
              <FAQItem
                question="How do I pay for my order?"
                answer="Once you approve the quote, you'll receive a payment link via email. We accept all major credit cards and bank transfers."
              />
            </div>
          </div>

          {/* Video Tutorials */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>🎬</span> Video Tutorials
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <VideoCard
                title="Getting Started"
                duration="3:45"
                description="Learn how to create your first job"
              />
              <VideoCard
                title="Uploading Files"
                duration="2:30"
                description="Best practices for file uploads"
              />
              <VideoCard
                title="Reviewing Renders"
                duration="4:15"
                description="How to review and request changes"
              />
              <VideoCard
                title="Downloading Files"
                duration="1:45"
                description="Download and use your deliverables"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Support */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-gradient-to-r from-walnut to-accent">
              <h2 className="font-bold text-white flex items-center gap-2">
                <span>📞</span> Contact Support
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <a
                href="mailto:support@cabinetviz.com"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">📧</span>
                <div>
                  <p className="font-medium text-text">Email Us</p>
                  <p className="text-sm text-text-muted">support@cabinetviz.com</p>
                </div>
              </a>
              <a
                href="tel:+64123456789"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">📞</span>
                <div>
                  <p className="font-medium text-text">Call Us</p>
                  <p className="text-sm text-text-muted">+64 123 456 789</p>
                </div>
              </a>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-text-light">
                  <span className="font-medium text-text">Business Hours:</span><br />
                  Monday - Friday: 9am - 5pm NZST
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>🔗</span> Quick Links
              </h2>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">📊</span>
                <span className="font-medium text-text">Dashboard</span>
              </Link>
              <Link
                href="/jobs/new"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">➕</span>
                <span className="font-medium text-text">Create New Job</span>
              </Link>
              <Link
                href="/dashboard/downloads"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">📥</span>
                <span className="font-medium text-text">My Downloads</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-5">
      <h3 className="font-semibold text-text mb-2">{question}</h3>
      <p className="text-text-light text-sm">{answer}</p>
    </div>
  )
}

function VideoCard({
  title,
  duration,
  description,
}: {
  title: string
  duration: string
  description: string
}) {
  return (
    <div className="bg-dark-elevated rounded-lg p-4 hover:bg-dark-elevated/80 transition-colors cursor-pointer">
      <div className="w-full h-24 bg-gray-800 rounded-lg flex items-center justify-center mb-3">
        <span className="text-3xl">▶️</span>
      </div>
      <h3 className="font-semibold text-text">{title}</h3>
      <p className="text-sm text-text-muted">{description}</p>
      <p className="text-xs text-walnut mt-2">{duration}</p>
    </div>
  )
}
