# Gmail Integration Setup Guide
## Connect Your Gmail Account to GoogleHubs Email Center

---

## Overview

GoogleHubs Email Center now integrates directly with Gmail, allowing you to:
- ✅ Read and manage your Gmail emails
- ✅ Send emails through your Gmail account
- ✅ AI-powered email replies with your brand voice
- ✅ Priority classification with neural filtering
- ✅ Mark as read, archive, and delete emails
- ✅ All data synced in real-time

---

## Prerequisites

Before setting up Gmail integration, you need:

1. **Google Account** - A Gmail account (personal or Google Workspace)
2. **Google Cloud Project** - To get API credentials
3. **OAuth2 Client ID** - For authentication

---

## Step 1: Create Google Cloud Project

### 1.1 Go to Google Cloud Console

Visit [Google Cloud Console](https://console.cloud.google.com/)

### 1.2 Create New Project

1. Click the project dropdown in the top navigation
2. Click **"New Project"**
3. Enter project details:
   - **Project name**: `GoogleHubs Email Integration`
   - **Organization**: Your organization (if applicable)
4. Click **"Create"**

### 1.3 Wait for Project Creation

The project will be created in a few seconds. You'll receive a notification when it's ready.

---

## Step 2: Enable Gmail API

### 2.1 Navigate to APIs & Services

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click on **"Gmail API"**
4. Click **"Enable"**

The API will be enabled for your project.

---

## Step 3: Create OAuth Consent Screen

### 3.1 Go to OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose user type:
   - **Internal**: For Google Workspace users only (recommended for businesses)
   - **External**: For anyone with a Google account (recommended for general use)
3. Click **"Create"**

### 3.2 Configure OAuth Consent Screen

**App Information**:
```
App name: GoogleHubs Email Center
User support email: your-email@example.com (your email)
App logo: (optional - upload GoogleHubs logo)
```

**App Domain** (optional but recommended):
```
Application home page: https://googlehubs.com
Application privacy policy link: https://googlehubs.com/privacy
Application terms of service link: https://googlehubs.com/terms
```

**Authorized Domains**:
```
googlehubs.com
localhost (for local development)
```

**Developer Contact Information**:
```
Email addresses: your-email@example.com
```

Click **"Save and Continue"**

### 3.3 Add Scopes

Click **"Add or Remove Scopes"**

Add these Gmail API scopes:
```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/gmail.compose
```

**Scope Descriptions**:
- `gmail.readonly`: View your email messages and settings
- `gmail.send`: Send email on your behalf
- `gmail.modify`: View and modify but not delete your email
- `gmail.compose`: Compose emails

Click **"Update"** → **"Save and Continue"**

### 3.4 Test Users (for External Apps)

If you selected **External** user type:

1. Click **"Add Users"**
2. Add your Gmail address and any test users
3. Click **"Save and Continue"**

**Note**: External apps start in "Testing" mode. You can publish later for production.

### 3.5 Summary

Review your OAuth consent screen settings and click **"Back to Dashboard"**

---

## Step 4: Create OAuth 2.0 Client ID

### 4.1 Navigate to Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**

### 4.2 Configure OAuth Client

**Application type**: Web application

**Name**: `GoogleHubs Email Center`

**Authorized JavaScript origins**:
```
http://localhost:5173 (for local development with Vite)
http://localhost:3000 (for local development)
https://googlehubs.com (production domain)
https://www.googlehubs.com (production www subdomain)
```

**Authorized redirect URIs**:
```
http://localhost:5173 (for local development)
http://localhost:3000 (for local development)
https://googlehubs.com (production)
https://www.googlehubs.com (production)
```

Click **"Create"**

### 4.3 Save Your Credentials

You'll see a modal with:
- **Client ID**: `123456789-abc123def456.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxx`

**Important**: Copy and save these credentials securely!

---

## Step 5: Configure GoogleHubs

### 5.1 Add Environment Variable

Create or update your `.env` file in the project root:

```bash
# Gmail OAuth Configuration
VITE_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

**Important**: Only add the Client ID to `.env`. Never commit the Client Secret to version control.

### 5.2 Restart Development Server

If you're running the development server, restart it to load the new environment variable:

```bash
npm run dev
```

---

## Step 6: Connect Gmail in GoogleHubs

### 6.1 Navigate to Email Center

1. Log in to GoogleHubs
2. Click **"Communications"** in the sidebar
3. Select **"Email Manager"**

### 6.2 Connect Gmail Account

1. In the left sidebar, you'll see a **Gmail** section
2. Click **"Connect Gmail"** button
3. A Google Sign-In popup will appear

### 6.3 Authenticate with Google

1. Select your Google account
2. Review permissions:
   - View your email messages and settings
   - Send email on your behalf
   - View and modify but not delete your email
3. Click **"Allow"** to grant permissions

### 6.4 Verify Connection

Once connected, you'll see:
- ✅ Green status indicator next to Gmail
- Your Gmail email address displayed
- **Refresh** and **Disconnect** buttons

Your Gmail emails will automatically load in the inbox!

---

## Using Gmail Integration

### Reading Emails

**Automatic Sync**:
- Emails are fetched when you connect
- Click **"Refresh"** button to fetch latest emails
- Up to 50 most recent emails are loaded

**Email List**:
- Unread emails have a blue indicator
- Priority classification (High/Medium/Low)
- Click any email to read full content

**Actions**:
- Mark as read (automatic when you open an email)
- Archive (future feature)
- Delete (moves to trash in Gmail)

### Sending Emails

**Method 1: Reply to Email**:
1. Select an email to read
2. Enter your reply objective (e.g., "Thank them and schedule a call")
3. Click **"Synthesize Draft"** to generate AI reply
4. Review and edit the draft
5. Click **"Dispatch Signal"** to send via Gmail

**Method 2: Compose New Email**:
1. Click the **+** button in the email list
2. Enter recipient, subject, and body
3. Click **"Dispatch Signal"** to send

**AI Email Generation**:
- Uses your brand voice settings from Brand Voice page
- Powered by Google Gemini AI
- Professional, contextual replies
- Editable before sending

### Priority Classification

GoogleHubs automatically classifies emails:

**High Priority**:
- Contains keywords: urgent, important, deadline, payment, partnership
- Marked as IMPORTANT in Gmail
- Requires immediate attention

**Medium Priority**:
- Regular business emails
- Follow-ups and updates
- General correspondence

**Low Priority**:
- Promotional emails
- Newsletters
- Spam or junk

---

## Troubleshooting

### Issue: "Google Identity Services not loaded"

**Solution**:
1. Check your internet connection
2. Ensure Google Sign-In script is loading (check browser console)
3. Clear browser cache and reload page
4. Try a different browser (Chrome recommended)

### Issue: "Failed to connect to Gmail"

**Solution**:
1. Verify Client ID is correct in `.env` file
2. Check authorized JavaScript origins in Google Cloud Console
3. Ensure Gmail API is enabled in your project
4. Check browser console for detailed error messages

### Issue: "Failed to load emails"

**Solution**:
1. Check that you granted all permissions during sign-in
2. Verify Gmail API scopes are added in OAuth consent screen
3. Click "Disconnect" then "Connect Gmail" again
4. Check browser console for API errors

### Issue: "Failed to send email"

**Solution**:
1. Verify `gmail.send` scope is enabled
2. Check that you have an active internet connection
3. Ensure recipient email is valid
4. Check Gmail sending limits (500 emails/day for Gmail accounts)

### Issue: "Token expired" or "Not authenticated"

**Solution**:
1. Access tokens expire after 1 hour by default
2. Click **"Disconnect"** and **"Connect Gmail"** again
3. Future enhancement: Automatic token refresh

---

## Security & Privacy

### Data Storage

**What's Stored**:
- ✅ OAuth access token (in browser localStorage)
- ✅ Token expiry time
- ✅ Your Gmail email address

**What's NOT Stored**:
- ❌ Your Gmail password
- ❌ Email content on our servers
- ❌ Sensitive personal information

**Local Storage Only**:
All Gmail data is fetched in real-time and displayed in your browser. We never store your emails on our servers.

### Token Management

**Access Token**:
- Stored in browser localStorage
- Expires after 1 hour (or configured duration)
- Can be revoked at any time

**Revoke Access**:
1. Click **"Disconnect"** in GoogleHubs
2. OR visit [Google Account Permissions](https://myaccount.google.com/permissions)
3. Find "GoogleHubs Email Center"
4. Click **"Remove Access"**

### Permissions

**Required Permissions**:
- `gmail.readonly`: Read your emails (required for inbox view)
- `gmail.send`: Send emails on your behalf (required for replies)
- `gmail.modify`: Mark as read, archive, star (required for actions)
- `gmail.compose`: Draft emails (required for composition)

**We Do NOT**:
- Delete emails permanently
- Share your data with third parties
- Access emails when you're not using GoogleHubs
- Store emails on our servers

---

## Gmail API Limits

### Rate Limits (per User per Project)

**Gmail API Quotas**:
- 250 quota units per second per user
- 10,000 quota units per second per project
- 1 billion quota units per day

**Quota Costs**:
- List messages: 5 units
- Get message: 5 units
- Send message: 100 units
- Modify message: 5 units

**Daily Limits**:
- ~200,000 read operations per day
- ~10,000 send operations per day

**Typical Usage**:
- Refresh inbox (50 emails): 255 units
- Send 1 email: 100 units
- Mark as read: 5 units

### Sending Limits

**Gmail Account**:
- 500 emails per day
- 20 MB attachment size per email

**Google Workspace**:
- 2,000 emails per day
- 25 MB attachment size per email

---

## Advanced Configuration

### Custom Scopes

If you need additional Gmail permissions, add them in Google Cloud Console:

**Available Scopes**:
```
gmail.readonly - Read all emails
gmail.send - Send emails
gmail.modify - Modify emails (mark read, star, etc.)
gmail.compose - Compose drafts
gmail.insert - Insert messages
gmail.labels - Manage labels
gmail.settings.basic - View settings
gmail.settings.sharing - Manage forwarding/delegation
gmail.metadata - View email metadata only
```

**Add Scope**:
1. Go to **OAuth consent screen** → **Edit App**
2. Click **"Add or Remove Scopes"**
3. Select additional scopes
4. **Save and Continue**

### Production Deployment

**Before launching to production**:

1. **Verify Domain Ownership**:
   - In Google Cloud Console, add and verify your domain
   - Provides trust indicators to users

2. **OAuth Consent Screen Verification** (for External apps):
   - Submit app for Google verification
   - Required to remove "unverified app" warning
   - Process takes 4-6 weeks
   - [Verification Guide](https://support.google.com/cloud/answer/9110914)

3. **Publish App**:
   - Change status from "Testing" to "In Production"
   - Allows unlimited users to connect

4. **Brand Assets**:
   - Add app logo (120x120px)
   - Add developer logo/profile picture
   - Improves trust and recognition

### Google Workspace Setup

**For Google Workspace (Business) Accounts**:

1. **Admin Console**:
   - Sign in to [Google Admin Console](https://admin.google.com)
   - Go to **Security** → **API Controls**

2. **Allow API Access**:
   - Ensure "Allow users to authorize access to data" is enabled
   - Add GoogleHubs to trusted apps list

3. **OAuth Whitelist**:
   - Add OAuth Client ID to whitelist
   - This bypasses admin approval for all users

---

## Monitoring & Analytics

### Track Gmail Usage

**In Google Cloud Console**:
1. Go to **APIs & Services** → **Dashboard**
2. Click **"Gmail API"**
3. View:
   - Traffic (requests per minute/day)
   - Errors (failed requests)
   - Quota usage (per metric)

**Set Up Alerts**:
1. Go to **Monitoring** → **Alerting**
2. Create alert for quota threshold
3. Get notified before hitting limits

---

## Cost

**Gmail API Pricing**: **FREE**

- No charges for Gmail API usage
- Standard Google Cloud project (free tier)
- Only pay if using other Google Cloud services

**Google Workspace**: Separate subscription
- Not required for Gmail API
- Works with free Gmail accounts too

---

## Support & Resources

### Google Documentation

- [Gmail API Overview](https://developers.google.com/gmail/api/guides)
- [OAuth 2.0 for Web Apps](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [API Reference](https://developers.google.com/gmail/api/reference/rest)
- [Quotas & Limits](https://developers.google.com/gmail/api/reference/quota)

### GoogleHubs Support

- **Email**: support@googlehubs.com
- **Documentation**: See `PLATFORM_UPDATES_SUMMARY.md`
- **Discord**: community.googlehubs.com

### Common Resources

- [Google Sign-In Library](https://developers.google.com/identity/gsi/web/guides/overview)
- [Google API Client Libraries](https://developers.google.com/api-client-library)

---

## Future Enhancements

### Coming Soon

- ✨ **Automatic token refresh** - No need to re-authenticate hourly
- ✨ **Label management** - Create and apply Gmail labels
- ✨ **Advanced search** - Full Gmail search syntax support
- ✨ **Attachment handling** - Download and upload attachments
- ✨ **Multiple accounts** - Switch between Gmail accounts
- ✨ **Smart compose** - AI suggestions as you type
- ✨ **Filters & Rules** - Automated email organization
- ✨ **Templates** - Reusable email templates
- ✨ **Scheduling** - Schedule emails for later sending
- ✨ **Read receipts** - Track when emails are opened
- ✨ **Email tracking** - Monitor link clicks in emails

### Roadmap

**Q1 2025**:
- Token refresh
- Label management
- Advanced search

**Q2 2025**:
- Attachment handling
- Multiple accounts
- Email templates

**Q3 2025**:
- Email scheduling
- Smart compose
- Filters & rules

---

## Frequently Asked Questions

### Q: Is my Gmail password stored?

**A**: No. OAuth2 authentication means we never see or store your password. Google handles authentication securely.

### Q: Can GoogleHubs read all my emails?

**A**: Only emails fetched when you're actively using the platform. We don't continuously monitor or store your emails.

### Q: What happens if I disconnect?

**A**: Your access token is removed from localStorage. You'll need to reconnect to use Gmail features again. Your emails remain in Gmail.

### Q: Can I use multiple Gmail accounts?

**A**: Currently one account at a time. Multiple account support is planned for Q2 2025.

### Q: Does this work with Google Workspace?

**A**: Yes! Works with both personal Gmail and Google Workspace accounts.

### Q: Are there any costs?

**A**: Gmail API is free. No charges from Google or GoogleHubs for email integration.

### Q: How often are emails synced?

**A**: Manual refresh via the "Refresh" button. Auto-sync coming in future update.

### Q: Can I use this offline?

**A**: No. Gmail API requires active internet connection to fetch and send emails.

### Q: Is this HIPAA compliant?

**A**: Gmail integration uses Google's infrastructure. Google Workspace can be HIPAA compliant with proper BAA. Consult with compliance officer for healthcare use.

---

## Conclusion

Gmail integration brings the power of Google's email platform directly into GoogleHubs Email Center. With AI-powered replies, intelligent filtering, and seamless sending, you can manage all your business communications without leaving GoogleHubs.

**Get Started**:
1. Complete Google Cloud Project setup (15 minutes)
2. Connect your Gmail account (30 seconds)
3. Start managing emails with AI assistance!

Need help? Contact support@googlehubs.com

---

*Last Updated: February 17, 2025*
*Version: 1.0*
*GoogleHubs Platform Documentation*
