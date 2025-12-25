// app/privacy/page.tsx
// Privacy Policy page

import Link from 'next/link'

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-text mb-2">Privacy Policy</h1>
        <p className="text-text-light mb-8">Last updated: December 2024</p>

        <div className="bg-dark-surface rounded-2xl border border-border p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-text mb-4">1. Introduction</h2>
            <p className="text-text-light">
              CabinetViz (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our cabinet visualization service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">2. Information We Collect</h2>
            <p className="text-text-light mb-3">We collect information that you provide directly to us:</p>
            <ul className="list-disc list-inside text-text-light space-y-2">
              <li><strong className="text-text">Account Information:</strong> Name, email address, phone number, company name</li>
              <li><strong className="text-text">Project Data:</strong> Measurements, sketches, photos, design preferences</li>
              <li><strong className="text-text">Payment Information:</strong> Billing details (processed securely by payment providers)</li>
              <li><strong className="text-text">Communications:</strong> Messages and comments on your projects</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">3. How We Use Your Information</h2>
            <p className="text-text-light mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-text-light space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your projects and deliver visualizations</li>
              <li>Send you updates about your projects</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">4. Information Sharing</h2>
            <p className="text-text-light mb-3">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-text-light space-y-2">
              <li><strong className="text-text">Service Providers:</strong> Third parties who help us operate our business</li>
              <li><strong className="text-text">Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong className="text-text">Business Transfers:</strong> In connection with a merger or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">5. Data Security</h2>
            <p className="text-text-light">
              We implement appropriate technical and organizational measures to protect
              your personal information against unauthorized access, alteration, disclosure,
              or destruction. However, no method of transmission over the Internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">6. Data Retention</h2>
            <p className="text-text-light">
              We retain your information for as long as your account is active or as needed
              to provide services. Project files and deliverables are retained for 2 years
              after project completion. You may request deletion of your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">7. Your Rights</h2>
            <p className="text-text-light mb-3">You have the right to:</p>
            <ul className="list-disc list-inside text-text-light space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Receive a copy of your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">8. Cookies and Tracking</h2>
            <p className="text-text-light">
              We use cookies and similar technologies to improve your experience,
              analyze usage patterns, and remember your preferences. You can control
              cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">{"9. Children's Privacy"}</h2>
            <p className="text-text-light">
              Our Service is not intended for children under 18 years of age. We do not
              knowingly collect personal information from children. If you believe we
              have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">10. International Transfers</h2>
            <p className="text-text-light">
              Your information may be transferred to and processed in countries other
              than your country of residence. We ensure appropriate safeguards are in
              place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">11. Changes to This Policy</h2>
            <p className="text-text-light">
              We may update this Privacy Policy from time to time. We will notify you
              of any changes by posting the new policy on this page and updating the
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-4">12. Contact Us</h2>
            <p className="text-text-light">
              If you have questions about this Privacy Policy or our privacy practices,
              please contact us at{' '}
              <a href="mailto:privacy@cabinetviz.com" className="text-walnut hover:text-accent">
                privacy@cabinetviz.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/terms" className="text-walnut hover:text-accent">
            Terms of Service →
          </Link>
          <Link href="/" className="text-walnut hover:text-accent">
            Back to Home →
          </Link>
        </div>
      </main>
    </div>
  )
}
