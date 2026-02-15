
export type Status = 'Done' | 'Working on it' | 'Stuck' | 'Not Started' | 'Critical' | 'Active' | 'Paused' | 'Draft' | 'Sent' | 'Scheduled' | 'Published' | 'On Track' | 'At Risk' | 'Off Track';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type BoardView = 'Table' | 'Timeline' | 'Calendar' | 'Kanban';

export type LeadCategory = 
  | 'Insurance' | 'Home Security' | 'Legal Help' | 'Incident Reports' 
  | 'Doctors' | 'Home Services' | 'Loans' | 'Real Estate' 
  | 'Flights' | 'Hotels' | 'Car Rentals' | 'Cruises' 
  | 'Packages' | 'Auto Dealerships' | 'Realtor' | 'Lawyer' 
  | 'Contractor' | 'Financial' | 'Crypto' | 'Auto Repair';

export interface ExternalSource {
  id: string;
  type: 'URL' | 'Sheet' | 'Doc' | 'PDF';
  label: string;
  url: string;
  lastSynced: string;
  status: 'Ready' | 'Syncing' | 'Error';
}

export interface BrandVoice {
  id: string;
  name: string;
  tone: string;
  audience: string;
  avoidKeywords: string[];
  keyPhrases: string[];
  language: string;
  personalityEmoji: string;
  externalSources?: ExternalSource[];
}

export type PublishingDestination = 'WordPress' | 'Blogger' | 'Shopify' | 'Webhook';

export interface OwnerInfo {
  name: string;
  role: string;
  bio: string;
  email: string;
  avatarUrl?: string;
  assignedPhone?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
  };
}

export interface BusinessInfo {
  name: string;
  industry: string;
  mission: string;
  website: string;
  size: string;
  assignedPhone?: string;
  logoUrl?: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  authorId: string;
  timestamp: string;
  likes: string[];
}

export interface Subtask {
  id: string;
  name: string;
  status: Status;
  dueDate?: string;
  ownerId?: string;
}

export interface Item {
  id: string;
  name: string;
  ownerId: string;
  status: Status;
  priority: Priority;
  timeline: { start: string; end: string } | null;
  dueDate?: string;
  lastUpdated: string;
  description?: string;
  comments?: Comment[];
  subtasks?: Subtask[];
}

export interface Group {
  id: string;
  name: string;
  color: string;
  items: Item[];
}

export interface Board {
  id: string;
  name: string;
  description: string;
  groups: Group[];
}

export interface Workspace {
  id: string;
  name: string;
  boards: Board[];
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  icon: string;
  connected: boolean;
  description: string;
  envKey?: string;
}

export type Page = 
  | 'dashboard'
  | 'board' 
  | 'portfolio'
  | 'integrations' 
  | 'workflows' 
  | 'campaigns' 
  | 'contacts' 
  | 'analytics'
  | 'webinars'
  | 'tasks'
  | 'calendar'
  | 'site-builder'
  | 'blog'
  | 'brand-voice'
  | 'social-calendar'
  | 'social'
  | 'content-creator'
  | 'video-maker'
  | 'movie-studio'
  | 'movie-maker'
  | 'box-office'
  | 'connections'
  | 'vault'
  | 'audio-lab'
  | 'owner-profile'
  | 'business-identity'
  | 'usage-dashboard'
  | 'email';

export interface PageDesign {
  headline: string;
  subheadline: string;
  ctaText: string;
  heroImage?: string;
  themeColor: string;
  accentColor: string;
}

export interface Webinar {
  id: string;
  title: string;
  slug: string;
  subdomain?: string;
  description?: string;
  date: string;
  invites: number;
  showUps: number;
  buyers: number;
  status: 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';
  transcript?: string;
  roomLink?: string;
  accessCode?: string;
  token?: string;
  scheduleDay?: number;
  scheduleTime?: string;
  repeatFrequency?: 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'None';
  invitePageDesign?: PageDesign;
  signinPageDesign?: PageDesign;
  invitesSent?: string[];
  calendarEventId?: string;
  campaignId?: string;
}

