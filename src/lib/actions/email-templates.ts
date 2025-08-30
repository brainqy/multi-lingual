
'use server';

import { PrismaClient } from '@prisma/client';
import type { EmailTemplate } from '@/types';
import { logAction, logError } from '@/lib/logger';

const db = new PrismaClient();

const DEFAULT_TEMPLATES = [
  {
    type: 'WELCOME',
    subject: 'Welcome to {{tenantName}}!',
    body: 'Hi {{userName}},\n\nWelcome to the {{tenantName}} alumni network, powered by JobMatch AI! We are thrilled to have you as part of our community.\n\nExplore the platform to connect with fellow alumni, find job opportunities, and access career resources.\n\nBest,\nThe {{tenantName}} Team',
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
];


/**
 * Fetches all email templates for a given tenant.
 * If no templates exist for the tenant, it creates the default set.
 * @param tenantId The ID of the tenant.
 * @returns A promise that resolves to an array of EmailTemplate objects.
 */
export async function getTenantEmailTemplates(tenantId: string): Promise<EmailTemplate[]> {
  console.log('[EmailTemplateAction LOG] --- Entering getTenantEmailTemplates ---', { tenantId });
  logAction('Fetching email templates for tenant', { tenantId });
  try {
    console.log('[EmailTemplateAction LOG] 1. Checking for existing templates in the database.');
    let templates = await db.emailTemplate.findMany({
      where: { tenantId },
      orderBy: { type: 'asc' },
    });
    console.log(`[EmailTemplateAction LOG] 2. Found ${templates.length} existing templates.`);

    if (templates.length === 0) {
      console.log('[EmailTemplateAction LOG] 3. No templates found. Proceeding to create default templates.');
      logAction('No templates found, creating defaults for tenant', { tenantId });
      
      const templatesToCreate = DEFAULT_TEMPLATES.map(t => ({
        ...t,
        tenantId: tenantId,
      }));
      
      console.log('[EmailTemplateAction LOG] 4. Starting transaction to create default templates.');
      await db.emailTemplate.createMany({
        data: templatesToCreate,
      });
      console.log('[EmailTemplateAction LOG] 5. Finished creating default templates.');
      
      console.log('[EmailTemplateAction LOG] 6. Re-fetching templates after creation.');
      templates = await db.emailTemplate.findMany({
        where: { tenantId },
        orderBy: { type: 'asc' },
      });
      console.log(`[EmailTemplateAction LOG] 7. Re-fetched and found ${templates.length} templates.`);
    }

    console.log('[EmailTemplateAction LOG] --- Exiting getTenantEmailTemplates successfully ---');
    return templates as unknown as EmailTemplate[];
  } catch (error) {
    console.error('[EmailTemplateAction LOG] !!! ERROR in getTenantEmailTemplates:', error);
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
  console.log('[EmailTemplateAction LOG] --- Entering updateEmailTemplate ---', { templateId, updateData });
  logAction('Updating email template', { templateId });
  try {
    console.log('[EmailTemplateAction LOG] 1. Calling database to update template.');
    const updatedTemplate = await db.emailTemplate.update({
      where: { id: templateId },
      data: updateData,
    });
    console.log('[EmailTemplateAction LOG] 2. Database update successful.', { updatedTemplateId: updatedTemplate.id });
    console.log('[EmailTemplateAction LOG] --- Exiting updateEmailTemplate successfully ---');
    return updatedTemplate as unknown as EmailTemplate;
  } catch (error) {
    console.error('[EmailTemplateAction LOG] !!! ERROR in updateEmailTemplate:', error);
    logError(`[EmailTemplateAction] Error updating template ${templateId}`, error, { templateId });
    return null;
  }
}
