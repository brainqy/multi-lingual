
'use server';

import type { EmailTemplateType } from '@prisma/client';

/**
 * Defines the default email templates to be used when a tenant
 * does not have a custom one in the database.
 */
export const DEFAULT_TEMPLATES: { type: EmailTemplateType; subject: string; body: string }[] = [
  {
    type: 'WELCOME',
    subject: 'Welcome to {{tenantName}}!',
    body: 'Hi {{userName}},\n\nWelcome to the {{tenantName}} alumni network! We are thrilled to have you as part of our community.\n\nYour username is your email: {{userEmail}}\n\nYou can now log in to explore the platform, connect with fellow alumni, find job opportunities, and access career resources.\n\nBest,\nThe {{tenantName}} Team',
  },
  {
    type: 'TENANT_WELCOME',
    subject: 'Your new manager account for {{tenantName}} is ready!',
    body: 'Hi {{userName}},\n\nA new tenant, "{{tenantName}}", has been created on our platform and your account has been set up as the primary manager.\n\nYour username is your email: {{userEmail}}\n\nPlease click the link below to set your password and access your new tenant dashboard:\n\n{{resetLink}}\n\nIf you did not expect this, please contact support.\n\nBest,\nThe Platform Team',
  },
  {
    type: 'APPOINTMENT_CONFIRMATION',
    subject: 'Your appointment is confirmed: {{appointmentTitle}}',
    body: 'Hi {{userName}},\n\nThis is a confirmation that your appointment "{{appointmentTitle}}" with {{partnerName}} has been scheduled for {{appointmentDateTime}}.\n\nYou can view your appointment details here: {{appointmentLink}}\n\nThanks,\nThe {{tenantName}} Team',
  },
  {
    type: 'PASSWORD_RESET',
    subject: 'Reset your password for {{tenantName}}',
    body: 'Hi {{userName}},\n\nA password reset was requested for your account. Please click the link below to set a new password:\n\n{{resetLink}}\n\nIf you did not request this, you can safely ignore this email.\n\nThanks,\nThe {{tenantName}} Team',
  },
  {
    type: 'PRACTICE_INTERVIEW_INVITE',
    subject: 'Interview Invitation — JobMatch AI',
    body: `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Interview Invitation — JobMatch AI</title>
  <style>
    /* Basic, email-safe inline-friendly styles (can be moved inline if needed) */
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      color: #0f1720;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 28px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 8px 30px rgba(12, 24, 40, 0.06);
      overflow: hidden;
    }
    .inner {
      padding: 28px;
    }
    .preheader {
      display: none !important;
      visibility: hidden;
      opacity: 0;
      color: transparent;
      height: 0;
      width: 0;
      overflow: hidden;
      mso-hide: all;
    }
    h1 {
      font-size: 20px;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }
    p {
      margin: 12px 0;
      font-size: 15px;
      line-height: 1.5;
    }
    .button {
      display: inline-block;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      background-color: #0b72ff;
      color: #ffffff;
    }
    .muted {
      color: #6b7280;
      font-size: 13px;
    }
    .footer {
      padding: 18px 28px;
      background: #f8fafc;
      font-size: 13px;
      color: #6b7280;
    }
    .brand {
      display: inline-block;
      margin-bottom: 10px;
      font-weight: 700;
      color: #0b72ff;
      text-decoration: none;
    }
    .fallback {
      word-break: break-all;
    }

    /* mobile adjustments */
    @media screen and (max-width: 480px) {
      .inner { padding: 18px; }
      .button { width: 100%; text-align: center; display: block; }
    }
  </style>
</head>
<body>
  <!-- Preheader (preview text in inbox) -->
  <div class="preheader">{{inviterName}} invited you to a practice interview on JobMatch AI — join the session using the link inside.</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:20px 28px; border-bottom: 1px solid #eef2f6; background: #ffffff;">
              <a href="#" class="brand">JobMatch AI</a>
            </td>
          </tr>

          <tr>
            <td class="inner">
              <h1>Hi {{userName}},</h1>

              <p>
                <strong>{{inviterName}}</strong> has invited you to a <strong>practice interview session</strong> on the JobMatch AI platform.
              </p>

              <p>
                Click the button below to join the session when it's time:
              </p>

              <p style="margin:18px 0 6px 0;">
                <a href="{{interviewLink}}" class="button" target="_blank" rel="noopener noreferrer">Join the interview session</a>
              </p>

              <p class="muted" style="margin-top:8px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p class="fallback muted" style="font-size:13px;">
                <a href="{{interviewLink}}" target="_blank" rel="noopener noreferrer" style="color:#0b72ff; text-decoration: none;">{{interviewLink}}</a>
              </p>

              <p>
                This is a great opportunity to hone your interview skills — practice common questions, get feedback, and improve your confidence.
              </p>

              <p style="margin-top:22px;">
                Best,<br/>
                <strong>The JobMatch AI Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td class="footer" align="left">
              <div style="margin-bottom:8px;">Need help?</div>
              <div class="muted" style="line-height:1.4;">
                If you didn't expect this invitation or have questions, please contact <a href="mailto:support@jobmatch.ai" style="color:#0b72ff; text-decoration:none;">support@jobmatch.ai</a>.
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:12px 28px; text-align:center; font-size:12px; color:#9aa4b2;">
              © <span id="year"></span> JobMatch AI. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <script>
    // Set current year for the footer (runs in clients that allow JS; harmless otherwise)
    try {
      document.getElementById('year').textContent = new Date().getFullYear();
    } catch (e) {}
  </script>
</body>
</html>
`
  },
];

    