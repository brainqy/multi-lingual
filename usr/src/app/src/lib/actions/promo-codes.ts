
'use server';


import type { PromoCode } from '@/types';
import { isPast, parseISO, addDays } from 'date-fns';
import { updateUser } from '@/lib/data-services/users';
import { getWallet, updateWallet } from './wallet';

import { checkAndAwardBadges } from './gamification';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { createActivity } from '@/lib/actions/activities';

/**
 * Fetches all promo codes, scoped by tenant for managers.
 * @param tenantId Optional tenant ID. If undefined, fetches all. If provided, fetches for that tenant and platform-wide.
 * @returns A promise that resolves to an array of PromoCode objects.
 */
export async function getPromoCodes(tenantId?: string): Promise<PromoCode[]> {
  try {
    const whereClause: Prisma.PromoCodeWhereInput = {};
    if (tenantId) {
      whereClause.OR = [
        { tenantId: tenantId },
        { tenantId: 'platform' },
      ];
    }
    const codes = await db.promoCode.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    return codes as unknown as PromoCode[];
  } catch (error) {
    console.error('[PromoCodeAction] Error fetching promo codes:', error);
    return [];
  }
}

/**
 * Creates a new promo code.
 * @param codeData The data for the new promo code.
 * @returns The newly created PromoCode object or null.
 */
export async function createPromoCode(codeData: Omit<PromoCode, 'id' | 'timesUsed' | 'createdAt'>): Promise<PromoCode | null> {
  console.log('[PromoCodeAction LOG] 1. Starting createPromoCode with data:', codeData);
  try {
    const { isPlatformWide, ...restOfData } = codeData as any;
    const dataForDb = {
      ...restOfData,
      code: codeData.code.toUpperCase(),
      expiresAt: codeData.expiresAt ? new Date(codeData.expiresAt) : undefined,
    };
    console.log('[PromoCodeAction LOG] 2. Prepared data for DB:', dataForDb);
    const newCode = await db.promoCode.create({
      data: dataForDb,
    });
    console.log('[PromoCodeAction LOG] 3. DB creation successful:', newCode);
    return newCode as unknown as PromoCode;
  } catch (error) {
    console.error('[PromoCodeAction LOG] 4. Error creating promo code:', error);
    return null;
  }
}


/**
 * Updates an existing promo code.
 * @param codeId The ID of the promo code to update.
 * @param updateData The data to update.
 * @returns The updated PromoCode object or null.
 */
export async function updatePromoCode(codeId: string, updateData: Partial<Omit<PromoCode, 'id'>>): Promise<PromoCode | null> {
  try {
    const updatedCode = await db.promoCode.update({
      where: { id: codeId },
      data: {
        ...updateData,
        code: updateData.code ? updateData.code.toUpperCase() : undefined,
        expiresAt: updateData.expiresAt ? new Date(updateData.expiresAt) : undefined,
      },
    });
    return updatedCode as unknown as PromoCode;
  } catch (error) {
    console.error(`[PromoCodeAction] Error updating promo code ${codeId}:`, error);
    return null;
  }
}

/**
 * Deletes a promo code.
 * @param codeId The ID of the promo code to delete.
 * @returns A boolean indicating success.
 */
export async function deletePromoCode(codeId: string): Promise<boolean> {
  try {
    await db.promoCode.delete({
      where: { id: codeId },
    });
    return true;
  } catch (error) {
    console.error(`[PromoCodeAction] Error deleting promo code ${codeId}:`, error);
    return false;
  }
}

/**
 * Redeems a promo code for a user.
 * @param code The promo code string.
 * @param userId The ID of the user redeeming the code.
 * @returns An object indicating success or failure with a message.
 */
