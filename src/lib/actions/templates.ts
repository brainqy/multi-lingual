
'use server';

import { db } from '@/lib/db';
import type { ResumeTemplate } from '@/types';

/**
 * Fetches all resume templates from the database.
 * @returns A promise that resolves to an array of ResumeTemplate objects.
 */
export async function getResumeTemplates(): Promise<ResumeTemplate[]> {
  try {
    const templates = await db.resumeTemplate.findMany({
      orderBy: { name: 'asc' },
    });
    return templates as unknown as ResumeTemplate[];
  } catch (error) {
    console.error('[TemplateAction] Error fetching templates:', error);
    return [];
  }
}

/**
 * Creates a new resume template.
 * @param templateData The data for the new template.
 * @returns The newly created ResumeTemplate object or null.
 */
export async function createResumeTemplate(templateData: Omit<ResumeTemplate, 'id'>): Promise<ResumeTemplate | null> {
  try {
    const newTemplate = await db.resumeTemplate.create({
      data: templateData,
    });
    return newTemplate as unknown as ResumeTemplate;
  } catch (error) {
    console.error('[TemplateAction] Error creating template:', error);
    return null;
  }
}

/**
 * Updates an existing resume template.
 * @param templateId The ID of the template to update.
 * @param updateData The data to update.
 * @returns The updated ResumeTemplate object or null.
 */
export async function updateResumeTemplate(templateId: string, updateData: Partial<Omit<ResumeTemplate, 'id'>>): Promise<ResumeTemplate | null> {
  try {
    const updatedTemplate = await db.resumeTemplate.update({
      where: { id: templateId },
      data: updateData,
    });
    return updatedTemplate as unknown as ResumeTemplate;
  } catch (error) {
    console.error(`[TemplateAction] Error updating template ${templateId}:`, error);
    return null;
  }
}

/**
 * Deletes a resume template.
 * @param templateId The ID of the template to delete.
 * @returns A boolean indicating success.
 */
export async function deleteResumeTemplate(templateId: string): Promise<boolean> {
  try {
    await db.resumeTemplate.delete({
      where: { id: templateId },
    });
    return true;
  } catch (error) {
    console.error(`[TemplateAction] Error deleting template ${templateId}:`, error);
    return false;
  }
}
