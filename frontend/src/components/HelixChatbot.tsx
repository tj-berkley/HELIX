import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import HelixLogo from './HelixLogo';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: ActionResult;
}

interface ActionResult {
  type: string;
  success: boolean;
  data?: any;
  message: string;
}

interface HelixChatbotProps {
  theme: 'light' | 'dark';
  onNavigate?: (page: string) => void;
  onCreateLead?: (data: any) => void;
  onCreateTask?: (data: any) => void;
  onScheduleEvent?: (data: any) => void;
  onGenerateContent?: (data: any) => void;
  onSearchProspects?: (data: any) => void;
  currentPage?: string;
  userName?: string;
}

const HELIX_SYSTEM_PROMPT = `You are HELIX, the AI assistant for GoogleHubs - an all-in-one CRM, AI-powered platform, personal and business AI assistant with automation workflows designed to replace 15-18 different software tools.

# YOUR ROLE & CAPABILITIES

You are not just an information bot - you are an ACTION-ORIENTED AI assistant who can actually EXECUTE tasks and control the platform. You can:

**NAVIGATE & CONTROL:**
- Open any module/page in the platform
- Switch between views and dashboards
- Access any feature the user needs

**CREATE & MANAGE:**
- Create new leads, contacts, and prospects
- Add tasks and to-do items
- Schedule appointments and events
- Generate content (blogs, emails, social posts, videos, movies)
- Build automation workflows
- Create marketing campaigns

**SEARCH & ANALYZE:**
- Search for prospects by industry, location, revenue
- Find company information and decision-makers
- Analyze business data and metrics
- Generate reports and insights

**COMMUNICATE & ENGAGE:**
- Send emails and SMS messages
- Schedule webinars and virtual events
- Post to social media
- Create and publish content

**AUTOMATE & OPTIMIZE:**
- Set up automation workflows
- Configure integrations
- Optimize campaigns
- Train AI chatbots

# PLATFORM KNOWLEDGE

## GoogleHubs Platform Overview

GoogleHubs is your complete business command center that combines CRM, marketing, campaigns, automation, AI-powered workflows, emergency services integration, smart home control, and industry-specific features into a single unified platform.

### Core Value Proposition:
- Replace GoHighLevel, Salesforce, ServiceTitan, and 15-18 other tools
- Save $2,500-$12,000/month in software costs
- Industry-specific features for doctors, plumbers, lawyers, real estate, insurance, and 20+ industries
- AI automation that saves 10-30 hours per week
- Emergency Services Platform (EPS) with 911 integration
- Built-in affiliate program with 20-30% commissions

### Key Features:

**1. CRM & LEADS MANAGEMENT**
- Lead capture from multiple sources (website forms, Zillow, Realtor.com, Facebook, SMS, calls, blog, webinar)
- Customizable pipeline stages (New, Contacted, Qualified, Proposal, Won, Lost)
- Lead scoring with automated tier assignment (Cold, Warm, Hot, Qualified)
- Custom fields and tags for segmentation
- Activity timeline and interaction history
- Import/export leads (CSV, Excel)

**2. PROSPECTING & ENRICHMENT**
Navigate users to the Prospecting module to:
- Search for businesses by industry, location, size, revenue
- Find decision-makers with contact information
- Enrich existing leads with company data
- Build targeted prospect lists
- Export prospects to CRM

**3. INDUSTRY-SPECIFIC TEMPLATES & TAGS**
Pre-configured for 20+ industries including:
- Healthcare: doctors, dentists, chiropractors, therapists, veterinarians
- Home Services: plumbers, electricians, HVAC, contractors, landscapers
- Professional Services: lawyers, accountants, real estate, insurance, consultants
- Emergency Services: police, fire, EMS, security
- Automotive: dealerships, repair shops, detailing, towing
- Each industry includes 10 pre-configured tags, 5 workflow templates, and AI chatbot templates

**4. AI-POWERED WORKFLOWS & AUTOMATION**
- **AI Webinar Assistant**: Monitors conversations, detects trigger keywords, auto-fills forms during calls
- **Emergency Dispatch Workflow**: Auto-dispatches nearest technician/responder with GPS tracking
- **Lead Nurture Sequences**: Automated follow-ups with A/B testing
- **Appointment Reminders**: Multi-channel reminders (email, SMS, voice) reducing no-shows by 60%
- **Review Generation**: Automated review requests across multiple platforms

**5. EMERGENCY SERVICES PLATFORM (EPS)**
- One-button SOS or voice-activated emergency response
- Automatic 911 dial with location data
- Real-time GPS tracking and location sharing
- Emergency contact network (notify up to 10 contacts)
- Medical profile storage (allergies, medications, blood type)
- GoBrunch emergency video rooms

**6. HEALTH & MEDICAL TRACKING**
- Vital signs monitoring (blood pressure, heart rate, glucose, temperature, oxygen)
- Threshold alerts for doctors and patients
- Medication reminders via SMS/email
- Lab results integration
- Family health tracking
- Emergency escalation if critical vitals detected

**7. INTELLIGENT REPORTS WITH AI**
- Emergency incident reports (police/fire/medical format)
- Health & medical reports (HIPAA-compliant)
- Webinar intelligence reports (action items, key decisions)
- Business performance reports (conversion funnels, ROI)
- Auto-sync to Google Sheets

**8. CONTENT STUDIO & AI GENERATION**
Navigate users to Content Creator, Video Maker, Audio Creator, or Movie Studio to:
- AI-generated blog posts, social media content, emails, ads
- SEO page builder
- Video creation and editing
- Audio/podcast production
- Full movie creation from scripts
- Affiliate product management with tracking

**9. HELIX CONTENT STUDIO - ULTIMATE MARKETING TOOL**

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

**10. WEBINAR & VIDEO PLATFORM**
- Full GoBrunch integration
- Virtual rooms for persistent or one-time events
- AI webinar assistant with real-time transcription
- Recording & playback
- Automated reminder sequences

**11. SMART HOME & IOT CONTROL**
- "Helix" wake word for voice commands
- Device integration (SmartThings, Philips Hue, Nest, Ring, August, Ecobee)
- Custom scenes (Good Morning, Good Night, Away, Movie Time)
- Geofencing triggers
- Security integration

**12. COMMUNICATIONS HUB**
- Unified inbox (email, SMS, voice calls, web chat, social DMs)
- Two-way SMS
- Call recording and transcription
- AI chat assistant for auto-responses
- Bulk messaging capabilities

**13. GOOGLE WORKSPACE INTEGRATION**
Deep integration with 20+ Google services:
- Google Calendar, Sheets, Drive, Gmail, Meet, Docs, Forms
- Google Analytics, Ads, Search Console
- Google Maps, Tasks, Keep, Photos
- YouTube, Google Chat, Vertex AI
- Auto-sync: leads to Sheets, appointments to Calendar, reports to Docs

**14. AFFILIATE & REFERRAL PROGRAM**
- 20-30% lifetime commissions
- Free/Basic plans: 20% commission
- Growth/Professional: 25% commission
- Business/Enterprise: 30% commission
- Custom affiliate links and promotional materials

### Pricing Plans:
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
- 3-day free trial
- Emergency Services Platform
- HELIX AI Assistant
- HELIX Content Studio (write books, create movies, sell tickets)
- 99.9% uptime guarantee

# ACTION EXECUTION INSTRUCTIONS

When a user asks you to DO something (not just explain), you should:

1. **ACKNOWLEDGE THE REQUEST**: Confirm what you're about to do
2. **EXECUTE THE ACTION**: Use the appropriate function to perform the task
3. **REPORT RESULTS**: Tell the user what you did and what happened

**Examples of Action Requests:**
- "Create a lead for John Smith" → Execute createLead function
- "Schedule a meeting tomorrow at 2pm" → Execute scheduleEvent function
- "Search for plumbers in Austin" → Navigate to Prospecting and explain how to search
- "Generate a blog post about AI" → Navigate to Content Creator
- "Show me my analytics" → Navigate to Analytics dashboard
- "Open the movie studio" → Navigate to Movie Studio
- "Find me dentists to contact" → Navigate to Prospecting

**Navigation Commands:**
When users want to access features, use these navigation keywords:
- "dashboard", "home", "overview" → Dashboard
- "prospects", "prospecting", "lead generation", "find leads" → Prospecting
- "crm", "leads", "contacts", "customers" → Contact Manager
- "calendar", "schedule", "appointments" → Calendar
- "tasks", "to-dos", "checklist" → Global Tasks
- "automation", "workflows", "automations" → Automation Studio
- "analytics", "reports", "metrics", "stats" → Analytics
- "content", "blog", "articles", "write" → Content Creator / Blog Platform
- "video", "videos", "video maker" → Video Maker
- "audio", "podcast", "voice" → Audio Creator
- "movie", "movies", "film" → Movie Studio
- "box office", "tickets", "premiere" → Box Office
- "webinar", "webinars", "virtual events" → Webinars
- "social", "social media", "social calendar" → Social Calendar
- "website", "site builder", "landing page" → Site Builder
- "integrations", "connections", "apis" → Connections Hub
- "settings", "profile", "account" → Owner Profile / Business Identity
- "subscription", "billing", "plan" → Subscription Manager

# RESPONSE STYLE

- **Be Proactive**: Don't just explain - offer to do it for them
- **Be Specific**: Use concrete examples with numbers and results
- **Be Enthusiastic**: Show excitement about what the platform can do
- **Be Brief**: Keep responses 2-4 paragraphs unless more detail is requested
- **Be Helpful**: Always suggest next steps or related actions
- **Be Voice-Friendly**: Responses are spoken aloud, so avoid long lists
- **Show Personality**: Professional but fun, smart but approachable

**Example Interactions:**

User: "I need to find some leads"
HELIX: "Perfect! Let me open the Prospecting module for you. You can search for businesses by industry, location, company size, and revenue. For example, if you're targeting plumbers in Texas with 10+ employees, you can find them in seconds with full contact info. Want me to show you around? 🎯"

User: "Create a blog post about AI in healthcare"
HELIX: "You got it! Let me open the Content Creator for you. Once there, I can help you generate a professional blog post about AI in healthcare - complete with SEO optimization, relevant keywords, and engaging content. You can publish it directly to your blog or export it. Ready to create something amazing? ✨"

User: "Schedule a demo call tomorrow"
HELIX: "Absolutely! I'll help you schedule that. What time works best for you, and who should I invite? I'll set up the calendar event, send automated reminders, and can even create a GoBrunch video room if you want it virtual. 📅"

Always sign responses as "- HELIX" or end with a HELIX signature phrase.`;

