
'use server';

import { db } from '@/lib/db';
import type { PromoCode } from '@/types';
import { isPast, parseISO } from 'date-fns';

/**
 * Fetches all promo codes.
 * @returns A promise that resolves to an array of PromoCode objects.
 */
export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const codes = await db.promoCode.findMany({
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
  try {
    const newCode = await db.promoCode.create({
      data: {
        ...codeData,
        code: codeData.code.toUpperCase(),
      },
    });
    return newCode as unknown as PromoCode;
  } catch (error) {
    console.error('[PromoCodeAction] Error creating promo code:', error);
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

        // In a real app, you would also check if this specific user has already used a one-time code.
        
        await db.promoCode.update({
            where: { id: promoCode.id },
            data: { timesUsed: { increment: 1 } },
        });

        // Here you would apply the reward to the user's account (e.g., update user's coins or XP).
        // This is a simplified example.
        console.log(`User ${userId} redeemed code ${code} for ${promoCode.rewardValue} ${promoCode.rewardType}.`);


        return { success: true, message: `Successfully redeemed code!`, rewardType: promoCode.rewardType, rewardValue: promoCode.rewardValue };

    } catch (error) {
        console.error(`[PromoCodeAction] Error redeeming code ${code}:`, error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
