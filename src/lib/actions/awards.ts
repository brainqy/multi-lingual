
'use server';

import { db } from '@/lib/db';
import type { Award, AwardCategory, Nomination, UserProfile } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { createNotification } from './notifications';

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
    const awardsUsingCategory = await db.award.count({ where: { categoryId: id } });
    if (awardsUsingCategory > 0) {
      logError(`[AwardsAction] Attempted to delete category in use`, {}, { id });
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
    const awards = await db.award.findMany({ 
        orderBy: { title: 'asc' },
        include: { nominations: { include: { nominee: true, nominator: true } } }
    });
    return awards as unknown as Award[];
  } catch (error) {
    logError('[AwardsAction] Error fetching awards', error);
    return [];
  }
}

export async function createAward(data: Omit<Award, 'id' | 'nominations'>): Promise<Award | null> {
  logAction('Creating award', { title: data.title });
  try {
    const newAward = await db.award.create({ data: data as any });
    return newAward as unknown as Award;
  } catch (error) {
    logError('[AwardsAction] Error creating award', error, { title: data.title });
    return null;
  }
}

export async function updateAward(id: string, data: Partial<Omit<Award, 'id' | 'nominations'>>): Promise<Award | null> {
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
    await db.$transaction([
      db.nomination.deleteMany({ where: { awardId: id } }),
      db.award.delete({ where: { id } }),
    ]);
    return true;
  } catch (error) {
    logError(`[AwardsAction] Error deleting award ${id}`, error, { id });
    return false;
  }
}

// Nomination Actions
export async function createNomination(data: Omit<Nomination, 'id' | 'createdAt'>): Promise<Nomination | null> {
    logAction('Creating nomination', { awardId: data.awardId, nomineeId: data.nomineeId });
    try {
        const award = await db.award.findUnique({ where: { id: data.awardId } });
        if (!award || award.status !== 'Nominating') {
            throw new Error("Nominations are not currently open for this award.");
        }
        
        const now = new Date();
        if (now < award.nominationStartDate || now > award.nominationEndDate) {
            throw new Error("Nomination period is not active.");
        }
        
        const existingNomination = await db.nomination.findFirst({
            where: {
                awardId: data.awardId,
                nomineeId: data.nomineeId,
                nominatorId: data.nominatorId
            }
        });
        if(existingNomination) {
            throw new Error("You have already nominated this person for this award.");
        }

        const newNomination = await db.nomination.create({ data });
        
        const nominee = await db.user.findUnique({ where: { id: data.nomineeId }});
        
        if (nominee && nominee.id !== data.nominatorId) {
             await createNotification({
                userId: data.nomineeId,
                type: 'system',
                content: `You have been nominated for the "${award.title}" award!`,
                link: '/awards',
                isRead: false
            });
        }

        return newNomination as unknown as Nomination;
    } catch (error) {
        logError('[AwardsAction] Error creating nomination', error, { awardId: data.awardId });
        // Re-throw the specific error message to be caught by the UI
        if (error instanceof Error) {
            throw error;
        }
        return null;
    }
}

export async function getActiveAwardsForNomination(): Promise<(Award & { category: AwardCategory })[]> {
    logAction('Fetching active awards for nomination');
    try {
        const now = new Date();
        const awards = await db.award.findMany({
            where: {
                status: 'Nominating',
                nominationStartDate: { lte: now },
                nominationEndDate: { gte: now },
            },
            include: {
                category: true,
                nominations: {
                    include: {
                        nominee: { select: { id: true, name: true, profilePictureUrl: true } }
                    }
                }
            },
            orderBy: { category: { name: 'asc' } }
        });
        return awards as unknown as (Award & { category: AwardCategory })[];
    } catch (error) {
        logError('[AwardsAction] Error fetching active awards', error);
        return [];
    }
}
