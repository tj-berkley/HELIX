import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, MapPin, Phone, Globe, Mail,
  Facebook, Linkedin, Instagram, Twitter, Youtube,
  FileText, Zap, Pin, PinOff, Download, Share2,
  CheckCircle, XCircle, Loader, ExternalLink
} from 'lucide-react';
import {
  enrichContactInfo,
  scoreBusinessProfile,
  validateEmail,
  validatePhone,
  generateGoogleBusinessReport,
  generateAIAuditReport,
  type EnrichedContact,
  type AIScore
} from '../services/prospectEnrichmentService';

interface Prospect {
  id: string;
  place_id: string;
  business_name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  total_ratings?: number;
  types?: string[];
  contact_info?: EnrichedContact;
  ai_score?: number;
  ai_score_details?: AIScore;
  is_pinned: boolean;
  email_valid?: boolean;
  phone_valid?: boolean;
}

interface Report {
  id: string;
  report_type: 'google_business' | 'ai_audit';
  report_data: { content: string };
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export default function ProspectDetail() {
  const { prospectId } = useParams<{ prospectId: string }>();
  const navigate = useNavigate();

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [generatingReport, setGeneratingReport] = useState<'google_business' | 'ai_audit' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProspect();
    loadReports();
  }, [prospectId]);

  async function loadProspect() {
    try {
      setLoading(true);
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/prospects-api/prospects/${prospectId}`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load prospect');
      const data = await response.json();
      setProspect(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prospect');
    } finally {
      setLoading(false);
    }
  }

  async function loadReports() {
    try {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/prospects-api/prospects/${prospectId}/reports`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  }

  async function enrichProspect() {
    if (!prospect) return;

    try {
      setEnriching(true);

      const contactInfo = await enrichContactInfo(
        prospect.business_name,
        prospect.website,
        prospect.phone
      );

      const aiScore = await scoreBusinessProfile(
        prospect.business_name,
        prospect.rating,
        prospect.total_ratings,
        prospect.website,
        prospect.phone,
        contactInfo
      );

      let emailValid = undefined;
      let phoneValid = undefined;

      if (contactInfo.emails && contactInfo.emails.length > 0) {
        emailValid = await validateEmail(contactInfo.emails[0]);
      }

      if (prospect.phone) {
        phoneValid = await validatePhone(prospect.phone);
      }

      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/prospects-api/prospects/${prospectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contact_info: contactInfo,
          ai_score: aiScore.overall,
          ai_score_details: aiScore,
          email_valid: emailValid,
          phone_valid: phoneValid
        })
      });

      if (!response.ok) throw new Error('Failed to update prospect');

      await loadProspect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enrich prospect');
    } finally {
      setEnriching(false);
    }
  }

  async function togglePin() {
    if (!prospect) return;

    try {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/prospects-api/prospects/${prospectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_pinned: !prospect.is_pinned })
      });

      if (!response.ok) throw new Error('Failed to toggle pin');
      await loadProspect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pin status');
    }
  }

  async function generateReport(type: 'google_business' | 'ai_audit') {
    if (!prospect) return;

    try {
      setGeneratingReport(type);

      let reportContent = '';

      if (type === 'google_business') {
        reportContent = await generateGoogleBusinessReport(
          prospect.business_name,
          prospect.rating,
          prospect.total_ratings,
          prospect.website,
          prospect.phone,
          prospect.address,
          prospect.types
        );
      } else {
        if (!prospect.website) {
          throw new Error('Website URL is required for AI audit');
        }
        reportContent = await generateAIAuditReport(
          prospect.business_name,
          prospect.website,
          prospect.types
        );
      }

      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/prospects-api/prospects/${prospectId}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          report_type: type,
          report_data: { content: reportContent },
          status: 'completed'
        })
      });

      if (!response.ok) throw new Error('Failed to save report');

      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGeneratingReport(null);
    }
  }

  function downloadReport(report: Report) {
    const blob = new Blob([report.report_data.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prospect?.business_name}_${report.report_type}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function shareReport(report: Report) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${prospect?.business_name} - ${report.report_type} Report`,
          text: report.report_data.content
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(report.report_data.content);
      alert('Report copied to clipboard!');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">Prospect not found</p>
          <button
            onClick={() => navigate('/prospecting')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Prospecting
          </button>
        </div>
      </div>
    );
  }

  const scoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/prospecting')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Prospecting
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {prospect.business_name}
                </h1>
                {prospect.types && prospect.types.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {prospect.types.slice(0, 3).map((type, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {type.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={togglePin}
                className={`p-2 rounded-lg transition-colors ${
                  prospect.is_pinned
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {prospect.is_pinned ? <Pin className="w-5 h-5" /> : <PinOff className="w-5 h-5" />}
              </button>
            </div>

            {prospect.rating && (
              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                <span className="text-lg font-semibold">{prospect.rating}</span>
                <span className="text-gray-500 ml-2">
                  ({prospect.total_ratings} reviews)
                </span>
              </div>
            )}

            <div className="space-y-3">
              {prospect.address && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <span className="text-gray-700">{prospect.address}</span>
                </div>
              )}

              {prospect.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{prospect.phone}</span>
                  {prospect.phone_valid !== undefined && (
                    prospect.phone_valid ? (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 ml-2" />
                    )
                  )}
                </div>
              )}

              {prospect.website && (
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-3" />
                  <a
                    href={prospect.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    {prospect.website}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>

            {!prospect.contact_info && (
              <button
                onClick={enrichProspect}
                disabled={enriching}
                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {enriching ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Enriching Data...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Enrich Contact & Score Profile
                  </>
                )}
              </button>
            )}
          </div>

          {prospect.contact_info && Object.keys(prospect.contact_info).length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>

              <div className="space-y-3">
                {prospect.contact_info.emails && prospect.contact_info.emails.length > 0 && (
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-500 mb-2">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Addresses
                    </div>
                    {prospect.contact_info.emails.map((email, idx) => (
                      <div key={idx} className="ml-6 flex items-center">
                        <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
                          {email}
                        </a>
                        {idx === 0 && prospect.email_valid !== undefined && (
                          prospect.email_valid ? (
                            <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 ml-2" />
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  {prospect.contact_info.facebook && (
                    <a
                      href={prospect.contact_info.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-blue-600"
                    >
                      <Facebook className="w-5 h-5 mr-2" />
                      Facebook
                    </a>
                  )}

                  {prospect.contact_info.linkedin && (
                    <a
                      href={prospect.contact_info.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-blue-700"
                    >
                      <Linkedin className="w-5 h-5 mr-2" />
                      LinkedIn
                    </a>
                  )}

                  {prospect.contact_info.instagram && (
                    <a
                      href={prospect.contact_info.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-pink-600"
                    >
                      <Instagram className="w-5 h-5 mr-2" />
                      Instagram
                    </a>
                  )}

                  {prospect.contact_info.twitter && (
                    <a
                      href={prospect.contact_info.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-blue-400"
                    >
                      <Twitter className="w-5 h-5 mr-2" />
                      Twitter
                    </a>
                  )}

                  {prospect.contact_info.youtube && (
                    <a
                      href={prospect.contact_info.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-red-600"
                    >
                      <Youtube className="w-5 h-5 mr-2" />
                      YouTube
                    </a>
                  )}
                </div>
              </div>

              <button
                onClick={enrichProspect}
                disabled={enriching}
                className="mt-6 w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center text-sm"
              >
                {enriching ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Refreshing...
                  </>
                ) : (
                  'Refresh Contact Info'
                )}
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Reports</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => generateReport('google_business')}
                disabled={generatingReport !== null}
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-4 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {generatingReport === 'google_business' ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Google Business Report
                  </>
                )}
              </button>

              <button
                onClick={() => generateReport('ai_audit')}
                disabled={generatingReport !== null || !prospect.website}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {generatingReport === 'ai_audit' ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    AI Audit Report
                  </>
                )}
              </button>
            </div>

            {!prospect.website && (
              <p className="text-sm text-yellow-600 mt-2">
                AI Audit requires a website URL
              </p>
            )}

            {reports.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Generated Reports</h3>
                {reports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {report.report_type === 'google_business'
                          ? 'Google Business Profile Report'
                          : 'AI Audit Report'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => downloadReport(report)}
                        className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center text-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={() => shareReport(report)}
                        className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center text-sm"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {prospect.ai_score_details && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">AI Profile Score</h2>

              <div className="text-center mb-6">
                <div className={`text-6xl font-bold ${scoreColor(prospect.ai_score)}`}>
                  {prospect.ai_score}
                </div>
                <div className="text-gray-500 text-sm mt-1">Out of 100</div>
              </div>

              <div className="space-y-3">
                <ScoreBar
                  label="Online Presence"
                  score={prospect.ai_score_details.onlinePresence}
                />
                <ScoreBar
                  label="Website Quality"
                  score={prospect.ai_score_details.websiteQuality}
                />
                <ScoreBar
                  label="Reviews & Reputation"
                  score={prospect.ai_score_details.reviewsReputation}
                />
                <ScoreBar
                  label="Contact Accessibility"
                  score={prospect.ai_score_details.contactAccessibility}
                />
                <ScoreBar
                  label="Business Maturity"
                  score={prospect.ai_score_details.businessMaturity}
                />
              </div>

              {prospect.ai_score_details.details && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{prospect.ai_score_details.details}</p>
                </div>
              )}

              {prospect.ai_score_details.recommendations &&
               prospect.ai_score_details.recommendations.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                  <ul className="space-y-2">
                    {prospect.ai_score_details.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex">
                        <span className="text-blue-600 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const getColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold">{score}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getColor()} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
