
'use server';

import { db } from '../db';
import type { PromoCode } from '@/types';
import { isPast, parseISO, addDays } from 'date-fns';
import { getWallet, updateWallet, addXp } from './wallet';
import { checkAndAwardBadges } from './gamification';
//import from node modules instead of @prisma/client to avoid TS errors
import { Prisma } from '@prisma/client';
import { updateUser } from '@/lib/data-services/users';
import { createActivity } from '@/lib/actions/activities';

/**
 * Fetches all promo codes, scoped by tenant for managers.
 * @param tenantId Optional tenant ID. If undefined, fetches all. If provided, fetches for that tenant and platform-wide.
 * @returns A promise that resolves to an array of PromoCode objects.
 */
export async function getPromoCodes(tenantId?: string): Promise<PromoCode[]> {
  try {
    const whereClause: Prisma.PromoCodeWhereInput = {}; // eslint-disable-line @typescript-eslint/no-unused-vars
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
    const { isPlatformWide, ...restOfData } = codeData as any; // Exclude form-only field
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
    try {
        const promoCode = await db.promoCode.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!promoCode) return { success: false, message: 'Invalid promo code.' };
        if (!promoCode.isActive) return { success: false, message: 'This promo code is inactive.' };
        if (promoCode.expiresAt && isPast(promoCode.expiresAt)) return { success: false, message: 'This promo code has expired.' };
        if (promoCode.usageLimit > 0 && promoCode.timesUsed >= promoCode.usageLimit) return { success: false, message: 'This promo code has reached its usage limit.' };

        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, message: 'User not found.' };
        
        if (promoCode.tenantId && promoCode.tenantId !== 'platform' && user.tenantId !== promoCode.tenantId) {
            return { success: false, message: 'This promo code is not valid for your account.' };
        }

        const existingRedemption = await db.userPromoCodeRedemption.findUnique({
            where: {
                userId_promoCodeId: {
                    userId: userId,
                    promoCodeId: promoCode.id,
                },
            },
        });

        if (existingRedemption) {
            return { success: false, message: 'You have already redeemed this promo code.' };
        }
        
        await db.$transaction(async (prisma) => {
            await prisma.promoCode.update({
                where: { id: promoCode.id },
                data: { timesUsed: { increment: 1 } },
            });

            await prisma.userPromoCodeRedemption.create({
                data: {
                    userId: userId,
                    promoCodeId: promoCode.id,
                },
            });

            const rewardDescription = `Redeemed promo code: ${promoCode.code}`;
            const wallet = await getWallet(userId);
            if (!wallet) {
              throw new Error(`Wallet not found for user ${userId}.`);
            }

            switch (promoCode.rewardType) {
                case 'coins':
                    await updateWallet(userId, { coins: wallet.coins + promoCode.rewardValue }, rewardDescription);
                    break;
                case 'flash_coins':
                    const expiryDays = 7;
                    const newFlashCoin = {
                        id: `fc-${Date.now()}`,
                        amount: promoCode.rewardValue,
                        expiresAt: addDays(new Date(), expiryDays).toISOString(),
                        source: `Promo Code: ${promoCode.code}`,
                    };
                    const updatedFlashCoins = [...(wallet.flashCoins || []), newFlashCoin];
                    await updateWallet(userId, { flashCoins: updatedFlashCoins }, rewardDescription);
                    break;
                case 'xp':
                    await addXp(userId, promoCode.rewardValue, rewardDescription);
                    break;
                case 'streak_freeze':
                    await updateUser(userId, { streakFreezes: (user.streakFreezes || 0) + promoCode.rewardValue });
                    break;
                case 'premium_days':
                    console.log(`Adding ${promoCode.rewardValue} premium days to user ${userId}`);
                    break;
            }
            
            await createActivity({
                userId: user.id,
                tenantId: user.tenantId,
                description: `${rewardDescription} for ${promoCode.rewardValue} ${promoCode.rewardType}.`
            });
        });

        await checkAndAwardBadges(userId);

        return { success: true, message: `Successfully redeemed code for ${promoCode.rewardValue} ${promoCode.rewardType}!`, rewardType: promoCode.rewardType, rewardValue: promoCode.rewardValue };

    } catch (error) {
        console.error(`[PromoCodeAction] Error in the redeem process for code ${code}:`, error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
