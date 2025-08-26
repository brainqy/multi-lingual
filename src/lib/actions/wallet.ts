
'use server';

import { db } from '@/lib/db';
import type { Wallet, WalletTransaction } from '@/types';
import { Prisma } from '@prisma/client';
import { logAction, logError } from '@/lib/logger';
import { updateUser } from '@/lib/data-services/users';

/**
 * Fetches a user's wallet, creating one if it doesn't exist.
 * @param userId The ID of the user.
 * @returns The user's Wallet object or null on error.
 */
export async function getWallet(userId: string): Promise<Wallet | null> {
  logAction('Fetching wallet', { userId });
  try {
    let wallet = await db.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: {
            date: 'desc',
          },
          take: 50, // Get recent transactions
        },
      },
    });

    if (!wallet) {
      logAction('Wallet not found, creating new one', { userId });
      const newWallet = await db.wallet.create({
        data: {
          userId,
          coins: 100, // Starting bonus
        },
      });

      // Add initial transaction
      await db.walletTransaction.create({
        data: {
            walletId: newWallet.id,
            description: "Initial account bonus",
            amount: 100,
            type: 'credit',
            currency: 'coins',
            date: new Date(),
        }
      });

      // Refetch the wallet to include the new transaction correctly
      wallet = await db.wallet.findUnique({
        where: { userId },
        include: {
          transactions: {
            orderBy: {
              date: 'desc',
            },
            take: 50,
          }
        }
      });
    }

    // Manually sort flashCoins if they exist on the returned wallet object
    if (wallet && (wallet as any).flashCoins && Array.isArray((wallet as any).flashCoins)) {
      (wallet as any).flashCoins.sort((a: any, b: any) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
    }
    
    return wallet as unknown as Wallet;
  } catch (error) {
    logError(`[WalletAction] Error fetching wallet for user ${userId}`, error, { userId });
    return null;
  }
}

/**
 * Updates a user's wallet balance and creates a transaction record for coins.
 * @param userId The ID of the user.
 * @param update The data to update (e.g., new coin balance).
 * @param description A description of the transaction.
 * @returns The updated Wallet object or null on error.
 */
export async function updateWallet(userId: string, update: Partial<Pick<Wallet, 'coins' | 'flashCoins'>>, description?: string): Promise<void> {
    logAction('Updating wallet', { userId, description });
    try {
        const currentWallet = await db.wallet.findUnique({ where: { userId } });
        if (!currentWallet) {
            await getWallet(userId); // Creates a wallet if it doesn't exist
            // Re-run the update after creation
            await updateWallet(userId, update, description);
            return;
        }

        const oldCoins = currentWallet.coins;
        const newCoins = update.coins ?? oldCoins;
        const amountChange = newCoins - oldCoins;

        await db.wallet.update({
            where: { userId },
            data: {
                coins: update.coins,
                flashCoins: update.flashCoins ? update.flashCoins as any : undefined,
            },
        });

        if (amountChange !== 0 && description) {
             await db.walletTransaction.create({
                data: {
                    walletId: currentWallet.id,
                    description: description,
                    amount: amountChange,
                    type: amountChange > 0 ? 'credit' : 'debit',
                    currency: 'coins',
                }
            });
        }
    } catch (error) {
        logError(`[WalletAction] Error updating wallet for user ${userId}`, error, { userId });
    }
}


/**
 * Adds XP to a user's profile and records a transaction in their wallet history.
 * @param userId The ID of the user.
 * @param xpToAdd The amount of XP to add.
 * @param description A description of why the XP was awarded.
 * @returns The updated UserProfile or null on error.
 */
export async function addXp(userId: string, xpToAdd: number, description: string): Promise<UserProfile | null> {
    logAction('Adding XP to user', { userId, xpToAdd, description });
    if (xpToAdd <= 0) return null;

    try {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (!user) {
            logError('[WalletAction] User not found for adding XP', {}, { userId });
            return null;
        }

        const wallet = await getWallet(userId);
        if (!wallet) {
             logError('[WalletAction] Wallet not found for adding XP transaction', {}, { userId });
             return null;
        }

        const updatedUser = await updateUser(userId, { xpPoints: (user.xpPoints || 0) + xpToAdd });

        await db.walletTransaction.create({
            data: {
                walletId: wallet.id,
                description: description,
                amount: xpToAdd,
                type: 'credit',
                currency: 'xp'
            }
        });

        return updatedUser;
    } catch (error) {
        logError(`[WalletAction] Error adding XP for user ${userId}`, error, { userId });
        return null;
    }
}
