// app/terms/page.tsx
// Terms of Service page

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <header className="bg-dark-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-walnut rounded-lg flex items-center justify-center text-warm-white text-lg">
              ⬡
            </div>
            <span className="text-lg font-bold text-text">CabinetViz</span>
          </Link>
          <Link
            href="/"
            className="text-text-light hover:text-walnut transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-text mb-2">Terms of Service</h1>
        <p className="text-text-light mb-8">Last updated: December 2024</p>

        <div className="bg-dark-surface rounded-2xl border border-border p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-text mb-4">1. Acceptance of Terms</h2>
            <p className="text-text-light">
              By accessing and using CabinetViz ("the Service"), you accept and agree to be bound by
              the terms and provision of this agreement. If you do not agree to abide by these terms,
              please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">2. Description of Service</h2>
            <p className="text-text-light">
              CabinetViz provides 3D cabinet visualization services including but not limited to
              3D renders, 2D technical drawings, cut lists, and assembly guides. We work with
              tradespeople and homeowners to visualize cabinet designs before manufacturing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">3. User Accounts</h2>
            <p className="text-text-light mb-3">
              To access certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-text-light space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly notify us of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">4. Payment Terms</h2>
            <p className="text-text-light mb-3">
              Payment is due upon approval of your quoted price. We accept major credit cards
              and bank transfers. All prices are quoted in New Zealand Dollars (NZD) unless
              otherwise specified.
            </p>
            <p className="text-text-light">
              Refunds are available if work has not commenced. Once design work begins,
              refunds are at our discretion based on work completed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">5. Intellectual Property</h2>
            <p className="text-text-light mb-3">
              Upon full payment, you receive a license to use the deliverables for your
              personal or business purposes. CabinetViz retains the right to use completed
              work in our portfolio and marketing materials unless you request otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">6. Revisions and Changes</h2>
            <p className="text-text-light">
              Each pricing package includes a specified number of revision rounds. Additional
              revisions beyond the included amount may incur extra charges. Major design changes
              after approval may require a new quote.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">7. Limitation of Liability</h2>
            <p className="text-text-light">
              CabinetViz provides visualization services only. We are not responsible for
              manufacturing errors, measurement inaccuracies provided by the client, or any
              issues arising from the actual construction of cabinets based on our designs.
              It is the client's responsibility to verify all measurements and specifications.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">8. Termination</h2>
            <p className="text-text-light">
              We reserve the right to terminate or suspend your account at any time for
              violation of these terms. Upon termination, your right to use the Service will
              immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">9. Changes to Terms</h2>
            <p className="text-text-light">
              We reserve the right to modify these terms at any time. We will notify users
              of significant changes via email or through the Service. Continued use of
              the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">10. Contact Information</h2>
            <p className="text-text-light">
              For questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@cabinetviz.com" className="text-walnut hover:text-accent">
                legal@cabinetviz.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/privacy" className="text-walnut hover:text-accent">
            Privacy Policy →
          </Link>
          <Link href="/" className="text-walnut hover:text-accent">
            Back to Home →
          </Link>
        </div>
      </main>
    </div>
  )
}