export interface WorkflowMaterial {
  id: string;
  name: string;
  type: string;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  label: string;
  icon: string;
  color: string;
  description: string;
  apiConnected?: boolean;
  mcpEnabled?: boolean;
  materials?: WorkflowMaterial[];
}

export interface Workflow {
  id: string;
  name: string;
  status: Status;
  nodes: WorkflowNode[];
}

export type CampaignTriggerSource = 
  | 'Form' | 'LinkClick' | 'PaperworkSigned' | 'IncomingCall' 
  | 'IncomingSMS' | 'WebinarJoin' | 'LandingPageVisit' | 'Manual';

export interface CampaignTrigger {
  id: string;
  source: CampaignTriggerSource;
  label: string;
}

export interface CampaignStep {
  id: string;
  type: 'Email' | 'SMS' | 'DM' | 'Call' | 'Wait';
  title: string;
  subject?: string;
  body: string;
  delayDays: number;
  status: Status;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: Status;
  reach: number;
  conversion: number;
  startDate: string;
  summary?: string;
  steps?: CampaignStep[];
  trigger?: CampaignTrigger;
  audienceType?: 'CRM_Segment' | 'CSV_Import';
  audienceMeta?: { fileName: string; count: number };
}

export interface CustomFieldValue {
  key: string;
  value: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  status: 'Lead' | 'Customer' | 'Nurturing' | 'Lost';
  lastContacted: string;
  category: LeadCategory;
  customFields: CustomFieldValue[];
}

export interface Manuscript {
  id: string;
  title: string;
  content: string;
  genre: string;
  tone: string;
  createdAt: string;
}

export interface AudioClip {
  id: string;
  text: string;
  voice: string;
  url: string;
  timestamp: string;
}

export interface ClonedVoice {
  id: string;
  label: string;
  description: string;
  emoji: string;
  provider?: 'ElevenLabs' | 'Gemini';
  sourceType?: 'audio' | 'video';
}

export interface MovieCharacter {
  id: string;
  name: string;
  description: string;
  traits: string[];
  voiceId?: string;
  avatarUrl?: string;
}

export interface MovieScene {
  id: string;
  slugline: string;
  description: string;
  visualPrompt: string;
  audioScript?: string;
  action?: string;
  isApproved: boolean;
  voiceId?: string;
  videoUrl?: string;
  isGenerating?: boolean;
}

export interface MovieScript {
  id: string;
  title: string;
  logline: string;
  characters: MovieCharacter[];
  scenes: MovieScene[];
  status: string;
}

export interface ReleasedMovie {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string;
  ticketPrice: number;
  ticketsSold: number;
  totalRevenue: number;
  author: string;
  ticketStatus: 'Draft' | 'Live';
  watchUrl?: string;
}

export type ConnectionChannel = 
  | 'Email' | 'SMS' | 'Twilio' | 'Telnyx' | 'Vonage' | 'WhatsApp' 
  | 'Telegram' | 'Discord' | 'Slack' | 'Circle' | 'Instagram' 
  | 'Facebook' | 'LinkedIn' | 'Phone';

export interface MessageThread {
  id: string;
  channel: ConnectionChannel;
  contactName: string;
  lastMessage: string;
  timestamp: string;
  isAiAutoPilot: boolean;
  avatarUrl: string;
  unreadCount: number;
}

export interface MemoryNode {
  id: string;
  title: string;
  type: 'Note' | 'Document' | 'Link';
  content: string;
  timestamp: string;
  category: string;
}

export type HobbsPersona = 
  | 'Emergency Responder' | 'Health Coach' | 'Business Mentor' 
  | 'Home Manager' | 'Travel Agent' | 'Financial Advisor' 
  | 'Medical Assistant' | 'Career Coach' | 'Fitness Trainer' 
  | 'Local Guide' | 'Life Coach' | 'Personal Assistant';

export interface SocialPost {
  id: string;
  title: string;
  content: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  scheduledTime: string;
  platforms: string[];
  status: Status;
}
