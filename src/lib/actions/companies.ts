
'use server';

import { db } from '@/lib/db';
import type { ProductCompany } from '@/types';
import { logAction, logError } from '@/lib/logger';

/**
 * Fetches all product companies from the database.
 * @returns A promise that resolves to an array of ProductCompany objects.
 */
export async function getCompanies(): Promise<ProductCompany[]> {
  logAction('Fetching companies');
  try {
    const companies = await db.productCompany.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return companies as unknown as ProductCompany[];
  } catch (error) {
    logError('[CompanyAction] Error fetching companies', error);
    return [];
  }
}
