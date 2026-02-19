import React from 'react';
import { useNavigate } from 'react-router-dom';
import HelixLogo from './HelixLogo';

const TermsOfService: React.FC = () => {
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
            <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Last Updated: February 17, 2026</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-white/5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Agreement to Terms</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Welcome to GoogleHubs. These Terms of Service constitute a legally binding agreement between you and GoogleHubs, Inc. governing your use of the GoogleHubs platform, including the HELIX AI Assistant, content creation tools, CRM, prospecting features, automation workflows, and all related services.
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                By accessing or using GoogleHubs, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the platform.
              </p>
            </section>

            {/* Definitions */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">1. Definitions</h2>
              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <p><strong>"Platform"</strong> refers to the GoogleHubs website, web application, mobile applications, and all related services.</p>
                <p><strong>"HELIX"</strong> refers to the AI Assistant and related AI-powered features integrated into the platform.</p>
                <p><strong>"Content"</strong> includes all data, text, images, videos, audio, code, and other materials created, uploaded, or generated through the platform.</p>
                <p><strong>"User," "You," "Your"</strong> refers to the individual or entity using the platform.</p>
                <p><strong>"We," "Us," "Our"</strong> refers to GoogleHubs, Inc.</p>
                <p><strong>"Subscription"</strong> refers to your paid plan (Starter, Professional, or Enterprise).</p>
              </div>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">2. Eligibility</h2>
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                <p>You must be at least 18 years old to use GoogleHubs. By using the platform, you represent and warrant that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You are at least 18 years of age</li>
                  <li>You have the legal capacity to enter into binding contracts</li>
                  <li>You will provide accurate and complete registration information</li>
                  <li>You will maintain the security of your account credentials</li>
                  <li>You will comply with all applicable laws and regulations</li>
                  <li>You are not prohibited from using the platform under U.S. or other applicable law</li>
                </ul>
              </div>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">3. Account Registration and Security</h2>
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3.1 Account Creation</h3>
                  <p>You must create an account to access most features. You agree to provide accurate, current, and complete information during registration and to update this information as needed.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3.2 Account Security</h3>
                  <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access or security breach. We are not liable for any loss or damage from your failure to protect your account.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3.3 One Account Per User</h3>
                  <p>You may not create multiple accounts to circumvent restrictions or abuse the platform. Duplicate accounts may be terminated without notice.</p>
                </div>
              </div>
            </section>

            {/* Subscriptions and Billing */}
            <section className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-500/20">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">4. Subscriptions and Billing</h2>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4.1 Subscription Plans</h3>
                  <p>GoogleHubs offers multiple subscription tiers:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li><strong>Starter:</strong> $97/month or $970/year ($81/month)</li>
                    <li><strong>Professional:</strong> $197/month or $1,970/year ($164/month)</li>
                    <li><strong>Enterprise:</strong> $497/month or $4,970/year ($414/month)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4.2 Free Trial</h3>
                  <p>New users receive a 3-day free trial. You must provide payment information to start the trial. If you do not cancel before the trial ends, your subscription will automatically begin, and you will be charged.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4.3 Billing Cycle</h3>
                  <p>Subscriptions are billed monthly or annually in advance. Billing occurs on the same day each cycle. You authorize us to charge your payment method automatically.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4.4 Payment Processing</h3>
                  <p>Payments are processed securely through Stripe. We do not store your full credit card information. You are responsible for all charges incurred under your account.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4.5 Price Changes</h3>
                  <p>We may change subscription prices with 30 days notice. Price changes apply to subsequent billing cycles. You may cancel if you do not agree to the new pricing.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4.6 Refund Policy</h3>
                  <p>Subscriptions are non-refundable except as required by law. If you cancel during the trial period, you will not be charged. For billing errors or technical issues preventing service access, contact support@googlehubs.com.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4.7 Cancellation</h3>
                  <p>You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. You will retain access until then. No partial refunds for unused time.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4.8 Failed Payments</h3>
                  <p>If payment fails, we will attempt to collect payment for up to 7 days. If unsuccessful, your account may be downgraded or suspended. You remain responsible for unpaid fees.</p>
                </div>
              </div>
            </section>

            {/* Use of Platform */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">5. Use of Platform and Services</h2>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">5.1 License Grant</h3>
                  <p>We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the platform for your internal business purposes, subject to these Terms.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">5.2 Acceptable Use</h3>
                  <p>You agree not to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Violate any laws, regulations, or third-party rights</li>
                    <li>Use the platform for illegal, fraudulent, or harmful activities</li>
                    <li>Transmit spam, viruses, malware, or other malicious code</li>
                    <li>Interfere with or disrupt the platform's operation or servers</li>
                    <li>Attempt to gain unauthorized access to any part of the platform</li>
                    <li>Scrape, crawl, or harvest data without permission</li>
                    <li>Reverse engineer, decompile, or disassemble the platform</li>
                    <li>Remove or modify any proprietary notices or labels</li>
                    <li>Impersonate any person or entity</li>
                    <li>Use the platform to compete with GoogleHubs</li>
                    <li>Resell or redistribute the platform without authorization</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">5.3 Usage Limits</h3>
                  <p>Your subscription includes specific usage limits (prospects, AI tokens, storage, emails, SMS). Exceeding these limits may result in additional charges or service restrictions. Monitor your usage in the dashboard.</p>
                </div>
              </div>
            </section>

            {/* HELIX AI and Content */}
            <section className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-8 border border-purple-100 dark:border-purple-500/20">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">6. HELIX AI Assistant and Content Creation</h2>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6.1 AI-Generated Content</h3>
                  <p>HELIX uses artificial intelligence to generate content based on your inputs. AI-generated content may not always be accurate, complete, or suitable for your purposes. You are responsible for reviewing and validating all AI-generated content before use.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6.2 Content Ownership</h3>
                  <p>You retain ownership of all content you create or upload to the platform, including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Articles, blog posts, and written content</li>
                    <li>Books, manuscripts, and children's books</li>
                    <li>Videos and movies created with Movie Studio</li>
                    <li>Audio content and voiceovers</li>
                    <li>Prospect data, CRM information, and business records</li>
                  </ul>
                  <p className="mt-2">GoogleHubs does not claim ownership of your content. You grant us a limited license to host, store, and process your content to provide the services.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6.3 Content Responsibility</h3>
                  <p>You are solely responsible for your content and its legal compliance. You represent and warrant that your content:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Does not infringe on intellectual property rights</li>
                    <li>Complies with all applicable laws</li>
                    <li>Is not defamatory, obscene, or illegal</li>
                    <li>Does not contain viruses or malicious code</li>
                    <li>Is accurate and not misleading</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6.4 Movie Studio and Box Office</h3>
                  <p>When using Movie Studio to convert books or scripts into movies and selling tickets through Box Office:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>You own the resulting movies and can monetize them</li>
                    <li>We process ticket sales and take a platform fee (disclosed at time of sale)</li>
                    <li>You are responsible for content rights and licensing</li>
                    <li>You must comply with copyright laws for music, images, and other third-party content</li>
                    <li>Refund requests from ticket buyers are handled per our refund policy</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">6.5 AI Model Training</h3>
                  <p>We do not use your specific content to train third-party AI models without your consent. Aggregated, anonymized usage data may be used to improve HELIX features. You can opt-out in your settings.</p>
                </div>
              </div>
            </section>

            {/* Prospecting and Data */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">7. Prospecting and Data Enrichment</h2>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">7.1 Data Sources</h3>
                  <p>Our prospecting features pull data from Google Places, LinkedIn, Facebook, and other public sources. You agree to use this data in compliance with:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Google's Terms of Service</li>
                    <li>LinkedIn's User Agreement</li>
                    <li>Facebook's Platform Terms</li>
                    <li>CAN-SPAM Act for email marketing</li>
                    <li>TCPA for SMS and phone calls</li>
                    <li>GDPR and other privacy regulations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">7.2 Responsible Use</h3>
                  <p>When contacting prospects, you must:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Provide accurate sender information</li>
                    <li>Include clear opt-out mechanisms</li>
                    <li>Honor opt-out requests promptly</li>
                    <li>Avoid harassment or excessive messaging</li>
                    <li>Respect business hours and time zones</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">7.3 Data Accuracy</h3>
                  <p>We strive for data accuracy but do not guarantee that prospect information is current, complete, or error-free. Verify critical information independently.</p>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">8. Intellectual Property Rights</h2>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">8.1 Our IP</h3>
                  <p>The platform, including all code, designs, logos, trademarks, and proprietary features, is owned by GoogleHubs and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or create derivative works without permission.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">8.2 Your IP</h3>
                  <p>You retain all rights to your content. By using the platform, you grant us a worldwide, non-exclusive, royalty-free license to use, store, reproduce, and display your content solely to provide the services.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">8.3 Feedback</h3>
                  <p>If you provide feedback, suggestions, or ideas about the platform, you grant us the right to use them without compensation or attribution.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">8.4 DMCA Policy</h3>
                  <p>We respect intellectual property rights. If you believe content on the platform infringes your copyright, contact dmca@googlehubs.com with:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Description of the copyrighted work</li>
                    <li>Location of the infringing material</li>
                    <li>Your contact information</li>
                    <li>Statement of good faith belief</li>
                    <li>Statement under penalty of perjury</li>
                    <li>Physical or electronic signature</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Third Party Services */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">9. Third-Party Services and Integrations</h2>
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                <p>The platform integrates with third-party services including:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Google Workspace (Calendar, Gmail, Drive, Docs, Sheets)</li>
                  <li>Stripe for payment processing</li>
                  <li>Twilio for SMS and voice</li>
                  <li>Social media platforms (LinkedIn, Facebook)</li>
                </ul>
                <p className="mt-3">Your use of these services is subject to their respective terms. We are not responsible for third-party services or their availability. If a third-party service discontinues or changes, we may remove the integration without liability.</p>
              </div>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">10. Privacy and Data Protection</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Our Privacy Policy explains how we collect, use, and protect your information. By using the platform, you consent to our privacy practices as described in the Privacy Policy. For healthcare users, we implement HIPAA-compliant safeguards for protected health information.
              </p>
              <button
                onClick={() => navigate('/privacy')}
                className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
              >
                Read Privacy Policy
              </button>
            </section>

            {/* Disclaimers */}
            <section className="bg-yellow-50 dark:bg-yellow-950/30 rounded-2xl p-8 border border-yellow-100 dark:border-yellow-500/20">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">11. Disclaimers and Limitations</h2>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">11.1 AS-IS Basis</h3>
                  <p className="uppercase font-bold">
                    THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">11.2 No Guarantee of Results</h3>
                  <p>We do not guarantee that the platform will meet your requirements, be uninterrupted, secure, or error-free. AI-generated content may contain inaccuracies. Results may vary by user.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">11.3 Not Professional Advice</h3>
                  <p>The platform does not provide legal, financial, medical, or professional advice. Consult qualified professionals for specific advice. HELIX AI responses are for informational purposes only.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">11.4 Third-Party Content</h3>
                  <p>We are not responsible for third-party content, links, or services accessible through the platform.</p>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">12. Limitation of Liability</h2>
              <div className="space-y-3 text-slate-700 dark:text-slate-300">
                <p className="uppercase font-bold">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, GOOGLEHUBS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE, WHETHER IN CONTRACT, TORT, OR OTHERWISE, ARISING FROM YOUR USE OF THE PLATFORM.
                </p>
                <p className="uppercase font-bold mt-3">
                  OUR TOTAL LIABILITY FOR ALL CLAIMS RELATED TO THE PLATFORM SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
                </p>
                <p className="mt-3">
                  Some jurisdictions do not allow limitations on implied warranties or liability for incidental damages. These limitations may not apply to you.
                </p>
              </div>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">13. Indemnification</h2>
              <p className="text-slate-700 dark:text-slate-300">
                You agree to indemnify, defend, and hold harmless GoogleHubs, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, costs, or expenses (including attorney fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4 mt-3">
                <li>Your use or misuse of the platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your content or conduct</li>
                <li>Your breach of any representations or warranties</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">14. Termination</h2>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">14.1 By You</h3>
                  <p>You may cancel your account at any time from your account settings. Cancellation takes effect at the end of your billing period.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">14.2 By Us</h3>
                  <p>We may suspend or terminate your account immediately if:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>You violate these Terms</li>
                    <li>Your payment fails</li>
                    <li>You engage in fraudulent or illegal activity</li>
                    <li>Your use harms the platform or other users</li>
                    <li>We discontinue the platform (with 30 days notice)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">14.3 Effect of Termination</h3>
                  <p>Upon termination, your access ends immediately. You remain liable for all charges incurred before termination. We may delete your data after 90 days. Export your data before canceling.</p>
                </div>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">15. Dispute Resolution</h2>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">15.1 Informal Resolution</h3>
                  <p>If you have a dispute, contact support@googlehubs.com first. We will attempt to resolve disputes informally within 30 days.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">15.2 Binding Arbitration</h3>
                  <p>If informal resolution fails, disputes will be resolved through binding arbitration under the rules of the American Arbitration Association. Arbitration will be conducted individually, not as a class action. The arbitrator's decision is final and enforceable in court.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">15.3 Governing Law</h3>
                  <p>These Terms are governed by the laws of the State of Delaware, without regard to conflict of law principles. Any court proceedings will be conducted in Delaware.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">15.4 Class Action Waiver</h3>
                  <p className="uppercase font-bold">YOU AGREE THAT DISPUTES WILL BE RESOLVED INDIVIDUALLY. YOU WAIVE THE RIGHT TO PARTICIPATE IN CLASS ACTIONS, CLASS ARBITRATIONS, OR REPRESENTATIVE ACTIONS.</p>
                </div>
              </div>
            </section>

            {/* General Provisions */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">16. General Provisions</h2>

              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">16.1 Entire Agreement</h3>
                  <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and GoogleHubs.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">16.2 Modifications</h3>
                  <p>We may update these Terms at any time. Material changes will be notified via email or platform notice 30 days in advance. Continued use after changes constitutes acceptance.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">16.3 Severability</h3>
                  <p>If any provision is found invalid or unenforceable, the remaining provisions remain in effect.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">16.4 No Waiver</h3>
                  <p>Our failure to enforce any provision does not waive our right to enforce it later.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">16.5 Assignment</h3>
                  <p>You may not assign these Terms without our consent. We may assign these Terms to any affiliate or successor.</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">16.6 Force Majeure</h3>
                  <p>We are not liable for delays or failures due to causes beyond our reasonable control (natural disasters, government actions, internet outages, etc.).</p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-500/20">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">17. Contact Information</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                For questions about these Terms of Service, please contact:
              </p>
              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <p><strong>Email:</strong> legal@googlehubs.com</p>
                <p><strong>Support:</strong> support@googlehubs.com</p>
                <p><strong>Address:</strong> GoogleHubs, Inc., Legal Department, [Your Business Address]</p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-white/5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Acknowledgment</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                By using GoogleHubs, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these Terms, you must discontinue use of the platform immediately.
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
                Thank you for choosing GoogleHubs. We are committed to providing you with powerful tools to grow your business.
              </p>
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
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate('/privacy')}
              className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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

export default TermsOfService;
