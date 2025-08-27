
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
        include: { 
          nominations: { include: { nominee: true, nominator: true } },
          winner: true,
        }
    });
    return awards as unknown as Award[];
  } catch (error) {
    logError('[AwardsAction] Error fetching awards', error);
    return [];
  }
}

export async function createAward(data: Omit<Award, 'id' | 'nominations' | 'winner' | 'category'>): Promise<Award | null> {
  logAction('Creating award', { title: data.title });
  try {
    const newAward = await db.award.create({ data: data as any });
    return newAward as unknown as Award;
  } catch (error) {
    logError('[AwardsAction] Error creating award', error, { title: data.title });
    return null;
  }
}

export async function updateAward(id: string, data: Partial<Omit<Award, 'id' | 'nominations' | 'winner' | 'category'>>): Promise<Award | null> {
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
      db.vote.deleteMany({ where: { nomination: { awardId: id } } }),
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
export async function createNomination(data: Omit<Nomination, 'id' | 'createdAt' | 'award' | 'nominee' | 'nominator' | 'votes'>): Promise<Nomination | null> {
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
            }
        });
        if(existingNomination) {
            // To keep it simple, we don't allow multiple people to nominate the same person.
            // First nomination counts. A real app might handle this differently.
            throw new Error("This person has already been nominated for this award.");
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
        if (error instanceof Error) {
            throw error;
        }
        return null;
    }
}

export async function getActiveAwardsForNomination(): Promise<(Award & { category: AwardCategory })[]> {
    logAction('Fetching active awards for nomination/voting');
    try {
        const now = new Date();
        const awards = await db.award.findMany({
            where: {
              status: { in: ['Nominating', 'Voting', 'Completed'] },
              // Fetch awards that are either currently active or recently completed
              OR: [
                { nominationStartDate: { lte: now } },
                { votingStartDate: { lte: now } },
              ]
            },
            include: {
                category: true,
                winner: true,
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


// Voting Actions
export async function getNomineesForAward(awardId: string): Promise<Nomination[]> {
  logAction('Fetching nominees for award', { awardId });
  try {
    const nominees = await db.nomination.findMany({
      where: { awardId },
      include: {
        nominee: true,
      },
      orderBy: { nominee: { name: 'asc' } },
    });
    return nominees as unknown as Nomination[];
  } catch (error) {
    logError(`[AwardsAction] Error fetching nominees for award ${awardId}`, error, { awardId });
    return [];
  }
}

export async function castVote(data: { awardId: string; nomineeId: string; voterId: string; }): Promise<{ success: boolean; message: string; }> {
  logAction('Casting vote', { awardId: data.awardId, voterId: data.voterId });
  try {
    const award = await db.award.findUnique({ where: { id: data.awardId } });
    if (!award || award.status !== 'Voting') {
      return { success: false, message: "Voting is not currently open for this award." };
    }

    const nomination = await db.nomination.findFirst({
        where: { awardId: data.awardId, nomineeId: data.nomineeId }
    });
    if (!nomination) {
        return { success: false, message: "Invalid nominee for this award." };
    }

    // Check for existing vote by this user for this award
    const existingVote = await db.vote.findFirst({
      where: {
        voterId: data.voterId,
        nomination: {
          awardId: data.awardId,
        },
      },
    });

    if (existingVote) {
      return { success: false, message: "You have already voted for this award." };
    }

    await db.vote.create({
      data: {
        nominationId: nomination.id,
        voterId: data.voterId,
      },
    });

    return { success: true, message: "Your vote has been cast successfully." };
  } catch (error: any) {
    logError('[AwardsAction] Error casting vote', error, { awardId: data.awardId });
    if (error.code === 'P2002') { // Unique constraint violation
      return { success: false, message: "You have already voted for this award." };
    }
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function tallyVotesAndDeclareWinner(awardId: string): Promise<{ success: boolean; error?: string; award?: Award }> {
  logAction('Tallying votes and declaring winner', { awardId });
  try {
    const nominationsWithVotes = await db.nomination.findMany({
      where: { awardId: awardId },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    if (nominationsWithVotes.length === 0) {
      return { success: false, error: 'No nominations found for this award.' };
    }

    // Find the nominee with the most votes
    const sortedNominations = nominationsWithVotes.sort((a, b) => b._count.votes - a._count.votes);
    const winnerNomination = sortedNominations[0];
    const topVoteCount = winnerNomination._count.votes;
    
    // Check for ties
    const tiedWinners = sortedNominations.filter(n => n._count.votes === topVoteCount);
    if (tiedWinners.length > 1) {
      return { success: false, error: `There is a tie between ${tiedWinners.length} nominees.` };
    }

    const winnerId = winnerNomination.nomineeId;
    const updatedAward = await db.award.update({
      where: { id: awardId },
      data: {
        winnerId: winnerId,
        status: 'Completed',
      },
      include: { winner: true }
    });
    
    logAction('Winner declared', { awardId, winnerId });
    
    await createNotification({
        userId: winnerId,
        type: 'system',
        content: `Congratulations! You have won the "${updatedAward.title}" award!`,
        link: '/awards',
        isRead: false,
    });
    
    return { success: true, award: updatedAward as unknown as Award };

  } catch (error) {
    logError(`[AwardsAction] Error tallying votes for award ${awardId}`, error, { awardId });
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
