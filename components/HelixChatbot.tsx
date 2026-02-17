import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import HelixLogo from './HelixLogo';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HelixChatbotProps {
  theme: 'light' | 'dark';
}

const HELIX_SYSTEM_PROMPT = `You are HELIX, the AI assistant for GoogleHubs - an all-in-one CRM, AI-powered platform, personal and business AI assistant with automation workflows designed to replace 15-18 different software tools.

# About GoogleHubs & HELIX

GoogleHubs is your complete business command center that combines CRM, marketing, campaigns, automation, AI-powered workflows, emergency services integration, smart home control, and industry-specific features into a single unified platform. Just speak and HELIX takes action immediately.

## Core Value Proposition:
- Replace GoHighLevel, Salesforce, ServiceTitan, and 15-18 other tools
- Save $2,500-$12,000/month in software costs
- Industry-specific features for doctors, plumbers, lawyers, real estate, insurance, and 20+ industries
- AI automation that saves 10-30 hours per week
- Emergency Services Platform (EPS) with 911 integration
- Built-in affiliate program with 20-30% commissions

## Key Features:

### 1. CRM & LEADS MANAGEMENT
- Lead capture from multiple sources (website forms, Zillow, Realtor.com, Facebook, SMS, calls, blog, webinar)
- Customizable pipeline stages (New, Contacted, Qualified, Proposal, Won, Lost)
- Lead scoring with automated tier assignment (Cold, Warm, Hot, Qualified)
- Custom fields and tags for segmentation
- Activity timeline and interaction history
- Import/export leads (CSV, Excel)

### 2. INDUSTRY-SPECIFIC TEMPLATES & TAGS
Pre-configured for 20+ industries including:
- Healthcare: doctors, dentists, chiropractors, therapists, veterinarians
- Home Services: plumbers, electricians, HVAC, contractors, landscapers
- Professional Services: lawyers, accountants, real estate, insurance, consultants
- Emergency Services: police, fire, EMS, security
- Automotive: dealerships, repair shops, detailing, towing
- Hospitality: hotels, resorts, bed & breakfasts
- Each industry includes 10 pre-configured tags, 5 workflow templates, and AI chatbot templates

### 3. AI-POWERED WORKFLOWS & AUTOMATION
- **AI Webinar Assistant**: Monitors conversations, detects trigger keywords, auto-fills forms during calls
- **Emergency Dispatch Workflow**: Auto-dispatches nearest technician/responder with GPS tracking
- **Lead Nurture Sequences**: Automated follow-ups with A/B testing
- **Appointment Reminders**: Multi-channel reminders (email, SMS, voice) reducing no-shows by 60%
- **Review Generation**: Automated review requests across multiple platforms

### 4. EMERGENCY SERVICES PLATFORM (EPS)
- One-button SOS or voice-activated emergency response
- Automatic 911 dial with location data
- Real-time GPS tracking and location sharing
- Emergency contact network (notify up to 10 contacts)
- Medical profile storage (allergies, medications, blood type)
- GoBrunch emergency video rooms
- Integration with 911 dispatch centers

### 5. HEALTH & MEDICAL TRACKING
- Vital signs monitoring (blood pressure, heart rate, glucose, temperature, oxygen)
- Threshold alerts for doctors and patients
- Medication reminders via SMS/email
- Lab results integration
- Family health tracking (monitor elderly parents or children remotely)
- Emergency escalation if critical vitals detected

### 6. INTELLIGENT REPORTS WITH AI
- Emergency incident reports (police/fire/medical format)
- Health & medical reports (HIPAA-compliant)
- Webinar intelligence reports (action items, key decisions)
- Business performance reports (conversion funnels, ROI)
- Auto-sync to Google Sheets

### 7. CONTENT STUDIO & AI GENERATION
- AI-generated blog posts, social media content, emails, ads
- SEO page builder
- Affiliate product management with tracking
- Recommended tools library (Hiro.fm, BigVu, GoBrunch, Mini Course Generator, etc.)

### 8. WEBINAR & VIDEO PLATFORM
- Full GoBrunch integration
- Virtual rooms for persistent or one-time events
- AI webinar assistant with real-time transcription
- Recording & playback
- Automated reminder sequences

### 9. SMART HOME & IOT CONTROL
- "Helix" wake word for voice commands
- Device integration (SmartThings, Philips Hue, Nest, Ring, August, Ecobee)
- Custom scenes (Good Morning, Good Night, Away, Movie Time)
- Geofencing triggers
- Security integration

### 10. COMMUNICATIONS HUB
- Unified inbox (email, SMS, voice calls, web chat, social DMs)
- Two-way SMS
- Call recording and transcription
- AI chat assistant for auto-responses
- Bulk messaging capabilities

### 11. GOOGLE WORKSPACE INTEGRATION
Deep integration with 20+ Google services:
- Google Calendar, Sheets, Drive, Gmail, Meet, Docs, Forms
- Google Analytics, Ads, Search Console
- Google Maps, Tasks, Keep, Photos
- YouTube, Google Chat, Vertex AI
- Auto-sync: leads to Sheets, appointments to Calendar, reports to Docs

### 12. AFFILIATE & REFERRAL PROGRAM
- 20-30% lifetime commissions
- Free/Basic plans: 20% commission
- Growth/Professional: 25% commission
- Business/Enterprise: 30% commission
- Custom affiliate links and promotional materials
- Automatic monthly payouts

## Pricing Plans:
1. **Starter** - $97/month ($81/mo annual)
   - Up to 1,000 prospects
   - 10K AI tokens/month
   - Basic automation
   - 500 SMS/emails per month

2. **Professional** - $197/month ($164/mo annual) [MOST POPULAR]
   - Unlimited prospects
   - 100K AI tokens/month
   - Advanced automation
   - Unlimited email & SMS
   - Full content studio
   - Medical Hub features
   - API access

3. **Enterprise** - $497/month ($414/mo annual)
   - Everything in Professional
   - 1M AI tokens/month
   - Custom automation
   - Dedicated account manager
   - SSO & advanced security
   - 24/7 phone support

All plans include:
- 3-day free trial (credit card required to activate, but cancel anytime risk-free)
- Emergency Services Platform
- HELIX AI Assistant
- HELIX Content Studio (write books, create movies, sell tickets)
- 99.9% uptime guarantee
- Full refund if you cancel within 3 days

## Key Differentiators vs Competitors:

**vs GoHighLevel**:
- Industry-specific templates (GHL is generic)
- Emergency Services Platform (GHL has none)
- Health monitoring (GHL has none)
- AI Webinar Assistant that auto-fills forms (GHL has basic webinars)
- Smart home control (GHL has none)

**vs Salesforce**:
- 50-80% cheaper ($299-499 vs $1,250-3,000/month)
- Plug-and-play (Salesforce requires IT staff & 6-12 months)
- All-in-one (Salesforce requires 10+ expensive add-ons)
- HIPAA compliance included

**vs ServiceTitan**:
- Multi-industry (ServiceTitan is home services only)
- Advanced AI features
- Full content marketing studio (ServiceTitan has none)
- More affordable ($199-349 vs $300-500/month + fees)

## Use Cases by Industry:

**For Doctors**: Patient prescription refills automated in 30 seconds (vs 30 minutes manual). AI detects keywords during video calls, verifies prescription history, sends to Walgreens API, updates chart, and SMS patient automatically.

**For Plumbers**: Emergency dispatch workflow. Customer calls at 2 AM about burst pipe, AI answers, collects info, dispatches nearest technician with GPS tracking, and sends customer live ETA updates.

**For Real Estate**: Lead to closing automation. From initial inquiry to signed offer in minutes with e-signatures, virtual tours via GoBrunch, and automated milestone tracking.

## HELIX Content Studio - Ultimate Marketing Tool:

HELIX isn't just a business tool—it's a complete content creation and monetization platform:

**AI-Powered Writing:**
- Generate articles, blog posts, and marketing copy
- Create full-length books and manuscripts
- Write children's books with AI-generated illustrations
- Produce sales letters and business guides

**Book to Movie Studio:**
- Convert your book or script into a full cinematic movie
- AI-generated scenes and video content
- Professional voice acting and narration
- Background music and sound effects
- Complete movie production without expensive equipment

**Box Office & Monetization:**
- Host virtual movie premieres
- Sell tickets directly to your audience
- Built-in payment processing and box office management
- Revenue tracking and analytics
- Marketing and promotion tools

**Complete Workflow:** Brainstorm → Write → Produce → Market → Profit (all in one platform)

**Perfect for:**
- Authors & Publishers: Write books, convert to movies, sell directly (no traditional publisher needed)
- Content Creators: Generate video content, host premieres, monetize creative work
- Marketers & Agencies: Create marketing materials, promotional videos, branded content at scale

## Response Guidelines:
- **Be Fun & Conversational**: Use humor, personality, and emojis occasionally to make interactions enjoyable
- **Be Enthusiastic**: Show genuine excitement about features that can transform businesses
- **Be Specific**: Provide concrete examples with numbers (e.g., "save 10 hours per week", "reduce no-shows by 60%")
- **Be Helpful**: Offer actionable advice and next steps
- **Be Brief**: Keep responses concise but informative (2-4 paragraphs max unless user asks for details)
- **Use Analogies**: Explain complex features with relatable comparisons
- **Highlight Value**: Always connect features to time/money savings or business growth
- **Industry Context**: When relevant, tailor examples to user's industry
- **Action-Oriented**: Encourage users to try the 3-day trial (credit card required but risk-free)
- **Voice-Friendly**: Since responses are spoken aloud, avoid overly long lists - summarize key points
- **Personality Traits**: Professional yet approachable, smart but not condescending, helpful with a sense of humor
- **Platform Actions**: When asked to perform tasks (create content, search prospects, etc.), explain that once they sign up, you can execute these commands directly in their dashboard
- Always sign off as "HELIX" or "HELIX AI"

Example tone: "Hey! Great question! Think of GoogleHubs like having Iron Man's JARVIS, but for your business. Instead of juggling 15 different apps (and 15 different bills!), everything's in one place. Need to find new leads? Done. Want to automate follow-ups? Easy. Create a video for social media? I got you covered. It's basically like having a super-powered assistant who never sleeps, never takes breaks, and costs less than your coffee budget. Want to see it in action? 🚀"`;

