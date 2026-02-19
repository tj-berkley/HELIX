// Gmail API Integration Service

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body: { data?: string };
    parts?: Array<{ mimeType: string; body: { data?: string } }>;
  };
  internalDate: string;
}

interface ParsedEmail {
  id: string;
  from: string;
  senderEmail: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  unread: boolean;
  neuralPriority: 'High' | 'Medium' | 'Low';
  labels: string[];
  threadId: string;
}

// Gmail OAuth2 Configuration
const GMAIL_CLIENT_ID = ''; // Set via environment or Supabase config
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose'
].join(' ');

export class GmailService {
  private accessToken: string | null = null;
  private tokenExpiryTime: number = 0;

  constructor() {
    // Load stored access token if exists
    const stored = localStorage.getItem('GMAIL_ACCESS_TOKEN');
    const expiry = localStorage.getItem('GMAIL_TOKEN_EXPIRY');
    if (stored && expiry && parseInt(expiry) > Date.now()) {
      this.accessToken = stored;
      this.tokenExpiryTime = parseInt(expiry);
    }
  }

  /**
   * Initiate Gmail OAuth2 flow
   */
  async authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use Google Identity Services (GIS) for OAuth
      const client = (window as any).google?.accounts?.oauth2?.initTokenClient({
        client_id: GMAIL_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID,
        scope: GMAIL_SCOPES,
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }

          this.accessToken = response.access_token;
          this.tokenExpiryTime = Date.now() + (response.expires_in * 1000);

          // Store tokens
          localStorage.setItem('GMAIL_ACCESS_TOKEN', this.accessToken);
          localStorage.setItem('GMAIL_TOKEN_EXPIRY', this.tokenExpiryTime.toString());

          resolve();
        },
      });

      if (client) {
        client.requestAccessToken();
      } else {
        reject(new Error('Google Identity Services not loaded'));
      }
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && this.tokenExpiryTime > Date.now();
  }

  /**
   * Disconnect Gmail account
   */
  disconnect(): void {
    this.accessToken = null;
    this.tokenExpiryTime = 0;
    localStorage.removeItem('GMAIL_ACCESS_TOKEN');
    localStorage.removeItem('GMAIL_TOKEN_EXPIRY');
  }

  /**
   * Fetch emails from Gmail
   */
  async fetchEmails(maxResults: number = 50, query?: string): Promise<ParsedEmail[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Gmail');
    }

    try {
      // Build query parameters
      const params = new URLSearchParams({
        maxResults: maxResults.toString(),
        ...(query && { q: query }),
      });

      // Fetch message list
      const listResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!listResponse.ok) {
        throw new Error(`Failed to fetch emails: ${listResponse.statusText}`);
      }

      const listData = await listResponse.json();

      if (!listData.messages || listData.messages.length === 0) {
        return [];
      }

      // Fetch full message details in parallel
      const messagePromises = listData.messages.map((msg: { id: string }) =>
        this.fetchMessageById(msg.id)
      );

      const messages = await Promise.all(messagePromises);
      return messages.map(msg => this.parseGmailMessage(msg)).filter(Boolean) as ParsedEmail[];
    } catch (error) {
      console.error('Error fetching Gmail emails:', error);
      throw error;
    }
  }

  /**
   * Fetch a single message by ID
   */
  private async fetchMessageById(messageId: string): Promise<GmailMessage> {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch message ${messageId}`);
    }

    return response.json();
  }

  /**
   * Parse Gmail message to standardized format
   */
  private parseGmailMessage(message: GmailMessage): ParsedEmail | null {
    try {
      const headers = message.payload.headers;
      const from = this.getHeader(headers, 'From') || 'Unknown';
      const to = this.getHeader(headers, 'To') || '';
      const subject = this.getHeader(headers, 'Subject') || '(no subject)';
      const date = new Date(parseInt(message.internalDate));

      // Extract sender name and email
      const fromMatch = from.match(/(.+?)\s*<(.+?)>/) || [null, from, from];
      const senderName = fromMatch[1]?.trim() || from;
      const senderEmail = fromMatch[2]?.trim() || from;

      // Get email body
      const body = this.extractBody(message.payload);

      // Determine if unread
      const unread = message.labelIds?.includes('UNREAD') || false;

      // Calculate neural priority based on keywords and importance
      const priority = this.calculatePriority(subject, body, message.labelIds);

      return {
        id: message.id,
        from: senderName,
        senderEmail: senderEmail,
        to: to,
        subject: subject,
        body: body,
        timestamp: this.formatTimestamp(date),
        unread: unread,
        neuralPriority: priority,
        labels: message.labelIds || [],
        threadId: message.threadId,
      };
    } catch (error) {
      console.error('Error parsing message:', error);
      return null;
    }
  }

  /**
   * Get header value by name
   */
  private getHeader(headers: Array<{ name: string; value: string }>, name: string): string | undefined {
    return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value;
  }

  /**
   * Extract email body from payload
   */
  private extractBody(payload: GmailMessage['payload']): string {
    let body = '';

    // Try to get plain text body
    if (payload.body?.data) {
      body = this.decodeBase64(payload.body.data);
    } else if (payload.parts) {
      // Multi-part message
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = this.decodeBase64(part.body.data);
          break;
        }
      }

      // If no plain text, try HTML
      if (!body) {
        for (const part of payload.parts) {
          if (part.mimeType === 'text/html' && part.body?.data) {
            const html = this.decodeBase64(part.body.data);
            body = this.stripHtml(html);
            break;
          }
        }
      }
    }

    return body.trim().slice(0, 500); // Limit to 500 chars for preview
  }

  /**
   * Decode base64url string
   */
  private decodeBase64(str: string): string {
    try {
      // Convert base64url to base64
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      // Decode
      return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
      console.error('Error decoding base64:', error);
      return '';
    }
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  /**
   * Calculate email priority based on content and labels
   */
  private calculatePriority(subject: string, body: string, labels: string[]): 'High' | 'Medium' | 'Low' {
    const content = `${subject} ${body}`.toLowerCase();

    // High priority keywords
    const highPriorityWords = [
      'urgent', 'important', 'asap', 'critical', 'deadline', 'emergency',
      'action required', 'immediate', 'payment', 'invoice', 'partnership',
      'proposal', 'contract', 'legal', 'security'
    ];

    // Check for important label
    if (labels?.includes('IMPORTANT')) {
      return 'High';
    }

    // Check for high priority keywords
    if (highPriorityWords.some(word => content.includes(word))) {
      return 'High';
    }

    // Check for promotional/spam
    if (labels?.some(label => ['CATEGORY_PROMOTIONS', 'SPAM'].includes(label))) {
      return 'Low';
    }

    return 'Medium';
  }

  /**
   * Format timestamp for display
   */
  private formatTimestamp(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  /**
   * Send an email via Gmail
   */
  async sendEmail(to: string, subject: string, body: string, threadId?: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Gmail');
    }

    try {
      // Create MIME message
      const message = [
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\n');

      // Encode message in base64url
      const encodedMessage = btoa(unescape(encodeURIComponent(message)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send email
      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raw: encodedMessage,
            ...(threadId && { threadId }),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Mark email as read
   */
  async markAsRead(messageId: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Gmail');
    }

    try {
      await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            removeLabelIds: ['UNREAD'],
          }),
        }
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  /**
   * Archive email
   */
  async archiveEmail(messageId: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Gmail');
    }

    try {
      await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            removeLabelIds: ['INBOX'],
          }),
        }
      );
    } catch (error) {
      console.error('Error archiving email:', error);
    }
  }

  /**
   * Delete email
   */
  async deleteEmail(messageId: string): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Gmail');
    }

    try {
      await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  }

  /**
   * Get user's Gmail profile
   */
  async getProfile(): Promise<{ emailAddress: string; messagesTotal: number; threadsTotal: number }> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Gmail');
    }

    try {
      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/profile',
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const gmailService = new GmailService();
