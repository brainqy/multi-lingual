
'use server';

import { db } from '@/lib/db';
import { logAction, logError } from '@/lib/logger';
import { getTenantEmailTemplates } from './email-templates';
import nodemailer from 'nodemailer';

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
}

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
  type: 'WELCOME' | 'APPOINTMENT_CONFIRMATION' | 'PASSWORD_RESET';
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
    const template = templates.find(t => t.type === type);
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });

    if (!template || !tenant) {
      logError('[SendEmail] Template or tenant not found', new Error('Template or tenant not found'), { tenantId, type });
      return;
    }

    let subject = template.subject;
    let body = template.body;
    
    // For WELCOME email, we must generate a password reset link
    if (type === 'WELCOME' && !placeholders.resetLink) {
        // This is a simplified token generation for demonstration. 
        // In production, use a secure, single-use, expiring token (e.g., JWT, crypto).
        const resetToken = Buffer.from(recipientEmail).toString('base64');
        const subdomain = placeholders.tenantDomain || tenant.domain || tenant.id;
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
