
'use server';

import { db } from '@/lib/db';
import type { ProductCompany } from '@/types';

/**
 * Fetches all product companies from the database.
 * @returns A promise that resolves to an array of ProductCompany objects.
 */
export async function getCompanies(): Promise<ProductCompany[]> {
  try {
    const companies = await db.productCompany.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return companies as unknown as ProductCompany[];
  } catch (error) {
    console.error('[CompanyAction] Error fetching companies:', error);
    return [];
  }
}
