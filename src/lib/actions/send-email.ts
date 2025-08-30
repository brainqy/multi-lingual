
'use server';

import { db } from '@/lib/db';
import { logAction, logError } from '@/lib/logger';
import { getTenantEmailTemplates } from './email-templates';
import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailPlaceholders {
  userName?: string;
  userEmail?: string;
  tenantName?: string;
  resetLink?: string;
  appointmentTitle?: string;
  partnerName?: string;
  appointmentDateTime?: string;
  appointmentLink?: string;
}

/**
 * Sends an email using the Resend service.
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
  type: 'WELCOME' | 'APPOINTMENT_CONFIRMATION' | 'PASSWORD_RESET';
  placeholders: EmailPlaceholders;
}) {
  logAction('Attempting to send email', { recipientEmail, type, tenantId });

  if (!process.env.RESEND_API_KEY) {
    logError('[SendEmail] Resend API key is not configured. Email sending is disabled.', new Error('RESEND_API_KEY missing'));
    // Log the intended email to the console as a fallback
    console.log(`--- FALLBACK: EMAIL NOT SENT (NO API KEY) ---`);
    console.log(`To: ${recipientEmail}`);
    console.log(`Type: ${type}`);
    console.log(`Placeholders: ${JSON.stringify(placeholders)}`);
    console.log(`-------------------------------------------`);
    return;
  }

  try {
    const templates = await getTenantEmailTemplates(tenantId);
    const template = templates.find(t => t.type === type);
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });

    if (!template || !tenant) {
      logError('[SendEmail] Template or tenant not found', new Error('Template or tenant not found'), { tenantId, type });
      return;
    }

    let subject = template.subject;
    let body = template.body;
    
    // Replace all placeholders
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
    
    // Using a generic "from" address. Resend requires a verified domain.
    // Replace 'onboarding@resend.dev' with your own verified domain email in a real app.
    const fromAddress = `donotreply@${tenant.domain || 'bhashasetu.com'}`;
    const fallbackFrom = 'JobMatch AI <onboarding@resend.dev>';
    
    const { data, error } = await resend.emails.send({
      from: fallbackFrom,
      to: [recipientEmail],
      subject: subject,
      text: body, // Use the text version of the body for simplicity
      // For HTML emails, you would use:
      // html: '<p>Your HTML content here</p>'
    });

    if (error) {
      logError('[SendEmail] Resend API error', error, { recipientEmail, type });
      throw error;
    }

    logAction('Email sent successfully via Resend', { recipientEmail, type, messageId: data?.id });

  } catch (error) {
    logError('[SendEmail] Failed to send email', error, { recipientEmail, type, tenantId });
  }
}