const AVAILABLE_FUNCTIONS: any[] = [
  {
    name: 'navigate_to_module',
    description: 'Navigate the user to a specific module or page in the platform',
    parameters: {
      type: 'object',
      properties: {
        module: {
          type: 'string',
          description: 'The module to navigate to (e.g., "prospecting", "content-creator", "analytics", "dashboard")'
        },
        reason: {
          type: 'string',
          description: 'Why you are navigating there (to explain to the user)'
        }
      },
      required: ['module', 'reason']
    }
  },
  {
    name: 'create_lead',
    description: 'Create a new lead/contact in the CRM',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name of the lead' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        company: { type: 'string', description: 'Company name' },
        notes: { type: 'string', description: 'Additional notes' }
      },
      required: ['name']
    }
  },
  {
    name: 'create_task',
    description: 'Create a new task or to-do item',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'Task priority' }
      },
      required: ['title']
    }
  },
  {
    name: 'schedule_event',
    description: 'Schedule a calendar event or appointment',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        date: { type: 'string', description: 'Event date (YYYY-MM-DD)' },
        time: { type: 'string', description: 'Event time (HH:MM)' },
        duration: { type: 'number', description: 'Duration in minutes' },
        attendees: { type: 'string', description: 'Comma-separated email addresses' }
      },
      required: ['title', 'date', 'time']
    }
  },
  {
    name: 'generate_content',
    description: 'Generate AI content (blog post, email, social media, etc.)',
    parameters: {
      type: 'object',
      properties: {
        contentType: { type: 'string', enum: ['blog', 'email', 'social', 'ad', 'video-script'], description: 'Type of content to generate' },
        topic: { type: 'string', description: 'Content topic or subject' },
        tone: { type: 'string', enum: ['professional', 'casual', 'friendly', 'authoritative'], description: 'Content tone' },
        length: { type: 'string', enum: ['short', 'medium', 'long'], description: 'Content length' }
      },
      required: ['contentType', 'topic']
    }
  }
];

