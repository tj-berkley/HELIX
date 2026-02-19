# HELIX

**Your AI Assistant by GoogleHubs**

HELIX is the intelligent AI assistant powering the GoogleHubs platform. A comprehensive all-in-one solution that combines CRM, AI automation, prospecting, content creation, emergency services, and business management into one powerful system. HELIX helps you save time, increase productivity, and grow your business.

## About HELIX

HELIX is not just another AI chatbot—it's your complete business AI assistant that:
- Manages your entire business operations
- Automates workflows and repetitive tasks
- Creates professional content (blogs, videos, audio, movies)
- Handles emergency services with 911 integration
- Monitors health and medical data
- Controls smart home devices
- Generates intelligent reports
- Powers prospecting and lead generation
- Provides real-time business insights

## Core Features

### 🤖 HELIX AI Assistant
- Voice-activated AI powered by Google Gemini
- Real-time conversational interface
- Text-to-speech capabilities
- Context-aware responses
- Memory and learning capabilities
- Multi-modal interactions (text, voice, video)

### 🔍 Prospecting & Lead Generation
- Google Business search integration
- Facebook Business Graph search
- LinkedIn Company search
- Automated enrichment with business intelligence
- AI-powered report generation
- Lead scoring and qualification

### 📊 CRM & Contact Management
- Comprehensive contact database
- Pipeline management
- Activity tracking and timeline
- Custom fields and tags
- Industry-specific templates
- Lead nurture sequences

### 🎨 Content Creation Suite
- **Blog Platform**: AI writing assistance
- **Video Maker**: Professional video creation
- **Movie Studio**: Full movie production and premiere ticketing
- **Audio Creator**: Podcast and audio content
- **Social Media**: Multi-platform content generation
- **Book Creator**: Generate manuscripts, children's books, novels

### 🚨 Emergency Services Platform (EPS)
- One-button SOS activation
- Automatic 911 integration
- GPS tracking and location sharing
- Emergency contact notification
- Video room creation for responders
- Medical profile storage
- Incident report generation

### 🏥 Health & Medical Tracking
- Vital signs monitoring
- Threshold alerts
- Doctor and patient dashboards
- Medication reminders
- Lab results integration
- Family health tracking
- Emergency escalation

### 📅 Calendar & Scheduling
- Multi-view calendar (Timeline, Board, Kanban)
- Task management and global tasks
- Event scheduling
- Google Workspace integration
- Automated reminders

### 📧 Communication Hub
- Email management center
- Webinar platform (GoBrunch integration)
- Social connections
- Campaign management
- SMS and voice integration

### 📈 Analytics & Insights
- Real-time analytics dashboard
- Performance metrics
- Usage tracking
- Business intelligence
- AI-powered predictions

### 🏠 Smart Home Control
- Voice control with "Helix" wake word
- SmartThings, Hue, Nest, Ring integration
- Scene automation
- Geofencing
- Energy monitoring

### ⚡ Automation Studio
- Workflow builder
- Custom automation rules
- Integration capabilities
- API management
- Trigger-based actions

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Routing**: React Router v7
- **AI**: Google Gemini API (@google/genai)
- **Backend**: Supabase (Database + Edge Functions)
- **Payment**: Stripe integration
- **Communication**: Twilio, Telnyx
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Google Gemini API key
- Supabase project

### Installation

1. Clone the repository
```bash
git clone https://github.com/tj-berkley/HELIX.git
cd HELIX
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

6. Deploy to GitHub Pages
```bash
npm run deploy:github
```

## Supabase Setup

HELIX uses Supabase for all data persistence:

### Database Tables
- `users` - User accounts and authentication
- `subscriptions` - Subscription plans and billing
- `credits` - Credit system for usage tracking
- `prospects` - Prospecting leads and business data
- `prospect_reports` - AI-generated business intelligence

### Edge Functions
- `google-places-search` - Google Business search API
- `facebook-business-search` - Facebook Graph API
- `linkedin-company-search` - LinkedIn company data
- `prospects-api` - CRUD operations for prospects
- `stripe-checkout` - Payment processing
- `purchase-credits` - Credit purchase handling

See `/supabase/migrations/` for complete database schema.

## Project Structure

```
HELIX/
├── components/          # React components
│   ├── HelixChatbot.tsx    # Main HELIX AI interface
│   ├── HelixLogo.tsx       # HELIX branding
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Sidebar.tsx         # Navigation
│   ├── Prospecting.tsx     # Lead generation
│   ├── ContentCreator.tsx  # Content studio
│   ├── MovieMaker.tsx      # Movie production
│   ├── MedicalHub.tsx      # Health tracking
│   └── ...
├── services/           # API services
│   ├── geminiService.ts
│   ├── prospectingService.ts
│   └── prospectEnrichmentService.ts
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/     # Database schemas
├── types.ts            # TypeScript definitions
├── constants.tsx       # App constants
└── vite.config.ts      # Build configuration
```

## Key Differentiators

HELIX replaces 15-18 different software tools:
- ✅ CRM (Salesforce, HubSpot)
- ✅ Marketing automation (GoHighLevel)
- ✅ Content creation platforms
- ✅ Video editing software
- ✅ Email marketing tools
- ✅ Calendar scheduling
- ✅ Project management
- ✅ Emergency response systems
- ✅ Health monitoring apps
- ✅ Smart home controllers
- ✅ Webinar platforms
- ✅ Communication tools

**All in one platform, powered by HELIX AI.**

## Platform Vision

HELIX by GoogleHubs aims to be the **single AI assistant** that:
- Manages your entire business operations
- Saves 10-30 hours per week through automation
- Reduces software costs by $2,500-$12,000/month
- Provides industry-specific solutions for 20+ industries
- Offers emergency services integration
- Enables white-label reselling for agencies

## Industry Support

HELIX includes pre-configured templates for:
- Healthcare professionals
- Home service providers
- Professional services (legal, accounting, real estate)
- Emergency services
- Automotive industry
- Hospitality
- And 15+ more industries

## Support & Resources

- **Website**: https://googlehubs.com
- **GitHub**: https://github.com/tj-berkley/HELIX
- **Documentation**: Coming soon
- **Community**: Coming soon

## License

Proprietary - All rights reserved © GoogleHubs

---

**Built by GoogleHubs Team**

*HELIX - Your AI-powered business command center. Just speak, and HELIX takes action.*
