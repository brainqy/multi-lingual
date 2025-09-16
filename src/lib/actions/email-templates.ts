
'use server';

import { db } from '@/lib/db';
import type { EmailTemplate } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { DEFAULT_TEMPLATES } from '@/lib/email-defaults';


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
