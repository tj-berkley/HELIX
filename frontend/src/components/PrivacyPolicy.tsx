import React from 'react';
import { useNavigate } from 'react-router-dom';
import HelixLogo from './HelixLogo';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0e12] transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <HelixLogo size={48} animated />
            <div>
              <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">GoogleHubs</span>
              <p className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">HELIX AI Powered</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Last Updated: February 17, 2026</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-white/5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Introduction</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Welcome to GoogleHubs. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, including the HELIX AI Assistant and all associated features. We are committed to protecting your privacy and ensuring transparency in how we handle your data.
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                By using GoogleHubs, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">1. Information We Collect</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1.1 Information You Provide</h3>
                  <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc list-inside">
                    <li><strong>Account Information:</strong> Name, email address, password, business name, phone number</li>
                    <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely through Stripe)</li>
                    <li><strong>Profile Data:</strong> Business type, industry, company size, job title</li>
                    <li><strong>Content:</strong> Prospects, leads, contacts, notes, tasks, calendar events, emails, SMS messages</li>
                    <li><strong>User-Generated Content:</strong> Articles, books, manuscripts, videos, audio content created using HELIX</li>
                    <li><strong>Communications:</strong> Messages sent to support, feedback, survey responses</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1.2 Information Collected Automatically</h3>
                  <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc list-inside">
                    <li><strong>Usage Data:</strong> Features accessed, time spent, actions taken, clicks, navigation patterns</li>
                    <li><strong>Device Information:</strong> IP address, browser type, operating system, device type, screen resolution</li>
                    <li><strong>Log Data:</strong> Access times, error logs, performance data</li>
                    <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                    <li><strong>Location Data:</strong> General location based on IP address (not precise GPS unless explicitly granted)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1.3 Information from Third Parties</h3>
                  <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc list-inside">
                    <li><strong>Integration Data:</strong> Information from connected services (Google Workspace, Stripe, social media platforms)</li>
                    <li><strong>Prospecting Data:</strong> Business information from Google Places, LinkedIn, Facebook APIs</li>
                    <li><strong>Payment Data:</strong> Transaction details from Stripe</li>
                    <li><strong>Analytics:</strong> Aggregated usage data from third-party analytics providers</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">2. How We Use Your Information</h2>

              <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-6 border border-indigo-100 dark:border-indigo-500/20 mb-6">
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-3">Core Platform Services</h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc list-inside">
                  <li>Provide access to GoogleHubs platform and HELIX AI Assistant</li>
                  <li>Process and manage your account, subscriptions, and payments</li>
                  <li>Enable CRM, prospecting, content creation, and automation features</li>
                  <li>Store and sync your data across devices</li>
                  <li>Generate AI content, videos, and audio based on your inputs</li>
                </ul>
              </div>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2.1 Communication</h3>
                  <p>Send you service announcements, updates, security alerts, and support messages. Send marketing emails (you can opt-out at any time).</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2.2 Improvement and Development</h3>
                  <p>Analyze usage patterns to improve features, develop new functionality, and enhance AI models. Conduct research and analytics to better understand user needs.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2.3 Security and Fraud Prevention</h3>
                  <p>Detect and prevent fraud, abuse, security incidents, and other harmful activities. Monitor for terms of service violations.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2.4 Legal Compliance</h3>
                  <p>Comply with legal obligations, respond to lawful requests from authorities, enforce our terms and policies.</p>
                </div>
              </div>
            </section>

            {/* AI and HELIX Specific */}
            <section className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-8 border border-purple-100 dark:border-purple-500/20">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">3. HELIX AI Assistant and Content Creation</h2>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p>
                  <strong>AI Processing:</strong> When you use HELIX AI to generate content, the prompts and inputs you provide are processed by AI models (Google Gemini and others). These inputs may be temporarily stored to generate responses but are not used to train third-party AI models without your consent.
                </p>
                <p>
                  <strong>Content Ownership:</strong> You retain full ownership of all content you create using HELIX, including articles, books, manuscripts, videos, and audio. GoogleHubs does not claim ownership of your user-generated content.
                </p>
                <p>
                  <strong>Movie Studio and Box Office:</strong> When you create movies or host premieres, transaction data (ticket sales, attendee information) is collected for billing and analytics purposes. We do not share your creative content with third parties without permission.
                </p>
                <p>
                  <strong>AI Improvement:</strong> Aggregated, anonymized usage data (not your specific content) may be used to improve HELIX AI features and responses. You can opt-out of this in your account settings.
                </p>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">4. How We Share Your Information</h2>

              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4.1 Service Providers</h3>
                  <p>We share data with trusted third-party vendors who help us operate the platform:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li><strong>Stripe:</strong> Payment processing</li>
                    <li><strong>Supabase:</strong> Database hosting and edge functions</li>
                    <li><strong>Google (Gemini AI):</strong> AI content generation</li>
                    <li><strong>Twilio:</strong> SMS and voice communications</li>
                    <li><strong>Analytics providers:</strong> Usage tracking and insights</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4.2 Business Transfers</h3>
                  <p>If GoogleHubs is involved in a merger, acquisition, or sale of assets, your information may be transferred. You will be notified of any change in ownership.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4.3 Legal Requirements</h3>
                  <p>We may disclose information if required by law, court order, or government request, or to protect the rights, property, or safety of GoogleHubs, our users, or others.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4.4 With Your Consent</h3>
                  <p>We may share information with third parties when you explicitly grant permission (e.g., publishing content to external platforms).</p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">5. Data Security</h2>

              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-100 dark:border-green-500/20">
                  <h4 className="font-bold text-green-900 dark:text-green-300 mb-2">Encryption</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Data encrypted in transit (TLS/SSL) and at rest</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-100 dark:border-green-500/20">
                  <h4 className="font-bold text-green-900 dark:text-green-300 mb-2">Access Controls</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Role-based permissions and authentication</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-100 dark:border-green-500/20">
                  <h4 className="font-bold text-green-900 dark:text-green-300 mb-2">Regular Audits</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Security assessments and vulnerability testing</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-100 dark:border-green-500/20">
                  <h4 className="font-bold text-green-900 dark:text-green-300 mb-2">Secure Infrastructure</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Hosted on enterprise-grade cloud providers</p>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 mt-4">
                No method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">6. Your Rights and Choices</h2>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6.1 Access and Correction</h3>
                  <p>You can access, update, or correct your personal information through your account settings or by contacting support.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6.2 Data Deletion</h3>
                  <p>You can request deletion of your account and associated data. Some information may be retained for legal or legitimate business purposes. Email privacy@googlehubs.com to request deletion.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6.3 Data Export</h3>
                  <p>You can export your data (prospects, contacts, content) in standard formats (CSV, JSON) from your account settings.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6.4 Marketing Communications</h3>
                  <p>You can opt-out of marketing emails by clicking the unsubscribe link in any email or adjusting preferences in your account.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6.5 Cookie Management</h3>
                  <p>You can control cookies through your browser settings. Note that disabling cookies may limit platform functionality.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6.6 Do Not Track</h3>
                  <p>We do not currently respond to Do Not Track signals as there is no industry standard for compliance.</p>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">7. Data Retention</h2>
              <p className="text-slate-700 dark:text-slate-300">
                We retain your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for legal compliance, dispute resolution, and fraud prevention. Backup copies may persist for up to 90 days after deletion.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">8. Children's Privacy</h2>
              <p className="text-slate-700 dark:text-slate-300">
                GoogleHubs is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us at privacy@googlehubs.com.
              </p>
            </section>

            {/* International Users */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">9. International Data Transfers</h2>
              <p className="text-slate-700 dark:text-slate-300">
                GoogleHubs is based in the United States. If you access the platform from outside the U.S., your information will be transferred to, stored, and processed in the U.S. By using our services, you consent to this transfer. We implement appropriate safeguards to protect your data in compliance with applicable laws.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-slate-700 dark:text-slate-300">
                We may update this Privacy Policy from time to time. We will notify you of material changes by email or through the platform. The "Last Updated" date at the top indicates when the policy was last revised. Your continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-500/20">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">11. Contact Us</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <p><strong>Email:</strong> privacy@googlehubs.com</p>
                <p><strong>Support:</strong> support@googlehubs.com</p>
                <p><strong>Data Protection Officer:</strong> dpo@googlehubs.com</p>
                <p><strong>Address:</strong> GoogleHubs, Inc., Privacy Team, [Your Business Address]</p>
              </div>
            </section>

            {/* Specific Disclosures */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">12. Specific State Disclosures</h2>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">California Residents (CCPA/CPRA)</h3>
                  <p>California residents have additional rights under the California Consumer Privacy Act:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Right to know what personal information is collected</li>
                    <li>Right to know if personal information is sold or shared</li>
                    <li>Right to opt-out of sale of personal information (we do not sell)</li>
                    <li>Right to deletion of personal information</li>
                    <li>Right to non-discrimination for exercising privacy rights</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">European Union Residents (GDPR)</h3>
                  <p>EU residents have rights under the General Data Protection Regulation:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>Right of access to your personal data</li>
                    <li>Right to rectification of inaccurate data</li>
                    <li>Right to erasure (right to be forgotten)</li>
                    <li>Right to restriction of processing</li>
                    <li>Right to data portability</li>
                    <li>Right to object to processing</li>
                    <li>Right to withdraw consent</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Back to Top */}
          <div className="mt-16 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
            >
              Back to Top
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-6 mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/terms')}
              className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate('/privacy')}
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400"
            >
              Privacy Policy
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-bold mb-2">© 2025 GoogleHubs. All rights reserved.</p>
          <p className="text-xs text-slate-500 dark:text-slate-500">Built with HELIX AI • Your AI-Powered Business Command Center</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
