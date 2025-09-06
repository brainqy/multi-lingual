
'use server';

import { db } from '@/lib/db';
import type { EmailTemplate } from '@/types';
import { EmailTemplateType } from '@prisma/client';
import { logAction, logError } from '@/lib/logger';

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
];


/**
 * Fetches all email templates for a given tenant.
 * If no templates exist for the tenant, it creates the default set.
 * @param tenantId The ID of the tenant.
 * @returns A promise that resolves to an array of EmailTemplate objects.
 */
export async function getTenantEmailTemplates(tenantId: string): Promise<EmailTemplate[]> {
  logAction('Fetching email templates for tenant', { tenantId });
  try {
    let templates = await db.emailTemplate.findMany({
      where: { tenantId },
      orderBy: { type: 'asc' },
    });

    if (templates.length === 0) {
      logAction('No templates found, creating defaults for tenant', { tenantId });
      
      const templatesToCreate = DEFAULT_TEMPLATES.map(t => ({
        ...t,
        tenantId: tenantId,
      }));
      
      await db.emailTemplate.createMany({
        data: templatesToCreate,
      });
      
      templates = await db.emailTemplate.findMany({
        where: { tenantId },
        orderBy: { type: 'asc' },
      });
    }

    return templates as unknown as EmailTemplate[];
  } catch (error) {
    logError(`[EmailTemplateAction] Error fetching templates for tenant ${tenantId}`, error, { tenantId });
    return [];
  }
}

/**
 * Updates an existing email template.
 * @param templateId The ID of the template to update.
 * @param updateData The data to update (subject and/or body).
 * @returns The updated EmailTemplate object or null.
 */
export async function updateEmailTemplate(templateId: string, updateData: Partial<Pick<EmailTemplate, 'subject' | 'body'>>): Promise<EmailTemplate | null> {
  logAction('Updating email template', { templateId });
  try {
    const updatedTemplate = await db.emailTemplate.update({
      where: { id: templateId },
      data: updateData,
    });
    return updatedTemplate as unknown as EmailTemplate;
  } catch (error) {
    logError(`[EmailTemplateAction] Error updating template ${templateId}`, error, { templateId });
    return null;
  }
}
