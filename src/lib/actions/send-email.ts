
'use server';

import { db } from '@/lib/db';
import { logAction, logError } from '@/lib/logger';
import { getTenantEmailTemplates } from './email-templates';
import nodemailer from 'nodemailer';
import { EmailTemplateType } from '@prisma/client';

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
  logAction('Attempting to send email via Gmail', { recipientEmail, type, tenantId });

  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    logError('[SendEmail] Gmail credentials are not configured in .env file. Email sending is disabled.', new Error('GMAIL_EMAIL or GMAIL_APP_PASSWORD missing'));
    
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    
    // Log the intended email to the console as a fallback
    console.log(`--- FALLBACK: EMAIL NOT SENT (NO GMAIL CREDS) ---`);
    console.log(`To: ${recipientEmail}`);
    console.log(`Type: ${type}`);
    console.log(`Tenant: ${tenant?.name || tenantId}`);
    
    // Manually replace placeholders for the log
    const allPlaceholders: EmailPlaceholders = {
        tenantName: tenant?.name,
        ...placeholders,
    };
    
    console.log(`Placeholders: ${JSON.stringify(allPlaceholders)}`);
    console.log(`-------------------------------------------`);
    return;
  }

  try {
    const templates = await getTenantEmailTemplates(tenantId);
    let template = templates.find(t => t.type === type);

    // If template not found for the specific tenant, create it from default and use it
    if (!template) {
        const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.type === type);
        if (defaultTemplate) {
            logAction('Template not found for tenant, creating from default', { tenantId, type });
            // Corrected: Ensure the 'type' field is included in the create call
            await db.emailTemplate.create({
                data: {
                    type: defaultTemplate.type,
                    subject: defaultTemplate.subject,
                    body: defaultTemplate.body,
                    tenantId: tenantId,
                },
            });
            template = { ...defaultTemplate, id: 'temp', tenantId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        }
    }

    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });

    if (!template || !tenant) {
      logError('[SendEmail] Template or tenant not found', new Error('Template or tenant not found'), { tenantId, type });
      return;
    }

    let subject = template.subject;
    let body = template.body;
    
    // For WELCOME email, we must generate a password reset link from the provided placeholder
    if (type === 'TENANT_WELCOME' && placeholders.tenantDomain) {
        const resetToken = Buffer.from(recipientEmail).toString('base64');
        const subdomain = placeholders.tenantDomain; 
        const resetUrl = `http://${subdomain}.localhost:9002/auth/reset-password?token=${resetToken}`;
        placeholders.resetLink = resetUrl;
    }


    const allPlaceholders: EmailPlaceholders = {
        tenantName: tenant.name,
        ...placeholders,
    };

    for (const [key, value] of Object.entries(allPlaceholders)) {
        if (value) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            subject = subject.replace(regex, value);
            body = body.replace(regex, value);
        }
    }
    
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD, // Use the App Password here
      },
    });

    const mailOptions = {
      from: `"${tenant.name}" <${process.env.GMAIL_EMAIL}>`,
      to: recipientEmail,
      subject: subject,
      text: body,
      // html: "<p>HTML version of the message</p>" // You can add an HTML version here
    };

    const info = await transporter.sendMail(mailOptions);

    logAction('Email sent successfully via Gmail', { recipientEmail, type, messageId: info.messageId });

  } catch (error) {
    logError('[SendEmail] Failed to send email via Gmail', error, { recipientEmail, type, tenantId });
  }
}