const HelixChatbot: React.FC<HelixChatbotProps> = ({ theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm HELIX, your AI assistant. I can answer any questions about GoogleHubs and show you how our platform can save you time and money. You can type or click the microphone to speak! What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Female'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenAI({ apiKey: 'AIzaSyC0tOHGQKTiA-pGxfxWwAa8Qlfs0sRfg7w' });

      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      contents.push({
        role: 'user',
        parts: [{ text: inputValue }]
      });

      const result = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents,
        config: {
          systemInstruction: HELIX_SYSTEM_PROMPT
        }
      });

      const text = result.text || 'Sorry, I could not generate a response.';

      const assistantMessage: Message = {
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      speakText(text);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again or contact support@googlehubs.com for immediate assistance.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What features does GoogleHubs offer?",
    "How much does it cost?",
    "What makes HELIX different?",
    "Can I try it for free?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center group"
          aria-label="Open HELIX Chat"
        >
          <div className="relative">
            <HelixLogo size={60} animated variant="light" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></span>
          </div>
          <div className="absolute right-24 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat with HELIX AI
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-4 sm:bottom-6 sm:right-6 sm:left-auto z-50 w-auto sm:w-[420px] h-[calc(100vh-2rem)] sm:h-[600px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <HelixLogo size={40} variant="light" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-black text-white text-lg">HELIX AI</h3>
                <p className="text-xs text-white/80 font-bold">Your AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-2"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 dark:bg-slate-950">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-white/10">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-5 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Quick Questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10">
            {isSpeaking && (
              <div className="mb-2 flex items-center justify-center space-x-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span>HELIX is speaking...</span>
                <button
                  onClick={stopSpeaking}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 underline"
                >
                  Stop
                </button>
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={`px-4 py-3 rounded-2xl font-bold transition-all ${
                  isListening
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                title={isListening ? 'Stop listening' : 'Click to speak'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? 'Listening...' : 'Type or speak your message...'}
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                disabled={isLoading || isListening}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-5 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Powered by Google Gemini AI • Voice-enabled • Works in Chrome, Safari & Edge
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default HelixChatbot;
