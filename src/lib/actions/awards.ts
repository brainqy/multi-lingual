
'use server';

import { db } from '@/lib/db';
import type { Award, AwardCategory } from '@/types';
import { logAction, logError } from '@/lib/logger';

// Award Category Actions
export async function getAwardCategories(): Promise<AwardCategory[]> {
  logAction('Fetching award categories');
  try {
    const categories = await db.awardCategory.findMany({ orderBy: { name: 'asc' } });
    return categories as unknown as AwardCategory[];
  } catch (error) {
    logError('[AwardsAction] Error fetching categories', error);
    return [];
  }
}

export async function createAwardCategory(data: Omit<AwardCategory, 'id'>): Promise<AwardCategory | null> {
  logAction('Creating award category', { name: data.name });
  try {
    const newCategory = await db.awardCategory.create({ data });
    return newCategory as unknown as AwardCategory;
  } catch (error) {
    logError('[AwardsAction] Error creating category', error, { name: data.name });
    return null;
  }
}

export async function updateAwardCategory(id: string, data: Partial<Omit<AwardCategory, 'id'>>): Promise<AwardCategory | null> {
  logAction('Updating award category', { id });
  try {
    const updatedCategory = await db.awardCategory.update({ where: { id }, data });
    return updatedCategory as unknown as AwardCategory;
  } catch (error) {
    logError(`[AwardsAction] Error updating category ${id}`, error, { id });
    return null;
  }
}

export async function deleteAwardCategory(id: string): Promise<boolean> {
  logAction('Deleting award category', { id });
  try {
    // Ensure no awards are using this category first
    const awardsUsingCategory = await db.award.count({ where: { categoryId: id } });
    if (awardsUsingCategory > 0) {
      logError(`[AwardsAction] Attempted to delete category in use`, {}, { id });
      // You might want to throw an error here to be caught by a try-catch in the UI for a better message
      return false; 
    }
    await db.awardCategory.delete({ where: { id } });
    return true;
  } catch (error) {
    logError(`[AwardsAction] Error deleting category ${id}`, error, { id });
    return false;
  }
}


// Award Actions
export async function getAwards(): Promise<Award[]> {
  logAction('Fetching awards');
  try {
    const awards = await db.award.findMany({ orderBy: { title: 'asc' } });
    return awards as unknown as Award[];
  } catch (error) {
    logError('[AwardsAction] Error fetching awards', error);
    return [];
  }
}

export async function createAward(data: Omit<Award, 'id'>): Promise<Award | null> {
  logAction('Creating award', { title: data.title });
  try {
    const newAward = await db.award.create({ data: data as any });
    return newAward as unknown as Award;
  } catch (error) {
    logError('[AwardsAction] Error creating award', error, { title: data.title });
    return null;
  }
}

export async function updateAward(id: string, data: Partial<Omit<Award, 'id'>>): Promise<Award | null> {
  logAction('Updating award', { id });
  try {
    const updatedAward = await db.award.update({ where: { id }, data: data as any });
    return updatedAward as unknown as Award;
  } catch (error) {
    logError(`[AwardsAction] Error updating award ${id}`, error, { id });
    return null;
  }
}

export async function deleteAward(id: string): Promise<boolean> {
  logAction('Deleting award', { id });
  try {
    // In a real app, you'd also delete related nominations and votes in a transaction.
    await db.award.delete({ where: { id } });
    return true;
  } catch (error) {
    logError(`[AwardsAction] Error deleting award ${id}`, error, { id });
    return false;
  }
}
```