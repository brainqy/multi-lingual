
'use server';

import { db } from '@/lib/db';
import type { Wallet, WalletTransaction } from '@/types';
import { Prisma } from '@prisma/client';

/**
 * Fetches a user's wallet, creating one if it doesn't exist.
 * @param userId The ID of the user.
 * @returns The user's Wallet object or null on error.
 */
export async function getWallet(userId: string): Promise<Wallet | null> {
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
      // Create a wallet for the user if it doesn't exist
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
    console.error(`[WalletAction] Error fetching wallet for user ${userId}:`, error);
    return null;
  }
}

/**
 * Updates a user's wallet balance and creates a transaction record.
 * @param userId The ID of the user.
 * @param data The data to update (e.g., new coin balance).
 * @param transactionDescription A description of the transaction.
 * @returns The updated Wallet object or null on error.
 */
export async function updateWallet(userId: string, data: Partial<Pick<Wallet, 'coins' | 'flashCoins'>>, transactionDescription: string): Promise<Wallet | null> {
    try {
        const currentWallet = await db.wallet.findUnique({ where: { userId } });
        if (!currentWallet) {
            return await getWallet(userId);
        }

        const oldCoins = currentWallet.coins;
        const newCoins = data.coins ?? oldCoins;
        const amountChange = newCoins - oldCoins;

        const updatedWallet = await db.wallet.update({
            where: { userId },
            data: {
                coins: data.coins,
                flashCoins: data.flashCoins ? data.flashCoins as any : undefined,
            },
        });

        if (amountChange !== 0) {
             await db.walletTransaction.create({
                data: {
                    walletId: updatedWallet.id,
                    description: transactionDescription,
                    amount: amountChange,
                    type: amountChange > 0 ? 'credit' : 'debit',
                    date: new Date(), // This was the missing field
                }
            });
        }
        
        // Refetch to include the new transaction
        return await getWallet(userId);

    } catch (error) {
        console.error(`[WalletAction] Error updating wallet for user ${userId}:`, error);
        return null;
    }
}