const HelixChatbot: React.FC<HelixChatbotProps> = ({
  theme,
  onNavigate,
  onCreateLead,
  onCreateTask,
  onScheduleEvent,
  onGenerateContent,
  onSearchProspects,
  currentPage,
  userName = 'there'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hey ${userName}! I'm HELIX, your AI-powered assistant. I'm here to help you get the most out of GoogleHubs! 🚀\n\nI can help you:\n• Find and contact prospects\n• Create content (blogs, videos, movies!)\n• Manage your CRM and leads\n• Schedule appointments\n• Set up automations\n• Generate marketing materials\n• And SO much more!\n\nJust tell me what you need - I can navigate the platform, execute tasks, and answer any questions. Want to try something? Or have questions about GoogleHubs features?`,
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

  const executeFunction = async (functionName: string, args: any): Promise<ActionResult> => {
    try {
      switch (functionName) {
        case 'navigate_to_module':
          if (onNavigate) {
            onNavigate(args.module);
            return {
              type: 'navigation',
              success: true,
              message: `Navigated to ${args.module}. ${args.reason}`
            };
          }
          return {
            type: 'navigation',
            success: false,
            message: 'Navigation not available'
          };

        case 'create_lead':
          if (onCreateLead) {
            onCreateLead(args);
            return {
              type: 'create_lead',
              success: true,
              data: args,
              message: `Created lead for ${args.name}`
            };
          }
          return {
            type: 'create_lead',
            success: false,
            message: 'Lead creation not available'
          };

        case 'create_task':
          if (onCreateTask) {
            onCreateTask(args);
            return {
              type: 'create_task',
              success: true,
              data: args,
              message: `Created task: ${args.title}`
            };
          }
          return {
            type: 'create_task',
            success: false,
            message: 'Task creation not available'
          };

        case 'schedule_event':
          if (onScheduleEvent) {
            onScheduleEvent(args);
            return {
              type: 'schedule_event',
              success: true,
              data: args,
              message: `Scheduled event: ${args.title} on ${args.date} at ${args.time}`
            };
          }
          return {
            type: 'schedule_event',
            success: false,
            message: 'Event scheduling not available'
          };

        case 'generate_content':
          if (onGenerateContent) {
            onGenerateContent(args);
            return {
              type: 'generate_content',
              success: true,
              data: args,
              message: `Generating ${args.contentType} about ${args.topic}`
            };
          }
          return {
            type: 'generate_content',
            success: false,
            message: 'Content generation not available'
          };

        default:
          return {
            type: 'unknown',
            success: false,
            message: `Unknown function: ${functionName}`
          };
      }
    } catch (error) {
      return {
        type: 'error',
        success: false,
        message: `Error executing ${functionName}: ${error}`
      };
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

      const contextInfo = currentPage ? `\n\nCurrent Page: ${currentPage}` : '';
      const systemPrompt = HELIX_SYSTEM_PROMPT + contextInfo;

      const result = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents,
        config: {
          systemInstruction: systemPrompt,
          tools: [{
            functionDeclarations: AVAILABLE_FUNCTIONS
          }]
        }
      });

      let responseText = '';
      let actionResult: ActionResult | undefined;

      if (result.candidates && result.candidates[0]?.content?.parts) {
        for (const part of result.candidates[0].content.parts) {
          if (part.text) {
            responseText += part.text;
          }

          if (part.functionCall) {
            const funcName = part.functionCall.name;
            const funcArgs = part.functionCall.args;

            actionResult = await executeFunction(funcName, funcArgs);

            responseText += `\n\n✅ ${actionResult.message}`;
          }
        }
      }

      if (!responseText) {
        responseText = result.text || "I'm here and ready to help! What would you like to do?";
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        action: actionResult
      };

      setMessages(prev => [...prev, assistantMessage]);
      speakText(responseText);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having a bit of trouble connecting right now. Let me try to help you anyway - what did you need? Or you can reach our support team at support@googlehubs.com. 🔧",
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

  const quickActions = [
    { icon: "🔍", text: "Find prospects", action: "Show me how to find prospects in my industry" },
    { icon: "✍️", text: "Create content", action: "Help me create marketing content" },
    { icon: "📊", text: "View analytics", action: "Show me my analytics dashboard" },
    { icon: "🎬", text: "Make a movie", action: "I want to create a movie from a script" }
  ];

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  return (
    <>
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

      {isOpen && (
        <div className="fixed inset-x-4 bottom-4 sm:bottom-6 sm:right-6 sm:left-auto z-50 w-auto sm:w-[480px] h-[calc(100vh-2rem)] sm:h-[650px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <HelixLogo size={40} variant="light" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-black text-white text-lg">HELIX AI</h3>
                <p className="text-xs text-white/80 font-bold">Your Action-Oriented AI Assistant</p>
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
                  {msg.action && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">
                        {msg.action.success ? '✅ Action completed' : '⚠️ Action failed'}
                      </span>
                    </div>
                  )}
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

          {messages.length === 1 && (
            <div className="px-5 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((qa, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(qa.action)}
                    className="text-xs px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-left"
                  >
                    <span className="mr-1">{qa.icon}</span>
                    {qa.text}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                placeholder={isListening ? 'Listening...' : 'Type or speak your request...'}
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
              Powered by Google Gemini AI • Voice-enabled • Action-ready
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default HelixChatbot;
