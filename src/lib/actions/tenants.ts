
'use server';

import { db } from '@/lib/db';
import type { Tenant, TenantSettings } from '@/types';
import { Prisma } from '@prisma/client';
import { createUser } from '@/lib/data-services/users';
import { logAction, logError } from '@/lib/logger';

/**
 * Fetches all tenants from the database.
 * @returns A promise that resolves to an array of Tenant objects.
 */
export async function getTenants(): Promise<Tenant[]> {
  logAction('Fetching all tenants');
  try {
    const tenants = await db.tenant.findMany({
      include: {
        settings: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return tenants as unknown as Tenant[];
  } catch (error) {
    logError('[TenantAction] Error fetching tenants', error);
    return [];
  }
}

/**
 * Creates a new tenant and its initial admin user.
 * @param tenantData The data for the new tenant.
 * @param adminUserData The data for the initial admin user.
 * @returns The newly created Tenant object or null if failed.
 */
export async function createTenantWithAdmin(
    tenantData: Omit<Tenant, 'id' | 'createdAt' | 'settings'> & { settings: Omit<TenantSettings, 'id'> },
    adminUserData: { name: string; email: string; }
): Promise<Tenant | null> {
    logAction('Creating tenant with admin', { tenantName: tenantData.name, adminEmail: adminUserData.email });
    try {
        const newTenant = await db.tenant.create({
            data: {
                name: tenantData.name,
                domain: tenantData.domain,
                settings: {
                    create: {
                        allowPublicSignup: tenantData.settings.allowPublicSignup,
                        customLogoUrl: tenantData.settings.customLogoUrl,
                        primaryColor: tenantData.settings.primaryColor,
                        accentColor: tenantData.settings.accentColor,
                        features: tenantData.settings.features ? (tenantData.settings.features as Prisma.JsonObject) : Prisma.JsonNull,
                    },
                },
            },
            include: {
                settings: true,
            },
        });

        // Create the initial admin user for this tenant
        await createUser({
            name: adminUserData.name,
            email: adminUserData.email,
            role: 'manager', // Initial tenant creator is a manager
            tenantId: newTenant.id,
            status: 'active',
        });

        return newTenant as unknown as Tenant;
    } catch (error) {
        logError('[TenantAction] Error creating tenant with admin', error, { tenantName: tenantData.name });
        return null;
    }
}

/**
 * Updates an existing tenant.
 * @param tenantId The ID of the tenant to update.
 * @param updateData The data to update (e.g., name, domain).
 * @returns The updated Tenant object or null if failed.
 */
export async function updateTenant(tenantId: string, updateData: Partial<Pick<Tenant, 'name' | 'domain'>>): Promise<Tenant | null> {
    logAction('Updating tenant', { tenantId });
    try {
        const updatedTenant = await db.tenant.update({
            where: { id: tenantId },
            data: updateData,
            include: { settings: true },
        });
        return updatedTenant as unknown as Tenant;
    } catch (error) {
        logError(`[TenantAction] Error updating tenant ${tenantId}`, error, { tenantId });
        return null;
    }
}

/**
 * Updates the settings for a specific tenant.
 * @param tenantId The ID of the tenant whose settings are to be updated.
 * @param settingsData The settings data to update.
 * @returns The updated TenantSettings object or null if failed.
 */
export async function updateTenantSettings(tenantId: string, settingsData: Partial<Omit<TenantSettings, 'id' | 'tenantId'>>): Promise<TenantSettings | null> {
    logAction('Updating tenant settings', { tenantId });
    try {
        const updatedSettings = await db.tenantSettings.update({
            where: { tenantId: tenantId },
            data: settingsData,
        });
        return updatedSettings as unknown as TenantSettings;
    } catch (error) {
        logError(`[TenantAction] Error updating settings for tenant ${tenantId}`, error, { tenantId });
        return null;
    }
}


/**
 * Deletes a tenant and all associated users.
 * @param tenantId The ID of the tenant to delete.
 * @returns A boolean indicating success.
 */
export async function deleteTenant(tenantId: string): Promise<boolean> {
  logAction('Deleting tenant', { tenantId });
  try {
    // This is a transaction to ensure both users and the tenant are deleted.
    await db.$transaction(async (prisma) => {
      // First, delete all users associated with the tenant
      await prisma.user.deleteMany({
        where: { tenantId: tenantId },
      });
      // Then, delete the tenant settings
      await prisma.tenantSettings.deleteMany({
        where: { tenantId: tenantId },
      });
      // Finally, delete the tenant itself
      await prisma.tenant.delete({
        where: { id: tenantId },
      });
    });
    return true;
  } catch (error) {
    logError(`[TenantAction] Error deleting tenant ${tenantId}`, error, { tenantId });
    return false;
  }
}
