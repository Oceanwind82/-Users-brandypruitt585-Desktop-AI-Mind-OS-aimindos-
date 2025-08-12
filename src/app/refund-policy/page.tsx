import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Refund Policy - AI Mind OS',
  description: 'AI Mind OS refund policy and terms',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
            <p className="text-xl text-gray-600">
              Our policy regarding refunds and cancellations
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: August 12, 2025
            </p>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Refund Policy</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <p className="text-red-800 font-semibold text-lg">
                  All sales are final. AI Mind OS does not provide refunds for any subscriptions or services.
                </p>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  When you purchase a subscription to AI Mind OS, you are agreeing to our no-refund policy. 
                  This policy applies to all subscription plans, add-on services, and any other purchases made through our platform.
                </p>
                
                <p>
                  We encourage all users to take advantage of our free trial period to fully evaluate the platform 
                  before committing to a paid subscription.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cancellations</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  While we do not provide refunds, you can cancel your subscription at any time through:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your account billing page</li>
                  <li>The Stripe billing portal</li>
                  <li>Contacting our support team</li>
                </ul>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-blue-800">
                    <strong>Important:</strong> Cancellations take effect at the end of your current billing period. 
                    You will retain access to all features until that date.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exceptions</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  The only exceptions to our no-refund policy are:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Billing errors or duplicate charges (verified by our team)</li>
                  <li>Technical issues that prevent access to the service for extended periods</li>
                  <li>Legal requirements in certain jurisdictions</li>
                </ul>
                
                <p>
                  These exceptions are handled on a case-by-case basis and require verification by our support team.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Chargebacks and Disputes</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Initiating a chargeback or payment dispute instead of contacting us directly may result in:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Immediate suspension of your account</li>
                  <li>Loss of access to all data and content</li>
                  <li>Additional fees to cover chargeback processing costs</li>
                </ul>
                
                <p>
                  We encourage users to contact our support team first to resolve any billing concerns.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data and Content</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Upon subscription cancellation:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You retain access until the end of your billing period</li>
                  <li>Data export options are available before termination</li>
                  <li>Content may be permanently deleted after account closure</li>
                  <li>We recommend downloading your data before cancellation</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have questions about this refund policy or need assistance with billing issues, please contact us:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <ul className="space-y-2">
                    <li><strong>Email:</strong> support@aimindos.com</li>
                    <li><strong>Response Time:</strong> Within 24 hours</li>
                    <li><strong>Business Hours:</strong> Monday - Friday, 9 AM - 6 PM EST</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Policy Updates</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  This refund policy may be updated from time to time. Users will be notified of material changes 
                  via email or through the platform. Continued use of the service after policy updates constitutes 
                  acceptance of the new terms.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
