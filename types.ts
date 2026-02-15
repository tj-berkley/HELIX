
export type Status = 'Done' | 'Working on it' | 'Stuck' | 'Not Started' | 'Critical' | 'Active' | 'Paused' | 'Draft' | 'Sent' | 'Scheduled' | 'Published' | 'On Track' | 'At Risk' | 'Off Track';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type BoardView = 'Table' | 'Timeline' | 'Calendar' | 'Kanban';

export type LeadCategory = 
  | 'Insurance' | 'Home Security' | 'Legal Help' | 'Incident Reports' 
  | 'Doctors' | 'Home Services' | 'Loans' | 'Real Estate' 
  | 'Flights' | 'Hotels' | 'Car Rentals' | 'Cruises' 
  | 'Packages' | 'Auto Dealerships' | 'Realtor' | 'Lawyer' 
  | 'Contractor' | 'Financial' | 'Crypto' | 'Auto Repair';

export interface BrandVoice {
  id: string;
  name: string;
  tone: string;
  audience: string;
  avoidKeywords: string[];
  keyPhrases: string[];
  language: string;
  personalityEmoji: string;
}

export type PublishingDestination = 'WordPress' | 'Blogger' | 'Shopify' | 'Webhook';

export interface OwnerInfo {
  name: string;
  role: string;
  bio: string;
  email: string;
  avatarUrl?: string;
}

export interface BusinessInfo {
  name: string;
  industry: string;
  mission: string;
  website: string;
  size: string;
  assignedPhone?: string;
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
  | 'social'
  | 'social-calendar'
  | 'content-creator'
  | 'video-maker'
  | 'movie-studio'
  | 'movie-maker'
  | 'box-office'
  | 'connections'
  | 'api-management'
  | 'audio-lab'
  | 'owner-profile'
  | 'business-identity'
  | 'usage-dashboard';

export type ConnectionChannel = 'Email' | 'SMS' | 'WhatsApp' | 'Telegram' | 'Discord' | 'Slack' | 'Circle' | 'Instagram' | 'Facebook' | 'LinkedIn' | 'Phone' | 'Twilio' | 'Telnyx' | 'Vonage';

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
  type: 'Document' | 'Link' | 'Note' | 'Voice' | 'Interaction';
  content: string;
  timestamp: string;
  category: string;
}

export type HobbsPersona = 
  | 'Emergency Responder' | 'Health Coach' | 'Business Mentor' 
  | 'Home Manager' | 'Travel Agent' | 'Financial Advisor' 
  | 'Medical Assistant' | 'Career Coach' | 'Fitness Trainer' 
  | 'Local Guide' | 'Life Coach' | 'Personal Assistant';

export interface WorkflowMaterial {
  type: 'document' | 'video' | 'image' | 'slide' | 'note' | 'task';
  url?: string;
  title: string;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  label: string;
  description: string;
  purpose?: string;
  icon: string;
  logoUrl?: string;
  color: string;
  apiConnected: boolean;
  mcpEnabled: boolean;
  materials: WorkflowMaterial[];
  config?: any;
}

export interface Workflow {
  id: string;
  name: string;
  status: 'Active' | 'Draft' | 'Paused';
  nodes: WorkflowNode[];
}

export type CampaignStepType = 'Email' | 'SMS' | 'DM' | 'Call' | 'Wait' | 'Trigger';

export interface CampaignStep {
  id: string;
  type: CampaignStepType;
  title: string;
  subject?: string;
  body: string;
  delayDays: number;
  status: 'Draft' | 'Active' | 'Completed';
  config?: any;
}

export type CampaignTriggerSource = 'Form' | 'IncomingSMS' | 'IncomingCall' | 'IncomingDM' | 'WebinarJoin' | 'PaperworkSigned' | 'LinkClick' | 'LandingPageVisit' | 'Manual';

export interface CampaignTrigger {
  id: string;
  source: CampaignTriggerSource;
  label: string;
  config?: any;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: Status; 
  reach: number; 
  conversion: number; 
  startDate: string;
  trigger?: CampaignTrigger;
  steps?: CampaignStep[];
  audienceType?: 'CRM_Segment' | 'CSV_Import' | 'Manual_Entry';
  audienceMeta?: any;
}

export interface Contact {
  id: string; name: string; email: string; company: string; role: string; status: 'Lead' | 'Customer' | 'Lost' | 'Nurturing'; lastContacted: string; category?: LeadCategory;
}

export interface Manuscript {
  id: string;
  title: string;
  content: string;
  genre: string;
  tone: string;
  createdAt: string;
}

export interface MovieCharacter {
  id: string;
  name: string;
  description: string;
  traits: string[];
  avatarUrl?: string;
  voiceId?: string;
}

export interface MovieScene {
  id: string;
  slugline: string;
  description: string;
  visualPrompt: string;
  action: string;
  audioScript?: string;
  voiceId?: string;
  dialogue: { character: string; line: string }[];
  videoUrl?: string;
  isGenerating?: boolean;
  isApproved?: boolean;
}

export interface MovieScript {
  id: string;
  title: string;
  logline: string;
  characters: MovieCharacter[];
  scenes: MovieScene[];
  status: 'Pre-Production' | 'In Production' | 'Rendered' | 'Released';
}

export interface ReleasedMovie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  ticketPrice: number;
  ticketsSold: number;
  totalRevenue: number;
  author: string;
}

export type LipSyncMode = 'Political Satire' | 'Cartoon Avatar' | 'Personal Clone' | 'Youtube Deepfake';

export interface SocialPost {
  id: string;
  title: string;
  content: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  scheduledTime: string; // YYYY-MM-DD HH:mm
  platforms: string[];
  status: 'Scheduled' | 'Published' | 'Failed';
  campaignId?: string;
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
  sourceType: 'video' | 'audio';
  provider: 'Yapper' | 'ElevenLabs' | 'Internal';
}

export interface Webinar {
  id: string;
  title: string;
  date: string;
  invites: number;
  showUps: number;
  buyers: number;
  status: 'Upcoming' | 'Live' | 'Completed';
  transcript?: string;
}
