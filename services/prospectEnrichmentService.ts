import { generateAIResponse } from './geminiService';

export interface EnrichedContact {
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  emails?: string[];
  additionalPhones?: string[];
}

export interface AIScore {
  overall: number;
  onlinePresence: number;
  websiteQuality: number;
  reviewsReputation: number;
  contactAccessibility: number;
  businessMaturity: number;
  details: string;
  recommendations: string[];
}

export async function enrichContactInfo(
  businessName: string,
  website?: string,
  phone?: string
): Promise<EnrichedContact> {
  const prompt = `You are a contact information researcher. Find social media profiles and contact information for this business:

Business Name: ${businessName}
Website: ${website || 'Not provided'}
Phone: ${phone || 'Not provided'}

Search for their official social media profiles (Facebook, LinkedIn, Instagram, Twitter, YouTube, TikTok).
Also find any additional email addresses or phone numbers.

Return ONLY a JSON object with this structure:
{
  "facebook": "url or null",
  "linkedin": "url or null",
  "instagram": "url or null",
  "twitter": "url or null",
  "youtube": "url or null",
  "tiktok": "url or null",
  "emails": ["email1", "email2"],
  "additionalPhones": ["+1234567890"]
}

Only include real, verified information. If you cannot find something, use null or empty array.`;

  try {
    const response = await generateAIResponse(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error enriching contact info:', error);
  }

  return {};
}

export async function scoreBusinessProfile(
  businessName: string,
  rating?: number,
  totalRatings?: number,
  website?: string,
  phone?: string,
  contactInfo?: EnrichedContact
): Promise<AIScore> {
  const prompt = `You are a business intelligence analyst. Score this business profile on a scale of 0-100:

Business Name: ${businessName}
Google Rating: ${rating || 'N/A'} (${totalRatings || 0} reviews)
Website: ${website || 'None'}
Phone: ${phone || 'None'}
Social Media Profiles: ${JSON.stringify(contactInfo || {})}

Evaluate:
1. Online Presence (social media, website)
2. Website Quality (if available)
3. Reviews & Reputation
4. Contact Accessibility
5. Business Maturity

Return ONLY a JSON object:
{
  "overall": 85,
  "onlinePresence": 90,
  "websiteQuality": 80,
  "reviewsReputation": 95,
  "contactAccessibility": 85,
  "businessMaturity": 75,
  "details": "Brief analysis paragraph",
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

  try {
    const response = await generateAIResponse(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error scoring business:', error);
  }

  return {
    overall: 50,
    onlinePresence: 50,
    websiteQuality: 50,
    reviewsReputation: 50,
    contactAccessibility: 50,
    businessMaturity: 50,
    details: 'Unable to score at this time',
    recommendations: []
  };
}

export async function validateEmail(email: string): Promise<boolean> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  const disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com'];
  const domain = email.split('@')[1];
  if (disposableDomains.includes(domain)) return false;

  return true;
}

export async function validatePhone(phone: string): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

export async function generateGoogleBusinessReport(
  businessName: string,
  rating?: number,
  totalRatings?: number,
  website?: string,
  phone?: string,
  address?: string,
  types?: string[]
): Promise<string> {
  const prompt = `Generate a professional Google Business Profile Report for:

Business Name: ${businessName}
Rating: ${rating || 'N/A'} stars (${totalRatings || 0} reviews)
Website: ${website || 'None'}
Phone: ${phone || 'None'}
Address: ${address || 'Not provided'}
Business Types: ${types?.join(', ') || 'Not specified'}

Create a comprehensive report including:
1. Executive Summary
2. Current Profile Analysis
3. Review Performance Metrics
4. Strengths & Weaknesses
5. Optimization Recommendations
6. Competitive Positioning
7. Action Items

Format as a professional business report with clear sections and actionable insights.`;

  try {
    return await generateAIResponse(prompt);
  } catch (error) {
    console.error('Error generating Google Business report:', error);
    return 'Unable to generate report at this time.';
  }
}

export async function generateAIAuditReport(
  businessName: string,
  website: string,
  businessTypes?: string[]
): Promise<string> {
  const prompt = `Generate a comprehensive AI Opportunity Audit Report for:

Business Name: ${businessName}
Website: ${website}
Industry: ${businessTypes?.join(', ') || 'General'}

Analyze how AI can improve their business in these areas:
1. Customer Service & Support (AI Chatbots, Virtual Assistants)
2. Marketing & Content (AI Content Generation, Personalization)
3. Operations & Automation (Workflow Automation, Process Optimization)
4. Sales & Lead Generation (Lead Scoring, Predictive Analytics)
5. Data Analysis & Insights (Business Intelligence, Trend Analysis)

For each area:
- Current state assessment
- AI solution recommendations
- Expected ROI and benefits
- Implementation complexity (Low/Medium/High)
- Estimated timeline

Include:
- Executive Summary
- Detailed AI Opportunity Analysis
- Technology Stack Recommendations
- Implementation Roadmap
- Cost-Benefit Analysis
- Next Steps

Format as a professional consulting report with actionable recommendations.`;

  try {
    return await generateAIResponse(prompt);
  } catch (error) {
    console.error('Error generating AI audit report:', error);
    return 'Unable to generate AI audit at this time.';
  }
}
