
'use server';

import { db } from '@/lib/db';
import { logAction, logError } from '@/lib/logger';
import { getTenantEmailTemplates } from './email-templates';

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
 * Simulates sending an email by fetching a template, replacing placeholders, and logging the output.
 * In a real application, this would integrate with an email service like SendGrid, Mailgun, or AWS SES.
 * 
 * @param tenantId The tenant for which to send the email, determines the template.
 * @param recipientEmail The email address of the recipient.
 * @param type The type of email template to use.
 * @param placeholders An object containing values to replace in the template.
 * @returns A promise that resolves when the email has been "sent" (logged).
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

    // --- Email Sending Simulation ---
    // In a real app, you would use an email sending library here.
    // For this project, we will log the email content to the console.
    console.log('--- SIMULATING EMAIL SEND ---');
    console.log(`To: ${recipientEmail}`);
    console.log(`From: noreply@${tenant.domain || 'jobmatch.ai'}`);
    console.log(`Subject: ${subject}`);
    console.log('--- Body ---');
    console.log(body);
    console.log('-----------------------------');
    logAction('Email sent successfully (simulated)', { recipientEmail, type });
    // --- End Simulation ---

  } catch (error) {
    logError('[SendEmail] Failed to send email', error, { recipientEmail, type, tenantId });
  }
}