export async function redeemPromoCode(code: string, userId: string): Promise<{ success: boolean; message: string; rewardType?: string; rewardValue?: number; }> {
    console.log(`[PromoCodeAction LOG] 1. Starting redeemPromoCode for user: ${userId}, code: ${code}`);
    try {
        console.log(`[PromoCodeAction LOG] 2. Searching for promo code: ${code.toUpperCase()}`);
        const promoCode = await db.promoCode.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!promoCode) {
            console.log(`[PromoCodeAction LOG] 3a. Promo code not found.`);
            return { success: false, message: 'Invalid promo code.' };
        }
        console.log(`[PromoCodeAction LOG] 3b. Found promo code:`, promoCode);

        if (!promoCode.isActive) {
            console.log(`[PromoCodeAction LOG] 4a. Promo code is inactive.`);
            return { success: false, message: 'This promo code is inactive.' };
        }
        console.log(`[PromoCodeAction LOG] 4b. Promo code is active.`);

        if (promoCode.expiresAt && isPast(promoCode.expiresAt)) {
            console.log(`[PromoCodeAction LOG] 5a. Promo code has expired.`);
            return { success: false, message: 'This promo code has expired.' };
        }
        console.log(`[PromoCodeAction LOG] 5b. Promo code is not expired.`);

        if (promoCode.usageLimit > 0 && promoCode.timesUsed >= promoCode.usageLimit) {
            console.log(`[PromoCodeAction LOG] 6a. Promo code has reached its usage limit.`);
            return { success: false, message: 'This promo code has reached its usage limit.' };
        }
        console.log(`[PromoCodeAction LOG] 6b. Promo code is within usage limits.`);

        console.log(`[PromoCodeAction LOG] 7. Searching for user: ${userId}`);
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
            console.log(`[PromoCodeAction LOG] 8a. User not found.`);
            return { success: false, message: 'User not found.' };
        }
        console.log(`[PromoCodeAction LOG] 8b. Found user:`, user.email);
        
        if (promoCode.tenantId && promoCode.tenantId !== 'platform' && user.tenantId !== promoCode.tenantId) {
            console.log(`[PromoCodeAction LOG] 9a. Tenant mismatch. Code tenant: ${promoCode.tenantId}, User tenant: ${user.tenantId}`);
            return { success: false, message: 'This promo code is not valid for your account.' };
        }
        console.log(`[PromoCodeAction LOG] 9b. Tenant check passed.`);
        
        console.log(`[PromoCodeAction LOG] 10. Starting database transaction.`);
        await db.$transaction(async (prisma) => {
            console.log(`[PromoCodeAction LOG] 11. Inside transaction. Updating promo code usage count.`);
            await prisma.promoCode.update({
                where: { id: promoCode.id },
                data: { timesUsed: { increment: 1 } },
            });
            console.log(`[PromoCodeAction LOG] 12. Promo code usage count updated.`);

            const rewardDescription = `Redeemed promo code: ${promoCode.code}`;
            console.log(`[PromoCodeAction LOG] 13. Applying reward. Type: ${promoCode.rewardType}, Value: ${promoCode.rewardValue}`);

            const wallet = await getWallet(userId);
            if (!wallet) {
              console.error(`[PromoCodeAction LOG] CRITICAL: Wallet not found for user ${userId}. Cannot apply coin-based rewards.`);
              throw new Error(`Wallet not found for user ${userId}.`);
            }

            switch (promoCode.rewardType) {
                case 'coins':
                    console.log(`[PromoCodeAction LOG] 14a. Reward type is coins. Current balance: ${wallet.coins}.`);
                    await updateWallet(userId, { coins: wallet.coins + promoCode.rewardValue }, rewardDescription);
                    console.log(`[PromoCodeAction LOG] 14b. Wallet updated for coins.`);
                    break;
                case 'flash_coins':
                    console.log(`[PromoCodeAction LOG] 15a. Reward type is flash_coins.`);
                    const newFlashCoin = {
                        id: `fc-${Date.now()}`,
                        amount: promoCode.rewardValue,
                        expiresAt: addDays(new Date(), 30).toISOString(), // Expires in 30 days
                        source: `Promo Code: ${promoCode.code}`,
                    };
                    const updatedFlashCoins = [...(wallet.flashCoins || []), newFlashCoin];
                    await updateWallet(userId, { flashCoins: updatedFlashCoins }, rewardDescription);
                     console.log(`[PromoCodeAction LOG] 15b. Wallet updated for flash coins.`);
                    break;
                case 'xp':
                    console.log(`[PromoCodeAction LOG] 16a. Reward type is xp. Updating user XP.`);
                    await updateUser(userId, { xpPoints: (user.xpPoints || 0) + promoCode.rewardValue });
                    console.log(`[PromoCodeAction LOG] 16b. User XP updated.`);
                    break;
                case 'streak_freeze':
                    console.log(`[PromoCodeAction LOG] 17a. Reward type is streak_freeze. Updating user freezes.`);
                    await updateUser(userId, { streakFreezes: (user.streakFreezes || 0) + promoCode.rewardValue });
                    console.log(`[PromoCodeAction LOG] 17b. User streak freezes updated.`);
                    break;
                case 'premium_days':
                    console.log(`[PromoCodeAction LOG] 18. Reward type is premium_days. (Mocked action)`);
                    // Mocked action: In a real app, you'd update a subscription status or expiry date.
                    break;
            }
            
            console.log(`[PromoCodeAction LOG] 19. Creating activity log.`);
            await createActivity({
                userId: user.id,
                tenantId: user.tenantId,
                description: `${rewardDescription} for ${promoCode.rewardValue} ${promoCode.rewardType}.`
            });
            console.log(`[PromoCodeAction LOG] 20. Activity log created.`);
        });
        console.log(`[PromoCodeAction LOG] 21. Database transaction completed successfully.`);

        console.log(`[PromoCodeAction LOG] 22. Checking for new badges for user ${userId}.`);
        await checkAndAwardBadges(userId);
        console.log(`[PromoCodeAction LOG] 23. Badge check complete.`);

        console.log(`[PromoCodeAction LOG] 24. Returning success response.`);
        return { success: true, message: `Successfully redeemed code for ${promoCode.rewardValue} ${promoCode.rewardType}!`, rewardType: promoCode.rewardType, rewardValue: promoCode.rewardValue };

    } catch (error) {
        console.error(`[PromoCodeAction LOG] 25. An error occurred in the redeem process for code ${code}:`, error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
