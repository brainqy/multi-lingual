
'use server';

import { db } from '@/lib/db';
import type { Tenant, TenantSettings } from '@/types';
import { Prisma, EmailTemplateType } from '@prisma/client';
import { createUser, getUserByEmail } from '@/lib/data-services/users';
import { logAction, logError } from '@/lib/logger';
import { sendEmail } from './send-email';

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
 * Fetches a single tenant by its ID or custom domain.
 * @param identifier The tenant's ID or unique custom domain.
 * @returns The Tenant object or null if not found.
 */
export async function getTenantByIdentifier(identifier: string): Promise<Tenant | null> {
    logAction('Fetching tenant by identifier', { identifier });
    try {
        const tenant = await db.tenant.findFirst({
            where: {
                OR: [
                    { id: identifier },
                    { domain: identifier },
                ]
            }
        });
        return tenant as unknown as Tenant | null;
    } catch (error) {
        logError('[TenantAction] Error fetching tenant by identifier', error, { identifier });
        return null;
    }
}


/**
 * Creates a new tenant and its initial admin user.
 * Sends a welcome email to the new manager with a password reset link.
 * @param tenantData The data for the new tenant.
 * @param adminUserData The data for the initial admin user.
 * @returns The newly created Tenant object or null if failed.
 */
export async function createTenantWithAdmin(
    tenantData: Omit<Tenant, 'id' | 'createdAt' | 'settings'> & { settings: Omit<TenantSettings, 'id'> },
    adminUserData: { name: string; email: string; }
): Promise<{ success: boolean; tenant: Tenant | null; error?: string }> {
    logAction('Creating tenant with admin', { tenantName: tenantData.name, adminEmail: adminUserData.email });
    try {
        // Check if the admin email is already in use
        const existingUser = await getUserByEmail(adminUserData.email);
        if (existingUser) {
            logError('[TenantAction] Admin email already exists', {}, { adminEmail: adminUserData.email });
            return { success: false, tenant: null, error: 'An account with this admin email already exists.' };
        }

        // Check if the tenant domain is already in use
        if (tenantData.domain) {
            const existingTenantDomain = await db.tenant.findUnique({
                where: { domain: tenantData.domain },
            });
            if (existingTenantDomain) {
                logError('[TenantAction] Tenant domain already exists', {}, { domain: tenantData.domain });
                return { success: false, tenant: null, error: 'This tenant domain is already taken. Please choose another.' };
            }
        }
        
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

        // Create the initial admin user for this tenant without a password
        const newManager = await createUser({
            name: adminUserData.name,
            email: adminUserData.email,
            role: 'manager', // Initial tenant creator is a manager
            tenantId: newTenant.id,
            status: 'active',
        });
        
        if (newManager) {
            const resetToken = Buffer.from(newManager.email).toString('base64');
            const subdomain = newTenant.domain || newTenant.id;
            const resetUrl = `http://${subdomain}.localhost:9002/auth/reset-password?token=${resetToken}`;
            
            await sendEmail({
                tenantId: newTenant.id,
                recipientEmail: newManager.email,
                type: EmailTemplateType.TENANT_WELCOME,
                placeholders: {
                    userName: newManager.name,
                    userEmail: newManager.email,
                    resetLink: resetUrl,
                },
            });
             logAction('Welcome email sent to new tenant manager', { email: newManager.email });
        }


        return { success: true, tenant: newTenant as unknown as Tenant };
    } catch (error) {
        logError('[TenantAction] Error creating tenant with admin', error, { tenantName: tenantData.name });
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2002 is the unique constraint violation code
            if (error.code === 'P2002' && (error.meta?.target as string[])?.includes('domain')) {
                return { success: false, tenant: null, error: 'This tenant domain is already taken. Please choose another.' };
            }
        }
        return { success: false, tenant: null, error: 'An unexpected error occurred.' };
    }
}

/**
 * Updates an existing tenant.
 * @param tenantId The ID of the tenant to update.
 * @param updateData The data to update (e.g., name, domain).
 * @returns The updated Tenant object or null if failed.
 */
export async function updateTenant(tenantId: string, updateData: Partial<Pick<Tenant, 'name' | 'domain' | 'settings'>>): Promise<Tenant | null> {
    logAction('Updating tenant', { tenantId });
    try {
        const { settings, ...tenantInfo } = updateData;

        if (settings) {
            await updateTenantSettings(tenantId, settings);
        }

        const updatedTenant = await db.tenant.update({
            where: { id: tenantId },
            data: tenantInfo,
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
            data: {
              ...settingsData,
              features: settingsData.features ? (settingsData.features as Prisma.JsonObject) : undefined,
            },
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
