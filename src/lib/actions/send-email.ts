
'use server';

import { db } from '@/lib/db';
import { logAction, logError } from '@/lib/logger';
import { getTenantEmailTemplates } from './email-templates';
import nodemailer from 'nodemailer';
import { EmailTemplateType } from '@prisma/client';
import { getUserByEmail } from '../data-services/users';

interface EmailPlaceholders {
  userName?: string;
  userEmail?: string;
  tenantName?: string;
  tenantDomain?: string;
  resetLink?: string;
  appointmentTitle?: string;
  partnerName?: string;
  appointmentDateTime?: string;
  appointmentLink?: string;
  inviterName?: string;
  interviewLink?: string;
}

const DEFAULT_TEMPLATES: { type: EmailTemplateType; subject: string; body: string }[] = [
  {
    type: EmailTemplateType.WELCOME,
    subject: 'Welcome to {{tenantName}}!',
    body: 'Hi {{userName}},\n\nWelcome to the {{tenantName}} alumni network! We are thrilled to have you as part of our community.\n\nYour username is your email: {{userEmail}}\n\nYou can now log in to explore the platform, connect with fellow alumni, find job opportunities, and access career resources.\n\nBest,\nThe {{tenantName}} Team',
  },
  {
    type: EmailTemplateType.TENANT_WELCOME,
    subject: 'Your new manager account for {{tenantName}} is ready!',
    body: 'Hi {{userName}},\n\nA new tenant, "{{tenantName}}", has been created on our platform and your account has been set up as the primary manager.\n\nYour username is your email: {{userEmail}}\n\nPlease click the link below to set your password and access your new tenant dashboard:\n\n{{resetLink}}\n\nIf you did not expect this, please contact support.\n\nBest,\nThe Platform Team',
  },
  {
    type: EmailTemplateType.APPOINTMENT_CONFIRMATION,
    subject: 'Your appointment is confirmed: {{appointmentTitle}}',
    body: 'Hi {{userName}},\n\nThis is a confirmation that your appointment "{{appointmentTitle}}" with {{partnerName}} has been scheduled for {{appointmentDateTime}}.\n\nYou can view your appointment details here: {{appointmentLink}}\n\nThanks,\nThe {{tenantName}} Team',
  },
  {
    type: EmailTemplateType.PASSWORD_RESET,
    subject: 'Reset your password for {{tenantName}}',
    body: 'Hi {{userName}},\n\nA password reset was requested for your account. Please click the link below to set a new password:\n\n{{resetLink}}\n\nIf you did not request this, you can safely ignore this email.\n\nThanks,\nThe {{tenantName}} Team',
  },
  {
    type: EmailTemplateType.PRACTICE_INTERVIEW_INVITE,
    subject: 'Invitation to a Practice Interview from {{inviterName}}',
    body: 'Hi {{userName}},\n\n{{inviterName}} has invited you to a practice interview session on the JobMatch AI platform.\n\nClick the link below to join the session when it\'s time:\n\n{{interviewLink}}\n\nThis is a great opportunity to hone your interview skills!\n\nBest,\nThe JobMatch AI Team',
  },
];


/**
 * Sends an email using the Nodemailer service with Gmail.
 * It fetches a template, replaces placeholders, and sends the email.
 * 
 * @param tenantId The tenant for which to send the email, which determines the template.
 * @param recipientEmail The email address of the recipient.
 * @param type The type of email template to use.
 * @param placeholders An object containing values to replace in the template.
 * @returns A promise that resolves when the email has been sent.
 */
