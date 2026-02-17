# GoogleHubs

**Your All-in-One AI-Powered Business Command Center**

GoogleHubs is a comprehensive platform that combines CRM, AI automation, prospecting, content creation, and business management into one powerful system. Meet **HELIX**, your intelligent AI assistant that helps you save time, increase productivity, and grow your business.

## Features

### 🤖 HELIX AI Assistant
- Voice-activated AI assistant powered by Gemini
- Real-time conversational interface
- Text-to-speech capabilities
- Context-aware responses

### 🔍 Prospecting & Lead Generation
- Google Business search integration
- Facebook Business Graph search
- LinkedIn Company search
- Automated enrichment with business intelligence
- AI-powered report generation

### 📊 CRM & Contact Management
- Comprehensive contact database
- Pipeline management
- Activity tracking
- Custom fields and tags

### 🎨 Content Creation Suite
- Blog platform with AI writing assistance
- Video content creation
- Audio production lab
- Movie studio and maker
- Social media content generation

### 📅 Calendar & Scheduling
- Multi-view calendar (Timeline, Board, Kanban)
- Task management
- Event scheduling
- Deadline tracking

### 📧 Communication Hub
- Email management center
- Webinar platform integration
- Social connections
- Campaign management

### 📈 Analytics & Insights
- Real-time analytics dashboard
- Performance metrics
- Usage tracking
- Business intelligence

### 🏥 Medical Hub
- Healthcare-specific features
- Patient management
- Appointment tracking
- Health records integration

### ⚡ Automation Studio
- Workflow automation
- Custom automation rules
- Integration capabilities
- API management

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Routing**: React Router v7
- **AI**: Google Gemini API
- **Backend**: Supabase (Database + Edge Functions)
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Gemini API key
- Supabase project (optional, for full features)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/googlehubs.git
cd googlehubs
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

## Supabase Setup

The platform uses Supabase for data persistence and serverless functions:

### Database Tables
- `prospects` - Store prospecting leads and business data
- `prospect_reports` - AI-generated business intelligence reports

### Edge Functions
- `google-places-search` - Google Business search API
- `facebook-business-search` - Facebook Graph API integration
- `linkedin-company-search` - LinkedIn company data
- `prospects-api` - CRUD operations for prospects

See `/supabase/migrations/` for database schema.

## Platform Architecture

```
googlehubs/
├── components/          # React components
│   ├── AIChatbot.tsx   # HELIX AI Assistant
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Sidebar.tsx     # Navigation
│   ├── Prospecting.tsx # Lead generation
│   └── ...
├── services/           # API services
│   ├── geminiService.ts
│   ├── prospectingService.ts
│   └── prospectEnrichmentService.ts
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/     # Database schemas
├── types.ts            # TypeScript definitions
└── constants.tsx       # App constants

```

## Key Features Explained

### HELIX AI Assistant
HELIX is your intelligent companion that can:
- Answer questions about your business
- Help with content creation
- Provide insights from your data
- Automate routine tasks
- Learn from your interactions

### Prospecting Engine
Powerful lead generation tools that search and enrich:
- Google Business profiles
- Facebook business pages
- LinkedIn companies
- Automatic data enrichment
- AI-generated intelligence reports

### Content Studio
Create professional content with AI assistance:
- Blog posts and articles
- Marketing videos
- Audio content and podcasts
- Social media posts
- Email campaigns

### Automation Studio
Build custom workflows to:
- Automate repetitive tasks
- Connect multiple services
- Create conditional logic
- Schedule automated actions

## Platform Vision

GoogleHubs aims to be the **single platform** that replaces:
- Traditional CRMs (Salesforce, HubSpot)
- Marketing automation tools
- Content creation platforms
- Communication tools
- Project management software

All powered by HELIX, your AI assistant that makes everything work together seamlessly.

## Support

For questions, issues, or feature requests:
- Website: https://googlehubs.com
- Documentation: Coming soon
- Community: Coming soon

## License

Proprietary - All rights reserved

---

**Built with ❤️ by the GoogleHubs team**

*Meet HELIX. Your AI-powered business command center.*
