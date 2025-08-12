import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | AI Mind OS',
  description: 'Terms of service and usage agreement for AI Mind OS platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>By accessing and using AI Mind OS, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
            <div className="space-y-4 text-gray-700">
              <p>AI Mind OS provides:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI-powered intelligence briefings and news curation</li>
                <li>Community intelligence sharing platform</li>
                <li>Gamified learning and engagement system</li>
                <li>Analytics and insights dashboard</li>
                <li>Subscription-based premium features</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
            <div className="space-y-4 text-gray-700">
              <p>Users agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate registration information</li>
                <li>Maintain account security and confidentiality</li>
                <li>Use the service lawfully and ethically</li>
                <li>Respect intellectual property rights</li>
                <li>Not share false or misleading information</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Content and Intellectual Property</h2>
            <div className="space-y-4 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>Users retain rights to their submitted content</li>
                <li>AI Mind OS retains rights to platform features and technology</li>
                <li>Community contributions may be shared and attributed</li>
                <li>AI-generated content is subject to platform guidelines</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment and Subscriptions</h2>
            <div className="space-y-4 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscription fees are billed according to chosen plan</li>
                <li>Cancellations take effect at the end of billing period</li>
                <li>All sales are final - no refunds will be provided</li>
                <li>Price changes require 30-day advance notice</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700">
              <p>AI Mind OS provides services &ldquo;as is&rdquo; without warranties. We are not liable for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accuracy of AI-generated content or intelligence</li>
                <li>Business decisions based on platform insights</li>
                <li>Service interruptions or technical issues</li>
                <li>Third-party integrations or external content</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Termination</h2>
            <div className="space-y-4 text-gray-700">
              <p>Either party may terminate this agreement:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Users can cancel subscriptions at any time</li>
                <li>We may suspend accounts for violations</li>
                <li>Data export options available before termination</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>For questions about these terms:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> legal@aimindos.com</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
              </div>
            </div>
          </section>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