export async function sendEmail({
  tenantId,
  recipientEmail,
  type,
  placeholders,
}: {
  tenantId: string;
  recipientEmail: string;
  type: EmailTemplateType;
  placeholders: EmailPlaceholders;
}) {
  logAction('[SendEmail] 1. Function invoked.', { recipientEmail, type, tenantId });

  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    logError('[SendEmail] 2. Gmail credentials are not configured. Email sending is disabled.', new Error('GMAIL_EMAIL or GMAIL_APP_PASSWORD missing'));
    
    logAction('[SendEmail] 2a. Fallback: Logging intended email to console.');
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    
    console.log(`--- FALLBACK: EMAIL NOT SENT (NO GMAIL CREDS) ---`);
    console.log(`To: ${recipientEmail}`);
    console.log(`Type: ${type}`);
    console.log(`Tenant: ${tenant?.name || tenantId}`);
    
    const allPlaceholders: EmailPlaceholders = {
        tenantName: tenant?.name,
        ...placeholders,
    };
    
    console.log(`Placeholders: ${JSON.stringify(allPlaceholders)}`);
    console.log(`-------------------------------------------`);
    logAction('[SendEmail] 2b. Fallback complete. Exiting function.');
    return;
  }

  try {
    logAction('[SendEmail] 3. Entering try block. Fetching templates for tenant.', { tenantId });
    const templates = await getTenantEmailTemplates(tenantId);
    logAction('[SendEmail] 4. Fetched existing templates.', { count: templates.length });
    let template = templates.find(t => t.type === type);
    logAction('[SendEmail] 5. Searched for required template type.', { type, found: !!template });

    if (!template) {
      logAction('[SendEmail] 6. Template not found for tenant, creating from default.', { tenantId, type });
      const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.type === type);
      logAction('[SendEmail] 6.0 Template not found for tenant, creating from default.', defaultTemplate);
      
      if (defaultTemplate) {
        logAction('[SendEmail] 6a. Found a default template to use.', { type: defaultTemplate.type });
        
        const dataForDb = {
            subject: defaultTemplate.subject,
            body: defaultTemplate.body,
            tenantId: tenantId,
            type: defaultTemplate.type,
        };
        logAction('[SendEmail] 6b. Data prepared for DB create operation.', { dataForDb });
        
        const newTemplate = await db.emailTemplate.create({ data: dataForDb });
        logAction('[SendEmail] 6c. Successfully created default template in DB.', { newTemplateId: newTemplate.id });
        
        template = { ...newTemplate, createdAt: newTemplate.createdAt.toISOString(), updatedAt: newTemplate.updatedAt.toISOString() };
        logAction('[SendEmail] 6d. Re-assigned local template variable with new DB entry.');
      }
    }

    logAction('[SendEmail] 7. Fetching tenant details.', { tenantId });
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    logAction('[SendEmail] 8. Tenant details fetched.', { tenantName: tenant?.name });

    if (!template || !tenant) {
      logError('[SendEmail] 9. ERROR: Template or tenant object is missing. Cannot proceed.', new Error('Template or tenant not found'), { tenantId, type, templateExists: !!template, tenantExists: !!tenant });
      return;
    }
    logAction('[SendEmail] 9. Template and tenant objects are valid.');

    let subject = template.subject;
    let body = template.body;
    
    logAction('[SendEmail] 10. Preparing placeholders.', { type });
    if (type === 'TENANT_WELCOME' && placeholders.tenantDomain) {
        const resetToken = Buffer.from(recipientEmail).toString('base64');
        const subdomain = placeholders.tenantDomain; 
        const resetUrl = `http://${subdomain}.localhost:9002/auth/reset-password?token=${resetToken}`;
        placeholders.resetLink = resetUrl;
        logAction('[SendEmail] 10a. Generated tenant welcome reset link.', { resetUrl });
    }

    const allPlaceholders: EmailPlaceholders = {
        tenantName: tenant.name,
        ...placeholders,
    };
    logAction('[SendEmail] 11. All placeholders compiled.', { allPlaceholders });

    for (const [key, value] of Object.entries(allPlaceholders)) {
        if (value) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            subject = subject.replace(regex, value);
            body = body.replace(regex, value);
        }
    }
    logAction('[SendEmail] 12. Placeholders replaced in subject and body.');
    
    logAction('[SendEmail] 13. Creating nodemailer transporter.');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    logAction('[SendEmail] 14. Transporter created. Preparing mail options.');

    const mailOptions = {
      from: `"${tenant.name}" <${process.env.GMAIL_EMAIL}>`,
      to: recipientEmail,
      subject: subject,
      text: body,
    };
    logAction('[SendEmail] 15. Mail options prepared. Sending email...', { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });

    const info = await transporter.sendMail(mailOptions);

    logAction('[SendEmail] 16. Email sent successfully via Gmail', { recipientEmail, type, messageId: info.messageId });

  } catch (error) {
    logError('[SendEmail] 17. CATCH BLOCK: Failed to send email via Gmail', error, { recipientEmail, type, tenantId });
  }
}
